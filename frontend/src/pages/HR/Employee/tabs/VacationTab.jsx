import React from 'react';

const VacationTab = ({ employee, formatDate }) => {
    return (
        <div className="vacation-info tab-panel">
            <h3>Vacation & Leave</h3>

            <div className="leave-balance">
                <div className="balance-card">
                    <h4>Annual Leave</h4>
                    <div className="balance">15 / 21</div>
                    <div className="balance-label">Days Remaining</div>
                </div>
                <div className="balance-card">
                    <h4>Sick Leave</h4>
                    <div className="balance">7 / 10</div>
                    <div className="balance-label">Days Remaining</div>
                </div>
                <div className="balance-card">
                    <h4>Personal Leave</h4>
                    <div className="balance">3 / 5</div>
                    <div className="balance-label">Days Remaining</div>
                </div>
            </div>

            <h4>Leave History</h4>
            <div className="leave-history-table-container">
                <table className="leave-history-table">
                    <thead>
                    <tr>
                        <th>Type</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Days</th>
                        <th>Reason</th>
                        <th>Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>Annual Leave</td>
                        <td>{formatDate("2025-03-15")}</td>
                        <td>{formatDate("2025-03-20")}</td>
                        <td>5</td>
                        <td>Vacation</td>
                        <td><span className="status-badge completed">Approved</span></td>
                    </tr>
                    <tr>
                        <td>Sick Leave</td>
                        <td>{formatDate("2025-02-03")}</td>
                        <td>{formatDate("2025-02-05")}</td>
                        <td>3</td>
                        <td>Illness</td>
                        <td><span className="status-badge completed">Approved</span></td>
                    </tr>
                    <tr>
                        <td>Personal Leave</td>
                        <td>{formatDate("2025-05-10")}</td>
                        <td>{formatDate("2025-05-12")}</td>
                        <td>2</td>
                        <td>Family event</td>
                        <td><span className="status-badge pending">Pending</span></td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <div className="leave-request">
                <h4>Request Leave</h4>
                <button className="request-leave-btn">New Leave Request</button>
            </div>
        </div>
    );
};

export default VacationTab;