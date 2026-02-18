import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../utils/Sidebar";
import Navbar from "../utils/Navbar";


const PortalLayout = () => {
  const location = useLocation();

  const isAdmin = location.pathname.includes("/portal/admin");

  return (
  <>
    {/* Sidebar (fixed by template CSS) */}
    <Sidebar role={isAdmin ? "admin" : "user"} />

    {/* Main Area (shifted right) */}
    <div
      style={{
        marginLeft: "280px",   // SAME width as sidebar
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <div
  style={{
    padding: "24px",
    paddingTop: "80px", // 👈 add this
  }}
>
  <Outlet />
</div>

    </div>
  </>
);
};

export default PortalLayout;
