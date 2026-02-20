import React, { useState } from "react";
import { Link } from "react-router-dom";

const HistoryPage = () => {
  // javascript
  // for searching
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");
  // mock data of prior queues
  const [services] = useState([
    { id: 1, name: "Pharmacy Pickup",
      description: "Collect prescribed medications",
      date: "02/10/2026", notes: "Prescription filled", status: "Pending" },
    { id: 2, name: "Lab Work & Blood Tests",
      description: "Blood draws, urine tests, and lab diagnostics",
      date: "01/12/2026", notes: "Normal results", status: "Completed" },
    { id: 3, name: "General Consultation",
      description: "Routine check-ups and doctor visits",
      date: "09/25/2025", notes: "Normal results", status: "Completed" }
  ]);

  // this is where we search
  // one can search either with the name in the search bar
  // or with the calendar/date input
  const filteredServices = services.filter(s => {
    const matchesText = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = searchDate === "" || (() => {
      const [m, d, y] = s.date.split("/");
      const formattedDate = `${y}-${m}-${d}`;
      return formattedDate === searchDate;
    })();
    
    return matchesText && matchesDate;
  });

  // actual HTML returned
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
        <input 
          type="date" 
          className="form-control w-25 ms-2" 
          onChange={(e) => setSearchDate(e.target.value)} 
        />
      </div>

      {/* quick summary, taken from Alec */}
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
      {/* table for the log of queues */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-white">
          <h5 className="mb-0">Queue Log</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  {/*table head*/}
                  <th style={{ width: "40%" }}>Service Name</th>
                  <th style={{ width: "15%" }}>Date</th>
                  <th style={{ width: "15%" }}>Status</th> 
                  <th style={{ width: "30%" }}>Doctor Notes</th>
                </tr>
              </thead>
              <tbody>
                {/*goes through queues, gives information in rows*/}
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