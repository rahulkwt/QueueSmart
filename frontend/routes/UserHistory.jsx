import React, { useState, useEffect } from 'react';
import { useAuth } from "../context/AuthContext";

// removed mock data from here

// this is a React component to go in the User dash board
const UserHistory = () => {
    const { user } = useAuth(); // user.token is needed to authorize the history request
    const [users, setUsers] = useState([]); // NEW
    const [selected, setSelected] = useState([]);

    // NEW
    useEffect(() => {
      // Pass the session token so the backend can verify the request is authenticated
      fetch("http://localhost:3000/api/user/history", {
        headers: { Authorization: `Bearer ${user.token}` },
      })
        .then(res => res.json())
        .then(data => setUsers(data));
    }, []);

    // toggle all
    const handleSelectAll = (e) => {
      if (e.target.checked) {
        setSelected(users.map(u => u.id));
      } else {
        setSelected([]);
      }
    };

    // toggle single row
    const handleSelectOne = (id) => {
      setSelected(prev =>
        prev.includes(id)
          ? prev.filter(i => i !== id)
          : [...prev, id]
      );
    };

    const isAllSelected = selected.length === users.length;

  return (
    <div  className="card"
          style = {{maxWidth: "1000px"}}
    >               {/*THIS STYLE IS TO BE REMOVED ONCE PORTAL LAYOUT IS FIXED
    style = {{maxWidth: "800px", margin: "0 auto"}}*/}
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0" id="customerList">
            {/*table head*/}
            <thead>
              <tr className="align-middle">
                {/*checkbox first*/}
                <th style={{ width: 50 }} className="text-center">
                  <div className="custom-control custom-checkbox">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="checkAllCustomer"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                    />
                    <label className="custom-control-label d-inline-block" htmlFor="checkAllCustomer"></label>
                  </div>
                </th>
                {/*rest of table head columns*/}
                <th className="text-start">Service type</th>
                <th className="text-start">Doctor</th>
                <th className="text-start">Date</th>
                <th className="text-start">Status</th>
              </tr>
            </thead>
            {/*table body*/}
            <tbody>
              {users.map((user) => (
                // go through customers
                <React.Fragment key={user.id}>
                  <tr className="align-middle">
                    <td className="text-center border-bottom-0">
                      <div className="custom-control custom-checkbox">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id={`checkBox_${user.id}`}
                          checked={selected.includes(user.id)}
                          onChange={() => handleSelectOne(user.id)}
                        />
                        <label className="custom-control-label d-inline-block" htmlFor={`checkBox_${user.id}`}></label>
                      </div>
                    </td>
                    {/*table row is filled with user data*/}
                    <td className="border-bottom-0">
                      <span className="fw-bold text-dark">{user.service}</span>
                    </td>
                    <td className="border-bottom-0">
                      <span className="text-dark">{user.doctor}</span>
                    </td>
                    <td className="border-bottom-0">
                      <span className="text-dark">{user.date}</span>
                    </td>
                    <td className="border-bottom-0">
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          padding: "0.2rem 0.6rem",
                          borderRadius: "999px",
                          background: user.status === "Completed" ? "#dcfce7" : user.status === "Cancelled" ? "#fee2e2" : "#fef3c7",
                          color: user.status === "Completed" ? "#16a34a" : user.status === "Cancelled" ? "#dc2626" : "#92400e",
                        }}
                      >
                        {user.status}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    {/*row below gives a doctor's notes*/}
                    <td className="border-top-0"></td> 
                    <td colSpan="4" className="pt-0 pb-3 border-top-0">
                      <div className="text-muted small">
                        <strong>Notes: </strong>{user.notes}
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserHistory;