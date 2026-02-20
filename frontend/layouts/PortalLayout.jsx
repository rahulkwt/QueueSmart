import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../utils/Sidebar";
import Navbar from "../utils/Navbar";


const PortalLayout = () => {
  const location = useLocation();

  const isAdmin = location.pathname.includes("/portal/admin");

  return (
  <>
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
      }}
    >
      {/* Sidebar */}
      <Sidebar role={isAdmin ? "admin" : "user"} />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Navbar />
        <div style={{ flex: 1 ,
          position: "fixed",
          left: "280px",
          right: "0",
          overflowY: "auto",
          height: "100%",
          padding: "85px 20px 20px 20px",
          // marginTop: "45px",
        }}>
          <Outlet />
        </div>
        {/* <Outlet /> */}
      </div>
    </div>

  </>
);
};

export default PortalLayout;
