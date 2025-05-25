import React, { useState, useEffect } from 'react';
import { BsCalendarPlus, BsPersonCheck, BsPersonDash } from 'react-icons/bs';
import './MonthlyAttendanceView.scss';

const MonthlyAttendanceView = ({ employees }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [generatingAttendance, setGeneratingAttendance] = useState(false);

    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' }
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    useEffect(() => {
        if (selectedEmployee) {
            fetchMonthlyAttendance();
        } else {
            setAttendanceData([]);
        }
    }, [selectedEmployee, selectedMonth, selectedYear]);

    const fetchMonthlyAttendance = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/v1/attendance/employee/${selectedEmployee}/monthly?year=${selectedYear}&month=${selectedMonth}`, {
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
            console.error('Error fetching monthly attendance:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const generateMonthlyAttendance = async () => {
        if (!selectedEmployee) {
            alert('Please select an employee first');
            return;
        }

        try {
            setGeneratingAttendance(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/v1/attendance/generate-monthly?employeeId=${selectedEmployee}&year=${selectedYear}&month=${selectedMonth}`, {
                method: 'POST',
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
            alert('Monthly attendance generated successfully');
        } catch (err) {
            console.error('Error generating monthly attendance:', err);
            setError(err.message);
        } finally {
            setGeneratingAttendance(false);
        }
    };

    const updateAttendanceStatus = async (attendanceId, status) => {
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
            fetchMonthlyAttendance();
        } catch (err) {
            console.error('Error updating attendance status:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'PRESENT':
                return 'present';
            case 'ABSENT':
                return 'absent';
            case 'LATE':
                return 'late';
            case 'HALF_DAY':
                return 'half-day';
            case 'ON_LEAVE':
                return 'leave';
            default:
                return '';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PRESENT':
                return <BsPersonCheck className="status-icon present" />;
            case 'ABSENT':
                return <BsPersonDash className="status-icon absent" />;
            case 'LATE':
                return <span className="status-icon late">L</span>;
            case 'HALF_DAY':
                return <span className="status-icon half-day">H</span>;
            case 'ON_LEAVE':
                return <span className="status-icon leave">V</span>;
            default:
                return null;
        }
    };

    const getSelectedEmployeeName = () => {
        if (!selectedEmployee) return '';
        const employee = employees.find(emp => emp.id === selectedEmployee);
        return employee ? `${employee.firstName} ${employee.lastName}` : '';
    };

    const getAttendanceSummary = () => {
        if (!attendanceData.length) return { present: 0, absent: 0, late: 0, leave: 0, total: 0 };

        const summary = {
            present: attendanceData.filter(a => a.status === 'PRESENT').length,
            absent: attendanceData.filter(a => a.status === 'ABSENT').length,
            late: attendanceData.filter(a => a.status === 'LATE').length,
            leave: attendanceData.filter(a => a.status === 'ON_LEAVE').length,
        };

        summary.total = attendanceData.length;
        return summary;
    };

    const summary = getAttendanceSummary();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Loading monthly attendance...</p>
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
        <div className="monthly-attendance-view">
            <div className="filters-container">
                <div className="filter-group">
                    <label>Employee:</label>
                    <select
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                    >
                        <option value="">Select Employee</option>
                        {employees.map(employee => (
                            <option key={employee.id} value={employee.id}>
                                {employee.firstName} {employee.lastName} - {employee.position || employee.jobPositionName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Month:</label>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    >
                        {months.map(month => (
                            <option key={month.value} value={month.value}>
                                {month.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Year:</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    >
                        {years.map(year => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    className="generate-btn"
                    onClick={generateMonthlyAttendance}
                    disabled={!selectedEmployee || generatingAttendance}
                >
                    <BsCalendarPlus /> Generate Attendance
                </button>
            </div>

            {selectedEmployee && (
                <div className="attendance-header">
                    <h2>Monthly Attendance: {getSelectedEmployeeName()}</h2>
                    <h3>
                        {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                    </h3>
                </div>
            )}

            {selectedEmployee && attendanceData.length > 0 && (
                <div className="attendance-summary">
                    <div className="summary-item">
                        <span className="label">Working Days:</span>
                        <span className="value">{summary.total}</span>
                    </div>
                    <div className="summary-item present">
                        <span className="label">Present:</span>
                        <span className="value">{summary.present}</span>
                    </div>
                    <div className="summary-item absent">
                        <span className="label">Absent:</span>
                        <span className="value">{summary.absent}</span>
                    </div>
                    <div className="summary-item late">
                        <span className="label">Late:</span>
                        <span className="value">{summary.late}</span>
                    </div>
                    <div className="summary-item leave">
                        <span className="label">On Leave:</span>
                        <span className="value">{summary.leave}</span>
                    </div>
                    <div className="summary-item">
                        <span className="label">Attendance Rate:</span>
                        <span className="value">
              {summary.total > 0
                  ? `${Math.round((summary.present / summary.total) * 100)}%`
                  : '0%'}
            </span>
                    </div>
                </div>
            )}

            {selectedEmployee && attendanceData.length > 0 ? (
                <div className="attendance-table-container">
                    <table className="attendance-table">
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {attendanceData.map(attendance => (
                            <tr key={attendance.id} className={getStatusClass(attendance.status)}>
                                <td>{formatDate(attendance.date)}</td>
                                <td className="status-cell">
                                    {getStatusIcon(attendance.status)}
                                    <span className="status-text">{attendance.status}</span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="present-btn"
                                            onClick={() => updateAttendanceStatus(attendance.id, 'PRESENT')}
                                            disabled={attendance.status === 'PRESENT'}
                                        >
                                            Present
                                        </button>
                                        <button
                                            className="absent-btn"
                                            onClick={() => updateAttendanceStatus(attendance.id, 'ABSENT')}
                                            disabled={attendance.status === 'ABSENT'}
                                        >
                                            Absent
                                        </button>
                                        <button
                                            className="late-btn"
                                            onClick={() => updateAttendanceStatus(attendance.id, 'LATE')}
                                            disabled={attendance.status === 'LATE'}
                                        >
                                            Late
                                        </button>
                                        <button
                                            className="leave-btn"
                                            onClick={() => updateAttendanceStatus(attendance.id, 'ON_LEAVE')}
                                            disabled={attendance.status === 'ON_LEAVE'}
                                        >
                                            Leave
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                selectedEmployee && (
                    <div className="no-data-container">
                        <p>No attendance records found for this month.</p>
                        <button
                            className="generate-btn"
                            onClick={generateMonthlyAttendance}
                            disabled={generatingAttendance}
                        >
                            {generatingAttendance ? 'Generating...' : 'Generate Monthly Attendance'}
                        </button>
                    </div>
                )
            )}

            {!selectedEmployee && (
                <div className="select-employee-prompt">
                    <p>Please select an employee to view their monthly attendance.</p>
                </div>
            )}
        </div>
    );
};

export default MonthlyAttendanceView;