import React from "react";
import { Outlet, Link } from "react-router-dom";

const UserDashboard = () => {
    return (
        <>
            <div>
                <h1>Welcome to the UserDashboard</h1>
                {/*text links to queue history, by Erick*/}
                <Link to="history">
                    <h2>View History</h2>
                </Link>
            </div>

            <hr />
            <Outlet />
        </>
    );
};

export default UserDashboard;