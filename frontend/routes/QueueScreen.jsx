import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const JoinQueue = () => {
  const { service } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const decodedService = decodeURIComponent(service);

  const [serviceId, setServiceId] = useState(null);
  const [joined, setJoined] = useState(false);
  const joinedRef = useRef(false);
  // Track the pending history entry created on join so we can update it when the session ends.
  // Persisted in localStorage so it survives page refreshes.
  const [currentHistoryId, setCurrentHistoryId] = useState(() => {
    const stored = localStorage.getItem(`pendingHistoryId_${decodeURIComponent(service)}`);
    return stored ? parseInt(stored, 10) : null;
  });
  const [priority, setPriority] = useState("Low");
  const [position, setPosition] = useState(null);
  const [estimatedWait, setEstimatedWait] = useState(null);
  const [peopleInQueue, setPeopleInQueue] = useState(null);
  const [status, setStatus] = useState("Waiting");
  const [queueId, setQueueId] = useState(null);
  const [loading, setLoading] = useState(false);
  const almostReadyFiredRef = useRef(
    localStorage.getItem(`almostReadyFired_${decodeURIComponent(service)}`) === "true"
  );

  // Keep joinedRef in sync so the polling interval (which captures a stale closure) can
  // still detect when the user has been served or removed by an admin.
  useEffect(() => {
    joinedRef.current = joined;
  }, [joined]);

  const formatHistoryDate = (d) => {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}-${dd}-${yyyy}`;
  };

  const saveHistoryId = (id) => {
    const key = `pendingHistoryId_${decodedService}`;
    if (id != null) {
      localStorage.setItem(key, String(id));
    } else {
      localStorage.removeItem(key);
    }
    setCurrentHistoryId(id);
  };

  // Step 1: Look up serviceId by matching service name from admin services list
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/admin/services", {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        const svc = res.data.find((s) => s.name === decodedService);
        if (svc) setServiceId(svc.id);
      })
      .catch((err) => console.error("Error fetching services:", err));
  }, [decodedService]);

  // Fetches the queue for this service and updates position if user is already in it
  const fetchQueue = async (svcId) => {
    if (!svcId) return 0;
    try {
      const res = await axios.get(`http://localhost:3000/api/admin/queue/${svcId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const queue = res.data;
      setPeopleInQueue(queue.length);

      const myEntry = queue.find((e) => e.userId === user.id);
      if (myEntry) {
        setJoined(true);
        setQueueId(myEntry.id);
        const raw = (myEntry.priority || "low").toLowerCase();
        setPriority(raw === "mid" ? "Medium" : raw.charAt(0).toUpperCase() + raw.slice(1));
        const pos = queue.findIndex((e) => e.id === myEntry.id) + 1;
        setPosition(pos);
        try {
          const waitRes = await fetch(
            `http://localhost:3000/api/queue/${svcId}/wait-time?entryId=${myEntry.id}&avgDuration=5`
          );
          const waitData = await waitRes.json();
          setEstimatedWait(waitData.estimatedWaitMinutes);
        } catch {
          setEstimatedWait(pos * 5);
        }
      } else if (joinedRef.current) {
        // User was served or removed by admin.
        // The backend already updated the Pending history entry (Completed or Cancelled).
        joinedRef.current = false;
        saveHistoryId(null);
        setJoined(false);
        setQueueId(null);
        setPosition(null);
        setEstimatedWait(null);
        setStatus("Waiting");
      }

      return queue.length;
    } catch (err) {
      console.error("Error fetching queue:", err);
      return 0;
    }
  };

  // Step 2: Once serviceId is known, load initial queue state and start polling
  useEffect(() => {
    if (!serviceId) return;
    fetchQueue(serviceId);
    const interval = setInterval(() => fetchQueue(serviceId), 10000);
    return () => clearInterval(interval);
  }, [serviceId]);

  // Update status label based on position
  useEffect(() => {
    if (position === null) return;
    if (position > 1) {
      setStatus("Waiting");
    } else if (position === 1) {
      setStatus("Almost Ready");
      if (!almostReadyFiredRef.current) {
        almostReadyFiredRef.current = true;
        localStorage.setItem(`almostReadyFired_${decodedService}`, "true");
        window.dispatchEvent(new CustomEvent("queue-almost-ready", { detail: { service: decodedService } }));
      }
    } else {
      setStatus("Served");
      window.dispatchEvent(new CustomEvent("queue-served", { detail: { service: decodedService } }));
    }
  }, [position]);

  const joinQueue = async () => {
    if (!serviceId) return;
    try {
      setLoading(true);
      const res = await axios.post(
        `http://localhost:3000/api/queue/${serviceId}/join`,
        { priority },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setQueueId(res.data.id);
      setJoined(true);
      almostReadyFiredRef.current = false;
      localStorage.removeItem(`almostReadyFired_${decodedService}`);
      window.dispatchEvent(new CustomEvent("queue-joined", { detail: { service: decodedService, priority } }));
      // Create a Pending history entry so the visit appears in history while in queue.
      // The backend will update it to Completed (served) or Cancelled (removed/left).
      try {
        const histRes = await axios.post(
          "http://localhost:3000/api/user/history",
          { service: decodedService, serviceId, date: formatHistoryDate(new Date()), status: "Pending" },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        saveHistoryId(histRes.data.id);
      } catch { /* non-critical */ }
      await fetchQueue(serviceId);
    } catch (err) {
      console.error("Error joining queue:", err);
    } finally {
      setLoading(false);
    }
  };

  const leaveQueue = async () => {
    if (!queueId || !serviceId) return;
    try {
      setLoading(true);
      await axios.delete(
        `http://localhost:3000/api/queue/${serviceId}/${queueId}/leave`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      // Update the Pending history entry to Cancelled (backend also does this as a safety net).
      if (currentHistoryId != null) {
        try {
          await axios.patch(
            `http://localhost:3000/api/user/history/${currentHistoryId}`,
            { status: "Cancelled" },
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
        } catch { /* non-critical */ }
      }
    } catch (err) {
      console.error("Error leaving queue:", err);
    } finally {
      joinedRef.current = false;
      saveHistoryId(null);
      setJoined(false);
      setQueueId(null);
      setPosition(null);
      setEstimatedWait(null);
      setStatus("Waiting");
      await fetchQueue(serviceId);
      setLoading(false);
    }
  };

  return (
    <div className="">
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate("/portal/user")}>
        ← Back to Dashboard
      </button>
      <h2 className="mb-4">{decodedService} Queue</h2>

      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <div className="card p-3 h-100">
            <h5>People in Queue</h5>
            <p className="fs-4 mb-0">{peopleInQueue ?? 0}</p>
          </div>
        </div>

        <div className="col-md-6 mb-3">
          <div className="card p-3 h-100">
            <h5>Estimated Wait Time</h5>
            <p className="fs-4 mb-0">{estimatedWait ?? (peopleInQueue != null ? peopleInQueue * 5 : 0)} minutes</p>
          </div>
        </div>
      </div>

      {!joined ? (
        <div className="card p-3 mb-4">
          <h5 className="mb-3">Join this Queue</h5>
          <label className="form-label">Select Priority</label>

          <div className="d-flex gap-3 mb-3">
            {["Low", "Medium", "High"].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setPriority(level)}
                className={`btn ${
                  priority === level
                    ? level === "High"
                      ? "btn-danger"
                      : level === "Medium"
                      ? "btn-warning"
                      : "btn-secondary"
                    : "btn-outline-secondary"
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          <button
            className="btn btn-primary"
            onClick={joinQueue}
            disabled={loading || !serviceId}
          >
            {loading ? "Joining..." : `Join ${decodedService} Queue`}
          </button>
        </div>
      ) : (
        <div>
          <div className="row mb-3">
            <div className="col-md-6 mb-3">
              <div className="card p-3 h-100">
                <h5>Your Position</h5>
                <p className="fs-4 mb-0">{position}</p>
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <div className="card p-3 h-100">
                <h5>Your Priority</h5>
                <span
                  className={`badge fs-6 ${
                    priority === "High"
                      ? "bg-danger"
                      : priority === "Medium"
                      ? "bg-warning text-dark"
                      : "bg-secondary"
                  }`}
                >
                  {priority}
                </span>
              </div>
            </div>

            <div className="col-12">
              <div className="card p-3">
                <h5>Status</h5>
                <p className="mb-0">{status}</p>
              </div>
            </div>
          </div>

          <button
            className="btn btn-outline-danger mt-2"
            onClick={leaveQueue}
            disabled={loading}
          >
            {loading ? "Leaving..." : "Leave Queue"}
          </button>
        </div>
      )}
    </div>
  );
};

export default JoinQueue;
