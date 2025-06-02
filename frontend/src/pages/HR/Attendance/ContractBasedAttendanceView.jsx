import React, { useState, useEffect } from 'react';
import { BsCheckCircle, BsXCircle, BsClock, BsCalendarCheck, BsPerson } from 'react-icons/bs';
import AttendanceForm from './AttendanceForm';
import './ContractBasedAttendanceView.scss';

const ContractBasedAttendanceView = ({ employees }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [selectedContractType, setSelectedContractType] = useState('ALL');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [formType, setFormType] = useState('record'); // 'record', 'check-in', 'check-out'

    // Contract type mapping
    const contractTypes = {
        'ALL': 'All Employees',
        'HOURLY': 'Hourly Employees',
        'DAILY': 'Daily Employees',
        'MONTHLY': 'Monthly Employees'
    };

    useEffect(() => {
        // Filter employees by contract type
        if (selectedContractType === 'ALL') {
            setFilteredEmployees(employees);
        } else {
            const filtered = employees.filter(emp =>
                emp.jobPosition && emp.jobPosition.contractType === selectedContractType
            );
            setFilteredEmployees(filtered);
        }
    }, [employees, selectedContractType]);

    useEffect(() => {
        if (selectedDate) {
            fetchDailyAttendance();
        }
    }, [selectedDate, filteredEmployees]);

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

    const handleQuickAction = async (employeeId, action) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            let endpoint = '';
            let body = {};

            const employee = employees.find(emp => emp.id === employeeId);
            const contractType = employee?.jobPosition?.contractType || 'MONTHLY';

            switch (action) {
                case 'check-in':
                    endpoint = 'http://localhost:8080/api/v1/attendance/check-in';
                    const checkInTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
                    body = {
                        employeeId,
                        checkInTime,
                        location: 'Office',
                        latitude: null,
                        longitude: null
                    };
                    break;
                case 'check-out':
                    endpoint = 'http://localhost:8080/api/v1/attendance/check-out';
                    const checkOutTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
                    body = {
                        employeeId,
                        checkOutTime
                    };
                    break;
                case 'mark-present':
                    endpoint = 'http://localhost:8080/api/v1/attendance/record';
                    body = {
                        employeeId,
                        date: selectedDate,
                        contractType,
                        status: contractType === 'MONTHLY' ? 'PRESENT' : null,
                        dailyStatus: contractType === 'DAILY' ? 'PRESENT' : null
                    };
                    break;
                case 'mark-absent':
                    endpoint = 'http://localhost:8080/api/v1/attendance/record';
                    body = {
                        employeeId,
                        date: selectedDate,
                        contractType,
                        status: contractType === 'MONTHLY' ? 'ABSENT' : null,
                        dailyStatus: contractType === 'DAILY' ? 'ABSENT' : null
                    };
                    break;
                default:
                    return;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Refresh attendance data
            await fetchDailyAttendance();
        } catch (err) {
            console.error('Error performing quick action:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const openFormForEmployee = (employee, type) => {
        setSelectedEmployee(employee);
        setFormType(type);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setSelectedEmployee(null);
        setFormType('record');
    };

    const handleFormSubmit = async (formData) => {
        try {
            const response = await fetch('http://localhost:8080/api/v1/attendance/record', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to record attendance');
            }

            await fetchDailyAttendance();
            closeForm();
        } catch (err) {
            console.error('Error submitting form:', err);
            setError(err.message);
        }
    };

    const getEmployeeAttendanceStatus = (employeeId) => {
        // Check if there's attendance data for this employee
        const allAttendance = [
            ...(attendanceData.present || []),
            ...(attendanceData.absent || []),
            ...(attendanceData.late || []),
            ...(attendanceData.checkedIn || [])
        ];

        return allAttendance.find(att => att.employeeId === employeeId);
    };

    const getStatusDisplay = (employee) => {
        const attendance = getEmployeeAttendanceStatus(employee.id);
        if (!attendance) return 'Not Recorded';

        // Handle different contract types
        const contractType = employee.jobPosition?.contractType;
        if (contractType === 'HOURLY') {
            if (attendance.checkInTime && !attendance.checkOutTime) {
                return 'Checked In';
            } else if (attendance.checkInTime && attendance.checkOutTime) {
                return attendance.isLate ? 'Present (Late)' : 'Present';
            }
        } else if (contractType === 'DAILY') {
            return attendance.dailyStatus || 'Not Recorded';
        } else if (contractType === 'MONTHLY') {
            return attendance.status || 'Not Recorded';
        }

        return 'Not Recorded';
    };

    const getActionButtons = (employee) => {
        const contractType = employee.jobPosition?.contractType;
        const attendance = getEmployeeAttendanceStatus(employee.id);

        if (contractType === 'HOURLY') {
            if (!attendance || !attendance.checkInTime) {
                return [
                    <button
                        key="checkin"
                        className="action-btn check-in-btn"
                        onClick={() => handleQuickAction(employee.id, 'check-in')}
                    >
                        Check In
                    </button>
                ];
            } else if (attendance.checkInTime && !attendance.checkOutTime) {
                return [
                    <button
                        key="checkout"
                        className="action-btn check-out-btn"
                        onClick={() => handleQuickAction(employee.id, 'check-out')}
                    >
                        Check Out
                    </button>
                ];
            }
        } else {
            if (!attendance) {
                return [
                    <button
                        key="present"
                        className="action-btn present-btn"
                        onClick={() => handleQuickAction(employee.id, 'mark-present')}
                    >
                        Present
                    </button>,
                    <button
                        key="absent"
                        className="action-btn absent-btn"
                        onClick={() => handleQuickAction(employee.id, 'mark-absent')}
                    >
                        Absent
                    </button>
                ];
            }
        }

        return [
            <button
                key="edit"
                className="action-btn edit-btn"
                onClick={() => openFormForEmployee(employee, 'record')}
            >
                Edit
            </button>
        ];
    };

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

    return (
        <div className="contract-based-attendance-view">
            <div className="controls-section">
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

                <div className="contract-filter">
                    <label htmlFor="contract-select">Contract Type:</label>
                    <select
                        id="contract-select"
                        value={selectedContractType}
                        onChange={(e) => setSelectedContractType(e.target.value)}
                    >
                        {Object.entries(contractTypes).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="attendance-summary">
                <div className="summary-card">
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

                <div className="summary-card">
                    <div className="card-icon">
                        <BsXCircle />
                    </div>
                    <div className="card-content">
                        <h3>Absent</h3>
                        <span className="count">{attendanceData.absent?.length || 0}</span>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-icon">
                        <BsClock />
                    </div>
                    <div className="card-content">
                        <h3>Late</h3>
                        <span className="count">{attendanceData.late?.length || 0}</span>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-icon">
                        <BsPerson />
                    </div>
                    <div className="card-content">
                        <h3>Total</h3>
                        <span className="count">{filteredEmployees.length}</span>
                    </div>
                </div>
            </div>

            <div className="employees-list">
                <div className="list-header">
                    <h2>Employees ({filteredEmployees.length})</h2>
                    <button
                        className="btn-primary"
                        onClick={() => openFormForEmployee(null, 'record')}
                    >
                        <BsCalendarCheck /> Record Attendance
                    </button>
                </div>

                <div className="employees-grid">
                    {filteredEmployees.map(employee => (
                        <div key={employee.id} className="employee-card">
                            <div className="employee-info">
                                <div className="employee-avatar">
                                    {employee.photoUrl ? (
                                        <img src={employee.photoUrl} alt={employee.fullName} />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="employee-details">
                                    <h3>{employee.firstName} {employee.lastName}</h3>
                                    <p className="position">{employee.jobPositionName || 'No Position'}</p>
                                    <p className="contract-type">
                                        {employee.jobPosition?.contractType || 'No Contract'}
                                    </p>
                                </div>
                            </div>

                            <div className="attendance-status">
                                <span className={`status-badge ${getStatusDisplay(employee).toLowerCase().replace(/\s+/g, '-')}`}>
                                    {getStatusDisplay(employee)}
                                </span>
                            </div>

                            <div className="action-buttons">
                                {getActionButtons(employee)}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredEmployees.length === 0 && (
                    <div className="no-employees">
                        <p>No employees found for the selected contract type.</p>
                    </div>
                )}
            </div>

            {showForm && (
                <AttendanceForm
                    type={formType}
                    employees={employees}
                    selectedEmployee={selectedEmployee}
                    selectedDate={new Date(selectedDate)}
                    onClose={closeForm}
                    onSubmit={handleFormSubmit}
                />
            )}
        </div>
    );
};

export default ContractBasedAttendanceView;