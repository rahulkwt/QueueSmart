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
    fetch(`${QUEUES_PATH}/${serviceId}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then((data) => setQueue(Array.isArray(data) ? data : []))
      .catch(() => setQueue([]));
  };

  // Fetch configured services once on mount; default-select the first one
  useEffect(() => {
    fetch("http://localhost:3000/api/admin/services", {
      headers: { Authorization: `Bearer ${user.token}` },
    })
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

  const priorityBadge = (p) => {
    if (!p) return <span className="badge bg-secondary">Low</span>;
    const lower = p.toLowerCase();
    if (lower === "high") return <span className="badge bg-danger">High</span>;
    if (lower === "mid" || lower === "medium") return <span className="badge bg-warning text-dark">Medium</span>;
    return <span className="badge bg-secondary">Low</span>;
  };

  const selectedServiceName = services.find((s) => s.id === selectedService)?.name ?? "";

  return (
    <div className="container-fluid py-2">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0 fw-bold">Queue Management</h4>
          <small className="text-muted">Manage and serve patients in real time</small>
        </div>
        <span className="badge bg-danger-subtle text-danger border px-3 py-2" style={{ fontSize: "0.85rem" }}>
          <i className="feather-shield me-1"></i> Admin Access
        </span>
      </div>

      {/* Service Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {services.map((s) => (
          <button
            key={s.id}
            className={`btn ${selectedService === s.id ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setSelectedService(s.id)}
          >
            {s.name}
            {selectedService === s.id && queue.length > 0 && (
              <span className="badge bg-white text-primary ms-2" style={{ fontSize: "0.7rem" }}>{queue.length}</span>
            )}
          </button>
        ))}
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
