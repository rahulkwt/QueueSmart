import React, { useState } from "react";
import { Link } from "react-router-dom";

const HistoryPage = () => {
  // Mock data
  const [services, setServices] = useState([
    { id: 1, name: "General Consultation", 
      description: "Routine check-ups and doctor visits",
      date: "09/25/2025", queueLength: 8 },
    { id: 2, name: "Lab Work & Blood Tests", 
      description: "Blood draws, urine tests, and lab diagnostics", 
      date: "01/12/2026", queueLength: 5 },
    { id: 3, name: "Pharmacy Pickup",
      description: "Collect prescribed medications", 
      date: "02/10/2026", queueLength: 3 },
  ]);

  const totalInQueue = services.reduce((sum, s) => sum + s.queueLength, 0);
  const openServices = services.filter((s) => s.isOpen).length;

  return (
    <div className="container py-4">
      <h2 className="mb-4">Your queue history</h2>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card text-center border-primary">
            <div className="card-body">
              <h6 className="text-muted">First date</h6>
              <h3 className="text-primary">09/25/2025</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center border-primary">
            <div className="card-body">
              <h6 className="text-muted">Last date</h6>
              <h3 className="text-primary">01/12/2026</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center border-primary">
            <div className="card-body">
              <h6 className="text-muted">Queue amount</h6>
              <h3 className="text-primary">{services.length}</h3>
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
                <th>Date</th>
                <th>Doctor Notes</th>
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
                  <td>{service.date}</td>
                  <td>{service.queueLength}</td>
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