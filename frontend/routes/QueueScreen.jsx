import React, { useState, useEffect } from "react";
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
  const [priority, setPriority] = useState("Low");
  const [position, setPosition] = useState(null);
  const [estimatedWait, setEstimatedWait] = useState(null);
  const [peopleInQueue, setPeopleInQueue] = useState(null);
  const [status, setStatus] = useState("Waiting");
  const [queueId, setQueueId] = useState(null);
  const [loading, setLoading] = useState(false);

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
        setPriority(myEntry.priority || "Low");
        const pos = queue.findIndex((e) => e.id === myEntry.id) + 1;
        setPosition(pos);
        setEstimatedWait(pos * 5);
      } else if (joined) {
        // User was served or removed by admin — reset
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
      window.dispatchEvent(new CustomEvent("queue-almost-ready", { detail: { service: decodedService } }));
    } else {
      setStatus("Served");
      window.dispatchEvent(new CustomEvent("queue-served", { detail: { service: decodedService } }));
    }
  }, [position]);

  const joinQueue = async () => {
    if (!serviceId) return;
    try {
      setLoading(true);
<<<<<<< HEAD
      const res = await axios.post(
        `http://localhost:3000/api/queue/${serviceId}/join`,
        { priority },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setQueueId(res.data.id);
      setJoined(true);
      window.dispatchEvent(new CustomEvent("queue-joined", { detail: { service: decodedService, priority } }));
      await fetchQueue(serviceId);
    } catch (err) {
      console.error("Error joining queue:", err);
=======

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const response = await axios.post("http://localhost:3000/api/services", {
        service: decodedService,
        priority,
        date: new Date().toISOString(),
        status: "Waiting",
      }, { headers: { Authorization: `Bearer ${user.token}` } });

      setQueueId(response.data.id);
      setJoined(true);
      saveActiveQueue(response.data.id, priority);

      const count = await fetchQueue();
      setPosition(count);
      const waitRes = await axios.get(
        `http://localhost:3000/api/queue/wait-time?position=${count}&isOpen=true`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setEstimatedWait(waitRes.data.estimatedWaitMinutes);
    } catch (error) {
      console.error("Error joining queue:", error);
>>>>>>> Alec-queuesmart
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
    } catch (err) {
      console.error("Error leaving queue:", err);
    } finally {
      setJoined(false);
      setQueueId(null);
      setPosition(null);
      setEstimatedWait(null);
      setStatus("Waiting");
      await fetchQueue(serviceId);
      setLoading(false);
    }
  };

<<<<<<< HEAD
=======
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("activeQueues") || "{}");
    const existing = stored[decodedService];
    if (existing) {
      setJoined(true);
      setQueueId(existing.queueId);
      setPriority(existing.priority);
      fetchQueue().then(async (count) => {
        setPosition(count);
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const waitRes = await axios.get(
          `http://localhost:3000/api/queue/wait-time?position=${count}&isOpen=true`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setEstimatedWait(waitRes.data.estimatedWaitMinutes);
      });
    } else {
      fetchQueue();
    }
  }, [decodedService]);

  useEffect(() => {
    if (!joined) return;

    const interval = setInterval(() => {
      setPosition((prev) => (prev > 0 ? prev - 1 : 0));
      setEstimatedWait((prev) => (prev > 5 ? prev - 5 : 5));
      setQueueData((prev) => {
        const [first, ...rest] = prev;
        if (first) {
          axios.patch(`http://localhost:3000/api/services/${first.id}/leave`, {
            status: "Completed",
            leftReason: "Served",
            leftBy: "system",
          })
            .then(() => fetchQueue())
            .catch((err) => console.error("Error completing queue entry:", err));
        }
        return rest;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [joined]);

  useEffect(() => {
    if (position === null) return;
    if (position > 1) setStatus("Waiting");
    else if (position === 1) setStatus("Almost Ready");
    else setStatus("Served");
  }, [position]);

  useEffect(() => {
    if (status !== "Served") return;
    const timeout = setTimeout(async () => {
      setJoined(false);
      setQueueId(null);
      setPosition(null);
      setEstimatedWait(null);
      setStatus("Waiting");
      removeActiveQueue();
      await fetchQueue();
    }, 2000);
    return () => clearTimeout(timeout);
  }, [status]);

>>>>>>> Alec-queuesmart
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
