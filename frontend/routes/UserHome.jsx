import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const iconColors = [
  { bg: "#e8f0fe", icon: "#3b82f6" },
  { bg: "#fef3c7", icon: "#f59e0b" },
  { bg: "#dcfce7", icon: "#22c55e" },
  { bg: "#f3e8ff", icon: "#a855f7" },
  { bg: "#fee2e2", icon: "#ef4444" },
  { bg: "#e0f2fe", icon: "#0ea5e9" },
];

const UserHome = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [waitTimes, setWaitTimes] = useState({});

  // Fetch configured services from the admin services endpoint
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/admin/services", {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => setServices(res.data))
      .catch(() => {});
  }, []);


  // Fetch queue length for each service to calculate wait times
  useEffect(() => {
    if (services.length === 0) return;

    const fetchAll = async () => {
      const results = await Promise.all(
        services.map(async (svc) => {
          try {
            const res = await axios.get(
              `http://localhost:3000/api/queue/${svc.id}`,
              { headers: { Authorization: `Bearer ${user.token}` } }
            );
            const queueLen = res.data.length;
            const duration = svc.duration || 5;
            try {
              const waitRes = await fetch(
                `http://localhost:3000/api/queue/${svc.id}/wait-time?avgDuration=${duration}`
              );
              const waitData = await waitRes.json();
              return { id: svc.id, wait: waitData.queue.length * duration };
            } catch {
              return { id: svc.id, wait: queueLen * duration };
            }
          } catch {
            return { id: svc.id, wait: 0 };
          }
        })
      );
      const map = {};
      results.forEach(({ id, wait }) => { map[id] = wait; });
      setWaitTimes(map);
    };

    fetchAll();
  }, [services]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "1rem",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: services.length <= 2 ? "1fr" : "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem",
          alignContent: "start",
        }}
      >
        {services.map((svc, idx) => {
          const color = iconColors[idx % iconColors.length];
          const wait = waitTimes[svc.id] ?? null;
          return (
            <Link
              key={svc.id}
              to={`/portal/user/queue/${encodeURIComponent(svc.name)}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: "1.25rem",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1.25rem",
                  height: "100%",
                  minHeight: "180px",
                  boxSizing: "border-box",
                  transition: "box-shadow 0.18s, transform 0.18s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 16px rgba(0,0,0,0.1), 0 8px 32px rgba(0,0,0,0.07)";
                  e.currentTarget.style.transform = "scale(1.01)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "1.25rem",
                    background: color.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="feather-clock" style={{ fontSize: "2rem", color: color.icon }} />
                </div>

                <div style={{ fontWeight: 700, fontSize: "1.2rem", color: "#111827", textAlign: "center", padding: "0 1rem" }}>
                  {svc.name}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span
                    style={{
                      background: "#dcfce7",
                      color: "#16a34a",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      padding: "0.2rem 0.6rem",
                      borderRadius: "999px",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                    }}
                  >
                    Open
                  </span>
                  <span style={{ color: "#9ca3af", fontSize: "0.85rem" }}>
                    {wait === null ? "Loading..." : `~${wait} min wait`}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

    </div>
  );
};

export default UserHome;
