import React, { useState } from "react";
import { Link } from "react-router-dom";

// ── Mock Data ──────────────────────────────────────────────────────────────────

const mockQueueStatus = {
  currentQueue: {
    serviceName: "General Consultation",
    position: 3,
    estimatedWait: 15,
    status: "waiting", // waiting | almost-ready | served
    joinedAt: "2025-02-18T09:32:00",
  },
};

const mockServices = [
  {
    id: 1,
    name: "General Consultation",
    department: "General Medicine",
    icon: "flaticon-cardiovascular",
    waitTime: 15,
    queueLength: 8,
    available: true,
  },
  {
    id: 2,
    name: "Dental Checkup",
    department: "Dentistry",
    icon: "flaticon-teeth",
    waitTime: 25,
    queueLength: 5,
    available: true,
  },
  {
    id: 3,
    name: "ENT Examination",
    department: "ENT",
    icon: "flaticon-ear",
    waitTime: 10,
    queueLength: 3,
    available: true,
  },
  {
    id: 4,
    name: "Orthopedic Consult",
    department: "Orthopedics",
    icon: "flaticon-bone",
    waitTime: 0,
    queueLength: 0,
    available: false,
  },
  {
    id: 5,
    name: "Neurological Screening",
    department: "Neurology",
    icon: "flaticon-lung",
    waitTime: 30,
    queueLength: 12,
    available: true,
  },
  {
    id: 6,
    name: "Blood Work & Lab Tests",
    department: "Laboratory",
    icon: "flaticon-cell",
    waitTime: 20,
    queueLength: 6,
    available: true,
  },
];

const mockNotifications = [
  {
    id: 1,
    message: "Your position in General Consultation queue moved to #3.",
    time: "2 min ago",
    type: "queue-update",
    read: false,
  },
  {
    id: 2,
    message: "Dental Checkup queue is now open with short wait times.",
    time: "10 min ago",
    type: "status-change",
    read: false,
  },
  {
    id: 3,
    message: "Your Blood Work appointment has been confirmed for tomorrow.",
    time: "1 hr ago",
    type: "status-change",
    read: true,
  },
  {
    id: 4,
    message: "ENT Examination queue has reopened.",
    time: "3 hr ago",
    type: "queue-update",
    read: true,
  },
  {
    id: 5,
    message: "You were successfully served at Dental Checkup.",
    time: "Yesterday",
    type: "status-change",
    read: true,
  },
];

const mockHistory = [
  {
    id: 1,
    serviceName: "Dental Checkup",
    date: "2025-02-17",
    outcome: "Served",
    waitTime: "18 min",
  },
  {
    id: 2,
    serviceName: "Blood Work & Lab Tests",
    date: "2025-02-14",
    outcome: "Served",
    waitTime: "22 min",
  },
  {
    id: 3,
    serviceName: "General Consultation",
    date: "2025-02-10",
    outcome: "Served",
    waitTime: "12 min",
  },
  {
    id: 4,
    serviceName: "ENT Examination",
    date: "2025-02-05",
    outcome: "Cancelled",
    waitTime: "—",
  },
  {
    id: 5,
    serviceName: "Neurological Screening",
    date: "2025-01-28",
    outcome: "Served",
    waitTime: "35 min",
  },
];

// ── Helper Components ──────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const map = {
    waiting: { label: "Waiting", cls: "badge bg-warning text-dark" },
    "almost-ready": { label: "Almost Ready", cls: "badge bg-info text-white" },
    served: { label: "Served", cls: "badge bg-success text-white" },
  };
  const s = map[status] || map.waiting;
  return <span className={s.cls}>{s.label}</span>;
};

const OutcomeBadge = ({ outcome }) => {
  const cls =
    outcome === "Served"
      ? "badge bg-success"
      : outcome === "Cancelled"
      ? "badge bg-danger"
      : "badge bg-secondary";
  return <span className={cls}>{outcome}</span>;
};

// ── Main Component ─────────────────────────────────────────────────────────────

const UserDashboard = () => {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const queue = mockQueueStatus.currentQueue;

  return (
    <div className="main-content">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="page-header">
        <div className="container-fluid">
          <div className="row align-items-center mb-4">
            <div className="col">
              <h2 className="header-title mb-0">Patient Dashboard</h2>
              <p className="text-muted mb-0 mt-1">
                Welcome back! Here's your queue overview.
              </p>
            </div>
            <div className="col-auto">
              <Link to="/portal/user" className="btn btn-primary">
                <i className="fas fa-sync-alt me-1"></i> Refresh
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid">
        {/* ── Current Queue Status Card ──────────────────────────────── */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="row align-items-center">
                  <div className="col-lg-6">
                    <h5 className="fw-bold mb-3">
                      <i className="fas fa-clipboard-list me-2 text-primary"></i>
                      Current Queue Status
                    </h5>
                    <h4 className="mb-2">{queue.serviceName}</h4>
                    <StatusBadge status={queue.status} />
                  </div>

                  {/* Stat boxes */}
                  <div className="col-lg-6">
                    <div className="row text-center mt-3 mt-lg-0">
                      <div className="col-4">
                        <div className="p-3 rounded" style={{ backgroundColor: "#f0f4ff" }}>
                          <h3 className="mb-0 text-primary fw-bold">
                            #{queue.position}
                          </h3>
                          <small className="text-muted">Position</small>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="p-3 rounded" style={{ backgroundColor: "#fff4ec" }}>
                          <h3 className="mb-0 fw-bold" style={{ color: "#e67e22" }}>
                            {queue.estimatedWait}
                          </h3>
                          <small className="text-muted">Min Wait</small>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="p-3 rounded" style={{ backgroundColor: "#eafff0" }}>
                          <h3 className="mb-0 fw-bold text-success">
                            {new Date(queue.joinedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </h3>
                          <small className="text-muted">Joined At</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress visual */}
                <div className="mt-4">
                  <div className="d-flex justify-content-between mb-1">
                    <small className="text-muted">Queue Progress</small>
                    <small className="text-muted">Position {queue.position} of 8</small>
                  </div>
                  <div className="progress" style={{ height: "8px" }}>
                    <div
                      className="progress-bar bg-primary"
                      role="progressbar"
                      style={{ width: `${((8 - queue.position) / 8) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-3 text-end">
                  <button className="btn btn-outline-danger btn-sm">
                    <i className="fas fa-sign-out-alt me-1"></i> Leave Queue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Active Services ────────────────────────────────────────── */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">
                <i className="fas fa-hospital me-2 text-primary"></i>
                Active Services
              </h5>
            </div>
          </div>

          {mockServices.map((svc) => (
            <div key={svc.id} className="col-lg-4 col-md-6 mb-4">
              <div
                className={`card border-0 shadow-sm h-100 ${
                  !svc.available ? "opacity-50" : ""
                }`}
              >
                <div className="card-body p-4">
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: 48,
                        height: 48,
                        backgroundColor: svc.available ? "#e8f0fe" : "#f5f5f5",
                      }}
                    >
                      <i
                        className={svc.icon}
                        style={{
                          fontSize: 22,
                          color: svc.available ? "#2563eb" : "#999",
                        }}
                      ></i>
                    </div>
                    {svc.available ? (
                      <span className="badge bg-success-subtle text-success">
                        Open
                      </span>
                    ) : (
                      <span className="badge bg-secondary">Closed</span>
                    )}
                  </div>

                  <h6 className="fw-bold mb-1">{svc.name}</h6>
                  <p className="text-muted small mb-3">{svc.department}</p>

                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted">
                        <i className="fas fa-users me-1"></i>
                        {svc.queueLength} in queue
                      </small>
                    </div>
                    <div>
                      <small className="text-muted">
                        <i className="fas fa-clock me-1"></i>
                        ~{svc.waitTime} min
                      </small>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary btn-sm w-100 mt-3"
                    disabled={!svc.available}
                  >
                    {svc.available ? "Join Queue" : "Unavailable"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Notifications & History Row ─────────────────────────────── */}
        <div className="row mb-5">
          {/* Notifications */}
          <div className="col-lg-5 mb-4 mb-lg-0">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3 px-4">
                <h6 className="fw-bold mb-0">
                  <i className="fas fa-bell me-2 text-primary"></i>
                  Notifications
                  {unreadCount > 0 && (
                    <span className="badge bg-danger ms-2">{unreadCount}</span>
                  )}
                </h6>
                <button
                  className="btn btn-link btn-sm text-decoration-none p-0"
                  onClick={markAllRead}
                >
                  Mark all read
                </button>
              </div>
              <div className="card-body p-0" style={{ maxHeight: 380, overflowY: "auto" }}>
                <ul className="list-group list-group-flush">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className={`list-group-item px-4 py-3 ${
                        !n.read ? "bg-light" : ""
                      }`}
                    >
                      <div className="d-flex">
                        <div className="me-3 mt-1">
                          <i
                            className={`fas ${
                              n.type === "queue-update"
                                ? "fa-arrow-up text-primary"
                                : "fa-info-circle text-success"
                            }`}
                          ></i>
                        </div>
                        <div>
                          <p className="mb-1 small">{n.message}</p>
                          <small className="text-muted">{n.time}</small>
                        </div>
                        {!n.read && (
                          <span
                            className="ms-auto mt-1 bg-primary rounded-circle"
                            style={{ width: 8, height: 8, display: "inline-block" }}
                          ></span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-bottom py-3 px-4">
                <h6 className="fw-bold mb-0">
                  <i className="fas fa-history me-2 text-primary"></i>
                  Queue History
                </h6>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="px-4 py-3 small text-muted fw-semibold">Service</th>
                        <th className="py-3 small text-muted fw-semibold">Date</th>
                        <th className="py-3 small text-muted fw-semibold">Wait Time</th>
                        <th className="py-3 small text-muted fw-semibold">Outcome</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockHistory.map((h) => (
                        <tr key={h.id}>
                          <td className="px-4 py-3">{h.serviceName}</td>
                          <td className="py-3">{h.date}</td>
                          <td className="py-3">{h.waitTime}</td>
                          <td className="py-3">
                            <OutcomeBadge outcome={h.outcome} />
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

export default UserDashboard;
