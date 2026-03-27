import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const services = [
  { id: 1, name: "Pharmacy Pickup",        icon: "feather-package"  },
  { id: 2, name: "Lab Work & Blood Tests", icon: "feather-activity" },
  { id: 3, name: "General Consultation",   icon: "feather-user"     },
  { id: 4, name: "Radiology / Imaging",    icon: "feather-aperture" },
];

const iconColors = [
  { bg: "#e8f0fe", icon: "#3b82f6" },
  { bg: "#fef3c7", icon: "#f59e0b" },
  { bg: "#dcfce7", icon: "#22c55e" },
  { bg: "#f3e8ff", icon: "#a855f7" },
];

const UserHome = () => {
  const [waitTimes, setWaitTimes] = useState({});

  useEffect(() => {
    const fetchAll = async () => {
      const results = await Promise.all(
        services.map(async (svc) => {
          try {
            const res = await axios.get(
              `http://localhost:3000/api/services?service=${encodeURIComponent(svc.name)}`
            );
            const active = res.data.filter((item) => item.isActive !== false);
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const waitRes = await axios.get(
              `http://localhost:3000/api/queue/wait-time?position=${active.length}&isOpen=true`,
              { headers: { Authorization: `Bearer ${user.token}` } }
            );
            return { name: svc.name, wait: waitRes.data.estimatedWaitMinutes };
          } catch {
            return { name: svc.name, wait: 0 };
          }
        })
      );
      const map = {};
      results.forEach(({ name, wait }) => { map[name] = wait; });
      setWaitTimes(map);
    };
    fetchAll();
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: "1rem",
        padding: "1rem",
        boxSizing: "border-box",
      }}
    >
      {services.map((svc, idx) => {
        const color = iconColors[idx];
        const wait = waitTimes[svc.name] ?? null;
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
                <i className={svc.icon} style={{ fontSize: "2rem", color: color.icon }} />
              </div>

              <div style={{ fontWeight: 700, fontSize: "1.2rem", color: "#111827", textAlign: "center" }}>
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
  );
};

export default UserHome;
