import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../utils/Sidebar";
import Navbar from "../utils/Navbar";


const PortalLayout = () => {
  const location = useLocation();

  const isAdmin = location.pathname.includes("/portal/admin");

  return (
  <>
  <div style={{ display: "flex", minHeight: "100vh" }}>
    
    {/*Edited layout in order to make the outlet content go in the */}
    {/*correct place using flex*/}
    {/* Sidebar (fixed width) */}
    <div style={{ width: "200px", flexShrink: 0 }}>
      <Sidebar role={isAdmin ? "admin" : "user"} />
    </div>

    {/* Content area */}
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      
      <Navbar />

      <div
        style={{
          flex: 1,
          padding: "140px",
          marginTop: "80px", // navbar height
          overflow: "auto",
        }}
      >
        <Outlet />
      </div>

    </div>
  </div>

  </>
);
};

export default PortalLayout;
