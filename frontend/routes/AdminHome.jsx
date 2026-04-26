import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SERVICES_PATH = "http://localhost:3000/api/admin/services/with-counts";

const AdminHome = () => {
  const { user } = useAuth();
  const [apiServices, setApiServices] = useState([]);

  useEffect(() => {
    const fetchServices = () => {
      fetch(SERVICES_PATH, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
        .then((res) => res.json())
        .then((data) => setApiServices(data));
    };

    fetchServices();
    const interval = setInterval(fetchServices, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalPatients = apiServices.reduce((acc, s) => acc + (s.queueCount || 0), 0);
  const openServices = apiServices.length;
  const servicesWithQueue = apiServices.filter((s) => s.queueCount > 0);
  const avgWaitAll = servicesWithQueue.length > 0
    ? Math.round(servicesWithQueue.reduce((acc, s) => acc + s.queueCount * (s.duration || 5), 0) / servicesWithQueue.length)
    : 0;

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

      <div className="row g-3">
        {/* Services Table */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">
                <i className="feather-grid me-2 text-primary"></i>Services & Queue Lengths
              </h6>
              <Link to="/portal/admin/service-management" className="btn btn-primary btn-sm">
                Manage Services
              </Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Service</th>
                      <th>Queue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiServices.map((svc) => (
                      <tr key={svc.id}>
                        <td>
                          <div className="fw-semibold small">{svc.name}</div>
                          <small className="text-muted">{svc.description}</small>
                        </td>
                        <td>
                          <span className="fw-bold text-primary">{svc.queueCount}</span>
                          <span className="text-muted small ms-1">{svc.queueCount == 1 ? "patient" : "patients"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-footer bg-white d-flex gap-2">
              <Link to="/portal/admin/queue-management" className="btn btn-outline-primary btn-sm">
                Queue Management
              </Link>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="col-lg-4 d-flex flex-column gap-3">
          <div className="card shadow-sm border-0">
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

          <div className="card shadow-sm border-0">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="rounded-3 bg-success-subtle p-3">
                <i className="feather-check-square text-success" style={{ fontSize: "1.4rem" }}></i>
              </div>
              <div>
                <div className="text-muted small text-uppercase fw-semibold">Open Services</div>
                <div className="fs-4 fw-bold">{openServices} / {apiServices.length}</div>
                <div className="text-muted" style={{ fontSize: "0.78rem" }}>Currently active</div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-0">
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
    </div>
  );
};

export default AdminHome;
