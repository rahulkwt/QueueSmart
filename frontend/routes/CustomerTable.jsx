import React from 'react';

// data/customers.js
export const customers = [
  {
    id: 1,
    name: "Alexandra Della",
    email: "alex@example.com",
    // ... add other fields
  },
  // ... more users
  {
    id: 2,
    name: "Erick Becerril",
    email: "egbecerr@example.com",
  }
];
// Assuming customers is imported or passed as a prop

const CustomerTable = () => {
  return (
    <div className="card stretch stretch-full">
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0" id="customerList">
            <thead>
              <tr className="border-top-0">
                <th style={{ width: 40 }} className="text-center">
                  <div className="custom-control custom-checkbox">
                    <input type="checkbox" className="custom-control-input" id="checkAllCustomer" />
                    <label className="custom-control-label d-block lh-1" htmlFor="checkAllCustomer"></label>
                  </div>
                </th>
                <th>Customer</th>
                <th>Email</th>
                <th>Group</th>
                <th>Phone</th>
                <th>Date</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="single-item">
                  {/* Checkbox Column: Centered vertically and horizontally */}
                  <td className="align-middle text-center">
                    <div className="custom-control custom-checkbox">
                      <input 
                        type="checkbox" 
                        className="custom-control-input checkbox" 
                        id={`checkBox_${customer.id}`} 
                      />
                      <label 
                        className="custom-control-label d-block lh-1" 
                        htmlFor={`checkBox_${customer.id}`}
                      ></label>
                    </div>
                  </td>
                  
                  {/* Customer Column */}
                  <td className="align-middle">
                    <a href="#" className="hstack gap-3 text-decoration-none">
                      <div>
                        {/* text-dark makes the text black/dark */}
                        <span className="text-truncate-1-line fw-bold text-dark">
                          {customer.name}
                        </span>
                      </div>
                    </a>
                  </td>

                  {/* Email Column */}
                  <td className="align-middle">
                    <a href={`mailto:${customer.email}`} className="text-dark text-decoration-none">
                      {customer.email}
                    </a>
                  </td>

                  <td className="align-middle">General</td>
                  <td className="align-middle">+1 234 567 890</td>
                  <td className="align-middle">Feb 17, 2026</td>
                  <td className="align-middle">
                    <span className="badge bg-soft-success text-success">Active</span>
                  </td>
                  
                  <td className="text-end align-middle">
                    {/* Actions dropdown or buttons */}
                    <button className="avatar-text avatar-md bg-primary text-white">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerTable;