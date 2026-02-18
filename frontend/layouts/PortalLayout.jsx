import { Outlet } from "react-router-dom";
import Navbar from "../utils/NavbarPublic.jsx";

const PortalLayout = () => {
  return (
    <>
      {/* Navbar can go here later */}
      <Navbar />
      <Outlet />
    </>
  );
};

export default PortalLayout;
