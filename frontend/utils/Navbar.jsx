import { useState } from "react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="nxl-header"
      style={{
        height: "100px", // 👈 makes navbar taller
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid #eee",
        background: "#fff",
      }}
    >
      <div className="navbar-wrapper d-flex justify-content-between align-items-center w-100 px-5">

        {/* LEFT SIDE */}
        <div>
          <h2
            className="mb-0"
            style={{
              fontWeight: "600",
              fontSize: "28px", // 👈 bigger welcome text
            }}
          >
            Welcome, User!
          </h2>
        </div>

        {/* RIGHT SIDE */}
        <div className="d-flex align-items-center gap-5 position-relative">

          {/* Notification Icon */}
          <div
            className="position-relative"
            style={{ cursor: "pointer" }}
            onClick={() => setOpen(!open)}
          >
            <i
              className="feather-bell"
              style={{ fontSize: "32px" }} // 👈 MUCH bigger bell
            ></i>

            {/* Red badge */}
            <span
              className="position-absolute bg-danger text-white rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "24px",
                height: "24px",
                fontSize: "12px",
                top: "-8px",
                right: "-10px",
              }}
            >
              3
            </span>
          </div>

          {/* Notification Dropdown */}
          {open && (
            <div
              className="card shadow position-absolute"
              style={{
                width: "340px",
                top: "70px",
                right: "90px",
                zIndex: 999,
                borderRadius: "12px",
              }}
            >
              <div className="card-body">
                <h5 className="mb-3">Notifications</h5>
                <hr />
                <p className="mb-2">New queue joined</p>
                <p className="mb-2">Admin updated service</p>
                <p className="mb-0">Reminder: Appointment soon</p>
              </div>
            </div>
          )}

          {/* Profile Picture */}
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="profile"
            className="rounded-circle"
            style={{
              width: "60px", // 👈 bigger profile pic
              height: "60px",
              objectFit: "cover",
            }}
          />

        </div>
      </div>
    </header>
  );
};

export default Navbar;
