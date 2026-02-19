import React, { useState } from "react";

const QueueManagement = () => {
  const [selectedService, setSelectedService] = useState("Consultation");

  const [queue, setQueue] = useState([
    { id: 1, name: "John Doe" },
    { id: 2, name: "Sarah Smith" },
    { id: 3, name: "Michael Lee" },
  ]);

  // 🔥 History stack for multiple undos
  const [history, setHistory] = useState([]);

  // Save current state before changing
  const saveToHistory = () => {
    setHistory((prev) => [...prev, queue]);
  };

  // Remove user
  const removeUser = (id) => {
    saveToHistory();
    setQueue(queue.filter((user) => user.id !== id));
  };

  // Move user up
  const moveUp = (index) => {
    if (index === 0) return;

    saveToHistory();

    const updatedQueue = [...queue];
    [updatedQueue[index - 1], updatedQueue[index]] = [
      updatedQueue[index],
      updatedQueue[index - 1],
    ];

    setQueue(updatedQueue);
  };

  // Serve next user
  const serveNext = () => {
    if (queue.length === 0) return;

    saveToHistory();
    setQueue(queue.slice(1));
  };

  // 🔥 Undo (can do multiple times)
  const undo = () => {
    if (history.length === 0) return;

    const previousState = history[history.length - 1];
    setQueue(previousState);
    setHistory(history.slice(0, -1));
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

      {/* Buttons */}
      <div className="d-flex gap-3">
        <button className="btn btn-success" onClick={serveNext}>
          Serve Next User
        </button>

        {history.length > 0 && (
          <button className="btn btn-warning" onClick={undo}>
            Undo
          </button>
        )}
      </div>
    </div>
  );
};

export default QueueManagement;
