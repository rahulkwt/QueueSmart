import React from "react";
import { Outlet, Link } from "react-router-dom";

const UserDashboard = () => {
    return (
        <>
            <div>
                <h1>Welcome to the UserDashboard</h1>
            </div>

            <hr />
            <Outlet />
        </>
    );
};

export default UserDashboard;