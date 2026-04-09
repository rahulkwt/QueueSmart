import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ isAdmin = false }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/user/notifications", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => n.notif_status === "unread").length);
    } catch (err) { console.error("fetchNotifications error:", err); }
  };

  const saveNotification = async (message) => {
    try {
      await axios.post(
        "http://localhost:3000/api/user/notifications",
        { message },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchNotifications();
    } catch (err) { console.error("saveNotification error:", err); }
  };

  const markAllRead = async () => {
    try {
      await axios.patch(
        "http://localhost:3000/api/user/notifications/read-all",
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setUnreadCount(0);
    } catch (err) { console.error("markAllRead error:", err); }
  };

  const clearAll = async () => {
    try {
      await axios.delete("http://localhost:3000/api/user/notifications", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) { console.error("clearAll error:", err); }
  };

  useEffect(() => {
    if (!isAdmin) fetchNotifications();
  }, []);

  useEffect(() => {
    const handleJoined = (e) => {
      const { service, priority } = e.detail;
      saveNotification(`Joined ${service} Queue — Priority: ${priority}`);
    };
    const handleAlmostReady = (e) => {
      const { service } = e.detail;
      saveNotification(`Almost your turn — ${service}`);
    };
    const handleServed = (e) => {
      const { service } = e.detail;
      saveNotification(`You've been served — ${service}`);
    };

    window.addEventListener("queue-joined", handleJoined);
    window.addEventListener("queue-almost-ready", handleAlmostReady);
    window.addEventListener("queue-served", handleServed);
    return () => {
      window.removeEventListener("queue-joined", handleJoined);
      window.removeEventListener("queue-almost-ready", handleAlmostReady);
      window.removeEventListener("queue-served", handleServed);
    };
  }, []);

  return (
    <header className="nxl-header">
      <div className="header-wrapper">
        {/* Start Header Left */}
        <div className="user-name my-auto">
          <h3>Welcome,<span className="user-name"> {user?.name || "User"}</span>!</h3>
        </div>
        <div className="header-left d-flex align-items-center gap-4">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="nxl-head-mobile-toggler"
            id="mobile-collapse"
          >
            <div className="hamburger hamburger--arrowturn">
              <div className="hamburger-box">
                <div className="hamburger-inner"></div>
              </div>
            </div>
          </a>
        </div>
        {/* End Header Left */}

        {/* Start Header Right */}
        <div className="header-right ms-auto">
          <div className="d-flex align-items-center">
            {!isAdmin && <div className="dropdown nxl-h-item">
              <a
                className="nxl-head-link me-3 position-relative"
                data-bs-toggle="dropdown"
                href="#"
                onClick={(e) => { e.preventDefault(); markAllRead(); }}
                role="button"
                data-bs-auto-close="outside"
              >
                <i className="feather-bell"></i>
                {unreadCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{ fontSize: "0.6rem" }}
                  >
                    {unreadCount}
                  </span>
                )}
              </a>

              <div className="dropdown-menu dropdown-menu-end nxl-h-dropdown nxl-notifications-menu" style={{ maxHeight: "350px" }}>
                <div style={{ display: "flex", flexDirection: "column", maxHeight: "350px" }}>
                  {notifications.length === 0 ? (
                    <div className="notifications-item">
                      <div className="notifications-desc">
                        <span className="text-muted">No notifications</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ overflowY: "auto", flex: 1 }}>
                        {notifications.map((n) => (
                          <div key={n.notif_id} className="notifications-item">
                            <div className="notifications-desc">
                              <span className="fw-semibold text-dark d-block">{n.notif_message}</span>
                              <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                                {new Date(n.notif_time).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-2 text-center border-top" style={{ flexShrink: 0 }}>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={clearAll}
                        >
                          Clear all
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>}

            <div className="dropdown nxl-h-item">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                data-bs-toggle="dropdown"
                role="button"
                data-bs-auto-close="outside"
              >
                <img
                  src="/frontend/public/assets/images/avatar/1.png"
                  alt="user-image"
                  className="img-fluid user-avtar me-0"
                />
              </a>

              <div className="dropdown-menu dropdown-menu-end nxl-h-dropdown nxl-user-dropdown">
                <div className="dropdown-header">
                  <div className="d-flex align-items-center">
                    <img
                      src="/frontend/public/assets/images/avatar/1.png"
                      alt="user-image"
                      className="img-fluid user-avtar"
                    />
                    <div>
                      <h6 className="text-dark mb-0">{user?.name}</h6>
                      <span className="fs-12 fw-medium text-muted">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="dropdown-divider"></div>

                <a href="javascript:void(0);" className="dropdown-item">
                  <i className="feather-user"></i>
                  <span>Profile Details</span>
                </a>

                {/* Calls logout() which clears localStorage, resets auth state, and redirects to /login */}
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); logout(); }}
                  className="dropdown-item"
                >
                  <i className="feather-log-out"></i>
                  <span>Logout</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* End Header Right */}
      </div>
    </header>
  );
};

export default Navbar;
