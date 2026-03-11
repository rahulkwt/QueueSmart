import React from "react";
import { Link, Outlet} from "react-router-dom";

const AdminDashboard = () => {
    return (
        <>
            <Outlet />
        </>
    );
};

export default AdminDashboard;