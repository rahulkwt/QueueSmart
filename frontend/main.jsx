import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Homepage from "./routes/Homepage";
import LoginPage from "./routes/LoginPage";
import RegistrationPage from "./routes/RegistrationPage";
import UserDashboard from "./routes/UserDashboard";
import AdminDashboard from "./routes/AdminDashboard";
import ErrorPage from "./routes/ErrorPage";
import QueueScreen from "./routes/QueueScreen";
import QueueManagement from "./routes/QueueManagement";
import PublicLayout from "./layouts/PublicLayout";
import PortalLayout from "./layouts/PortalLayout";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "bootstrap/dist/css/bootstrap.min.css";

// 2. Icon fonts
import "./public/assets/css/flaticon.css";
import "./public/assets/css/themify-icons.css";
import "./public/assets/css/fontawesome-all.min.css";

// 3. Animation and plugin styles
import "./public/assets/css/animate.min.css";
// import "./public/assets/css/animated-headline.css";
import "./public/assets/css/nice-select.css";

// 4. Vendor CSS
import "./public/assets/vendors/css/vendors.min.css";

// 4. Template main style LAST (VERY IMPORTANT)
import "./public/assets/css/bootstrap.min.css";
import "./public/assets/css/theme.min.css";
import "./public/assets/css/style.css";



const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <Homepage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegistrationPage /> },
    ],
  },
  {
    path: "/portal",
    element: <PortalLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: "user", element: <UserDashboard /> },
      { path: "admin", element: <AdminDashboard /> },

      { path: "queue", element: <QueueScreen /> },
      { path: "queue-management", element: <QueueManagement /> },
    ],
  },
]);




ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

