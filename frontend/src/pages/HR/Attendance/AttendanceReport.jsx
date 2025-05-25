import React, { useState, useEffect } from 'react';
import './AttendanceReport.scss';

const AttendanceReport = ({ siteId, employees }) => {
    const [reportType, setReportType] = useState('site'); // 'site', 'employee'
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: getFirstDayOfMonth(),
        endDate: getLastDayOfMonth()
    });
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showDownloadOptions, setShowDownloadOptions] = useState(false);

    // Helper functions for date handling
    function getFirstDayOfMonth() {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    }

    function getLastDayOfMonth() {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    }

    // Generate report when parameters change
    useEffect(() => {
        const fetchReport = async () => {
            if (!siteId || (reportType === 'employee' && !selectedEmployee)) {
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem('token');
                let endpoint = '';

                if (reportType === 'site') {
                    // For site report, we'll use a specific date (the start date)
                    endpoint = `http://localhost:8080/api/v1/attendance/report/site/${siteId}?date=${dateRange.startDate}`;
                } else {
                    // For employee report, we'll use the date range
                    endpoint = `http://localhost:8080/api/v1/attendance/report/employee/${selectedEmployee}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
                }

                const response = await fetch(endpoint, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch report data');
                }

                const data = await response.json();
                setReportData(data);

            } catch (err) {
                console.error('Error fetching report:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [siteId, reportType, selectedEmployee, dateRange.startDate, dateRange.endDate]);

    // Handle report type change
    const handleReportTypeChange = (e) => {
        setReportType(e.target.value);
        setReportData(null); // Clear previous report data
    };

    // Handle employee selection change
    const handleEmployeeChange = (e) => {
        setSelectedEmployee(e.target.value);
        setReportData(null); // Clear previous report data
    };

    // Handle date range changes
    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
        setReportData(null); // Clear previous report data
    };

    // Handle generate report button click
    const handleGenerateReport = () => {
        // This will trigger the useEffect to run and fetch the report
        // Setting reportData to null will show loading state
        setReportData(null);
    };

    // Handle download button click
    const handleDownloadClick = () => {
        setShowDownloadOptions(!showDownloadOptions);
    };

    // Handle actual download (simulated)
    const handleDownload = (format) => {
        // In a real application, you'd generate the actual file here
        // For this example, we'll just simulate it
        alert(`Downloading report as ${format}...`);
        setShowDownloadOptions(false);
    };

    // Format date for display
    const formatDate = (dateString) => {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="attendance-report">
            <div className="report-header">
                <h2>Attendance Reports</h2>

                {reportData && (
                    <div className="download-container">
                        <button className="download-btn" onClick={handleDownloadClick}>
                            Download Report
                        </button>

                        {showDownloadOptions && (
                            <div className="download-options">
                                <button onClick={() => handleDownload('PDF')}>PDF</button>
                                <button onClick={() => handleDownload('Excel')}>Excel</button>
                                <button onClick={() => handleDownload('CSV')}>CSV</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="report-filters">
                <div className="filter-group">
                    <label>Report Type</label>
                    <div className="report-type-selector">
                        <label className={`report-type-option ${reportType === 'site' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="reportType"
                                value="site"
                                checked={reportType === 'site'}
                                onChange={handleReportTypeChange}
                            />
                            Site Report
                        </label>
                        <label className={`report-type-option ${reportType === 'employee' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="reportType"
                                value="employee"
                                checked={reportType === 'employee'}
                                onChange={handleReportTypeChange}
                            />
                            Employee Report
                        </label>
                    </div>
                </div>

                {reportType === 'employee' && (
                    <div className="filter-group">
                        <label>Employee</label>
                        <select
                            value={selectedEmployee}
                            onChange={handleEmployeeChange}
                            required
                        >
                            <option value="">Select Employee</option>
                            {employees.map(employee => (
                                <option key={employee.id} value={employee.id}>
                                    {employee.firstName} {employee.lastName}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="filter-group date-filters">
                    <label>{reportType === 'site' ? 'Date' : 'Date Range'}</label>
                    <div className="date-inputs">
                        <input
                            type="date"
                            name="startDate"
                            value={dateRange.startDate}
                            onChange={handleDateChange}
                            required
                        />

                        {reportType === 'employee' && (
                            <>
                                <span className="date-separator">to</span>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={dateRange.endDate}
                                    onChange={handleDateChange}
                                    required
                                />
                            </>
                        )}
                    </div>
                </div>

                <div className="filter-actions">
                    <button className="generate-btn" onClick={handleGenerateReport}>
                        Generate Report
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-indicator">
                    <div className="spinner"></div>
                    <p>Generating report...</p>
                </div>
            ) : error ? (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            ) : reportData ? (
                <div className="report-content">
                    {reportType === 'site' ? (
                        <SiteReport report={reportData} />
                    ) : (
                        <EmployeeReport report={reportData} />
                    )}
                </div>
            ) : (
                <div className="no-report-message">
                    <p>Select report parameters and click Generate Report</p>
                </div>
            )}
        </div>
    );
};

// Site report component
const SiteReport = ({ report }) => {
    return (
        <div className="site-report">
            <div className="report-meta">
                <h3>Site Attendance Report</h3>
                <div className="meta-details">
                    <div className="meta-item">
                        <span className="meta-label">Site:</span>
                        <span className="meta-value">{report.siteName}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">Date:</span>
                        <span className="meta-value">{new Date(report.date).toLocaleDateString()}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">Total Employees:</span>
                        <span className="meta-value">{report.totalEmployees}</span>
                    </div>
                </div>
            </div>

            <div className="report-summary">
                <div className="summary-card">
                    <div className="card-title">Present</div>
                    <div className="card-value">{report.statusCounts?.PRESENT || 0}</div>
                    <div className="card-percentage">
                        {report.totalEmployees > 0
                            ? Math.round(((report.statusCounts?.PRESENT || 0) / report.totalEmployees) * 100)
                            : 0}%
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-title">Absent</div>
                    <div className="card-value">
                        {report.totalEmployees -
                            ((report.statusCounts?.PRESENT || 0) +
                                (report.statusCounts?.LATE || 0) +
                                (report.statusCounts?.ON_LEAVE || 0))}
                    </div>
                    <div className="card-percentage">
                        {report.totalEmployees > 0
                            ? Math.round(((report.totalEmployees -
                                ((report.statusCounts?.PRESENT || 0) +
                                    (report.statusCounts?.LATE || 0) +
                                    (report.statusCounts?.ON_LEAVE || 0))) / report.totalEmployees) * 100)
                            : 0}%
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-title">Late</div>
                    <div className="card-value">{report.statusCounts?.LATE || 0}</div>
                    <div className="card-percentage">
                        {report.totalEmployees > 0
                            ? Math.round(((report.statusCounts?.LATE || 0) / report.totalEmployees) * 100)
                            : 0}%
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-title">On Leave</div>
                    <div className="card-value">{report.statusCounts?.ON_LEAVE || 0}</div>
                    <div className="card-percentage">
                        {report.totalEmployees > 0
                            ? Math.round(((report.statusCounts?.ON_LEAVE || 0) / report.totalEmployees) * 100)
                            : 0}%
                    </div>
                </div>
            </div>

            <div className="report-details">
                <h4>Average Check-In Time: {report.averageCheckInTime || 'N/A'}</h4>
                <h4>Present Percentage: {report.presentPercentage?.toFixed(1) || 0}%</h4>

                {report.absentEmployees && report.absentEmployees.length > 0 && (
                    <div className="absent-employees">
                        <h4>Absent Employees</h4>
                        <div className="employees-list">
                            {report.absentEmployees.map((employee, index) => (
                                <div key={index} className="employee-item">
                                    <div className="employee-name">{employee.name}</div>
                                    <div className="employee-position">{employee.position}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {report.records && report.records.length > 0 && (
                <div className="records-table-container">
                    <h4>Attendance Records</h4>
                    <table className="records-table">
                        <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Check-In</th>
                            <th>Check-Out</th>
                            <th>Status</th>
                            <th>Working Hours</th>
                            <th>Notes</th>
                        </tr>
                        </thead>
                        <tbody>
                        {report.records.map((record, index) => (
                            <tr key={index}>
                                <td>
                                    <div className="employee-name">
                                        {record.employee.firstName} {record.employee.lastName}
                                    </div>
                                </td>
                                <td>{record.checkInTime
                                    ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : 'N/A'}
                                </td>
                                <td>{record.checkOutTime
                                    ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : 'N/A'}
                                </td>
                                <td>{record.status}</td>
                                <td>{record.workingHours ? record.workingHours.toFixed(1) + ' hrs' : 'N/A'}</td>
                                <td>{record.notes || '-'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// Employee report component
const EmployeeReport = ({ report }) => {
    return (
        <div className="employee-report">
            <div className="report-meta">
                <h3>Employee Attendance Report</h3>
                <div className="meta-details">
                    <div className="meta-item">
                        <span className="meta-label">Employee:</span>
                        <span className="meta-value">{report.employeeName}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">Period:</span>
                        <span className="meta-value">
                            {new Date(report.startDate).toLocaleDateString()} to {new Date(report.endDate).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">Total Days:</span>
                        <span className="meta-value">{report.totalDays}</span>
                    </div>
                </div>
            </div>

            <div className="report-summary">
                <div className="summary-stats">
                    <div className="stat-item">
                        <div className="stat-label">Attendance Percentage</div>
                        <div className="stat-value">{report.attendancePercentage?.toFixed(1) || 0}%</div>
                    </div>

                    <div className="stat-item">
                        <div className="stat-label">Average Working Hours</div>
                        <div className="stat-value">{report.averageWorkingHours?.toFixed(1) || 0} hrs</div>
                    </div>

                    <div className="stat-item">
                        <div className="stat-label">Total Overtime</div>
                        <div className="stat-value">{report.totalOvertimeHours?.toFixed(1) || 0} hrs</div>
                    </div>

                    <div className="stat-item">
                        <div className="stat-label">Average Late Minutes</div>
                        <div className="stat-value">{report.averageLateMinutes?.toFixed(0) || 0} mins</div>
                    </div>
                </div>

                <div className="status-distribution">
                    <h4>Attendance Distribution</h4>
                    <div className="status-chart">
                        {report.statusCounts && (
                            <div className="chart-bars">
                                {Object.entries(report.statusCounts).map(([status, count]) => (
                                    <div key={status} className="chart-bar">
                                        <div className="bar-fill" style={{
                                            height: `${(count / report.totalDays) * 100}%`,
                                            backgroundColor: getStatusColor(status)
                                        }}></div>
                                        <div className="bar-label">{status}</div>
                                        <div className="bar-value">{count}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {report.records && report.records.length > 0 && (
                <div className="records-container">
                    <h4>Attendance Records</h4>
                    <div className="records-table-container">
                        <table className="records-table">
                            <thead>
                            <tr>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Check-In</th>
                                <th>Check-Out</th>
                                <th>Working Hours</th>
                                <th>Late By</th>
                                <th>Notes</th>
                            </tr>
                            </thead>
                            <tbody>
                            {report.records.map((record, index) => (
                                <tr key={index}>
                                    <td>{new Date(record.attendanceDate).toLocaleDateString()}</td>
                                    <td>
                                            <span className="status-badge" style={{
                                                backgroundColor: getStatusColor(record.status)
                                            }}>
                                                {record.status}
                                            </span>
                                    </td>
                                    <td>{record.checkInTime
                                        ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : 'N/A'}
                                    </td>
                                    <td>{record.checkOutTime
                                        ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : 'N/A'}
                                    </td>
                                    <td>{record.workingHours ? record.workingHours.toFixed(1) + ' hrs' : 'N/A'}</td>
                                    <td>{record.lateMinutes ? record.lateMinutes + ' mins' : '-'}</td>
                                    <td>{record.notes || '-'}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper function to get color for status
const getStatusColor = (status) => {
    const statusColors = {
        PRESENT: 'var(--color-success)',
        ABSENT: 'var(--color-danger)',
        LATE: 'var(--color-warning)',
        HALF_DAY: 'orange',
        ON_LEAVE: 'purple',
        WEEKEND: 'gray',
        HOLIDAY: 'var(--color-info)'
    };

    return statusColors[status] || 'gray';
};

export default AttendanceReport;