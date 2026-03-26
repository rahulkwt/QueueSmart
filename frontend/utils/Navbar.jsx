import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  // user holds the session object { id, name, email, role, token } from AuthContext/localStorage
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const { service, priority } = e.detail;
      setNotifications((prev) => [
        { id: Date.now(), service, priority, time: new Date().toLocaleTimeString() },
        ...prev,
      ]);
    };
    window.addEventListener("queue-joined", handler);
    return () => window.removeEventListener("queue-joined", handler);
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
            <div className="dropdown nxl-h-item">
              <a
                className="nxl-head-link me-3 position-relative"
                data-bs-toggle="dropdown"
                href="#"
                onClick={(e) => e.preventDefault()}
                role="button"
                data-bs-auto-close="outside"
              >
                <i className="feather-bell"></i>
                {notifications.length > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{ fontSize: "0.6rem" }}
                  >
                    {notifications.length}
                  </span>
                )}
              </a>

              <div className="dropdown-menu dropdown-menu-end nxl-h-dropdown nxl-notifications-menu">
                {notifications.length === 0 ? (
                  <div className="notifications-item">
                    <div className="notifications-desc">
                      <span className="text-muted">No notifications</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {notifications.map((n) => (
                      <div key={n.id} className="notifications-item">
                        <div className="notifications-desc">
                          <span className="fw-semibold text-dark d-block">
                            Joined {n.service} Queue
                          </span>
                          <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                            Priority: {n.priority} &middot; {n.time}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="p-2 text-center border-top">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setNotifications([])}
                      >
                        Clear all
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

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
