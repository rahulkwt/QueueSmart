import { Link } from "react-router-dom";


const Sidebar = ({ role }) => {

  return (
    <nav className="nxl-navigation">
  <div className="navbar-wrapper">

    {/* LOGO SECTION */}
    <div className="navbar-brand" style={{ padding: "20px" }}>
      <Link
        to="/portal/user"
        style={{
          textDecoration: "none",
          fontSize: "24px",
          fontWeight: "800",
          letterSpacing: "1px",
          color: "#0f172a"
        }}
      >
        QueueSmart
      </Link>
    </div>

    <div className="navbar-content">
      <ul className="nxl-navbar">

            <li className="nxl-item nxl-caption">
              <label>Navigation</label>
            </li>

            {/* USER SIDEBAR */}
            {role === "user" && (
              <>
                <li className="nxl-item">
                    <Link to="/portal/user" className="nxl-link">
                        <span className="nxl-micon">
                            <i className="feather-airplay"></i>
                        </span>
                        <span className="nxl-mtext">
                            Dashboard
                        </span>
                    </Link>
                </li>

                <li className="nxl-item">
                  <Link to="/portal/user/queue" className="nxl-link">
                    <span className="nxl-micon">
                        <i className="feather-users"></i>
                    </span>
                    <span className="nxl-mtext">
                        Join Queue/Queue Status
                    </span>
                  </Link>
                </li>


                <li className="nxl-item">
                  <Link to="/portal/user/history" className="nxl-link">
                    <span className="nxl-micon">
                        <i className="feather-cast"></i>
                    </span>
                    <span className="nxl-mtext">
                        Queue History
                    </span>
                  </Link>
                </li>
              </>
            )}

            {/* ADMIN SIDEBAR */}
            {role === "admin" && (
              <>
                <li className="nxl-item">
                  <Link to="/portal/admin" className="nxl-link">
                    <span className="nxl-micon">
                            <i className="feather-airplay"></i>
                        </span>
                    <span className="nxl-mtext">Dashboard</span>
                  </Link>
                </li>

                <li className="nxl-item">
                  <Link to="/portal/admin/queue-management" className="nxl-link">
                    <span className="nxl-micon">
                          <i className="feather-users"></i>
                      </span>
                    <span className="nxl-mtext">Queue Management</span>
                  </Link>
                </li>

                <li className="nxl-item">
                  <Link to="/portal/admin/service-management" className="nxl-link">
                    <span className="nxl-micon">
                      <i className="feather-layout"></i>
                    </span>
                    <span className="nxl-mtext">Service Management</span>
                  </Link>
                </li>
              </>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
