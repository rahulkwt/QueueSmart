import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const QUEUES_PATH = "http://localhost:3000/api/admin/queue";

const QueueManagement = () => {
  const { user, logout } = useAuth();
  const [queue, setQueue] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(""); // stores service id as string
  const [error, setError] = useState(null);

  // Shared fetch wrapper: auto-logout on 401/403, surface errors to UI
  const adminFetch = (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${user.token}`,
      },
    }).then((res) => {
      if (res.status === 401 || res.status === 403) {
        logout(); // token is invalid or expired — send back to login
        return null;
      }
      return res;
    });
  };

  // Fetch the live queue for the given service id
  const fetchQueue = (serviceId) => {
    if (!serviceId) return;
    adminFetch(`${QUEUES_PATH}/${serviceId}`)
      .then((res) => res && res.json())
      .then((data) => { if (data) setQueue(data); });
  };

  // Fetch configured services once on mount; default-select the first one
  useEffect(() => {
    adminFetch("http://localhost:3000/api/admin/services")
      .then((res) => res && res.json())
      .then((data) => {
        if (!data) return;
        setServices(data);
        if (data.length > 0) {
          setSelectedService(String(data[0].id));
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
    setError(null);
    adminFetch(`${QUEUES_PATH}/${selectedService}/serve`, { method: "POST" })
      .then((res) => {
        if (!res) return;
        if (res.ok) {
          fetchQueue(selectedService);
        } else {
          res.json().then((body) => setError(body.message || "Failed to serve next user."));
        }
      });
  };

  const removeUser = (entryId) => {
    setError(null);
    adminFetch(`${QUEUES_PATH}/${selectedService}/${entryId}`, { method: "DELETE" })
      .then((res) => {
        if (!res) return;
        if (res.ok) {
          // Fetch fresh queue — positions are renumbered server-side after removal
          fetchQueue(selectedService);
        } else {
          res.json().then((body) => setError(body.message || "Failed to remove user."));
        }
      });
  };

  // Move an entry one position toward the front within the selected service's queue
  const moveUp = (entryId) => {
    setError(null);
    adminFetch(`${QUEUES_PATH}/${selectedService}/${entryId}/move-up`, { method: "PUT" })
      .then((res) => {
        if (!res) return;
        if (!res.ok) {
          return res.json().then((body) => setError(body.message || "Move failed."));
        }
        return res.json().then((updatedQueue) => setQueue(updatedQueue));
      });
  };

  return (
    <div className="">
      <h2 className="mb-4">Queue Management</h2>

      {error && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} />
        </div>
      )}

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
                  #{entry.position} - {entry.name}
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
