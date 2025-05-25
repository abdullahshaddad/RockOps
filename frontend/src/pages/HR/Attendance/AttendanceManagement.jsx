import React, { useState, useEffect } from 'react';
import { BsCalendarCheck, BsClipboardData, BsClock } from 'react-icons/bs';
import MonthlyAttendanceView from './MonthlyAttendanceView';
import DailyAttendanceView from './DailyAttendanceView';
import HourlyAttendanceView from './HourlyAttendanceView';
import './AttendanceManagement.scss';

const AttendanceManagement = () => {
    const [activeTab, setActiveTab] = useState('daily');
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:8080/api/v1/employees', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setEmployees(data);
            } catch (err) {
                console.error('Error fetching employees:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, []);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="loading-container">
                    <div className="loader"></div>
                    <p>Loading attendance data...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="error-container">
                    <p>Error: {error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            );
        }

        switch (activeTab) {
            case 'daily':
                return <DailyAttendanceView employees={employees} />;
            case 'monthly':
                return <MonthlyAttendanceView employees={employees} />;
            case 'hourly':
                return <HourlyAttendanceView employees={employees} />;
            default:
                return <DailyAttendanceView employees={employees} />;
        }
    };

    return (
        <div className="attendance-container">
            <div className="attendance-header">
                <h1>Attendance Management</h1>
                <div className="attendance-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
                        onClick={() => setActiveTab('daily')}
                    >
                        <BsCalendarCheck /> Daily Attendance
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'monthly' ? 'active' : ''}`}
                        onClick={() => setActiveTab('monthly')}
                    >
                        <BsClipboardData /> Monthly View
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'hourly' ? 'active' : ''}`}
                        onClick={() => setActiveTab('hourly')}
                    >
                        <BsClock /> Hourly Tracking
                    </button>
                </div>
            </div>
            <div className="attendance-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default AttendanceManagement;