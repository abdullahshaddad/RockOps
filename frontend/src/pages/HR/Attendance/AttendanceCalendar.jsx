import React, { useState, useEffect } from 'react';
import './AttendanceCalendar.scss';

const AttendanceCalendar = ({ employees }) => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [calendarDays, setCalendarDays] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('all');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Status colors for attendance
    const statusColors = {
        PRESENT: 'var(--color-success)',
        ABSENT: 'var(--color-danger)',
        LATE: 'var(--color-warning)',
        HALF_DAY: 'orange',
        ON_LEAVE: 'purple',
        WEEKEND: 'gray',
        HOLIDAY: 'var(--color-info)'
    };

    // Month names
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Day names
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Generate calendar days for the current month
    useEffect(() => {
        const generateCalendarDays = () => {
            const year = currentYear;
            const month = currentMonth;

            // First day of the month
            const firstDay = new Date(year, month, 1);

            // Last day of the month
            const lastDay = new Date(year, month + 1, 0);

            // Starting day of the week (0-6, Sunday-Saturday)
            const startingDayOfWeek = firstDay.getDay();

            // Total days in the month
            const totalDays = lastDay.getDate();

            // Generate array of calendar days
            const days = [];

            // Add empty spaces for days before the first day of the month
            for (let i = 0; i < startingDayOfWeek; i++) {
                days.push({
                    date: null,
                    dayOfMonth: '',
                    isCurrentMonth: false
                });
            }

            // Add days of the current month
            for (let i = 1; i <= totalDays; i++) {
                const date = new Date(year, month, i);
                days.push({
                    date,
                    dayOfMonth: i,
                    isCurrentMonth: true,
                    isWeekend: date.getDay() === 0 || date.getDay() === 6,
                    isToday: isSameDay(date, new Date()),
                    isSelected: isSameDay(date, selectedDate)
                });
            }

            // Add empty spaces for days after the last day of the month to complete the grid
            const remainingDays = 42 - days.length; // 6 rows of 7 days
            for (let i = 0; i < remainingDays; i++) {
                days.push({
                    date: null,
                    dayOfMonth: '',
                    isCurrentMonth: false
                });
            }

            return days;
        };

        setCalendarDays(generateCalendarDays());
        fetchAttendanceData();
    }, [currentMonth, currentYear, selectedDate, selectedEmployeeId]);

    // Fetch attendance data
    const fetchAttendanceData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            let endpoint = `http://localhost:8080/api/v1/attendance/monthly?year=${currentYear}&month=${currentMonth + 1}`;

            if (selectedEmployeeId !== 'all') {
                endpoint = `http://localhost:8080/api/v1/attendance/employee/${selectedEmployeeId}/monthly?year=${currentYear}&month=${currentMonth + 1}`;
            }

            const response = await fetch(endpoint, {
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

            // Transform data to include employee information
            const formattedData = Array.isArray(data) ? data.map(item => {
                // If it already has employee info, use it, otherwise try to find the employee
                if (!item.employee && item.employeeId) {
                    const employee = employees.find(e => e.id === item.employeeId);
                    return {
                        ...item,
                        employee: employee || { id: item.employeeId }
                    };
                }
                return item;
            }) : [];

            setAttendanceData(formattedData);
        } catch (err) {
            console.error('Error fetching attendance data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle month navigation
    const goToPreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
        setSelectedDate(today);
    };

    // Handle day click
    const handleDayClick = (day) => {
        if (day.date) {
            setSelectedDate(day.date);
        }
    };

    // Handle employee selection change
    const handleEmployeeChange = (e) => {
        const employeeId = e.target.value;
        setSelectedEmployeeId(employeeId);
    };

    // Get attendance status for a specific day and employee
    const getAttendanceStatus = (day) => {
        if (!day.date || !day.isCurrentMonth) return null;

        const dateStr = day.date.toISOString().split('T')[0];

        let filteredAttendance = attendanceData.filter(attendance => {
            const attendanceDate = new Date(attendance.date || attendance.attendanceDate).toISOString().split('T')[0];
            return attendanceDate === dateStr;
        });

        if (selectedEmployeeId !== 'all') {
            filteredAttendance = filteredAttendance.filter(
                attendance => (attendance.employee?.id === selectedEmployeeId) ||
                    (attendance.employeeId === selectedEmployeeId)
            );

            if (filteredAttendance.length > 0) {
                return filteredAttendance[0].status;
            }

            // If it's a weekend, mark as WEEKEND
            if (day.isWeekend) {
                return 'WEEKEND';
            }

            // For past dates with no attendance record, mark as ABSENT
            const today = new Date();
            if (day.date < today && !isSameDay(day.date, today)) {
                return 'ABSENT';
            }
        }

        return null;
    };

    // Check if two dates are the same day
    const isSameDay = (date1, date2) => {
        return date1 && date2 &&
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    };

    // Format attendance data for the day summary
    const getDaySummary = (day) => {
        if (!day.date || !day.isCurrentMonth) return null;

        const dateStr = day.date.toISOString().split('T')[0];

        const dayAttendance = attendanceData.filter(attendance => {
            const attendanceDate = new Date(attendance.date || attendance.attendanceDate).toISOString().split('T')[0];
            return attendanceDate === dateStr;
        });

        if (dayAttendance.length === 0) return null;

        // Count by status
        const statusCounts = {};
        dayAttendance.forEach(attendance => {
            const status = attendance.status || 'UNKNOWN';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        // Calculate present percentage
        const totalEmployees = employees.length;
        const presentCount = (statusCounts.PRESENT || 0) + (statusCounts.LATE || 0);
        const presentPercentage = totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0;

        return {
            totalEmployees,
            presentCount,
            presentPercentage,
            statusCounts
        };
    };

    return (
        <div className="attendance-calendar">
            <div className="calendar-header">
                <div className="month-navigation">
                    <button onClick={goToPreviousMonth}>&lt;</button>
                    <h2>{monthNames[currentMonth]} {currentYear}</h2>
                    <button onClick={goToNextMonth}>&gt;</button>
                </div>

                <div className="calendar-controls">
                    <button className="today-btn" onClick={goToToday}>Today</button>

                    <div className="employee-select">
                        <label>Employee:</label>
                        <select value={selectedEmployeeId} onChange={handleEmployeeChange}>
                            <option value="all">All Employees</option>
                            {employees.map(employee => (
                                <option key={employee.id} value={employee.id}>
                                    {employee.firstName} {employee.lastName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="calendar-grid">
                {/* Calendar header with day names */}
                {dayNames.map((day, index) => (
                    <div key={`header-${index}`} className="calendar-header-cell">
                        {day}
                    </div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((day, index) => {
                    const status = getAttendanceStatus(day);
                    const summary = selectedEmployeeId === 'all' ? getDaySummary(day) : null;

                    return (
                        <div
                            key={`day-${index}`}
                            className={`calendar-day ${day.isCurrentMonth ? 'current-month' : 'other-month'} 
                        ${day.isWeekend ? 'weekend' : ''} 
                        ${day.isToday ? 'today' : ''} 
                        ${day.isSelected ? 'selected' : ''}`}
                            onClick={() => handleDayClick(day)}
                        >
                            <div className="day-number">{day.dayOfMonth}</div>

                            {status && (
                                <div
                                    className="attendance-status"
                                    style={{ backgroundColor: statusColors[status] || 'gray' }}
                                >
                                    {status}
                                </div>
                            )}

                            {summary && (
                                <div className="attendance-summary">
                                    <div className="present-percentage">
                                        {summary.presentPercentage}% Present
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Status legend */}
            <div className="status-legend">
                <h3>Status Legend</h3>
                <div className="legend-items">
                    {Object.entries(statusColors).map(([status, color]) => (
                        <div key={status} className="legend-item">
                            <div className="color-box" style={{ backgroundColor: color }}></div>
                            <span>{status}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Selected day details */}
            {selectedDate && (
                <div className="selected-day-details">
                    <h3>Details for {selectedDate.toDateString()}</h3>

                    <div className="day-overview">
                        <DayOverview
                            date={selectedDate}
                            attendanceData={attendanceData}
                            employees={employees}
                            selectedEmployeeId={selectedEmployeeId}
                        />
                    </div>
                </div>
            )}

            {loading && (
                <div className="loading-overlay">
                    <div className="loader"></div>
                </div>
            )}
        </div>
    );
};

// Component to display attendance overview for a specific day
const DayOverview = ({ date, attendanceData, employees, selectedEmployeeId }) => {
    // Skip if no date is selected
    if (!date) return null;

    const dateStr = date.toISOString().split('T')[0];

    // Filter attendance data for the selected date
    const dayAttendance = attendanceData.filter(attendance => {
        const attendanceDate = new Date(attendance.date || attendance.attendanceDate).toISOString().split('T')[0];
        return attendanceDate === dateStr;
    });

    // For single employee view
    if (selectedEmployeeId !== 'all') {
        const employeeAttendance = dayAttendance.find(
            a => (a.employee?.id === selectedEmployeeId) || (a.employeeId === selectedEmployeeId)
        );

        const employee = employees.find(e => e.id === selectedEmployeeId);

        if (!employee) {
            return <p>Employee not found</p>;
        }

        if (!employeeAttendance) {
            return (
                <div className="employee-attendance-details">
                    <p>No attendance record for {employee.firstName} {employee.lastName} on this date.</p>
                </div>
            );
        }

        return (
            <div className="employee-attendance-details">
                <div className="attendance-record">
                    <div className="record-row">
                        <div className="record-label">Status:</div>
                        <div className="record-value">
              <span className={`status-badge ${employeeAttendance.status?.toLowerCase()}`}>
                {employeeAttendance.status || 'Not Recorded'}
              </span>
                        </div>
                    </div>

                    {(employeeAttendance.startTime || employeeAttendance.checkInTime) && (
                        <div className="record-row">
                            <div className="record-label">Check-in Time:</div>
                            <div className="record-value">
                                {formatTime(employeeAttendance.startTime || employeeAttendance.checkInTime)}
                            </div>
                        </div>
                    )}

                    {(employeeAttendance.endTime || employeeAttendance.checkOutTime) && (
                        <div className="record-row">
                            <div className="record-label">Check-out Time:</div>
                            <div className="record-value">
                                {formatTime(employeeAttendance.endTime || employeeAttendance.checkOutTime)}
                            </div>
                        </div>
                    )}

                    {employeeAttendance.notes && (
                        <div className="record-row">
                            <div className="record-label">Notes:</div>
                            <div className="record-value">
                                {employeeAttendance.notes}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // For all employees view - show summary stats
    // Count by status
    const statusCounts = {};
    dayAttendance.forEach(attendance => {
        const status = attendance.status || 'UNKNOWN';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // Calculate percentages
    const totalEmployees = employees.length;
    const presentCount = (statusCounts.PRESENT || 0) + (statusCounts.LATE || 0);
    const absentCount = totalEmployees - presentCount;

    // Calculate average check-in time
    const checkInTimes = dayAttendance
        .filter(a => a.checkInTime || a.startTime)
        .map(a => new Date(a.checkInTime || a.startTime));

    let avgCheckInTime = 'N/A';
    if (checkInTimes.length > 0) {
        const totalMinutes = checkInTimes.reduce((sum, time) =>
            sum + time.getHours() * 60 + time.getMinutes(), 0);
        const avgMinutes = Math.round(totalMinutes / checkInTimes.length);
        const hours = Math.floor(avgMinutes / 60);
        const minutes = avgMinutes % 60;
        avgCheckInTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    return (
        <div className="day-overview-container">
            <div className="overview-cards">
                <div className="overview-card">
                    <div className="card-title">Present</div>
                    <div className="card-value">{presentCount}</div>
                    <div className="card-percentage">
                        {totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0}%
                    </div>
                </div>

                <div className="overview-card">
                    <div className="card-title">Absent</div>
                    <div className="card-value">{absentCount}</div>
                    <div className="card-percentage">
                        {totalEmployees > 0 ? Math.round((absentCount / totalEmployees) * 100) : 0}%
                    </div>
                </div>

                <div className="overview-card">
                    <div className="card-title">Late</div>
                    <div className="card-value">{statusCounts.LATE || 0}</div>
                    <div className="card-percentage">
                        {totalEmployees > 0 ? Math.round(((statusCounts.LATE || 0) / totalEmployees) * 100) : 0}%
                    </div>
                </div>

                <div className="overview-card">
                    <div className="card-title">On Leave</div>
                    <div className="card-value">{statusCounts.ON_LEAVE || 0}</div>
                    <div className="card-percentage">
                        {totalEmployees > 0 ? Math.round(((statusCounts.ON_LEAVE || 0) / totalEmployees) * 100) : 0}%
                    </div>
                </div>
            </div>

            <div className="overview-stats">
                <div className="stat-item">
                    <div className="stat-label">Average Check-in Time</div>
                    <div className="stat-value">{avgCheckInTime}</div>
                </div>

                <div className="stat-item">
                    <div className="stat-label">Total Employees</div>
                    <div className="stat-value">{totalEmployees}</div>
                </div>
            </div>
        </div>
    );
};

// Helper function to format time
const formatTime = (timeString) => {
    if (!timeString) return 'N/A';

    try {
        // Handle different time formats
        if (typeof timeString === 'string') {
            // If already in HH:MM format
            if (timeString.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) {
                return timeString.substring(0, 5); // Return just HH:MM
            }

            // If it's an ISO date string
            const date = new Date(timeString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        return 'N/A';
    } catch (e) {
        console.error('Error formatting time:', e);
        return 'N/A';
    }
};

export default AttendanceCalendar;