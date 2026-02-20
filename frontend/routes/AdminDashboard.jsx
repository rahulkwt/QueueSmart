import React, { useState } from "react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  // Mock service data – replace with API later
  const [services, setServices] = useState([
    { id: 1, name: "General Consultation", queue: 12, avgWait: 18, open: true },
    { id: 2, name: "Pharmacy Pickup", queue: 5, avgWait: 5, open: true },
    { id: 3, name: "Lab Work & Blood Tests", queue: 8, avgWait: 22, open: true },
    { id: 4, name: "Radiology / Imaging", queue: 3, avgWait: 35, open: true },
    { id: 5, name: "Emergency Triage", queue: 0, avgWait: 0, open: false },
  ]);

  const recentActivity = [
    { id: 1, type: "joined", patient: "Patient P-20489", service: "General Consultation", time: "2 min ago" },
    { id: 2, type: "served", patient: "Patient P-18821", service: "Lab Work & Blood Tests", time: "5 min ago" },
    { id: 3, type: "left", patient: "Patient P-20101", service: "Pharmacy Pickup", time: "9 min ago" },
    { id: 4, type: "served", patient: "Patient P-19943", service: "General Consultation", time: "12 min ago" },
    { id: 5, type: "joined", patient: "Patient P-20502", service: "Radiology / Imaging", time: "15 min ago" },
  ];

  const totalPatients = services.reduce((acc, s) => acc + s.queue, 0);
  const openServices = services.filter((s) => s.open).length;
  const avgWaitAll = Math.round(
    services.filter((s) => s.open && s.avgWait > 0).reduce((acc, s) => acc + s.avgWait, 0) /
      services.filter((s) => s.open && s.avgWait > 0).length
  );

  const toggleService = (id) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, open: !s.open } : s))
    );
  };

  const activityIcon = {
    joined: { icon: "feather-user-plus", color: "text-primary" },
    served: { icon: "feather-check-circle", color: "text-success" },
    left: { icon: "feather-user-minus", color: "text-danger" },
  };

  return (
    <div className="container-fluid py-2">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0 fw-bold">Admin Dashboard</h4>
          <small className="text-muted">Hospital Queue Overview</small>
        </div>
        <span className="badge bg-danger-subtle text-danger border px-3 py-2" style={{ fontSize: "0.85rem" }}>
          <i className="feather-shield me-1"></i> Admin Access
        </span>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="rounded-3 bg-primary-subtle p-3">
                <i className="feather-users text-primary" style={{ fontSize: "1.4rem" }}></i>
              </div>
              <div>
                <div className="text-muted small text-uppercase fw-semibold">Total in Queue</div>
                <div className="fs-4 fw-bold">{totalPatients}</div>
                <div className="text-muted" style={{ fontSize: "0.78rem" }}>Across all services</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="rounded-3 bg-success-subtle p-3">
                <i className="feather-check-square text-success" style={{ fontSize: "1.4rem" }}></i>
              </div>
              <div>
                <div className="text-muted small text-uppercase fw-semibold">Open Services</div>
                <div className="fs-4 fw-bold">{openServices} / {services.length}</div>
                <div className="text-muted" style={{ fontSize: "0.78rem" }}>Currently active</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="rounded-3 bg-warning-subtle p-3">
                <i className="feather-clock text-warning" style={{ fontSize: "1.4rem" }}></i>
              </div>
              <div>
                <div className="text-muted small text-uppercase fw-semibold">Avg Wait Time</div>
                <div className="fs-4 fw-bold">~{avgWaitAll} min</div>
                <div className="text-muted" style={{ fontSize: "0.78rem" }}>Across open services</div>
              </div>
            </div>
          </div>
        </div>


      </div>

      <div className="row g-3">
        {/* Services Table */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">
                <i className="feather-grid me-2 text-primary"></i>Services & Queue Lengths
              </h6>
              <Link to="/portal/service-management" className="btn btn-primary btn-sm">
                Manage Services
              </Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "35%" }}>Service</th>
                      <th style={{ width: "15%" }}>Queue</th>
                      <th style={{ width: "20%" }}>Est. Wait</th>
                      <th style={{ width: "15%" }}>Status</th>
                      <th style={{ width: "15%" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((svc) => (
                      <tr key={svc.id}>
                        <td>
                          <span className="fw-semibold small">{svc.name}</span>
                        </td>
                        <td>
                          <span className="fw-bold text-primary">{svc.queue}</span>
                          <span className="text-muted small ms-1">pts</span>
                        </td>
                        <td className="small text-muted">
                          {svc.open ? `~${svc.avgWait} min` : "—"}
                        </td>
                        <td>
                          <span
                            className={`badge border ${
                              svc.open ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"
                            }`}
                          >
                            {svc.open ? "Open" : "Closed"}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`btn btn-sm ${svc.open ? "btn-outline-danger" : "btn-outline-success"}`}
                            style={{ fontSize: "0.72rem", padding: "2px 8px" }}
                            onClick={() => toggleService(svc.id)}
                          >
                            {svc.open ? "Close" : "Open"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-footer bg-white d-flex gap-2">
              <Link to="/portal/queue-management" className="btn btn-outline-primary btn-sm">
                Queue Management
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white">
              <h6 className="mb-0 fw-bold">
                <i className="feather-activity me-2 text-success"></i>Recent Activity
              </h6>
            </div>
            <div className="card-body p-0">
              {recentActivity.map((a) => (
                <div key={a.id} className="d-flex align-items-start gap-3 px-3 py-3 border-bottom">
                  <i className={`${activityIcon[a.type].icon} ${activityIcon[a.type].color} mt-1`}></i>
                  <div>
                    <div className="small fw-semibold">{a.patient}</div>
                    <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                      {a.type === "joined" && "Joined"} 
                      {a.type === "served" && "Served from"} 
                      {a.type === "left" && "Left"} {a.service}
                    </div>
                    <div className="text-muted" style={{ fontSize: "0.72rem" }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="card-footer bg-white text-center">
              <span className="text-muted small">Showing last 5 actions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;