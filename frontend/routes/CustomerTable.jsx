import React from 'react';

const customers = [
  {
    id: 1,
    service: "General Consultation",
    doctor: "Dr. Albert Einstein",
    date: "09-25-2025",
    notes: "Normal results. Patient advised to return in 6 months for a follow-up. Vital signs were stable throughout the visit.",
    status: "Completed"
  },
  {
    id: 2,
    service: "Emergency",
    doctor: "Dr. Walt Seuss",
    date: "12-02-2025",
    notes: "Stabilized. Transferred to observation ward.",
    status: "Completed"
  }
];

const CustomerTable = () => {
  return (
    <div className="card stretch stretch-full">
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0" id="customerList">
            <thead>
              <tr className="align-middle">
                <th style={{ width: 50 }} className="text-center">
                  {/* Fixed: Simplified the container to ensure the custom checkbox renders correctly */}
                  <div className="custom-control custom-checkbox">
                    <input 
                      type="checkbox" 
                      className="custom-control-input" 
                      id="checkAllCustomer" 
                    />
                    <label 
                      className="custom-control-label d-inline-block" 
                      htmlFor="checkAllCustomer"
                    ></label>
                  </div>
                </th>
                <th className="text-start">Service type</th>
                <th className="text-start">Doctor</th>
                <th className="text-start">Date</th>
                <th className="text-start">Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <React.Fragment key={customer.id}>
                  <tr className="align-middle">
                    <td className="text-center border-bottom-0">
                      <div className="custom-control custom-checkbox">
                        <input 
                          type="checkbox" 
                          className="custom-control-input" 
                          id={`checkBox_${customer.id}`} 
                        />
                        <label 
                          className="custom-control-label d-inline-block" 
                          htmlFor={`checkBox_${customer.id}`}
                        ></label>
                      </div>
                    </td>
                    <td className="border-bottom-0">
                      <span className="fw-bold text-dark">{customer.service}</span>
                    </td>
                    <td className="border-bottom-0">
                      <span className="text-dark">{customer.doctor}</span>
                    </td>
                    <td className="border-bottom-0">
                      <span className="text-dark">{customer.date}</span>
                    </td>
                    <td className="border-bottom-0">
                      <span className="badge bg-soft-success text-success">{customer.status}</span>
                    </td>
                    <td className="text-end border-bottom-0">
                      <button className="btn btn-sm btn-primary align-middle">Edit</button>
                    </td>
                  </tr>

                {/* The Notes Row */}
                <tr>
                  {/* 1. Empty cell under the checkbox */}
                  <td className="border-top-0"></td> 
                  
                  {/* 2. Span 4 columns: Service Type, Doctor, Date, and Status */}
                  <td colSpan="4" className="pt-0 pb-3 border-top-0">
                    <div className="text-muted small">
                      <strong>Notes: </strong>{customer.notes}
                    </div>
                  </td>
                  
                  {/* 3. Empty cell under Actions (Edit button) so notes never slide under it */}
                  <td className="border-top-0 text-end"></td>
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

export default CustomerTable;