import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const QueueStatus = () => {
  const navigate = useNavigate();
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueueStatuses = async () => {
    const stored = JSON.parse(localStorage.getItem("activeQueues") || "{}");
    const entries = Object.entries(stored);

    if (entries.length === 0) {
      setQueues([]);
      setLoading(false);
      return;
    }

    const results = await Promise.all(
      entries.map(async ([service, info]) => {
        try {
          const response = await axios.get(
            `http://localhost:3000/api/services?service=${encodeURIComponent(service)}`
          );
          const active = response.data.filter((item) => item.isActive !== false);
          const position = active.findIndex((item) => item.id === info.queueId) + 1;
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          const waitRes = await axios.get(
            `http://localhost:3000/api/queue/wait-time?position=${position}&isOpen=true`,
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
          const estimatedWait = waitRes.data.estimatedWaitMinutes ?? 0;

          let status = "Waiting";
          if (position === 1) status = "Almost Ready";
          else if (position === 0) status = "Served";

          return {
            service,
            queueId: info.queueId,
            priority: info.priority,
            joinedAt: info.joinedAt,
            position: position > 0 ? position : null,
            estimatedWait,
            status,
            peopleInQueue: active.length,
          };
        } catch {
          return {
            service,
            queueId: info.queueId,
            priority: info.priority,
            joinedAt: info.joinedAt,
            position: null,
            estimatedWait: null,
            status: "Unknown",
            peopleInQueue: null,
          };
        }
      })
    );

    setQueues(results);
    setLoading(false);
  };

  useEffect(() => {
    fetchQueueStatuses();
    const interval = setInterval(fetchQueueStatuses, 10000);
    return () => clearInterval(interval);
  }, []);

  const priorityBadgeClass = (priority) => {
    if (priority === "High") return "bg-danger";
    if (priority === "Medium") return "bg-warning text-dark";
    return "bg-secondary";
  };

  const statusBadgeClass = (status) => {
    if (status === "Almost Ready") return "bg-success";
    if (status === "Served") return "bg-primary";
    if (status === "Unknown") return "bg-secondary";
    return "bg-info text-dark";
  };

  return (
    <div>
      <h2 className="mb-1">Queue Status</h2>
      <p className="text-muted mb-4">Your active queues</p>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2 text-muted">Loading your queues...</p>
        </div>
      ) : queues.length === 0 ? (
        <div className="card p-4 text-center">
          <p className="text-muted mb-3">You have not joined any queues yet.</p>
          <button
            className="btn btn-primary mx-auto"
            style={{ width: "fit-content" }}
            onClick={() => navigate("/portal/user")}
          >
            Browse Services
          </button>
        </div>
      ) : (
        <div className="row">
          {queues.map((q) => (
            <div key={q.queueId} className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title mb-0">{q.service}</h5>
                    <span className={`badge ${statusBadgeClass(q.status)}`}>{q.status}</span>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <div className="bg-light rounded p-2 text-center">
                        <div className="fs-4 fw-bold">{q.position ?? "—"}</div>
                        <div className="small text-muted">Your Position</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="bg-light rounded p-2 text-center">
                        <div className="fs-4 fw-bold">{q.estimatedWait ?? "—"}</div>
                        <div className="small text-muted">Est. Wait (min)</div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <span>
                      Priority:{" "}
                      <span className={`badge ${priorityBadgeClass(q.priority)}`}>
                        {q.priority}
                      </span>
                    </span>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => navigate(`/portal/user/queue/${encodeURIComponent(q.service)}`)}
                    >
                      View Queue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QueueStatus;
