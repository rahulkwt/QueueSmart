import React, { useState } from "react";
import { Link } from "react-router-dom";

const UserHome = () => {
  // Mock data – replace with real API calls later
  const user = { patientId: "P-20489" };

  const activeQueue = {
    service: "General Consultation",
    position: 4,
    totalAhead: 4,
    estimatedWait: 18, // minutes
    status: "waiting", // "waiting" | "almost_ready" | "served"
    ticketNumber: "GC-047",
    doctor: "Dr. Sarah Mitchell",
    room: "Room 12B",
  };

  const availableServices = [
    { id: 1, name: "Pharmacy Pickup", icon: "feather-package", wait: 5, open: true },
    { id: 2, name: "Lab Work & Blood Tests", icon: "feather-activity", wait: 22, open: true },
    { id: 3, name: "General Consultation", icon: "feather-user", wait: 18, open: true },
    { id: 4, name: "Radiology / Imaging", icon: "feather-aperture", wait: 35, open: true },
    { id: 5, name: "Emergency Triage", icon: "feather-alert-triangle", wait: 0, open: false },
  ];

  const statusColor = {
    waiting: "bg-warning-subtle text-warning",
    almost_ready: "bg-info-subtle text-info",
    served: "bg-success-subtle text-success",
  };

  const statusLabel = {
    waiting: "Waiting",
    almost_ready: "Almost Ready",
    served: "Served",
  };

  const progressPct = Math.max(
    5,
    Math.round(((10 - activeQueue.totalAhead) / 10) * 100)
  );

  return (
    <div className="container-fluid py-2">

      {/* Welcome Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0 fw-bold">Welcome back {user.name}</h4>
          <small className="text-muted">Patient ID: {user.patientId}</small>
        </div>
        <span className="badge bg-primary-subtle text-primary border px-3 py-2" style={{ fontSize: "0.85rem" }}>
          <i className="feather-clock me-1"></i> {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="rounded-3 bg-primary-subtle p-3">
                <i className="feather-layers text-primary" style={{ fontSize: "1.4rem" }}></i>
              </div>
              <div>
                <div className="text-muted small text-uppercase fw-semibold">Active Queue</div>
                <div className="fs-4 fw-bold">#4</div>
                <div className="text-muted" style={{ fontSize: "0.78rem" }}>General Consultation</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="rounded-3 bg-success-subtle p-3">
                <i className="feather-clock text-success" style={{ fontSize: "1.4rem" }}></i>
              </div>
              <div>
                <div className="text-muted small text-uppercase fw-semibold">Est. Wait</div>
                <div className="fs-4 fw-bold">~18 min</div>
                <div className="text-muted" style={{ fontSize: "0.78rem" }}>Updated just now</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="rounded-3 bg-info-subtle p-3">
                <i className="feather-bell text-info" style={{ fontSize: "1.4rem" }}></i>
              </div>
              <div>
                <div className="text-muted small text-uppercase fw-semibold">Notifications</div>
                <div className="fs-4 fw-bold">3</div>
                <div className="text-muted" style={{ fontSize: "0.78rem" }}>2 unread</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="rounded-3 bg-warning-subtle p-3">
                <i className="feather-calendar text-warning" style={{ fontSize: "1.4rem" }}></i>
              </div>
              <div>
                <div className="text-muted small text-uppercase fw-semibold">Past Visits</div>
                <div className="fs-4 fw-bold">3</div>
                <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                  <Link to="/portal/history" className="text-muted">View history →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {/* Active Queue Status Card */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">
                <i className="feather-radio me-2 text-primary"></i>Active Queue Status
              </h6>
              <span className={`badge ${statusColor[activeQueue.status]} border`}>
                {statusLabel[activeQueue.status]}
              </span>
            </div>
            <div className="card-body">
              <div className="text-center mb-3">
                <div
                  className="mx-auto rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold mb-2"
                  style={{ width: 80, height: 80, fontSize: "1.8rem" }}
                >
                  {activeQueue.position}
                </div>
                <div className="text-muted small">Your position in queue</div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between small text-muted mb-1">
                  <span>Queue progress</span>
                  <span>{activeQueue.totalAhead} ahead of you</span>
                </div>
                <div className="progress" style={{ height: 8 }}>
                  <div
                    className="progress-bar bg-primary"
                    style={{ width: `${progressPct}%` }}
                  ></div>
                </div>
              </div>

              <ul className="list-unstyled mb-3 small">
                <li className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Ticket</span>
                  <span className="fw-semibold">{activeQueue.ticketNumber}</span>
                </li>
                <li className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Service</span>
                  <span className="fw-semibold">{activeQueue.service}</span>
                </li>
                <li className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Doctor</span>
                  <span className="fw-semibold">{activeQueue.doctor}</span>
                </li>
                <li className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Room</span>
                  <span className="fw-semibold">{activeQueue.room}</span>
                </li>
                <li className="d-flex justify-content-between py-1">
                  <span className="text-muted">Est. Wait</span>
                  <span className="fw-semibold text-warning">~{activeQueue.estimatedWait} min</span>
                </li>
              </ul>

              <div className="d-grid gap-2">
                <Link to="/portal/join" className="btn btn-primary btn-sm" style={{ textAlign: "center", justifyContent: "center" }}>
                  View Full Status
                </Link>
                <button className="btn btn-outline-danger btn-sm" style={{ textAlign: "center", justifyContent: "center" }}>
                  Leave Queue
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Available Services */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">
                <i className="feather-grid me-2 text-primary"></i>Available Services
              </h6>
              <Link to="/portal/join" className="btn btn-primary btn-sm text-white px-3">Join a Queue →</Link>
            </div>
            <div className="card-body p-0">
              {availableServices.map((svc) => (
                <div key={svc.id} className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <i className={`${svc.icon} text-primary`}></i>
                    <span className="small fw-semibold">{svc.name}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    {svc.open ? (
                      <>
                        <span className="text-muted small">~{svc.wait} min</span>
                        <span className="badge bg-success-subtle text-success border">Open</span>
                      </>
                    ) : (
                      <span className="badge bg-danger-subtle text-danger border">Closed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHome