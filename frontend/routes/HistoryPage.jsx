import React, { useState } from "react";
import { Link } from "react-router-dom";

const HistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [services] = useState([
    { id: 1, name: "Pharmacy Pickup",
      description: "Collect prescribed medications",
      date: "02/10/2026", notes: "Prescription filled", status: "Pending" },
    { id: 2, name: "Lab Work & Blood Tests",
      description: "Blood draws, urine tests, and lab diagnostics",
      date: "01/12/2026", notes: "Normal results", status: "Completed" },
    { id: 3, name: "General Consultation",
      description: "Routine check-ups and doctor visits",
      date: "09/25/2025", notes: "Follow-up in 2 weeks", status: "Completed" }
  ]);

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Your queue history</h2>
        {/* added search bar */}
        <input 
          type="text" 
          className="form-control w-25" 
          placeholder="Search services..." 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card text-center border-primary shadow-sm">
            <div className="card-body">
              <h6 className="text-muted text-uppercase small">Total Visits</h6>
              <h3 className="text-primary mb-0">{services.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card text-center border-primary shadow-sm">
            <div className="card-body">
              <h6 className="text-muted text-uppercase small">First Date</h6>
              <h3 className="text-primary mb-0">09/25/2025</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card text-center border-primary shadow-sm">
            <div className="card-body">
              <h6 className="text-muted text-uppercase small">Last date</h6>
              <h3 className="text-primary mb-0">01/12/2026</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-white">
          <h5 className="mb-0">Queue Log</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "40%" }}>Service Name</th>
                  <th style={{ width: "15%" }}>Date</th>
                  <th style={{ width: "15%" }}>Status</th> 
                  <th style={{ width: "30%" }}>Doctor Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => (
                  <tr key={service.id}>
                    <td>
                      <div className="fw-bold">{service.name}</div>
                      <small className="text-muted">{service.description}</small>
                    </td>
                    <td className="text-nowrap">{service.date}</td>
                    <td>
                      <span className={`badge ${service.status === 'Completed' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'} border`}>
                        {service.status}
                      </span>
                    </td>
                    <td className="text-muted small">{service.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;