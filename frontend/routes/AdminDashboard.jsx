import React from "react";
import { Link, Outlet} from "react-router-dom";

const AdminDashboard = () => {
    return (
        <>
            <div>
                <h1>Welcome to the AdminDashboard</h1>
                {/* <Link to="/dashboard">Go to Dashboard</Link> */}
            </div>

            <Link to="manage">
                <h2>View service management</h2>
            </Link>
            <Outlet />
        </>
    );
};

export default AdminDashboard;