import React, { useState, useEffect } from 'react';
import {
    Clock,
    CheckCircle,
    XCircle,
    Edit,
    LogIn,
    LogOut,
    Users,
    Filter,
    ChevronDown,
    ChevronUp,
    Search,
    MoreVertical,
    Eye,
    Calendar,
    MapPin,
    TrendingUp
} from 'lucide-react';

const AttendanceListView = ({
                                attendanceData,
                                employees,
                                selectedDate,
                                onEditAttendance,
                                onQuickCheckIn,
                                onQuickCheckOut
                            }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedEmployee, setExpandedEmployee] = useState(null);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);

    // Process attendance data for list view
    const processedData = React.useMemo(() => {
        if (!attendanceData || typeof attendanceData !== 'object') {
            return [];
        }

        // If attendanceData has categorized data (from daily summary)
        if (attendanceData.present || attendanceData.absent) {
            const allRecords = [
                ...(attendanceData.present || []),
                ...(attendanceData.absent || []),
                ...(attendanceData.late || []),
                ...(attendanceData.checkedIn || [])
            ];

            return allRecords.map(record => {
                const employee = employees.find(emp => emp.id === record.employeeId);
                return {
                    id: record.id || `${record.employeeId}-${record.date || new Date().toISOString()}`,
                    ...record,
                    employee: employee ? {
                        id: employee.id,
                        fullName: employee.fullName || 'Unknown Employee',
                        jobPositionName: employee.jobPosition?.name || 'Unknown',
                        photoUrl: employee.photoUrl || null,
                        siteName: employee.site?.name || 'Unknown Site',
                        departmentName: employee.department?.name || 'Unknown Department'
                    } : {
                        id: record.employeeId,
                        fullName: 'Unknown Employee',
                        jobPositionName: 'Unknown',
                        photoUrl: null,
                        siteName: 'Unknown Site',
                        departmentName: 'Unknown Department'
                    }
                };
            });
        }

        // If attendanceData is an array of records
        if (Array.isArray(attendanceData)) {
            return attendanceData.map(record => {
                const employee = employees.find(emp => emp.id === record.employeeId);
                return {
                    id: record.id || `${record.employeeId}-${record.date || new Date().toISOString()}`,
                    ...record,
                    employee: employee ? {
                        id: employee.id,
                        fullName: employee.fullName || 'Unknown Employee',
                        jobPositionName: employee.jobPosition?.name || 'Unknown',
                        photoUrl: employee.photoUrl || null,
                        siteName: employee.site?.name || 'Unknown Site',
                        departmentName: employee.department?.name || 'Unknown Department'
                    } : {
                        id: record.employeeId,
                        fullName: 'Unknown Employee',
                        jobPositionName: 'Unknown',
                        photoUrl: null,
                        siteName: 'Unknown Site',
                        departmentName: 'Unknown Department'
                    }
                };
            });
        }

        return [];
    }, [attendanceData, employees]);

    // Filter and sort data
    const filteredAndSortedData = React.useMemo(() => {
        let filtered = processedData;

        // Apply status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(record => {
                const status = getAttendanceStatus(record);
                return status === filterStatus;
            });
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(record =>
                record.employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.employee.jobPositionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.employee.siteName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply sorting
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aValue, bValue;

                switch (sortConfig.key) {
                    case 'name':
                        aValue = a.employee.fullName;
                        bValue = b.employee.fullName;
                        break;
                    case 'position':
                        aValue = a.employee.jobPositionName || '';
                        bValue = b.employee.jobPositionName || '';
                        break;
                    case 'status':
                        aValue = getAttendanceStatus(a);
                        bValue = getAttendanceStatus(b);
                        break;
                    case 'checkIn':
                        aValue = a.checkInTime || '';
                        bValue = b.checkInTime || '';
                        break;
                    case 'checkOut':
                        aValue = a.checkOutTime || '';
                        bValue = b.checkOutTime || '';
                        break;
                    case 'hours':
                        aValue = a.hoursWorked || 0;
                        bValue = b.hoursWorked || 0;
                        break;
                    case 'site':
                        aValue = a.employee.siteName || '';
                        bValue = b.employee.siteName || '';
                        break;
                    default:
                        aValue = a[sortConfig.key];
                        bValue = b[sortConfig.key];
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [processedData, filterStatus, searchTerm, sortConfig]);

    const getAttendanceStatus = (record) => {
        if (!record) return 'absent';

        if (record.isLeave || record.status === 'ON_LEAVE') {
            return 'leave';
        }

        if (record.isHoliday) {
            return 'holiday';
        }

        switch (record.contractType) {
            case 'HOURLY':
                if (record.checkInTime && !record.checkOutTime) {
                    return 'checkedin';
                }
                if (record.checkInTime && record.checkOutTime) {
                    return record.isLate ? 'late' : 'present';
                }
                return 'absent';

            case 'DAILY':
                return record.dailyStatus === 'PRESENT' ? 'present' : 'absent';

            case 'MONTHLY':
                return record.status === 'PRESENT' ? 'present' : 'absent';

            default:
                return 'unknown';
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            present: { icon: CheckCircle, className: 'status-present', text: 'Present' },
            absent: { icon: XCircle, className: 'status-absent', text: 'Absent' },
            late: { icon: Clock, className: 'status-late', text: 'Late' },
            checkedin: { icon: LogIn, className: 'status-checkedin', text: 'Checked In' },
            leave: { icon: Calendar, className: 'status-leave', text: 'On Leave' },
            holiday: { icon: Calendar, className: 'status-holiday', text: 'Holiday' },
            unknown: { icon: XCircle, className: 'status-unknown', text: 'Unknown' }
        };

        const config = statusConfig[status] || statusConfig.unknown;
        const IconComponent = config.icon;

        return (
            <span className={`rockops-attendance-status-badge rockops-attendance-${config.className}`}>
                <IconComponent size={14} />
                {config.text}
            </span>
        );
    };

    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
    };

    const canCheckIn = (record) => {
        return record.contractType === 'HOURLY' &&
            (!record.checkInTime || (record.checkInTime && record.checkOutTime));
    };

    const canCheckOut = (record) => {
        return record.contractType === 'HOURLY' &&
            record.checkInTime && !record.checkOutTime;
    };

    const formatTime = (time) => {
        if (!time) return '-';
        return typeof time === 'string' ? time : time.toString();
    };

    const formatHours = (hours) => {
        if (!hours) return '-';
        return `${parseFloat(hours).toFixed(1)}h`;
    };

    const formatDuration = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return '-';

        const start = new Date(`2000-01-01T${checkIn}`);
        const end = new Date(`2000-01-01T${checkOut}`);
        const diff = (end - start) / (1000 * 60 * 60); // hours

        return `${diff.toFixed(1)}h`;
    };

    const handleEmployeeSelect = (employeeId, checked) => {
        if (checked) {
            setSelectedEmployees(prev => [...prev, employeeId]);
        } else {
            setSelectedEmployees(prev => prev.filter(id => id !== employeeId));
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedEmployees(filteredAndSortedData.map(record => record.employeeId));
        } else {
            setSelectedEmployees([]);
        }
    };

    const handleBulkCheckIn = async () => {
        // Implement bulk check-in logic
        console.log('Bulk check-in for:', selectedEmployees);
    };

    const handleBulkCheckOut = async () => {
        // Implement bulk check-out logic
        console.log('Bulk check-out for:', selectedEmployees);
    };

    const toggleEmployeeDetails = (employeeId) => {
        setExpandedEmployee(expandedEmployee === employeeId ? null : employeeId);
    };

    const getContractTypeColor = (contractType) => {
        switch (contractType) {
            case 'HOURLY':
                return 'contract-hourly';
            case 'DAILY':
                return 'contract-daily';
            case 'MONTHLY':
                return 'contract-monthly';
            default:
                return 'contract-unknown';
        }
    };

    return (
        <div className="rockops-attendance-list-view">
            <div className="rockops-attendance-list-header">
                <div className="rockops-attendance-list-filters">
                    <div className="rockops-attendance-search-box">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="rockops-attendance-search-input"
                        />
                    </div>
                    <div className="rockops-attendance-status-filter">
                        <Filter size={16} />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="rockops-attendance-status-select"
                        >
                            <option value="all">All Status</option>
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="late">Late</option>
                            <option value="checkedin">Checked In</option>
                            <option value="leave">On Leave</option>
                        </select>
                    </div>
                </div>
                {showBulkActions && (
                    <div className="rockops-attendance-bulk-actions">
                        <button
                            onClick={handleBulkCheckIn}
                            className="rockops-btn rockops-btn-primary rockops-attendance-bulk-btn"
                        >
                            <LogIn size={16} />
                            Check In Selected
                        </button>
                        <button
                            onClick={handleBulkCheckOut}
                            className="rockops-btn rockops-btn-secondary rockops-attendance-bulk-btn"
                        >
                            <LogOut size={16} />
                            Check Out Selected
                        </button>
                    </div>
                )}
            </div>

            <div className="rockops-attendance-list-table">
                <table className="rockops-attendance-table">
                    <thead className="rockops-attendance-table-header">
                        <tr>
                            <th className="rockops-attendance-checkbox-cell">
                                <input
                                    type="checkbox"
                                    checked={selectedEmployees.length === filteredAndSortedData.length}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    className="rockops-attendance-checkbox"
                                />
                            </th>
                            <th
                                className="rockops-attendance-sortable rockops-attendance-name-cell"
                                onClick={() => handleSort('name')}
                            >
                                Employee Name {getSortIcon('name')}
                            </th>
                            <th
                                className="rockops-attendance-sortable rockops-attendance-position-cell"
                                onClick={() => handleSort('position')}
                            >
                                Position {getSortIcon('position')}
                            </th>
                            <th
                                className="rockops-attendance-sortable rockops-attendance-status-cell"
                                onClick={() => handleSort('status')}
                            >
                                Status {getSortIcon('status')}
                            </th>
                            <th
                                className="rockops-attendance-sortable rockops-attendance-checkin-cell"
                                onClick={() => handleSort('checkIn')}
                            >
                                Check In {getSortIcon('checkIn')}
                            </th>
                            <th
                                className="rockops-attendance-sortable rockops-attendance-checkout-cell"
                                onClick={() => handleSort('checkOut')}
                            >
                                Check Out {getSortIcon('checkOut')}
                            </th>
                            <th
                                className="rockops-attendance-sortable rockops-attendance-hours-cell"
                                onClick={() => handleSort('hours')}
                            >
                                Hours {getSortIcon('hours')}
                            </th>
                            <th
                                className="rockops-attendance-sortable rockops-attendance-site-cell"
                                onClick={() => handleSort('site')}
                            >
                                Site {getSortIcon('site')}
                            </th>
                            <th className="rockops-attendance-actions-cell">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="rockops-attendance-table-body">
                        {filteredAndSortedData.map((record) => (
                            <React.Fragment key={record.id}>
                                <tr className="rockops-attendance-table-row">
                                    <td className="rockops-attendance-checkbox-cell">
                                        <input
                                            type="checkbox"
                                            checked={selectedEmployees.includes(record.id)}
                                            onChange={(e) => handleEmployeeSelect(record.id, e.target.checked)}
                                            className="rockops-attendance-checkbox"
                                        />
                                    </td>
                                    <td className="rockops-attendance-name-cell">
                                        <div className="rockops-attendance-employee-info">
                                            <img
                                                src={record.employee.photoUrl || '/default-avatar.png'}
                                                alt={record.employee.fullName}
                                                className="rockops-attendance-employee-avatar"
                                            />
                                            <div className="rockops-attendance-employee-details">
                                                <span className="rockops-attendance-employee-name">
                                                    {record.employee.fullName}
                                                </span>
                                                <span className="rockops-attendance-employee-id">
                                                    ID: {record.employeeId}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="rockops-attendance-position-cell">
                                        {record.employee.jobPositionName || '-'}
                                    </td>
                                    <td className="rockops-attendance-status-cell">
                                        {getStatusBadge(getAttendanceStatus(record))}
                                    </td>
                                    <td className="rockops-attendance-checkin-cell">
                                        {formatTime(record.checkInTime)}
                                    </td>
                                    <td className="rockops-attendance-checkout-cell">
                                        {formatTime(record.checkOutTime)}
                                    </td>
                                    <td className="rockops-attendance-hours-cell">
                                        {formatHours(record.hoursWorked)}
                                    </td>
                                    <td className="rockops-attendance-site-cell">
                                        {record.employee.siteName || '-'}
                                    </td>
                                    <td className="rockops-attendance-actions-cell">
                                        <div className="rockops-attendance-action-buttons">
                                            {canCheckIn(record) && (
                                                <button
                                                    onClick={() => onQuickCheckIn(record)}
                                                    className="rockops-btn rockops-btn-primary rockops-attendance-action-btn"
                                                    title="Check In"
                                                >
                                                    <LogIn size={16} />
                                                </button>
                                            )}
                                            {canCheckOut(record) && (
                                                <button
                                                    onClick={() => onQuickCheckOut(record)}
                                                    className="rockops-btn rockops-btn-secondary rockops-attendance-action-btn"
                                                    title="Check Out"
                                                >
                                                    <LogOut size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => onEditAttendance(record)}
                                                className="rockops-btn rockops-btn-tertiary rockops-attendance-action-btn"
                                                title="Edit Attendance"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => toggleEmployeeDetails(record.id)}
                                                className="rockops-btn rockops-btn-tertiary rockops-attendance-action-btn"
                                                title="View Details"
                                            >
                                                {expandedEmployee === record.id ? (
                                                    <ChevronUp size={16} />
                                                ) : (
                                                    <ChevronDown size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedEmployee === record.id && (
                                    <tr className="rockops-attendance-details-row">
                                        <td colSpan="9" className="rockops-attendance-details-cell">
                                            <div className="rockops-attendance-details-content">
                                                <div className="rockops-attendance-details-section">
                                                    <h4 className="rockops-attendance-details-title">
                                                        <Clock size={16} />
                                                        Time Details
                                                    </h4>
                                                    <div className="rockops-attendance-time-details">
                                                        <div className="rockops-attendance-time-item">
                                                            <span className="rockops-attendance-time-label">Check In:</span>
                                                            <span className="rockops-attendance-time-value">
                                                                {formatTime(record.checkInTime)}
                                                            </span>
                                                        </div>
                                                        <div className="rockops-attendance-time-item">
                                                            <span className="rockops-attendance-time-label">Check Out:</span>
                                                            <span className="rockops-attendance-time-value">
                                                                {formatTime(record.checkOutTime)}
                                                            </span>
                                                        </div>
                                                        <div className="rockops-attendance-time-item">
                                                            <span className="rockops-attendance-time-label">Duration:</span>
                                                            <span className="rockops-attendance-time-value">
                                                                {formatDuration(record.checkInTime, record.checkOutTime)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="rockops-attendance-details-section">
                                                    <h4 className="rockops-attendance-details-title">
                                                        <MapPin size={16} />
                                                        Location Details
                                                    </h4>
                                                    <div className="rockops-attendance-location-details">
                                                        <div className="rockops-attendance-location-item">
                                                            <span className="rockops-attendance-location-label">Site:</span>
                                                            <span className="rockops-attendance-location-value">
                                                                {record.employee.siteName || '-'}
                                                            </span>
                                                        </div>
                                                        <div className="rockops-attendance-location-item">
                                                            <span className="rockops-attendance-location-label">Department:</span>
                                                            <span className="rockops-attendance-location-value">
                                                                {record.employee.departmentName || '-'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="rockops-attendance-details-section">
                                                    <h4 className="rockops-attendance-details-title">
                                                        <TrendingUp size={16} />
                                                        Performance Metrics
                                                    </h4>
                                                    <div className="rockops-attendance-metrics">
                                                        <div className="rockops-attendance-metric-item">
                                                            <span className="rockops-attendance-metric-label">Hours Worked:</span>
                                                            <span className="rockops-attendance-metric-value">
                                                                {formatHours(record.hoursWorked)}
                                                            </span>
                                                        </div>
                                                        <div className="rockops-attendance-metric-item">
                                                            <span className="rockops-attendance-metric-label">Contract Type:</span>
                                                            <span className="rockops-attendance-metric-value">
                                                                {record.contractType}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttendanceListView;