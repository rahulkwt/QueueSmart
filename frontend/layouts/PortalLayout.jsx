import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../utils/Sidebar";
import Navbar from "../utils/Navbar";
import { useAuth } from "../context/AuthContext";

const PortalLayout = () => {
  const { user } = useAuth();

  // Auth guard: unauthenticated users are redirected to login before any portal UI renders
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Derive admin flag from role string so Sidebar receives a clean boolean-like prop
  const isAdmin = user.role === "admin";

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
          <div style={{ flex: 1,
            position: "fixed",
            left: "280px",
            right: "0",
            overflowY: "auto",
            height: "100%",
            padding: "85px 20px 20px 20px",
          }}>
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default PortalLayout;
