import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const QUEUES_PATH = "http://localhost:3000/api/admin/queue";

const QueueManagement = () => {
  const { user } = useAuth(); // user.token is needed to authorize queue mutations
  const [queue, setQueue] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(""); // stores service id

  // Fetch the live queue for the given service id
  const fetchQueue = (serviceId) => {
    if (!serviceId) return;
    fetch(`${QUEUES_PATH}/${serviceId}`)
      .then((res) => res.json())
      .then((data) => setQueue(data));
  };

  // Fetch configured services once on mount; default-select the first one
  useEffect(() => {
    fetch("http://localhost:3000/api/admin/services")
      .then((res) => res.json())
      .then((data) => {
        setServices(data);
        if (data.length > 0) {
          setSelectedService(data[0].id);
        }
      });
  }, []);

  // Re-fetch and re-start polling whenever the selected service changes
  useEffect(() => {
    fetchQueue(selectedService);

    const interval = setInterval(() => fetchQueue(selectedService), 5000);
    return () => clearInterval(interval); // cleanup before next effect or unmount
  }, [selectedService]);

  // Serve the first user in the selected service's queue
  const serveNext = () => {
    if (queue.length === 0) return;
    fetch(`${QUEUES_PATH}/${selectedService}/serve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then(() => fetchQueue(selectedService));
  };

  // Remove a specific entry from the selected service's queue
  const removeUser = (entryId) => {
    fetch(`${QUEUES_PATH}/${selectedService}/${entryId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then(() => fetchQueue(selectedService));
  };

  // Move an entry one position toward the front within the selected service's queue
  const moveUp = (entryId) => {
    fetch(`${QUEUES_PATH}/${selectedService}/${entryId}/move-up`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then(() => fetchQueue(selectedService));
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
            <option key={s.id} value={s.id}>
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
