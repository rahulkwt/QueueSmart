import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const formatPriority = (p) => {
  if (!p) return "Low";
  const l = p.toLowerCase();
  if (l === "mid" || l === "medium") return "Medium";
  return l.charAt(0).toUpperCase() + l.slice(1);
};

const statusBadge = (s) => {
  if (s === "completed") return <span className="badge bg-success">Completed</span>;
  if (s === "cancelled") return <span className="badge bg-danger">Cancelled</span>;
  return <span className="badge bg-warning text-dark">Pending</span>;
};

const priorityBadge = (p) => {
  const l = (p || "").toLowerCase();
  if (l === "high") return <span className="badge bg-danger">{formatPriority(p)}</span>;
  if (l === "mid" || l === "medium") return <span className="badge bg-warning text-dark">{formatPriority(p)}</span>;
  return <span className="badge bg-secondary">{formatPriority(p)}</span>;
};

const DataReports = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({ total: 0, completed: 0, cancelled: 0, pending: 0 });
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

  const [filters, setFilters] = useState({ from: firstOfMonth, to: today, serviceId: "", status: "" });

  useEffect(() => {
    fetch("http://localhost:3000/api/admin/services", {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then((d) => setServices(Array.isArray(d) ? d : []));
  }, []);

  const fetchReport = (overrideFilters) => {
    const active = overrideFilters || filters;
    setLoading(true);
    const params = new URLSearchParams();
    if (active.from) params.set("from", active.from);
    if (active.to) params.set("to", active.to);
    if (active.serviceId) params.set("serviceId", active.serviceId);
    if (active.status) params.set("status", active.status);

    fetch(`http://localhost:3000/api/admin/reports?${params}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setEntries(Array.isArray(d.entries) ? d.entries : []);
        setSummary(d.summary || { total: 0, completed: 0, cancelled: 0, pending: 0 });
      })
      .catch(() => {
        setEntries([]);
        setSummary({ total: 0, completed: 0, cancelled: 0, pending: 0 });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReport(); }, []);

  const set = (key, val) => {
    const next = { ...filters, [key]: val };
    setFilters(next);
    fetchReport(next);
  };

  const clearFilters = () => {
    const reset = { from: firstOfMonth, to: today, serviceId: "", status: "" };
    setFilters(reset);
    fetchReport(reset);
  };

  /**
   * Builds a CSV string from the current filtered entries and triggers a browser download.
   * Uses the native Blob API — no dependencies required.
   */
  const exportCSV = () => {
    const timestamp = new Date().toLocaleString("en-US");
    const serviceName = filters.serviceId
      ? (services.find((s) => String(s.id) === String(filters.serviceId))?.name ?? "Unknown")
      : "All";
    const statusLabel = filters.status
      ? filters.status.charAt(0).toUpperCase() + filters.status.slice(1)
      : "All";

    const meta = [
      ["QueueSmart Data Report"],
      ["Generated:", timestamp],
      [],
      ["Filters"],
      ["From", filters.from, "To", filters.to, "Service", serviceName, "Status", statusLabel],
      [],
      ["Summary"],
      ["Total", "Completed", "Cancelled", "Pending"],
      [summary.total, summary.completed, summary.cancelled, summary.pending],
      [],
      ["Patient", "Service", "Priority", "Status", "Date", "Time"],
    ];

    const rows = entries.map((e) => {
      const dt = new Date(e.joinedAt);
      return [
        e.patient,
        e.service,
        formatPriority(e.priority),
        e.status.charAt(0).toUpperCase() + e.status.slice(1),
        dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      ];
    });

    const csv = [...meta, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `queue-report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container-fluid py-2">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0 fw-bold">Data Reports</h4>
          <small className="text-muted">Filter and explore queue activity</small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-success btn-sm"
            onClick={exportCSV}
            disabled={entries.length === 0}
            title="Download filtered results as CSV"
          >
            <i className="me-1"></i> Export CSV
          </button>
          <span className="badge bg-danger-subtle text-danger border px-3 py-2" style={{ fontSize: "0.85rem" }}>
            <i className="feather-shield me-1"></i> Admin Access
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-sm-6 col-md-3">
              <label className="form-label small fw-semibold text-muted text-uppercase">From</label>
              <input type="date" className="form-control" style={{ height: "45px" }} value={filters.from} onChange={(e) => set("from", e.target.value)} />
            </div>
            <div className="col-sm-6 col-md-3">
              <label className="form-label small fw-semibold text-muted text-uppercase">To</label>
              <input type="date" className="form-control" style={{ height: "45px" }} value={filters.to} onChange={(e) => set("to", e.target.value)} />
            </div>
            <div className="col-sm-6 col-md-2">
              <label className="form-label small fw-semibold text-muted text-uppercase">Service</label>
              <select className="form-select" style={{ height: "45px" }} value={filters.serviceId} onChange={(e) => set("serviceId", e.target.value)}>
                <option value="">All Services</option>
                {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="col-sm-6 col-md-2">
              <label className="form-label small fw-semibold text-muted text-uppercase">Status</label>
              <select className="form-select" style={{ height: "45px" }} value={filters.status} onChange={(e) => set("status", e.target.value)}>
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-sm-6 col-md-2 d-flex gap-2 align-items-end">
              <button className="btn btn-outline-secondary w-100" onClick={clearFilters}>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total", value: summary.total, color: "primary", icon: "feather-list" },
          { label: "Completed", value: summary.completed, color: "success", icon: "feather-check-circle" },
          { label: "Cancelled", value: summary.cancelled, color: "danger", icon: "feather-x-circle" },
          { label: "Pending", value: summary.pending, color: "warning", icon: "feather-clock" },
        ].map(({ label, value, color, icon }) => (
          <div className="col-6 col-md-3" key={label}>
            <div className="card shadow-sm border-0">
              <div className="card-body d-flex align-items-center gap-3">
                <div className={`rounded-3 bg-${color}-subtle p-3`}>
                  <i className={`${icon} text-${color}`} style={{ fontSize: "1.3rem" }}></i>
                </div>
                <div>
                  <div className="text-muted small text-uppercase fw-semibold">{label}</div>
                  <div className="fs-4 fw-bold">{value}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white">
          <h6 className="mb-0 fw-bold"><i className="feather-table me-2 text-primary"></i>Queue Entries</h6>
        </div>
        <div className="card-body p-0">
          {entries.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="feather-inbox" style={{ fontSize: "2rem" }}></i>
              <p className="mt-2 mb-0">No entries found for the selected filters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Patient</th>
                    <th>Service</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => {
                    const dt = new Date(e.joinedAt);
                    return (
                      <tr key={e.id}>
                        <td className="fw-semibold">{e.patient}</td>
                        <td className="text-muted">{e.service}</td>
                        <td>{priorityBadge(e.priority)}</td>
                        <td>{statusBadge(e.status)}</td>
                        <td>{dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                        <td className="text-muted">{dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {entries.length > 0 && (
          <div className="card-footer bg-white text-muted small">
            Showing {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataReports;
