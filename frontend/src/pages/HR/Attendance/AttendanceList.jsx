import React, { useEffect, useState } from 'react';
import {
    FiFilter,
    FiChevronDown,
    FiPlus,
    FiEdit,
    FiTrash2,
    FiCheck,
    FiX,
    FiCalendar,
    FiClock,
    FiSearch
} from 'react-icons/fi';
import AddAttendanceForm from '../../Components/HR/AddAttendanceForm';
import EditAttendanceForm from '../../Components/HR/EditAttendanceForm';
import './AttendanceList.scss';

const AttendanceList = () => {
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        employeeId: '',
        date: '',
        status: '',
        department: '',
        attendanceType: ''
    });
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '-';

        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Format time for display
    const formatTime = (timeString) => {
        if (!timeString) return '-';

        // If time string is in format "HH:MM:SS"
        if (timeString.includes(':')) {
            return timeString.substring(0, 5);
        }

        return timeString;
    };

    // Calculate duration between start and end time
    const calculateDuration = (startTime, endTime) => {
        if (!startTime || !endTime) return '-';

        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);

        // If end time is earlier than start time, assume it's the next day
        let diff = end - start;
        if (diff < 0) {
            diff += 24 * 60 * 60 * 1000;
        }

        // Convert to hours and minutes
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m`;
    };

    // Function to fetch attendance records
    const fetchAttendanceRecords = async () => {
        setLoading(true);
        try {
            // Build query parameters based on filters
            const params = new URLSearchParams();
            if (filters.employeeId) params.append('employeeId', filters.employeeId);
            if (filters.status) params.append('status', filters.status);
            if (filters.department) params.append('department', filters.department);
            if (filters.attendanceType) params.append('type', filters.attendanceType);
            if (dateRange.startDate) params.append('startDate', dateRange.startDate);
            if (dateRange.endDate) params.append('endDate', dateRange.endDate);

            const queryString = params.toString() ? `?${params.toString()}` : '';

            const response = await fetch(`http://localhost:8080/api/v1/attendance${queryString}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch attendance records');
            }

            const data = await response.json();
            setAttendanceRecords(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching attendance records:', err);
            setError(err.message || 'Failed to load attendance records');
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch employees
    const fetchEmployees = async () => {
        try {
            const response = await fetch(`http://localhost:8080/employees`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch employees');
            }

            const data = await response.json();
            setEmployees(data);
        } catch (err) {
            console.error('Error fetching employees:', err);
        }
    };

    useEffect(() => {
        // Fetch initial data
        fetchEmployees();
        fetchAttendanceRecords();
    }, []);

    useEffect(() => {
        // Fetch records when filters change
        fetchAttendanceRecords();
    }, [filters, dateRange]);

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
        setOpenDropdown(null); // Close dropdown after selection
    };

    // Handle date range change
    const handleDateRangeChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDropdown && !event.target.closest('.attendance-filter-dropdown')) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openDropdown]);

    const toggleDropdown = (dropdown) => {
        if (openDropdown === dropdown) {
            setOpenDropdown(null);
        } else {
            setOpenDropdown(dropdown);
        }
    };

    const handleOpenForm = () => {
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
    };

    const handleOpenEditForm = (record) => {
        setCurrentRecord(record);
        setIsEditFormOpen(true);
    };

    const handleCloseEditForm = () => {
        setIsEditFormOpen(false);
        setCurrentRecord(null);
    };

    const handleSubmitForm = async (formData) => {
        try {
            let endpoint;
            let method = 'POST';
            let body = {};

            switch (formData.attendanceType) {
                case 'FULL_TIME':
                    endpoint = 'http://localhost:8080/api/v1/attendance/mark-status';
                    body = {
                        employeeId: formData.employeeId,
                        date: formData.date,
                        status: formData.status,
                        notes: formData.notes
                    };
                    break;
                case 'HOURLY':
                    endpoint = 'http://localhost:8080/api/v1/attendance/hourly';
                    body = {
                        employeeId: formData.employeeId,
                        date: formData.date,
                        startTime: formData.startTime,
                        endTime: formData.endTime,
                        notes: formData.notes
                    };
                    break;
                case 'DAILY':
                    endpoint = 'http://localhost:8080/api/v1/attendance/daily';
                    body = {
                        employeeId: formData.employeeId,
                        date: formData.date,
                        notes: formData.notes
                    };
                    break;
                default:
                    throw new Error('Invalid attendance type');
            }

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error('Failed to create attendance record');
            }

            // Refresh the attendance list
            fetchAttendanceRecords();
            // Close the form
            handleCloseForm();
        } catch (err) {
            console.error('Error creating attendance record:', err);
            alert(err.message || 'Failed to create attendance record');
        }
    };

    const handleSubmitEditForm = async (formData) => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/attendance/${formData.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to update attendance record');
            }

            // Refresh the attendance list
            fetchAttendanceRecords();
            // Close the form
            handleCloseEditForm();
        } catch (err) {
            console.error('Error updating attendance record:', err);
            alert(err.message || 'Failed to update attendance record');
        }
    };

    const handleDeleteRecord = async (id) => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/attendance/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete attendance record');
            }

            // Refresh the attendance list
            fetchAttendanceRecords();
            // Reset the delete confirmation
            setDeleteConfirmId(null);
        } catch (err) {
            console.error('Error deleting attendance record:', err);
            alert(err.message || 'Failed to delete attendance record');
        }
    };

    // Get employee name by ID
    const getEmployeeName = (employeeId) => {
        const employee = employees.find(emp => emp.id === employeeId);
        return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
    };

    // Define filter options
    const departmentOptions = [
        'HR', 'Finance', 'Engineering', 'Operations', 'IT', 'Marketing', 'Sales',
        'Procurement', 'Legal', 'Contracts', 'Project Management', 'Construction',
        'Mining Operations', 'Safety', 'Quality Control'
    ];

    const attendanceStatusOptions = [
        'PRESENT',
        'ABSENT',
        'LATE',
        'HALF_DAY',
        'ON_LEAVE',
        'WORK_FROM_HOME',
        'SICK_LEAVE',
        'VACATION',
        'HOLIDAY',
        'TRAINING',
        'BUSINESS_TRIP',
        'COMPENSATORY_OFF'
    ];

    const attendanceTypeOptions = [
        'FULL_TIME',
        'HOURLY',
        'DAILY'
    ];

    if (loading && attendanceRecords.length === 0) return <div className="attendance-loading">Loading...</div>;
    if (error && attendanceRecords.length === 0) return <div className="attendance-error">Error: {error}</div>;

    return (
        <div className="attendance-list-container">
            <h1 className="attendance-list-header">Attendance Management</h1>

            {/* Filters and Add Attendance */}
            <div className="attendance-filter-card">
                <div className="attendance-filter-bar">
                    <div className="attendance-filter-label">
                        <FiFilter className="attendance-filter-icon" />
                        <span>Filter</span>
                    </div>

                    {/* Date Range Filter */}
                    <div className="date-range-filter">
                        <div className="date-filter-group">
                            <label>From:</label>
                            <input
                                type="date"
                                name="startDate"
                                value={dateRange.startDate}
                                onChange={handleDateRangeChange}
                                max={dateRange.endDate}
                            />
                        </div>
                        <div className="date-filter-group">
                            <label>To:</label>
                            <input
                                type="date"
                                name="endDate"
                                value={dateRange.endDate}
                                onChange={handleDateRangeChange}
                                min={dateRange.startDate}
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>

                    {/* Employee Filter */}
                    <div
                        className="attendance-filter-dropdown"
                        onClick={() => toggleDropdown('employee')}
                    >
            <span className="attendance-filter-text">
              {filters.employeeId ? getEmployeeName(filters.employeeId) : 'Employee'}
            </span>
                        <FiChevronDown className="attendance-filter-arrow" />

                        {openDropdown === 'employee' && (
                            <div className="attendance-dropdown-menu">
                                <div
                                    className="attendance-dropdown-item"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleFilterChange('employeeId', '');
                                    }}
                                >
                                    All Employees
                                </div>
                                {employees.map(employee => (
                                    <div
                                        key={employee.id}
                                        className="attendance-dropdown-item"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleFilterChange('employeeId', employee.id);
                                        }}
                                    >
                                        {`${employee.firstName} ${employee.lastName}`}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Status Filter */}
                    <div
                        className="attendance-filter-dropdown"
                        onClick={() => toggleDropdown('status')}
                    >
            <span className="attendance-filter-text">
              {filters.status || 'Status'}
            </span>
                        <FiChevronDown className="attendance-filter-arrow" />

                        {openDropdown === 'status' && (
                            <div className="attendance-dropdown-menu">
                                <div
                                    className="attendance-dropdown-item"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleFilterChange('status', '');
                                    }}
                                >
                                    All Statuses
                                </div>
                                {attendanceStatusOptions.map(option => (
                                    <div
                                        key={option}
                                        className="attendance-dropdown-item"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleFilterChange('status', option);
                                        }}
                                    >
                                        {option.replace('_', ' ')}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Type Filter */}
                    <div
                        className="attendance-filter-dropdown attendance-filter-last"
                        onClick={() => toggleDropdown('type')}
                    >
            <span className="attendance-filter-text">
              {filters.attendanceType || 'Type'}
            </span>
                        <FiChevronDown className="attendance-filter-arrow" />

                        {openDropdown === 'type' && (
                            <div className="attendance-dropdown-menu">
                                <div
                                    className="attendance-dropdown-item"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleFilterChange('attendanceType', '');
                                    }}
                                >
                                    All Types
                                </div>
                                {attendanceTypeOptions.map(option => (
                                    <div
                                        key={option}
                                        className="attendance-dropdown-item"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleFilterChange('attendanceType', option);
                                        }}
                                    >
                                        {option.replace('_', ' ')}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Add Attendance Button */}
                    <button className="attendance-add-button" onClick={handleOpenForm}>
                        <FiPlus className="attendance-add-icon" /> Add Attendance
                    </button>
                </div>

                {/* Active Filter Pills */}
                <div className="attendance-filter-pills">
                    {filters.employeeId && (
                        <button
                            className="attendance-filter-pill attendance-filter-pill-active"
                            onClick={() => handleFilterChange('employeeId', '')}>
                            Employee: {getEmployeeName(filters.employeeId)} ×
                        </button>
                    )}
                    {filters.status && (
                        <button
                            className="attendance-filter-pill attendance-filter-pill-active"
                            onClick={() => handleFilterChange('status', '')}>
                            Status: {filters.status.replace('_', ' ')} ×
                        </button>
                    )}
                    {filters.attendanceType && (
                        <button
                            className="attendance-filter-pill attendance-filter-pill-active"
                            onClick={() => handleFilterChange('attendanceType', '')}>
                            Type: {filters.attendanceType.replace('_', ' ')} ×
                        </button>
                    )}
                    {(dateRange.startDate !== new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0] ||
                        dateRange.endDate !== new Date().toISOString().split('T')[0]) && (
                        <button
                            className="attendance-filter-pill attendance-filter-pill-active"
                            onClick={() => setDateRange({
                                startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
                                endDate: new Date().toISOString().split('T')[0]
                            })}>
                            Date: {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)} ×
                        </button>
                    )}
                    {(filters.employeeId || filters.status || filters.attendanceType ||
                        (dateRange.startDate !== new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0] ||
                            dateRange.endDate !== new Date().toISOString().split('T')[0])) && (
                        <button
                            className="attendance-filter-pill"
                            onClick={() => {
                                setFilters({
                                    employeeId: '',
                                    date: '',
                                    status: '',
                                    department: '',
                                    attendanceType: ''
                                });
                                setDateRange({
                                    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
                                    endDate: new Date().toISOString().split('T')[0]
                                });
                            }}>
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Attendance Table */}
            <div className="attendance-table-card">
                <table className="attendance-table">
                    <thead>
                    <tr className="attendance-table-header">
                        <th className="attendance-table-header-cell">Employee</th>
                        <th className="attendance-table-header-cell">Date</th>
                        <th className="attendance-table-header-cell">Status</th>
                        <th className="attendance-table-header-cell">Time In</th>
                        <th className="attendance-table-header-cell">Time Out</th>
                        <th className="attendance-table-header-cell">Duration</th>
                        <th className="attendance-table-header-cell">Type</th>
                        <th className="attendance-table-header-cell">Notes</th>
                        <th className="attendance-table-header-cell">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {attendanceRecords.length > 0 ? (
                        attendanceRecords.map((record) => (
                            <tr key={record.id} className="attendance-table-row">
                                <td className="attendance-table-cell">
                                    {getEmployeeName(record.employeeId)}
                                </td>
                                <td className="attendance-table-cell">
                                    {formatDate(record.date)}
                                </td>
                                <td className="attendance-table-cell attendance-status-cell">
                    <span className={`attendance-status-badge ${record.status ? record.status.toLowerCase() : ''}`}>
                      {record.status || '-'}
                    </span>
                                </td>
                                <td className="attendance-table-cell">
                                    {formatTime(record.startTime)}
                                </td>
                                <td className="attendance-table-cell">
                                    {formatTime(record.endTime)}
                                </td>
                                <td className="attendance-table-cell">
                                    {record.startTime && record.endTime ?
                                        calculateDuration(record.startTime, record.endTime) : '-'}
                                </td>
                                <td className="attendance-table-cell">
                                    {record.type || 'FULL_TIME'}
                                </td>
                                <td className="attendance-table-cell attendance-notes-cell">
                                    {record.notes || '-'}
                                </td>
                                <td className="attendance-table-cell attendance-actions-cell">
                                    <div className="attendance-actions">
                                        <button
                                            className="table-action-button table-edit-button"
                                            onClick={() => handleOpenEditForm(record)}
                                        >
                                            <FiEdit />
                                        </button>
                                        {deleteConfirmId === record.id ? (
                                            <div className="table-delete-confirm">
                                                <button
                                                    className="table-confirm-yes"
                                                    onClick={() => handleDeleteRecord(record.id)}
                                                >
                                                    Yes
                                                </button>
                                                <button
                                                    className="table-confirm-no"
                                                    onClick={() => setDeleteConfirmId(null)}
                                                >
                                                    No
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                className="table-action-button attendance-delete-button"
                                                onClick={() => setDeleteConfirmId(record.id)}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9" className="attendance-empty-message">No attendance records found.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Add Attendance Form Modal */}
            {isFormOpen && (
                <AddAttendanceForm
                    isOpen={isFormOpen}
                    onClose={handleCloseForm}
                    onSubmit={handleSubmitForm}
                    employees={employees}
                    attendanceTypeOptions={attendanceTypeOptions}
                    attendanceStatusOptions={attendanceStatusOptions}
                />
            )}

            {/* Edit Attendance Form Modal */}
            {isEditFormOpen && currentRecord && (
                <EditAttendanceForm
                    isOpen={isEditFormOpen}
                    onClose={handleCloseEditForm}
                    onSubmit={handleSubmitEditForm}
                    record={currentRecord}
                    employees={employees}
                    attendanceTypeOptions={attendanceTypeOptions}
                    attendanceStatusOptions={attendanceStatusOptions}
                />
            )}
        </div>
    );
};

export default AttendanceList;