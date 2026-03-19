/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import axios from "axios";

const JoinQueue = () => {
  const service = "Consultation";

  const [joined, setJoined] = useState(false);
  const [priority, setPriority] = useState("Low");
  const [position, setPosition] = useState(4);
  const [estimatedWait, setEstimatedWait] = useState(20);
  const [peopleInQueue, setPeopleInQueue] = useState(3);
  const [status, setStatus] = useState("Waiting");
  const [queueData, setQueueData] = useState([]);
  const [queueId, setQueueId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchQueue = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/services");
      setQueueData(response.data);
      setPeopleInQueue(response.data.length);
    } catch (error) {
      console.error("Error fetching queue:", error);
    }
  };

  const joinQueue = async () => {
    try {
      setLoading(true);

      const response = await axios.post("http://localhost:3000/api/services", {
        service,
        priority,
        date: new Date().toISOString(),
        status: "Waiting",
      });

      console.log("Joined queue:", response.data);

      setQueueId(response.data.id);
      setJoined(true);

      await fetchQueue();
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

        console.log("Left queue for id:", queueId);
      }
    } catch (error) {
      console.error("Error leaving queue:", error);
    } finally {
      setJoined(false);
      setQueueId(null);
      setPosition(4);
      setEstimatedWait(20);
      setStatus("Waiting");
      await fetchQueue();
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  useEffect(() => {
    if (!joined) return;

    const interval = setInterval(() => {
      setPosition((prev) => (prev > 1 ? prev - 1 : 1));
      setEstimatedWait((prev) => (prev > 5 ? prev - 5 : 5));
      setPeopleInQueue((prev) => (prev > 1 ? prev - 1 : 1));
    }, 3001);

    return () => clearInterval(interval);
  }, [joined]);

  useEffect(() => {
    if (position > 2) setStatus("Waiting");
    else if (position === 2) setStatus("Almost Ready");
    else setStatus("Served");
  }, [position]);

  return (
    <div className="">
      <h2 className="mb-4">{service} Queue</h2>

      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <div className="card p-3 h-100">
            <h5>People in Queue</h5>
            <p className="fs-4 mb-0">{peopleInQueue}</p>
          </div>
        </div>

        <div className="col-md-6 mb-3">
          <div className="card p-3 h-100">
            <h5>Estimated Wait Time</h5>
            <p className="fs-4 mb-0">{estimatedWait} minutes</p>
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
            {loading ? "Joining..." : `Join ${service} Queue`}
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