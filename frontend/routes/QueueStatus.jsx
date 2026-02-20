import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const QueueStatus = () => {
  const navigate = useNavigate();
  const { service } = useParams();

  const [position, setPosition] = useState(3);
  const [estimatedWait, setEstimatedWait] = useState(15);
  const [status, setStatus] = useState("Waiting");

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => (prev > 1 ? prev - 1 : 1));
      setEstimatedWait((prev) => (prev > 5 ? prev - 5 : 5));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (position > 1) setStatus("Waiting");
    else if (position === 1) setStatus("Almost Ready");
    else setStatus("Served");
  }, [position]);

  return (
    <div className="">
      <h2 className="mb-4">
        {service} Queue Status
      </h2>

      <div className="card p-3 mb-3">
        <h5>Current Position</h5>
        <p className="fs-4">{position}</p>
      </div>

      <div className="card p-3 mb-3">
        <h5>Estimated Wait Time</h5>
        <p>{estimatedWait} minutes</p>
      </div>

      <div className="card p-3 mb-4">
        <h5>Status</h5>
        <p>{status}</p>
      </div>

      <button
        className="btn btn-danger"
        onClick={() => navigate("/portal/join")}
      >
        Back to Join Page
      </button>
    </div>
  );
};

export default QueueStatus;
