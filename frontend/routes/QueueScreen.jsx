/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const JoinQueue = () => {
  const { service } = useParams();
  const navigate = useNavigate();
  const decodedService = decodeURIComponent(service);

  const [joined, setJoined] = useState(false);
  const [priority, setPriority] = useState("Low");
  const [position, setPosition] = useState(null);
  const [estimatedWait, setEstimatedWait] = useState(null);
  const [peopleInQueue, setPeopleInQueue] = useState(null);
  const [status, setStatus] = useState("Waiting");
  const [queueData, setQueueData] = useState([]);
  const [queueId, setQueueId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchQueue = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/services?service=${encodeURIComponent(decodedService)}`);
      const active = response.data.filter((item) => item.isActive !== false);
      setQueueData(active);
      setPeopleInQueue(active.length);
      return active.length;
    } catch (error) {
      console.error("Error fetching queue:", error);
      return 0;
    }
  };

  const joinQueue = async () => {
    try {
      setLoading(true);

      const response = await axios.post("http://localhost:3000/api/services", {
        service: decodedService,
        priority,
        date: new Date().toISOString(),
        status: "Waiting",
      });

      setQueueId(response.data.id);
      setJoined(true);

      const count = await fetchQueue();
      setPosition(count);
      setEstimatedWait(count * 5);
    } catch (error) {
      console.error("Error joining queue:", error);
    } finally {
      setLoading(false);
    }
  };

  const leaveQueue = async () => {
    try {
      setLoading(true);

      if (!queueId) {
        console.error("No queue id found.");
      } else {
        await axios.patch(`http://localhost:3000/api/services/${queueId}/leave`, {
          leftReason: "User left queue",
          leftBy: "user",
        });
      }
    } catch (error) {
      console.error("Error leaving queue:", error);
    } finally {
      setJoined(false);
      setQueueId(null);
      setPosition(null);
      setEstimatedWait(null);
      setStatus("Waiting");
      await fetchQueue();
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
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
      await fetchQueue();
    }, 2000);
    return () => clearTimeout(timeout);
  }, [status]);

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
            <p className="fs-4 mb-0">{estimatedWait ?? 0} minutes</p>
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
            disabled={loading}
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

      <div className="card p-3 mt-4">
        <h5>Current Queue Data</h5>
        {queueData.map((item) => (
          <div key={item.id} className="border-bottom py-2">
            <p className="mb-1">
              <strong>Service:</strong> {item.service}
            </p>
            <p className="mb-1">
              <strong>Status:</strong> {item.status}
            </p>
            <p className="mb-0">
              <strong>Priority:</strong> {item.priority || "N/A"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JoinQueue;
