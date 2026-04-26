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

  const priorityBadge = (p) => {
    if (!p) return <span className="badge bg-secondary">Low</span>;
    const lower = p.toLowerCase();
    if (lower === "high") return <span className="badge bg-danger">High</span>;
    if (lower === "mid" || lower === "medium") return <span className="badge bg-warning text-dark">Medium</span>;
    return <span className="badge bg-secondary">Low</span>;
  };

  const selectedServiceName = services.find((s) => s.id === selectedService)?.name ?? "";

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

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white">
          <h6 className="mb-0 fw-bold">{selectedServiceName}</h6>
        </div>

        <div className="card-body p-0">
          {queue.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="feather-inbox" style={{ fontSize: "2rem" }}></i>
              <p className="mt-2 mb-0">No patients in queue for {selectedServiceName}</p>
            </div>
          ) : (
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 60 }}>#</th>
                  <th>Patient</th>
                  <th>Priority</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((entry, index) => (
                  <tr key={entry.id} className="align-middle">
                    <td className="fw-bold text-muted">{index + 1}</td>
                    <td>
                      <div className="fw-semibold">{entry.name}</div>
                    </td>
                    <td>{priorityBadge(entry.priority)}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => moveUp(entry.id)}
                        disabled={index === 0}
                        title="Move up"
                      >
                        <i className="feather-arrow-up"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeUser(entry.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {queue.length > 0 && (
          <div className="card-footer bg-white">
            <button className="btn btn-primary" onClick={serveNext}>
              <i className="feather-check me-2"></i>Serve Next Patient
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueManagement;
