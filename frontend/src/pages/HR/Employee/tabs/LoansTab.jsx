import React from 'react';

const LoansTab = ({ employee, formatCurrency }) => {
    return (
        <div className="loans-info tab-panel">
            <h3>Loans & Advances</h3>

            <div className="loans-summary">
                <div className="summary-card">
                    <h4>Total Outstanding</h4>
                    <div className="amount">{formatCurrency(1200)}</div>
                    <div className="period">Current Balance</div>
                </div>
                <div className="summary-card">
                    <h4>Monthly Deduction</h4>
                    <div className="amount">{formatCurrency(100)}</div>
                    <div className="period">Current Rate</div>
                </div>
            </div>

            <div className="loans-table-container">
                <table className="loans-table">
                    <thead>
                    <tr>
                        <th>Date Issued</th>
                        <th>Loan Type</th>
                        <th>Amount</th>
                        <th>Remaining</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>January 10, 2025</td>
                        <td>Personal Loan</td>
                        <td>{formatCurrency(1500)}</td>
                        <td>{formatCurrency(1200)}</td>
                        <td><span className="status-badge active">Active</span></td>
                        <td><button className="view-details-btn">Details</button></td>
                    </tr>
                    <tr>
                        <td>October 5, 2024</td>
                        <td>Salary Advance</td>
                        <td>{formatCurrency(500)}</td>
                        <td>{formatCurrency(0)}</td>
                        <td><span className="status-badge completed">Paid Off</span></td>
                        <td><button className="view-details-btn">Details</button></td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <div className="loan-application">
                <h4>Request Loan or Advance</h4>
                <button className="request-loan-btn">Apply for Loan</button>
            </div>
        </div>
    );
};

export default LoansTab;