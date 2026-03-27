/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";

const JoinQueue = () => {
  const service = "Consultation"; // 👈 change this per screen

  const [joined, setJoined] = useState(false);
  const [priority, setPriority] = useState("Low");
  const [position, setPosition] = useState(4);
  const [estimatedWait, setEstimatedWait] = useState(20);
  const [peopleInQueue, setPeopleInQueue] = useState(3);
  const [status, setStatus] = useState("Waiting");

  useEffect(() => {
    if (!joined) return;
    const interval = setInterval(() => {
      setPosition((prev) => (prev > 1 ? prev - 1 : 1));
      setEstimatedWait((prev) => (prev > 5 ? prev - 5 : 5));
      setPeopleInQueue((prev) => (prev > 1 ? prev - 1 : 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [joined]);

  useEffect(() => {
    if (position > 2) setStatus("Waiting");
    else if (position === 2) setStatus("Almost Ready");
    else setStatus("Served");
  }, [position]);

  return (
    <div className="">

      {/* Title */}
      <h2 className="mb-4">{service} Queue</h2>

      {/* Queue Info - always visible */}
      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <div className="card p-3 h-100">
            <h5>People in Queue</h5>
            <p className="fs-4 mb-0">{joined ? peopleInQueue + 1 : peopleInQueue}</p>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="card p-3 h-100">
            <h5>Estimated Wait Time</h5>
            <p className="fs-4 mb-0">{estimatedWait} minutes</p>
          </div>
        </div>
      </div>

      {/* Before joining */}
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
                    ? level === "High" ? "btn-danger"
                      : level === "Medium" ? "btn-warning"
                      : "btn-secondary"
                    : "btn-outline-secondary"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => setJoined(true)}>
            Join {service} Queue
          </button>
        </div>

      ) : (
        /* After joining */
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
                <span className={`badge fs-6 ${
                  priority === "High" ? "bg-danger" :
                  priority === "Medium" ? "bg-warning text-dark" :
                  "bg-secondary"
                }`}>
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
            onClick={() => {
              setJoined(false);
              setPosition(4);
              setEstimatedWait(20);
              setPeopleInQueue(3);
              setStatus("Waiting");
            }}
          >
            Leave Queue
          </button>
        </div>
      )}
    </div>
  );
};

export default JoinQueue;