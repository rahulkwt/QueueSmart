import React from "react";
import { Link } from "react-router-dom";

const UserDashboard = () => {
    //Mock data
    const currentQueue = {
        service: "Emergency Room",
        position: 4,
        estimatedWait: "30 minutes",
        status: "Waiting",
    };

const availableServices = [
    { id: 1, name: "General Consultation", waitTime: "15 minutes", queueLength: 8 },
    { id: 2, name: "Pediatrics", waitTime: "20 minutes", queueLength: 5 },
    { id: 3, name: "Dermatology", waitTime: "10 minutes", queueLength: 3 },
    { id: 4, name: "Cardiology", waitTime: "25 minutes", queueLength: 10 },
    { id: 5, name: "Orthopedics", waitTime: "18 minutes", queueLength: 7 },
];

const notifications =[
{ id : 1, message: "Your appointment for General Consultation is confirmed for tomorrow at 10 AM." },
{ id : 2, message: "Your position in the Emergency Room queue has changed. You are now 4th." },
{ id : 3, message: "Your Lab Work and Blood Test visit is complete " },
];

const toggleQueue = (id) => {
    setServices(services.map((s) => s.id === id ? { ...s, inOpen: !s.isOpen} : s));
};
return (
    <div className="container py-4">
      <h2 className="mb-4">User Dashboard</h2>

      {/* Current Queue Status */}
      <div className="card mb-4 border-primary">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Current Queue</h5>
          <span className="badge bg-light text-primary">{currentQueue.status}</span>
        </div>
        <div className="card-body">
          <div className="row text-center">
            <div className="col-md-4">
              <h6 className="text-muted">Service</h6>
              <p className="fs-5 fw-semibold">{currentQueue.service}</p>
            </div>
            <div className="col-md-4">
              <h6 className="text-muted">Position</h6>
              <p className="fs-5 fw-semibold">#{currentQueue.position}</p>
            </div>
            <div className="col-md-4">
              <h6 className="text-muted">Estimated Wait</h6>
              <p className="fs-5 fw-semibold">{currentQueue.estimatedWait}</p>
            </div>
          </div>
          <div className="text-center mt-3">
            <button className="btn btn-outline-danger">Leave Queue</button>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Available Services */}
        <div className="col-lg-7 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Available Services</h5>
            </div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Service</th>
                    <th>Wait Time</th>
                    <th>In Queue</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {availableServices.map((service) => (
                    <tr key={service.id}>
                      <td>{service.name}</td>
                      <td>{service.waitTime}</td>
                      <td>{service.queueLength}</td>
                      <td>
                        <button className="btn btn-sm btn-primary">Join</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="col-lg-5 mb-4">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Notifications</h5>
              <span className="badge bg-primary rounded-pill">{notifications.length}</span>
            </div>
            <div className="card-body">
              {notifications.map((notif) => (
                <div key={notif.id} className={`alert alert-${notif.type} py-2 px-3`}>
                  <small className="d-block">{notif.message}</small>
                  <small className="text-muted">{notif.time}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default UserDashboard;