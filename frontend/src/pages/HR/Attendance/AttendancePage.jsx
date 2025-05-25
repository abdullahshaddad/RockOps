import React, { useState, useEffect } from 'react';
import { BsCalendarWeek, BsClipboardCheck, BsFileEarmarkBarGraph, BsListCheck } from 'react-icons/bs';
import AttendanceManagement from './AttendanceManagement';
import AttendanceCalendar from './AttendanceCalendar';
import AttendanceForm from './AttendanceForm';
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
            case 'form':
                return <AttendanceForm employees={employees} />;
            case 'report':
                return <AttendanceReport employees={employees} />;
            default:
                return <AttendanceManagement employees={employees} />;
        }
    };

    return (
        <div className="attendance-page">
            <div className="page-header">
                <h1>Attendance Management System</h1>
                <p className="description">
                    Track and manage employee attendance, generate reports, and view attendance statistics
                </p>
            </div>

            <div className="nav-tabs">
                <button
                    className={`nav-tab ${activeView === 'management' ? 'active' : ''}`}
                    onClick={() => setActiveView('management')}
                >
                    <BsListCheck /> Attendance Management
                </button>
                <button
                    className={`nav-tab ${activeView === 'calendar' ? 'active' : ''}`}
                    onClick={() => setActiveView('calendar')}
                >
                    <BsCalendarWeek /> Calendar View
                </button>
                <button
                    className={`nav-tab ${activeView === 'form' ? 'active' : ''}`}
                    onClick={() => setActiveView('form')}
                >
                    <BsClipboardCheck /> Quick Entry
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