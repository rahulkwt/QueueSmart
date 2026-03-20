import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const QUEUES_PATH = "http://localhost:3000/api/admin/queue";
const QueueManagement = () => {
  const { user } = useAuth(); // user.token is needed to authorize queue mutations
  const [queue, setQueue] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");

  // Fetch the live queue from the server
  const fetchQueue = () => {
    fetch(QUEUES_PATH)
      .then((res) => res.json())
      .then((data) => setQueue(data));
  };

  // Fetch configured services for the selector dropdown
  const fetchServices = () => {
    fetch("http://localhost:3000/api/admin/services")
      .then((res) => res.json())
      .then((data) => {
        setServices(data);
        if (data.length > 0 && selectedService === "") {
          setSelectedService(data[0].name);
        }
      });
  };

  useEffect(() => {
    fetchQueue();
    fetchServices();

    const interval = setInterval(fetchQueue, 5000); // poll queue every 5 seconds
    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  // Serve the first user in the queue
  const serveNext = () => {
    if (queue.length === 0) return;
    fetch(`${QUEUES_PATH}/serve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then(() => fetchQueue());
  };

  // Remove a specific user from the queue
  const removeUser = (id) => {
    fetch(`${QUEUES_PATH}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then(() => fetchQueue());
  };

  // Move a user one position toward the front
  const moveUp = (id) => {
    fetch(`${QUEUES_PATH}/${id}/move-up`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then(() => fetchQueue());
  };

  return (
    <div className="">
      <h2 className="mb-4">Queue Management</h2>

      {/* Select Service */}
      <div className="mb-3">
        <label className="form-label">Select Service</label>
        <select
          className="form-select"
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
        >
          {services.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Queue List */}
      <div className="card p-3 mb-4">
        <h5>Current Queue</h5>

        {queue.length === 0 ? (
          <p>No users in queue.</p>
        ) : (
          <ul className="list-group">
            {queue.map((entry, index) => (
              <li
                key={entry.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>
                  #{index + 1} - {entry.name}
                </span>

                <div>
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => moveUp(entry.id)}
                    disabled={index === 0}
                  >
                    ↑
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeUser(entry.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Buttons */}
      <div className="d-flex gap-3">
        <button className="btn btn-success" onClick={serveNext}>
          Serve Next User
        </button>
      </div>
    </div>
  );
};

export default QueueManagement;
