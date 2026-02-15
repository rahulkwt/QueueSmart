import { Outlet } from "react-router-dom";

const PublicLayout = () => {
  return (
    <>
      {/* Navbar can go here later */}
      <Outlet />
    </>
  );
};

export default PublicLayout;
