import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const { user } = useAuth();

  // Role guard: only admins can access the admin portal
  // PortalLayout already ensures user is authenticated, so user is non-null here
  if (user?.role !== "admin") {
    return <Navigate to="/portal/user" replace />;
  }

  return (
    <>
      <Outlet />
    </>
  );
};

export default AdminDashboard;