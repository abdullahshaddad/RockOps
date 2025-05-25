import React, { useState, useEffect } from 'react';
import { BsCheckCircle, BsXCircle, BsExclamationCircle, BsClockHistory } from 'react-icons/bs';
import './DailyAttendanceView.scss';

const DailyAttendanceView = ({ employees }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({
        present: [],
        absent: [],
        late: [],
        leave: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch daily attendance for the selected date
    useEffect(() => {
        const fetchDailyAttendance = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:8080/api/v1/attendance/daily-summary?date=${selectedDate}`, {
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
                setAttendanceData(data);
            } catch (err) {
                console.error('Error fetching daily attendance:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (selectedDate) {
            fetchDailyAttendance();
        }
    }, [selectedDate]);

    // Mark an employee as present
    const markPresent = async (employeeId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/v1/attendance/mark-present`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeId,
                    date: selectedDate
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Refresh attendance data
            const updatedAttendanceResponse = await fetch(`http://localhost:8080/api/v1/attendance/daily-summary?date=${selectedDate}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (updatedAttendanceResponse.ok) {
                const updatedData = await updatedAttendanceResponse.json();
                setAttendanceData(updatedData);
            }
        } catch (err) {
            console.error('Error marking employee as present:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Update attendance status
    const updateStatus = async (attendanceId, status) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/v1/attendance/${attendanceId}/status?status=${status}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Refresh attendance data
            const updatedAttendanceResponse = await fetch(`http://localhost:8080/api/v1/attendance/daily-summary?date=${selectedDate}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (updatedAttendanceResponse.ok) {
                const updatedData = await updatedAttendanceResponse.json();
                setAttendanceData(updatedData);
            }
        } catch (err) {
            console.error('Error updating attendance status:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Loading daily attendance...</p>
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

    return (
        <div className="daily-attendance-view">
            <div className="date-selector">
                <label htmlFor="date-input">Select Date:</label>
                <input
                    id="date-input"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                />
            </div>

            <div className="attendance-summary">
                <div className="summary-card present-card">
                    <div className="card-icon">
                        <BsCheckCircle />
                    </div>
                    <div className="card-content">
                        <h3>Present</h3>
                        <span className="count">{attendanceData.present.length}</span>
                    </div>
                </div>

                <div className="summary-card absent-card">
                    <div className="card-icon">
                        <BsXCircle />
                    </div>
                    <div className="card-content">
                        <h3>Absent</h3>
                        <span className="count">{attendanceData.absent.length}</span>
                    </div>
                </div>

                <div className="summary-card late-card">
                    <div className="card-icon">
                        <BsClockHistory />
                    </div>
                    <div className="card-content">
                        <h3>Late</h3>
                        <span className="count">{attendanceData.late.length}</span>
                    </div>
                </div>

                <div className="summary-card leave-card">
                    <div className="card-icon">
                        <BsExclamationCircle />
                    </div>
                    <div className="card-content">
                        <h3>On Leave</h3>
                        <span className="count">{attendanceData.leave.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyAttendanceView;
