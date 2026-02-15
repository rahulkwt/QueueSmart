import { Outlet } from "react-router-dom";

const PortalLayout = () => {
  return (
    <>
      <h2>Portal</h2>
      {/* Later: sidebar, topbar, logout */}
      <Outlet />
    </>
  );
};

export default PortalLayout;
