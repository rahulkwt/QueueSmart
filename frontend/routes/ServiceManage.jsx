import React, { useState } from "react";
import { Link } from "react-router-dom";

const ServiceManagement = () => {
  const [services, setServices] = useState([
    { id: 1, name: "General Consultation", description: "Standard check-up", duration: 20, priority: "Medium" },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    priority: "Low",
  });

  const [isEditing, setIsEditing] = useState(null);

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

  const handleEdit = (service) => {
    setFormData(service);
    setIsEditing(service.id);
  };

  return (
    <div className="container mt-5">
      <h1>Add/Edit Services</h1>
      <h2 className="mb-4">Currently: {isEditing ? "Editing" : "Adding"}</h2>
      
      {/* Service Form */}
      <div className="card p-4 mb-5 shadow-sm">
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
            <div className="col-md-6 mb-3">
              <label className="form-label">Priority Level</label>
              <select
                className="form-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <button type="submit" className={`btn ${isEditing ? 'btn-warning' : 'btn-success'}`}>
            {isEditing ? "Update Service" : "Add Service"}
          </button>
          {isEditing && (
            <button className="btn btn-link" onClick={() => {setIsEditing(null); setFormData({name:"", description:"", duration:"", priority:"Low"})}}>
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* Existing Services List */}
      <h4>Configured Services</h4>
      <div className="table-responsive">
        <table className="table table-hover mt-3">
          <thead className="table-light">
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
                <td><strong>{service.name}</strong></td>
                <td>{service.duration} mins</td>
                <td>
                  <span className={`badge ${service.priority === 'High' ? 'bg-danger' : service.priority === 'Medium' ? 'bg-primary' : 'bg-secondary'}`}>
                    {service.priority}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(service)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceManagement;