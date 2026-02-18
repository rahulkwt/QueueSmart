import React, { useState } from "react";
import { Link } from "react-router-dom";

// ── Mock Data ──────────────────────────────────────────────────────────────────

const initialServices = [
  {
    id: 1,
    name: "General Consultation",
    department: "General Medicine",
    icon: "flaticon-cardiovascular",
    description: "Routine medical consultations and check-ups.",
    expectedDuration: 20,
    queueLength: 8,
    currentlyServing: "Patient #A-042",
    isOpen: true,
  },
  {
    id: 2,
    name: "Dental Checkup",
    department: "Dentistry",
    icon: "flaticon-teeth",
    description: "Dental examinations, cleanings, and minor procedures.",
    expectedDuration: 30,
    queueLength: 5,
    currentlyServing: "Patient #D-017",
    isOpen: true,
  },
  {
    id: 3,
    name: "ENT Examination",
    department: "ENT",
    icon: "flaticon-ear",
    description: "Ear, nose, and throat specialist consultations.",
    expectedDuration: 25,
    queueLength: 3,
    currentlyServing: "Patient #E-008",
    isOpen: true,
  },
  {
    id: 4,
    name: "Orthopedic Consult",
    department: "Orthopedics",
    icon: "flaticon-bone",
    description: "Bone and joint evaluation, fracture follow-ups.",
    expectedDuration: 20,
    queueLength: 0,
    currentlyServing: "—",
    isOpen: false,
  },
  {
    id: 5,
    name: "Neurological Screening",
    department: "Neurology",
    icon: "flaticon-lung",
    description: "Neurological assessments and diagnostic screenings.",
    expectedDuration: 40,
    queueLength: 12,
    currentlyServing: "Patient #N-031",
    isOpen: true,
  },
  {
    id: 6,
    name: "Blood Work & Lab Tests",
    department: "Laboratory",
    icon: "flaticon-cell",
    description: "Blood draws, urinalysis, and standard lab panels.",
    expectedDuration: 15,
    queueLength: 6,
    currentlyServing: "Patient #L-055",
    isOpen: true,
  },
];

// ── Main Component ─────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const [services, setServices] = useState(initialServices);

  const toggleQueue = (id) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isOpen: !s.isOpen } : s))
    );
  };

  const serveNext = (id) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === id && s.queueLength > 0
          ? { ...s, queueLength: s.queueLength - 1 }
          : s
      )
    );
  };

  const totalQueued = services.reduce((sum, s) => sum + s.queueLength, 0);
  const openCount = services.filter((s) => s.isOpen).length;
  const closedCount = services.filter((s) => !s.isOpen).length;
  const avgWait = services.length
    ? Math.round(
        services.reduce(
          (sum, s) => sum + (s.isOpen ? s.expectedDuration : 0),
          0
        ) / (openCount || 1)
      )
    : 0;

  return (
    <div className="main-content">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="page-header">
        <div className="container-fluid">
          <div className="row align-items-center mb-4">
            <div className="col">
              <h2 className="header-title mb-0">Admin Dashboard</h2>
              <p className="text-muted mb-0 mt-1">
                Manage hospital queues and services at a glance.
              </p>
            </div>
            <div className="col-auto">
              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid">
        {/* ── Summary Cards ──────────────────────────────────────────── */}
        <div className="row mb-4">
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h3 className="mb-0 fw-bold">{totalQueued}</h3>
                <small className="text-muted">Total in Queues</small>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h3 className="mb-0 fw-bold text-success">{openCount}</h3>
                <small className="text-muted">Open Queues</small>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h3 className="mb-0 fw-bold text-danger">{closedCount}</h3>
                <small className="text-muted">Closed Queues</small>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h3 className="mb-0 fw-bold" style={{ color: "#e67e22" }}>
                  {avgWait} min
                </h3>
                <small className="text-muted">Avg. Service Duration</small>
              </div>
            </div>
          </div>
        </div>

        {/* ── Services Table ─────────────────────────────────────────── */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom py-3 px-4">
                <h5 className="fw-bold mb-0">
                  Hospital Services &amp; Queue Lengths
                </h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="px-4 py-3 small text-muted fw-semibold">
                          Service
                        </th>
                        <th className="py-3 small text-muted fw-semibold">
                          Duration
                        </th>
                        <th className="py-3 small text-muted fw-semibold">
                          Queue
                        </th>
                        <th className="py-3 small text-muted fw-semibold">
                          Currently Serving
                        </th>
                        <th className="py-3 small text-muted fw-semibold">
                          Status
                        </th>
                        <th className="py-3 small text-muted fw-semibold text-center">
                          Quick Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((svc) => (
                        <tr key={svc.id}>
                          {/* Service name + icon */}
                          <td className="px-4 py-3">
                            <div className="d-flex align-items-center">
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                                style={{
                                  width: 40,
                                  height: 40,
                                  backgroundColor: svc.isOpen
                                    ? "#e8f0fe"
                                    : "#f5f5f5",
                                }}
                              >
                                <i
                                  className={svc.icon}
                                  style={{
                                    fontSize: 18,
                                    color: svc.isOpen ? "#2563eb" : "#999",
                                  }}
                                ></i>
                              </div>
                              <div>
                                <span className="fw-semibold">{svc.name}</span>
                                <br />
                                <small className="text-muted">{svc.department}</small>
                              </div>
                            </div>
                          </td>

                          {/* Duration */}
                          <td className="py-3">{svc.expectedDuration} min</td>

                          {/* Queue length */}
                          <td className="py-3">
                            <span
                              className={`fw-bold ${
                                svc.queueLength >= 10
                                  ? "text-danger"
                                  : svc.queueLength >= 5
                                  ? "text-warning"
                                  : "text-success"
                              }`}
                            >
                              {svc.queueLength}
                            </span>{" "}
                            <small className="text-muted">patients</small>

                            <div
                              className="progress mt-1"
                              style={{ height: 4, maxWidth: 100 }}
                            >
                              <div
                                className={`progress-bar ${
                                  svc.queueLength >= 10
                                    ? "bg-danger"
                                    : svc.queueLength >= 5
                                    ? "bg-warning"
                                    : "bg-success"
                                }`}
                                style={{
                                  width: `${Math.min(
                                    (svc.queueLength / 15) * 100,
                                    100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </td>

                          {/* Currently serving */}
                          <td className="py-3">
                            <span className={svc.isOpen ? "" : "text-muted"}>
                              {svc.currentlyServing}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3">
                            {svc.isOpen ? (
                              <span className="badge bg-success">Open</span>
                            ) : (
                              <span className="badge bg-secondary">Closed</span>
                            )}
                          </td>

                          {/* Quick Actions */}
                          <td className="py-3 text-center">
                            <div className="d-flex justify-content-center gap-2 flex-wrap">
                              <button
                                className={`btn btn-sm ${
                                  svc.isOpen
                                    ? "btn-outline-danger"
                                    : "btn-outline-success"
                                }`}
                                onClick={() => toggleQueue(svc.id)}
                              >
                                {svc.isOpen ? "Close" : "Open"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;