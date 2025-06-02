import React, { useState, useEffect } from 'react';
import { BsCalendarWeek, BsClipboardCheck, BsFileEarmarkBarGraph, BsListCheck, BsPersonCheck } from 'react-icons/bs';
import AttendanceManagement from './AttendanceManagement';
import AttendanceCalendar from './AttendanceCalendar';
import AttendanceReport from './AttendanceReport';
import './AttendancePage.scss';

const AttendancePage = () => {
    const [activeView, setActiveView] = useState('management');
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

        switch (activeView) {
            case 'management':
                return <AttendanceManagement employees={employees} />;
            case 'calendar':
                return <AttendanceCalendar employees={employees} />;
            case 'list':
                return <AttendanceList employees={employees} />;
            case 'report':
                return <AttendanceReport employees={employees} />;
            default:
                return <AttendanceManagement employees={employees} />;
        }
    };

    // Get employee statistics for display
    const getEmployeeStats = () => {
        const hourlyCount = employees.filter(emp => emp.jobPosition?.contractType === 'HOURLY').length;
        const dailyCount = employees.filter(emp => emp.jobPosition?.contractType === 'DAILY').length;
        const monthlyCount = employees.filter(emp => emp.jobPosition?.contractType === 'MONTHLY').length;

        return { hourlyCount, dailyCount, monthlyCount, total: employees.length };
    };

    const stats = getEmployeeStats();

    return (
        <div className="attendance-page">
            <div className="page-header">
                <h1>Attendance Management System</h1>
                <p className="description">
                    Track and manage employee attendance across different contract types, generate reports, and view attendance statistics
                </p>

                {/* Employee Statistics */}
                <div className="employee-stats">
                    <div className="stat-item">
                        <span className="stat-label">Total Employees:</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Hourly:</span>
                        <span className="stat-value">{stats.hourlyCount}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Daily:</span>
                        <span className="stat-value">{stats.dailyCount}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Monthly:</span>
                        <span className="stat-value">{stats.monthlyCount}</span>
                    </div>
                </div>
            </div>

            <div className="nav-tabs">
                <button
                    className={`nav-tab ${activeView === 'management' ? 'active' : ''}`}
                    onClick={() => setActiveView('management')}
                >
                    <BsPersonCheck /> Contract-Based Management
                </button>
                <button
                    className={`nav-tab ${activeView === 'calendar' ? 'active' : ''}`}
                    onClick={() => setActiveView('calendar')}
                >
                    <BsCalendarWeek /> Calendar View
                </button>
                <button
                    className={`nav-tab ${activeView === 'list' ? 'active' : ''}`}
                    onClick={() => setActiveView('list')}
                >
                    <BsListCheck /> Attendance List
                </button>
                <button
                    className={`nav-tab ${activeView === 'report' ? 'active' : ''}`}
                    onClick={() => setActiveView('report')}
                >
                    <BsFileEarmarkBarGraph /> Reports & Analytics
                </button>
            </div>

            <div className="content-container">
                {renderContent()}
            </div>
        </div>
    );
};

export default AttendancePage;