import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const QueueStatus = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueueStatuses = async () => {
    try {
      // Get this user's queue entries
      const myQueuesRes = await axios.get("http://localhost:3000/api/queue/my-queues", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const myEntries = myQueuesRes.data;

      if (myEntries.length === 0) {
        setQueues([]);
        setLoading(false);
        return;
      }

      // Get all services so we can look up names by serviceId
      const servicesRes = await axios.get("http://localhost:3000/api/admin/services", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const allServices = servicesRes.data;

      const results = await Promise.all(
        myEntries.map(async (entry) => {
          const svc = allServices.find((s) => s.id === entry.serviceId);
          const serviceName = svc ? svc.name : "Unknown Service";

          try {
            const queueRes = await axios.get(
              `http://localhost:3000/api/admin/queue/${entry.serviceId}`,
              { headers: { Authorization: `Bearer ${user.token}` } }
            );
            const queue = queueRes.data;
            const position = queue.findIndex((e) => e.id === entry.id) + 1;
            const estimatedWait = position > 0 ? position * 5 : 0;

            let status = "Waiting";
            if (position === 1) status = "Almost Ready";
            else if (position === 0) status = "Served";

            return {
              service: serviceName,
              serviceId: entry.serviceId,
              queueId: entry.id,
              priority: entry.priority,
              joinedAt: entry.date,
              position: position > 0 ? position : null,
              estimatedWait,
              status,
              peopleInQueue: queue.length,
            };
          } catch {
            return {
              service: serviceName,
              serviceId: entry.serviceId,
              queueId: entry.id,
              priority: entry.priority,
              joinedAt: entry.date,
              position: null,
              estimatedWait: null,
              status: "Unknown",
              peopleInQueue: null,
            };
          }
        })
      );

      setQueues(results.filter((q) => q.status !== "Served"));
      setLoading(false);
    } catch {
      setQueues([]);
      setLoading(false);
    }
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
