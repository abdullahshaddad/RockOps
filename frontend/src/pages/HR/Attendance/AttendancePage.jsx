import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, TrendingUp, Filter, Download, Plus } from 'lucide-react';
import AttendanceCalendarView from './components/AttendanceCalendarView';
import AttendanceListView from './components/AttendanceListView';
import AttendanceFilters from './components/AttendanceFilters';
import AttendanceStats from './components/AttendanceStats';
import AttendanceModal from './components/AttendanceModal';

import { useSnackbar } from '../../../contexts/SnackbarContext';
import attendanceService from "../../../services/attendanceService.js";
import { employeeService } from "../../../services/employeeService.js";
import "./attendance.scss";

const AttendancePage = () => {
    const [view, setView] = useState('calendar'); // 'calendar' or 'list'
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [attendanceData, setAttendanceData] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [filters, setFilters] = useState({
        employeeId: '',
        department: '',
        site: '',
        status: '',
        contractType: ''
    });
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedAttendanceRecord, setSelectedAttendanceRecord] = useState(null);
    const [stats, setStats] = useState({});

    const { showSnackbar } = useSnackbar();

    // Fetch employees on component mount
    useEffect(() => {
        fetchEmployees();
    }, []);

    // Fetch attendance data when date, employee, or filters change
    useEffect(() => {
        if (filters.employeeId || view === 'list') {
            fetchAttendanceData();
        }
    }, [selectedDate, filters, view]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await employeeService.getAll();
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
            showSnackbar('Failed to fetch employees', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendanceData = async () => {
        setLoading(true);
        try {
            const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

            if (filters.employeeId) {
                // Fetch specific employee attendance
                const response = await attendanceService.getEmployeeAttendance(
                    filters.employeeId,
                    attendanceService.utils.formatDate(startDate),
                    attendanceService.utils.formatDate(endDate)
                );
                setAttendanceData(response.data);

                // Fetch monthly summary for stats
                const statsResponse = await attendanceService.getMonthlyAttendanceSummary(
                    filters.employeeId,
                    selectedDate.getFullYear(),
                    selectedDate.getMonth() + 1
                );
                setStats(statsResponse.data);
            } else if (view === 'list') {
                // Fetch daily summary for all employees
                const response = await attendanceService.getDailyAttendanceSummary(
                    attendanceService.utils.formatDate(selectedDate)
                );
                setAttendanceData(response.data);
            }
        } catch (error) {
            console.error('Error fetching attendance data:', error);
            showSnackbar('Failed to fetch attendance data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRecordAttendance = async (attendanceRecord) => {
        try {
            setLoading(true);

            // Validate attendance data before submission
            const validation = attendanceService.utils.validateAttendanceData(attendanceRecord);
            if (!validation.isValid) {
                showSnackbar(`Validation Error: ${validation.errors.join(', ')}`, 'error');
                return;
            }

            if (selectedAttendanceRecord?.id) {
                // Update existing record
                await attendanceService.recordAttendance({
                    ...attendanceRecord,
                    id: selectedAttendanceRecord.id
                });
                showSnackbar('Attendance updated successfully', 'success');
            } else {
                // Create new record
                await attendanceService.recordAttendance(attendanceRecord);
                showSnackbar('Attendance recorded successfully', 'success');
            }

            setShowModal(false);
            setSelectedAttendanceRecord(null);
            await fetchAttendanceData(); // Refresh data
        } catch (error) {
            console.error('Error recording attendance:', error);
            const errorMessage = error.response?.data?.message || 'Failed to record attendance';
            showSnackbar(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickCheckIn = async (employeeId) => {
        try {
            setLoading(true);
            const now = new Date();
            const checkInTime = attendanceService.utils.formatTime(now);

            // Get current location if available
            let location = null;
            let latitude = null;
            let longitude = null;

            if (navigator.geolocation) {
                try {
                    const position = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            timeout: 5000,
                            enableHighAccuracy: false
                        });
                    });

                    latitude = position.coords.latitude;
                    longitude = position.coords.longitude;
                    location = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                } catch (geoError) {
                    console.warn('Could not get location:', geoError);
                }
            }

            await attendanceService.checkIn(employeeId, checkInTime, location, latitude, longitude);
            showSnackbar('Employee checked in successfully', 'success');
            await fetchAttendanceData(); // Refresh data
        } catch (error) {
            console.error('Error checking in employee:', error);
            const errorMessage = error.response?.data?.message || 'Failed to check in employee';
            showSnackbar(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickCheckOut = async (employeeId) => {
        try {
            setLoading(true);
            const now = new Date();
            const checkOutTime = attendanceService.utils.formatTime(now);

            await attendanceService.checkOut(employeeId, checkOutTime);
            showSnackbar('Employee checked out successfully', 'success');
            await fetchAttendanceData(); // Refresh data
        } catch (error) {
            console.error('Error checking out employee:', error);
            const errorMessage = error.response?.data?.message || 'Failed to check out employee';
            showSnackbar(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEditAttendance = (record) => {
        setSelectedAttendanceRecord(record);
        setShowModal(true);
    };

    const handleExportAttendance = async () => {
        try {
            setLoading(true);

            // Determine what to export based on current view and filters
            let exportData = [];
            let filename = '';

            if (filters.employeeId) {
                // Export specific employee data
                const employee = getSelectedEmployeeInfo();
                const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

                const response = await attendanceService.getEmployeeAttendance(
                    filters.employeeId,
                    attendanceService.utils.formatDate(startDate),
                    attendanceService.utils.formatDate(endDate)
                );

                exportData = response.data;
                filename = `${employee?.fullName || 'Employee'}_Attendance_${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}.csv`;
            } else {
                // Export daily summary
                const response = await attendanceService.getDailyAttendanceSummary(
                    attendanceService.utils.formatDate(selectedDate)
                );

                exportData = response.data;
                filename = `Daily_Attendance_${attendanceService.utils.formatDate(selectedDate)}.csv`;
            }

            // Convert to CSV and download
            const csvContent = convertToCSV(exportData);
            downloadCSV(csvContent, filename);

            showSnackbar('Attendance data exported successfully', 'success');
        } catch (error) {
            console.error('Error exporting attendance:', error);
            showSnackbar('Failed to export attendance data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const convertToCSV = (data) => {
        if (!data || data.length === 0) return '';

        // Get headers from first object
        const headers = Object.keys(data[0]);
        const csvHeaders = headers.join(',');

        // Convert data rows
        const csvRows = data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Handle values that might contain commas
                return typeof value === 'string' && value.includes(',')
                    ? `"${value}"`
                    : value;
            }).join(',')
        );

        return [csvHeaders, ...csvRows].join('\n');
    };

    const downloadCSV = (csvContent, filename) => {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleBulkCheckIn = async (employeeIds) => {
        try {
            setLoading(true);
            const now = new Date();
            const checkInTime = attendanceService.utils.formatTime(now);

            const checkInData = employeeIds.map(employeeId => ({
                employeeId,
                checkInTime,
                location: null // Could be enhanced with location
            }));

            const results = await attendanceService.bulk.checkInMultiple(checkInData);

            // Count successful and failed operations
            const successful = results.filter(result => result.status === 'fulfilled').length;
            const failed = results.filter(result => result.status === 'rejected').length;

            if (failed === 0) {
                showSnackbar(`Successfully checked in ${successful} employees`, 'success');
            } else {
                showSnackbar(`Checked in ${successful} employees, ${failed} failed`, 'warning');
            }

            await fetchAttendanceData(); // Refresh data
        } catch (error) {
            console.error('Error in bulk check-in:', error);
            showSnackbar('Bulk check-in operation failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateMonthlyAttendance = async (employeeIds = null) => {
        try {
            setLoading(true);
            const year = selectedDate.getFullYear();
            const month = selectedDate.getMonth() + 1;

            const targetEmployeeIds = employeeIds ||
                employees
                    .filter(emp => emp.jobPosition?.contractType === 'MONTHLY')
                    .map(emp => emp.id);

            if (targetEmployeeIds.length === 0) {
                showSnackbar('No monthly contract employees found', 'warning');
                return;
            }

            const results = await attendanceService.bulk.generateMonthlyMultiple(
                targetEmployeeIds,
                year,
                month
            );

            // Count successful and failed operations
            const successful = results.filter(result => result.status === 'fulfilled').length;
            const failed = results.filter(result => result.status === 'rejected').length;

            if (failed === 0) {
                showSnackbar(`Monthly attendance generated for ${successful} employees`, 'success');
            } else {
                showSnackbar(`Generated for ${successful} employees, ${failed} failed`, 'warning');
            }

            await fetchAttendanceData(); // Refresh data
        } catch (error) {
            console.error('Error generating monthly attendance:', error);
            showSnackbar('Failed to generate monthly attendance', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getSelectedEmployeeInfo = () => {
        return employees.find(emp => emp.id === filters.employeeId);
    };

    const handleDateNavigation = (direction) => {
        const newDate = new Date(selectedDate);
        if (view === 'calendar') {
            // Navigate by month
            newDate.setMonth(newDate.getMonth() + direction);
        } else {
            // Navigate by day
            newDate.setDate(newDate.getDate() + direction);
        }
        setSelectedDate(newDate);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case 'ArrowLeft':
                        event.preventDefault();
                        handleDateNavigation(-1);
                        break;
                    case 'ArrowRight':
                        event.preventDefault();
                        handleDateNavigation(1);
                        break;
                    case 'n':
                        event.preventDefault();
                        setShowModal(true);
                        break;
                    case 'e':
                        event.preventDefault();
                        handleExportAttendance();
                        break;
                    default:
                        break;
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedDate, view]);

    return (
        <div className="rockops-attendance-page">
            {/* Header */}
            <div className="rockops-attendance-header">
                <div className="rockops-attendance-header-left">
                    <h1 className="rockops-attendance-title">
                        <Clock className="rockops-attendance-title-icon" />
                        Attendance Management
                    </h1>
                    <p className="rockops-attendance-subtitle">
                        Track and manage employee attendance across different contract types
                    </p>
                </div>

                <div className="rockops-attendance-header-actions">
                    <button
                        className="rockops-btn rockops-btn--outline"
                        onClick={handleExportAttendance}
                        disabled={loading}
                        title="Export attendance data (Ctrl+E)"
                    >
                        <Download size={16} />
                        Export
                    </button>

                    {employees.some(emp => emp.jobPosition?.contractType === 'MONTHLY') && (
                        <button
                            className="rockops-btn rockops-btn--outline"
                            onClick={() => handleGenerateMonthlyAttendance()}
                            disabled={loading}
                            title="Generate monthly attendance for all monthly employees"
                        >
                            <Calendar size={16} />
                            Generate Monthly
                        </button>
                    )}

                    <button
                        className="rockops-btn rockops-btn--primary"
                        onClick={() => setShowModal(true)}
                        disabled={loading}
                        title="Record new attendance (Ctrl+N)"
                    >
                        <Plus size={16} />
                        Record Attendance
                    </button>
                </div>
            </div>

            {/* Stats Section */}
            {filters.employeeId && Object.keys(stats).length > 0 && (
                <AttendanceStats
                    stats={stats}
                    employee={getSelectedEmployeeInfo()}
                />
            )}

            {/* Filters */}
            <AttendanceFilters
                filters={filters}
                setFilters={setFilters}
                employees={employees}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
            />

            {/* View Toggle */}
            <div className="rockops-attendance-view-controls">
                <div className="rockops-attendance-view-toggle">
                    <button
                        className={`rockops-attendance-toggle-btn ${view === 'calendar' ? 'rockops-attendance-toggle-btn--active' : ''}`}
                        onClick={() => setView('calendar')}
                        disabled={loading}
                    >
                        <Calendar size={16} />
                        Calendar View
                    </button>
                    <button
                        className={`rockops-attendance-toggle-btn ${view === 'list' ? 'rockops-attendance-toggle-btn--active' : ''}`}
                        onClick={() => setView('list')}
                        disabled={loading}
                    >
                        <Users size={16} />
                        List View
                    </button>
                </div>

                {/* Navigation Helper */}
                <div className="rockops-attendance-navigation-hint">
                    <span className="rockops-attendance-hint-text">
                        Use Ctrl+← → to navigate, Ctrl+N for new record, Ctrl+E to export
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="rockops-attendance-content">
                {loading ? (
                    <div className="rockops-attendance-loading">
                        <div className="rockops-attendance-loading-spinner"></div>
                        <p>Loading attendance data...</p>
                    </div>
                ) : (
                    <>
                        {view === 'calendar' ? (
                            <AttendanceCalendarView
                                selectedDate={selectedDate}
                                setSelectedDate={setSelectedDate}
                                attendanceData={attendanceData}
                                selectedEmployee={getSelectedEmployeeInfo()}
                                onEditAttendance={handleEditAttendance}
                                onQuickCheckIn={handleQuickCheckIn}
                                onQuickCheckOut={handleQuickCheckOut}
                                loading={loading}
                            />
                        ) : (
                            <AttendanceListView
                                attendanceData={attendanceData}
                                employees={employees}
                                selectedDate={selectedDate}
                                onEditAttendance={handleEditAttendance}
                                onQuickCheckIn={handleQuickCheckIn}
                                onQuickCheckOut={handleQuickCheckOut}
                                onBulkCheckIn={handleBulkCheckIn}
                                loading={loading}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Attendance Modal */}
            {showModal && (
                <AttendanceModal
                    isOpen={showModal}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedAttendanceRecord(null);
                    }}
                    onSubmit={handleRecordAttendance}
                    employees={employees}
                    initialData={selectedAttendanceRecord}
                    selectedDate={selectedDate}
                    loading={loading}
                />
            )}

            {/* Error Boundary would go here in a real app */}
            {/* <ErrorBoundary> content </ErrorBoundary> */}
        </div>
    );
};

export default AttendancePage;