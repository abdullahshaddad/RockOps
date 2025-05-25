// src/Pages/Dashboards/UserDashboard.jsx
import React from 'react';

const UserDashboard = () => {
    return (
        <div className="user-dashboard">
            <h1>User Dashboard</h1>
            <div className="dashboard-cards">
                {/* Your dashboard content here */}
                <div className="dashboard-card">
                    <h2>Welcome to the system</h2>
                    <p>Select a module from the sidebar to get started.</p>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;