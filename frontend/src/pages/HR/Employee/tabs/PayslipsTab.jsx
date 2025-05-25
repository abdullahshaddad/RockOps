import React from 'react';

const PayslipsTab = ({ employee, formatCurrency }) => {
    return (
        <div className="payslips-info tab-panel">
            <h3>Payslips & Salary History</h3>

            <div className="payslips-table-container">
                <table className="payslips-table">
                    <thead>
                    <tr>
                        <th>Period</th>
                        <th>Gross Pay</th>
                        <th>Deductions</th>
                        <th>Net Pay</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>April 2025</td>
                        <td>{formatCurrency(employee.monthlySalary || 3000)}</td>
                        <td>{formatCurrency(250)}</td>
                        <td>{formatCurrency((employee.monthlySalary || 3000) - 250)}</td>
                        <td><span className="status-badge pending">Processing</span></td>
                        <td><button className="download-btn" disabled>Download</button></td>
                    </tr>
                    <tr>
                        <td>March 2025</td>
                        <td>{formatCurrency(employee.monthlySalary || 3000)}</td>
                        <td>{formatCurrency(250)}</td>
                        <td>{formatCurrency((employee.monthlySalary || 3000) - 250)}</td>
                        <td><span className="status-badge completed">Paid</span></td>
                        <td><button className="download-btn">Download</button></td>
                    </tr>
                    <tr>
                        <td>February 2025</td>
                        <td>{formatCurrency(employee.monthlySalary || 3000)}</td>
                        <td>{formatCurrency(250)}</td>
                        <td>{formatCurrency((employee.monthlySalary || 3000) - 250)}</td>
                        <td><span className="status-badge completed">Paid</span></td>
                        <td><button className="download-btn">Download</button></td>
                    </tr>
                    <tr>
                        <td>January 2025</td>
                        <td>{formatCurrency(employee.monthlySalary || 3000)}</td>
                        <td>{formatCurrency(250)}</td>
                        <td>{formatCurrency((employee.monthlySalary || 3000) - 250)}</td>
                        <td><span className="status-badge completed">Paid</span></td>
                        <td><button className="download-btn">Download</button></td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PayslipsTab;