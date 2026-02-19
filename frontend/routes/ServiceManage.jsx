import React, { useState } from "react";
import { Link } from "react-router-dom";

const ServiceManagement = () => {
  // sets up how services will be formatted and detailed
  const [services, setServices] = useState([
    { id: 1, name: "General Consultation", description: "Standard check-up", duration: 20, priority: "Medium" },
  ]);

  // form data for the dynamic table below in HTML
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    priority: "Low",
  });

  const [isEditing, setIsEditing] = useState(null);

  // give web response based on whether the
  // admin is adding a service or editing one
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing !== null) {
      // Edit logic
      setServices(services.map(s => s.id === isEditing ? { ...formData, id: isEditing } : s));
      setIsEditing(null);
    } else {
      // Create logic
      setServices([...services, { ...formData, id: Date.now() }]);
    }
    setFormData({ name: "", description: "", duration: "", priority: "Low" });
  };

  // boolean to tell whether the admin is editing or adding
  // in the HTML returned below
  const handleEdit = (service) => {
    setFormData(service);
    setIsEditing(service.id);
  };

  return (
    <div className="container mt-5">
      <h1>Add/Edit Services</h1>
      {/*says whether the admin is editing or adding a service*/}
      <h2 className="mb-4">Currently: {isEditing ? "Editing" : "Adding"}</h2>
      
      {/* ================= UPDATED: FORM WRAPPED WITH TEMPLATE CLASSES ================= */}
      {/* Applied 'card-body lead-status' and shadow for template styling */}
      <div className="card p-4 mb-5 shadow-sm lead-status">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Service Name* (Max 100 characters)</label>
            <input
              type="text"
              className="form-control"
              maxLength="100"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* define the input for the service's description */}
          <div className="mb-3">
            <label className="form-label">Description*</label>
            <textarea
              className="form-control"
              required
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          {/* define the input for the service's expected duration */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Expected Duration* (minutes)</label>
              <input
                type="number"
                className="form-control"
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
            </div>

            {/* assign a priority level for the service */}
            <div className="col-md-6 mb-3">
              <label className="form-label">Priority Level</label>
              <select
                className="form-select py-1"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* change the submit form button based on whether 
             admin is editing or adding */}
          <button
            type="submit"
            className={`btn ${isEditing ? 'btn-warning' : 'btn-light-brand'}`} // updated to template button
          >
            {isEditing ? "Update Service" : "Add Service"}
          </button>
          {isEditing && (
            <button
              type="button"
              className="btn ms-3"
              onClick={() => {
                setIsEditing(null);
                setFormData({ name: "", description: "", duration: "", priority: "Low" });
              }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>
      {/* ================= END UPDATED FORM ================= */}

      {/* table for the services */}
      <h4>Configured Services</h4>
      <div className="card p-4 mb-5 shadow-sm lead-status">
        <div className="table-responsive">
          <table className="table table-hover mt-3">
            <thead className="bg-transparent border-bottom">
              <tr>
                <th>Name</th>
                <th>Duration</th>
                <th>Priority</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td>
                    <div><strong>{service.name}</strong></div>
                    <small className="fs-12 fw-normal text-muted text-truncate-1-line">{service.description}</small>
                  </td>
                  <td>{service.duration} mins</td>
                  <td>
                    <span
                      className={`badge ${
                        service.priority === 'High'
                          ? 'bg-danger'
                          : service.priority === 'Medium'
                          ? 'bg-primary'
                          : 'bg-secondary'
                      }`}
                    >
                      {service.priority}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleEdit(service)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ServiceManagement;
