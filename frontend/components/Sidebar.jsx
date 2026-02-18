const Sidebar = () => {
  return (
    <nav className="nxl-navigation">
      <div className="navbar-wrapper">
        <div className="m-header">
          <span className="b-brand">Clinic Portal</span>
        </div>

        <div className="navbar-content">
          <ul className="nxl-navbar">

            <li className="nxl-item">
              <span className="nxl-link">Dashboard</span>
            </li>

            <li className="nxl-item">
              <span className="nxl-link">Join Queue</span>
            </li>

            <li className="nxl-item">
              <span className="nxl-link">Queue Status</span>
            </li>

            <li className="nxl-item">
              <span className="nxl-link">History</span>
            </li>

            <li className="nxl-item">
              <span className="nxl-link">Service Management</span>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
