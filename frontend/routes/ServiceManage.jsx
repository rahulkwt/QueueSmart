import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ServiceManagement = () => {
  // I AM COMMENTING OUT PRIORITY TO PRESERVE
  // DROPDOWN FEATURE FOR LATER
  // commenting out priority everywhere, including html
  // sets up how services will be formatted and detailed
  const { user } = useAuth(); // user.token is needed to authorize create/update requests
  const [services, setServices] = useState([]);

  const fetchServices = () => {
    fetch("http://localhost:3000/api/admin/services")
      .then(res => res.json())
      .then(data => setServices(data));
  };

  useEffect(() => {
    fetchServices(); // initial call

    const interval = setInterval(fetchServices, 5000); // every 5 seconds

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  // form data for the dynamic table below in HTML
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
  });

  const [isEditing, setIsEditing] = useState(null);

  // give web response based on whether the
  // admin is adding a service or editing one
  const handleSubmit = (e) => {
    e.preventDefault();

    const url = isEditing !== null
      ? `http://localhost:3000/api/admin/services/${isEditing}`
      : "http://localhost:3000/api/admin/services";

    const method = isEditing !== null ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify(formData),
    })
      .then(res => res.json())
      .then(() => {
        fetchServices(); // refresh list from server
        setIsEditing(null);
        setFormData({ name: "", description: "", duration: ""/*, priority: "Low"*/ });
      });
  };

  // boolean to tell whether the admin is editing or adding
  // in the HTML returned below
  const handleEdit = (service) => {
    setFormData(service);
    setIsEditing(service.id);
  };

  // in html, commenting out priority
  return (
  /*THIS IS A TEMPORARY PADDING FOR THE SCREENSHOT, REMOVE ONCE LAYOUT IS FIXED*/
  /*if layout is fixed, remove paddingTop and any style here meant as a placeholder
  paddingTop: "20px", margin: "0 auto"*/
  <div style={{ maxWidth: "1000px" }}> {/* Centers the form and keeps it at a readable width */}
      <div className="mb-4">
        <h1>Add/Edit Services</h1>
      </div>
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
          <div className="row align-items-end">
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

            <div className="col-md-6 mb-3 d-flex gap-2">            
              <button
                type="submit"
                className={`btn btn-sm btn-outline-secondary`}
                style={{ height: "45px", width: "120px", padding: "6px 12px", color: "white" }}
              >
                {isEditing ? "Update" : "Add Service"}
              </button>
              
              {isEditing && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  style={{ height: "45px", width: "120px", visibility: isEditing ? "visible" : "hidden", padding: "6px 12px"}} // keeps space
                  onClick={() => {
                    setIsEditing(null);
                    setFormData({ name: "", description: "", duration: "" });
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
            {/* assign a priority level for the service */}

          {/*  <div className="col-md-6 mb-3">
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
          */}
          {/* change the submit form button based on whether 
             admin is editing or adding */}
        </form>
      </div>
      {/* ================= END UPDATED FORM ================= */}

      {/* table for the services */}
      <h4>Configured Services</h4>
      <div className="card p-4 mb-5 shadow-sm lead-status">
        <div className="table-responsive"
            style={{
              maxHeight: "400px",
              overflowY: "auto"
            }}
        >
          <table className="table table-hover mt-3">
            <thead className="bg-transparent border-bottom">
              <tr>
                <th>Name</th>
                <th>Duration</th>
                {/*<th>Priority</th>*/}
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
                  {/*<td>
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
                  </td>*/}
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
