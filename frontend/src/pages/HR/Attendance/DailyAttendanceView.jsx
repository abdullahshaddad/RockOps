import React, { useState, useEffect } from 'react';
import { BsCheckCircle, BsXCircle, BsExclamationCircle, BsClockHistory, BsPersonCheck } from 'react-icons/bs';
import './DailyAttendanceView.scss';

const DailyAttendanceView = ({ employees }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({
        present: [],
        absent: [],
        late: [],
        checkedIn: [],
        totalEmployees: 0
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

    // Quick action to mark an employee as present
    const markPresent = async (employeeId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Get employee to determine contract type
            const employee = employees.find(emp => emp.id === employeeId);
            const contractType = employee?.jobPosition?.contractType || 'MONTHLY';

            let requestBody = {
                employeeId,
                date: selectedDate,
                contractType
            };

            // Set appropriate status based on contract type
            if (contractType === 'MONTHLY') {
                requestBody.status = 'PRESENT';
            } else if (contractType === 'DAILY') {
                requestBody.dailyStatus = 'PRESENT';
            } else if (contractType === 'HOURLY') {
                // For hourly, we'll do a check-in action
                const response = await fetch(`http://localhost:8080/api/v1/attendance/check-in`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        employeeId,
                        checkInTime: new Date().toLocaleTimeString('en-GB', { hour12: false }),
                        location: 'Office'
                    }),
                });

                if (response.ok) {
                    // Refresh data and return
                    await fetchDailyAttendance();
                }
                return;
            }

            const response = await fetch(`http://localhost:8080/api/v1/attendance/record`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Refresh attendance data
            await fetchDailyAttendance();
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
            await fetchDailyAttendance();
        } catch (err) {
            console.error('Error updating attendance status:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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

    const getEmployeeName = (employeeId) => {
        const employee = employees.find(emp => emp.id === employeeId);
        return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
    };

    const getEmployeePosition = (employeeId) => {
        const employee = employees.find(emp => emp.id === employeeId);
        return employee?.jobPositionName || employee?.position || 'No Position';
    };

    const getEmployeeContractType = (employeeId) => {
        const employee = employees.find(emp => emp.id === employeeId);
        return employee?.jobPosition?.contractType || 'MONTHLY';
    };

    const renderEmployeeList = (title, employeeList, iconComponent, cardClass) => {
        return (
            <div className="attendance-section">
                <h2>
                    <span className="section-icon">{iconComponent}</span>
                    {title} ({employeeList.length})
                </h2>
                <div className="employee-list">
                    {employeeList.length > 0 ? (
                        employeeList.map(attendance => (
                            <div key={attendance.employeeId || attendance.id} className="employee-item">
                                <div className="employee-info">
                                    <h3>{getEmployeeName(attendance.employeeId)}</h3>
                                    <p>{getEmployeePosition(attendance.employeeId)}</p>
                                    <p className="contract-type">
                                        {getEmployeeContractType(attendance.employeeId)}
                                    </p>
                                    {attendance.checkInTime && (
                                        <p className="check-in-time">
                                            Check-in: {new Date(`2000-01-01T${attendance.checkInTime}`).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                        </p>
                                    )}
                                    {attendance.checkOutTime && (
                                        <p className="check-out-time">
                                            Check-out: {new Date(`2000-01-01T${attendance.checkOutTime}`).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                        </p>
                                    )}
                                </div>
                                <div className="action-buttons">
                                    {title === 'Absent' && (
                                        <button
                                            className="mark-present-btn"
                                            onClick={() => markPresent(attendance.employeeId)}
                                        >
                                            Mark Present
                                        </button>
                                    )}
                                    {title === 'Late' && attendance.id && (
                                        <button
                                            className="mark-present-btn"
                                            onClick={() => updateStatus(attendance.id, 'PRESENT')}
                                        >
                                            Mark On Time
                                        </button>
                                    )}
                                    {title === 'Checked In' && attendance.employeeId && (
                                        <button
                                            className="mark-present-btn"
                                            onClick={async () => {
                                                try {
                                                    const token = localStorage.getItem('token');
                                                    await fetch(`http://localhost:8080/api/v1/attendance/check-out`, {
                                                        method: 'POST',
                                                        headers: {
                                                            'Authorization': `Bearer ${token}`,
                                                            'Content-Type': 'application/json',
                                                        },
                                                        body: JSON.stringify({
                                                            employeeId: attendance.employeeId,
                                                            checkOutTime: new Date().toLocaleTimeString('en-GB', { hour12: false })
                                                        }),
                                                    });
                                                    await fetchDailyAttendance();
                                                } catch (err) {
                                                    console.error('Error checking out:', err);
                                                }
                                            }}
                                        >
                                            Check Out
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-data">
                            No employees in this category.
                        </div>
                    )}
                </div>
            </div>
        );
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
                        <span className="count">
                            {(attendanceData.present?.length || 0) + (attendanceData.checkedIn?.length || 0)}
                        </span>
                    </div>
                </div>

                <div className="summary-card absent-card">
                    <div className="card-icon">
                        <BsXCircle />
                    </div>
                    <div className="card-content">
                        <h3>Absent</h3>
                        <span className="count">{attendanceData.absent?.length || 0}</span>
                    </div>
                </div>

                <div className="summary-card late-card">
                    <div className="card-icon">
                        <BsClockHistory />
                    </div>
                    <div className="card-content">
                        <h3>Late</h3>
                        <span className="count">{attendanceData.late?.length || 0}</span>
                    </div>
                </div>

                <div className="summary-card leave-card">
                    <div className="card-icon">
                        <BsExclamationCircle />
                    </div>
                    <div className="card-content">
                        <h3>Checked In</h3>
                        <span className="count">{attendanceData.checkedIn?.length || 0}</span>
                    </div>
                </div>
            </div>

            <div className="attendance-lists">
                {renderEmployeeList('Present', attendanceData.present || [], <BsCheckCircle />, 'present-card')}
                {renderEmployeeList('Absent', attendanceData.absent || [], <BsXCircle />, 'absent-card')}
                {renderEmployeeList('Late', attendanceData.late || [], <BsClockHistory />, 'late-card')}
                {renderEmployeeList('Checked In', attendanceData.checkedIn || [], <BsPersonCheck />, 'checkedin-card')}
            </div>
        </div>
    );
};

export default DailyAttendanceView;