import React, { useState } from "react";
import { Link } from "react-router-dom";

const HistoryPage = () => {
  // Mock data
  const [services, setServices] = useState([
    { id: 1, name: "General Consultation", description: "Routine check-ups and doctor visits", duration: 20, priority: "high", queueLength: 8, isOpen: true },
    { id: 2, name: "Lab Work & Blood Tests", description: "Blood draws, urine tests, and lab diagnostics", duration: 15, priority: "medium", queueLength: 5, isOpen: true },
    { id: 3, name: "Pharmacy Pickup", description: "Collect prescribed medications", duration: 10, priority: "low", queueLength: 3, isOpen: true },
    { id: 4, name: "Radiology & Imaging", description: "X-rays, MRIs, CT scans, and ultrasounds", duration: 35, priority: "high", queueLength: 12, isOpen: true },
    { id: 5, name: "Vaccination", description: "Flu shots, COVID boosters, and immunizations", duration: 10, priority: "medium", queueLength: 4, isOpen: false },
  ]);

  const recentActivity = [
    { id: 1, action: "Patient served", detail: "John D. completed General Consultation", time: "5 min ago" },
    { id: 2, action: "Queue opened", detail: "Lab Work & Blood Tests queue opened", time: "20 min ago" },
    { id: 3, action: "Patient removed", detail: "Jane S. left Radiology & Imaging", time: "30 min ago" },
    { id: 4, action: "Service created", detail: "Vaccination service was added", time: "1 hour ago" },
  ];

  const toggleQueue = (id) => {
    setServices(services.map((s) =>
      s.id === id ? { ...s, isOpen: !s.isOpen } : s
    ));
  };

  const getPriorityBadge = (priority) => {
    const colors = { high: "danger", medium: "warning", low: "success" };
    return <span className={`badge bg-${colors[priority]}`}>{priority}</span>;
  };

  const totalInQueue = services.reduce((sum, s) => sum + s.queueLength, 0);
  const openServices = services.filter((s) => s.isOpen).length;

  return (
    <div className="container py-4">
      <h2 className="mb-4">Your history</h2>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card text-center border-primary">
            <div className="card-body">
              <h6 className="text-muted">Total Services</h6>
              <h3 className="text-primary">{services.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center border-success">
            <div className="card-body">
              <h6 className="text-muted">Open Queues</h6>
              <h3 className="text-success">{openServices}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center border-warning">
            <div className="card-body">
              <h6 className="text-muted">Total in Queue</h6>
              <h3 className="text-warning">{totalInQueue}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center border-info">
            <div className="card-body">
              <h6 className="text-muted">Avg Wait Time</h6>
              <h3 className="text-info">14 min</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Services</h5>
        </div>
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Service Name</th>
                <th>Duration</th>
                <th>Priority</th>
                <th>Queue Length</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td>
                    <strong>{service.name}</strong>
                    <br />
                    <small className="text-muted">{service.description}</small>
                  </td>
                  <td>{service.duration} min</td>
                  <td>{getPriorityBadge(service.priority)}</td>
                  <td>{service.queueLength}</td>
                  <td>
                    <span className={`badge bg-${service.isOpen ? "success" : "secondary"}`}>
                      {service.isOpen ? "Open" : "Closed"}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${service.isOpen ? "btn-outline-danger" : "btn-outline-success"} me-2`}
                      onClick={() => toggleQueue(service.id)}
                    >
                      {service.isOpen ? "Close" : "Open"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;