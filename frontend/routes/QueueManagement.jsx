import React, { useState } from "react";

const QueueManagement = () => {
  const [selectedService, setSelectedService] = useState("Consultation");

  // Fake queue data (UI only)
  const [queue, setQueue] = useState([
    { id: 1, name: "John Doe" },
    { id: 2, name: "Sarah Smith" },
    { id: 3, name: "Michael Lee" },
  ]);

  // Remove user
  const removeUser = (id) => {
    setQueue(queue.filter((user) => user.id !== id));
  };

  // Move user up
  const moveUp = (index) => {
    if (index === 0) return;

    const updatedQueue = [...queue];
    [updatedQueue[index - 1], updatedQueue[index]] =
      [updatedQueue[index], updatedQueue[index - 1]];

    setQueue(updatedQueue);
  };

  // Serve next user (remove first in line)
  const serveNext = () => {
    if (queue.length === 0) return;
    setQueue(queue.slice(1));
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Queue Management</h2>

      {/* Select Service */}
      <div className="mb-3">
        <label className="form-label">Select Service</label>
        <select
          className="form-select"
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
        >
          <option value="Consultation">Consultation</option>
          <option value="Check-up">Check-up</option>
          <option value="Follow-up">Follow-up</option>
        </select>
      </div>

      {/* Queue List */}
      <div className="card p-3 mb-4">
        <h5>Current Queue</h5>

        {queue.length === 0 ? (
          <p>No users in queue.</p>
        ) : (
          <ul className="list-group">
            {queue.map((user, index) => (
              <li
                key={user.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>
                  #{index + 1} - {user.name}
                </span>

                <div>
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => moveUp(index)}
                  >
                    ↑
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeUser(user.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Serve Next */}
      <button className="btn btn-success" onClick={serveNext}>
        Serve Next User
      </button>
    </div>
  );
};

export default QueueManagement;
