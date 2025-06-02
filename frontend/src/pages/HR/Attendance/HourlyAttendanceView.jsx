import React, { useState, useEffect } from 'react';
import { BsClockHistory, BsSearch, BsPlus } from 'react-icons/bs';
import './HourlyAttendanceView.scss';

const HourlyAttendanceView = ({ employees }) => {
    const [hourlyEmployees, setHourlyEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [breakDuration, setBreakDuration] = useState(60);
    const [searchDate, setSearchDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Filter employees with HOURLY job position type
        const filtered = employees.filter(
            employee => employee.jobPosition && employee.jobPosition.contractType === 'HOURLY'
        );
        setHourlyEmployees(filtered);
    }, [employees]);

    useEffect(() => {
        if (selectedEmployee) {
            fetchEmployeeAttendance();
        }
    }, [selectedEmployee, searchDate]);

    const fetchEmployeeAttendance = async () => {
        try {
            setLoading(true);
            // Extract year and month from the search date
            const date = new Date(searchDate);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;

            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/v1/attendance/employee/${selectedEmployee}?startDate=${year}-${month.toString().padStart(2, '0')}-01&endDate=${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate()}`, {
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
            // Filter to only include hourly attendance records
            const hourlyData = data.filter(record => record.contractType === 'HOURLY');
            setAttendanceData(hourlyData);
        } catch (err) {
            console.error('Error fetching hourly attendance:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const recordHourlyAttendance = async () => {
        if (!selectedEmployee || !selectedDate || !startTime || !endTime) {
            alert('Please fill in all required fields');
            return;
        }

        // Validate that end time is after start time
        if (startTime >= endTime) {
            alert('End time must be after start time');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const requestBody = {
                employeeId: selectedEmployee,
                date: selectedDate,
                contractType: 'HOURLY',
                checkInTime: startTime + ':00',
                checkOutTime: endTime + ':00',
                breakDurationMinutes: parseInt(breakDuration),
                notes: ''
            };

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

            // Refresh attendance data if the recorded date is in the same month as search date
            const recordedDate = new Date(selectedDate);
            const searchDateObj = new Date(searchDate);

            if (recordedDate.getMonth() === searchDateObj.getMonth() &&
                recordedDate.getFullYear() === searchDateObj.getFullYear()) {
                fetchEmployeeAttendance();
            }

            alert('Hourly attendance recorded successfully');

            // Reset form fields
            setSelectedDate(new Date().toISOString().split('T')[0]);
            setStartTime('09:00');
            setEndTime('17:00');
            setBreakDuration(60);
        } catch (err) {
            console.error('Error recording hourly attendance:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const calculateHoursWorked = (start, end, breakMinutes = 0) => {
        if (!start || !end) return 'N/A';

        const startArr = start.split(':');
        const endArr = end.split(':');

        const startMinutes = parseInt(startArr[0]) * 60 + parseInt(startArr[1]);
        const endMinutes = parseInt(endArr[0]) * 60 + parseInt(endArr[1]);

        // Calculate difference in minutes
        let diffMinutes = endMinutes - startMinutes;

        // Subtract break time
        if (breakMinutes) {
            diffMinutes -= breakMinutes;
        }

        // Convert to hours and minutes
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;

        return `${hours}h ${minutes}m`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        // If time is in format HH:MM:SS, remove seconds
        if (timeString && timeString.split(':').length === 3) {
            return timeString.substring(0, 5);
        }
        return timeString || 'N/A';
    };

    const getSelectedEmployeeName = () => {
        if (!selectedEmployee) return '';
        const employee = employees.find(emp => emp.id === selectedEmployee);
        return employee ? `${employee.firstName} ${employee.lastName}` : '';
    };

    const calculateOvertimeHours = (regularHours, totalHours) => {
        if (!regularHours || !totalHours) return 0;
        return Math.max(0, totalHours - regularHours);
    };

    const formatHoursFromDecimal = (decimalHours) => {
        if (!decimalHours) return 'N/A';
        const hours = Math.floor(decimalHours);
        const minutes = Math.round((decimalHours - hours) * 60);
        return `${hours}h ${minutes}m`;
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Loading hourly attendance...</p>
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
        <div className="hourly-attendance-view">
            <div className="hourly-attendance-container">
                <div className="form-section">
                    <h2>Record Hourly Attendance</h2>
                    <div className="form-content">
                        <div className="form-group">
                            <label>Employee:</label>
                            <select
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                            >
                                <option value="">Select Employee</option>
                                {hourlyEmployees.map(employee => (
                                    <option key={employee.id} value={employee.id}>
                                        {employee.firstName} {employee.lastName} - {employee.position || employee.jobPositionName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Date:</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="form-group">
                            <label>Start Time:</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>End Time:</label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Break Duration (minutes):</label>
                            <input
                                type="number"
                                value={breakDuration}
                                onChange={(e) => setBreakDuration(e.target.value)}
                                min="0"
                                max="480"
                            />
                        </div>

                        <button
                            className="record-btn"
                            onClick={recordHourlyAttendance}
                            disabled={!selectedEmployee || !selectedDate || !startTime || !endTime}
                        >
                            <BsPlus /> Record Attendance
                        </button>
                    </div>
                </div>

                <div className="history-section">
                    <h2>Attendance History</h2>
                    <div className="search-container">
                        <div className="search-group">
                            <label>Employee:</label>
                            <select
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                            >
                                <option value="">Select Employee</option>
                                {hourlyEmployees.map(employee => (
                                    <option key={employee.id} value={employee.id}>
                                        {employee.firstName} {employee.lastName} - {employee.position || employee.jobPositionName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="search-group">
                            <label>Month:</label>
                            <input
                                type="date"
                                value={searchDate}
                                onChange={(e) => setSearchDate(e.target.value)}
                            />
                        </div>

                        <button
                            className="search-btn"
                            onClick={fetchEmployeeAttendance}
                            disabled={!selectedEmployee}
                        >
                            <BsSearch /> Search
                        </button>
                    </div>

                    {selectedEmployee && (
                        <div className="attendance-header">
                            <h3>
                                {getSelectedEmployeeName()} - Hourly Attendance Records
                            </h3>
                        </div>
                    )}

                    {selectedEmployee && attendanceData.length > 0 ? (
                        <div className="attendance-table-container">
                            <table className="attendance-table">
                                <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Check-In</th>
                                    <th>Check-Out</th>
                                    <th>Break Duration</th>
                                    <th>Hours Worked</th>
                                    <th>Regular Hours</th>
                                    <th>Overtime</th>
                                    <th>Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {attendanceData.map(record => (
                                    <tr key={record.id}>
                                        <td>{formatDate(record.date)}</td>
                                        <td>{formatTime(record.checkInTime)}</td>
                                        <td>{formatTime(record.checkOutTime)}</td>
                                        <td>{record.breakDurationMinutes ? `${record.breakDurationMinutes} min` : 'N/A'}</td>
                                        <td>
                                            {record.hoursWorked
                                                ? formatHoursFromDecimal(record.hoursWorked)
                                                : record.checkInTime && record.checkOutTime
                                                    ? calculateHoursWorked(
                                                        formatTime(record.checkInTime),
                                                        formatTime(record.checkOutTime),
                                                        record.breakDurationMinutes
                                                    )
                                                    : 'N/A'
                                            }
                                        </td>
                                        <td>
                                            {record.regularHours
                                                ? formatHoursFromDecimal(record.regularHours)
                                                : 'N/A'
                                            }
                                        </td>
                                        <td>
                                            {record.overtimeHours
                                                ? formatHoursFromDecimal(record.overtimeHours)
                                                : '0h 0m'
                                            }
                                        </td>
                                        <td>
                                            <span className={`status-badge ${record.displayStatus?.toLowerCase() || 'unknown'}`}>
                                                {record.displayStatus || 'Unknown'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        selectedEmployee && (
                            <div className="no-data-container">
                                <p>No hourly attendance records found for this employee.</p>
                            </div>
                        )
                    )}

                    {!selectedEmployee && (
                        <div className="select-employee-prompt">
                            <p>Please select an employee to view their hourly attendance.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HourlyAttendanceView;