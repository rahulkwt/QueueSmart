import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const services = ["Consultation", "Check-up", "Follow-up"];

const JoinQueue = () => {
  const navigate = useNavigate();

  const [selectedService, setSelectedService] = useState("Consultation");

  const [joinedQueues, setJoinedQueues] = useState(() => {
    const saved = localStorage.getItem("joinedQueues");
    return saved ? JSON.parse(saved) : [];
  });

  const [justJoined, setJustJoined] = useState(null);

  useEffect(() => {
    localStorage.setItem("joinedQueues", JSON.stringify(joinedQueues));
  }, [joinedQueues]);

  const isAlreadyJoined = joinedQueues.some(
    (q) => q.service === selectedService
  );

  const joinQueue = () => {
    if (isAlreadyJoined) return;

    const newQueue = {
      service: selectedService,
      position: Math.floor(Math.random() * 5) + 1,
      estimatedWait:
        selectedService === "Consultation" ? 15 : 25,
      status: "Waiting",
    };

    setJoinedQueues([...joinedQueues, newQueue]);
    setJustJoined(selectedService);
  };

  const leaveQueue = (service) => {
    const updated = joinedQueues.filter(
      (q) => q.service !== service
    );
    setJoinedQueues(updated);

    if (justJoined === service) {
      setJustJoined(null);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Join a Queue</h2>

      {/* Select Service */}
      <div className="mb-3">
        <label className="form-label">Select Service</label>
        <select
          className="form-select"
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
        >
          {services.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>

      {/* Join Button */}
      {!isAlreadyJoined ? (
        <button
          className="btn btn-primary mb-4"
          onClick={joinQueue}
        >
          Join Selected Queue
        </button>
      ) : justJoined === selectedService ? (
        // Immediately after joining → still show normal button disabled
        <button className="btn btn-secondary mb-4" disabled>
          Joined Successfully
        </button>
      ) : (
        // Only show message if you switched away and came back
        <div className="alert alert-success mb-4">
          You’ve already joined this queue.
        </div>
      )}

      {/* Joined Queues Section */}
      <h4>Your Active Queues</h4>

      {joinedQueues.length === 0 ? (
        <p className="text-muted">
          You have not joined any queues yet.
        </p>
      ) : (
        <div className="row">
          {joinedQueues.map((queue) => (
            <div
              className="col-md-6 mb-3"
              key={queue.service}
            >
              <div className="card p-3">
                <h5>{queue.service}</h5>
                <p className="mb-1">
                  Position: {queue.position}
                </p>
                <p className="mb-1">
                  Estimated Wait: {queue.estimatedWait} minutes
                </p>
                <p className="mb-2">
                  Status: {queue.status}
                </p>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() =>
                      navigate(
                        `/portal/status/${queue.service}`
                      )
                    }
                  >
                    View Status
                  </button>

                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() =>
                      leaveQueue(queue.service)
                    }
                  >
                    Leave
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JoinQueue;
