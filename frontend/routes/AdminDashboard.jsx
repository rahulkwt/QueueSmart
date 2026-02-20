import React from "react";
import { Link, Outlet} from "react-router-dom";

const AdminDashboard = () => {
    return (
        <>
            {/*connect to the ServiceManage, added by Erick*/}
            <Outlet />
        </>
    );
};

export default AdminDashboard;