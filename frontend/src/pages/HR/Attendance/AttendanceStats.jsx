import React, { useState, useEffect } from 'react';
import './AttendanceStats.scss';

const AttendanceStats = ({ siteId, selectedMonth, selectedYear }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [timeframe, setTimeframe] = useState('month'); // 'week', 'month', 'quarter'

    // Fetch attendance statistics for the site
    useEffect(() => {
        const fetchAttendanceStats = async () => {
            if (!siteId) return;

            try {
                setLoading(true);
                setError(null);

                // Calculate start and end dates based on timeframe
                const startDate = calculateStartDate(timeframe, selectedMonth, selectedYear);
                const endDate = calculateEndDate(timeframe, selectedMonth, selectedYear);

                const startDateStr = startDate.toISOString().split('T')[0];
                const endDateStr = endDate.toISOString().split('T')[0];

                const token = localStorage.getItem('token');
                const response = await fetch(
                    `http://localhost:8080/api/v1/attendance/site/${siteId}?startDate=${startDateStr}&endDate=${endDateStr}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch attendance statistics');
                }

                const data = await response.json();

                // Process the data to generate statistics
                const processedStats = processAttendanceData(data, startDate, endDate);
                setStats(processedStats);

            } catch (err) {
                console.error('Error fetching attendance statistics:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendanceStats();
    }, [siteId, timeframe, selectedMonth, selectedYear]);

    // Calculate start date based on timeframe
    const calculateStartDate = (tf, month, year) => {
        const date = new Date(year, month, 1);

        if (tf === 'week') {
            // Start from the beginning of the current week
            const day = date.getDay();
            return new Date(date.setDate(date.getDate() - day));
        } else if (tf === 'month') {
            // Start from the beginning of the month
            return new Date(date.setDate(1));
        } else if (tf === 'quarter') {
            // Start from the beginning of the quarter
            const quarter = Math.floor(month / 3);
            return new Date(date.setMonth(quarter * 3, 1));
        }

        return date;
    };

    // Calculate end date based on timeframe
    const calculateEndDate = (tf, month, year) => {
        let date = new Date(year, month, 1);

        if (tf === 'week') {
            // End at the end of the current week
            const day = date.getDay();
            date.setDate(date.getDate() - day + 6);
            return date;
        } else if (tf === 'month') {
            // End at the end of the month
            return new Date(date.getFullYear(), date.getMonth() + 1, 0);
        } else if (tf === 'quarter') {
            // End at the end of the quarter
            const quarter = Math.floor(month / 3);
            return new Date(date.getFullYear(), (quarter + 1) * 3, 0);
        }

        return date;
    };

    // Process attendance data to generate statistics
    const processAttendanceData = (data, startDate, endDate) => {
        // For simplicity, we'll simulate the statistics
        // In a real application, you would calculate these from actual data

        // Count attendance by status
        const statusCounts = {};
        data.forEach(record => {
            const status = record.status || 'UNKNOWN';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        // Calculate attendance percentages
        const totalRecords = data.length;
        const presentCount = (statusCounts.PRESENT || 0) + (statusCounts.LATE || 0);
        const presentPercentage = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

        // Calculate average check-in time
        const checkInTimes = data
            .filter(record => record.checkInTime)
            .map(record => {
                const time = new Date(record.checkInTime);
                return time.getHours() * 60 + time.getMinutes(); // convert to minutes since midnight
            });

        const avgCheckInMinutes = checkInTimes.length > 0
            ? checkInTimes.reduce((sum, minutes) => sum + minutes, 0) / checkInTimes.length
            : 0;

        const avgCheckInHours = Math.floor(avgCheckInMinutes / 60);
        const avgCheckInMins = Math.round(avgCheckInMinutes % 60);

        // Calculate average working hours
        const workingHours = data
            .filter(record => record.workingHours)
            .map(record => record.workingHours);

        const avgWorkingHours = workingHours.length > 0
            ? workingHours.reduce((sum, hours) => sum + hours, 0) / workingHours.length
            : 0;

        // Calculate attendance trends (daily data)
        const trendData = [];
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];

            const dayRecords = data.filter(record => {
                const recordDate = new Date(record.attendanceDate).toISOString().split('T')[0];
                return recordDate === dateStr;
            });

            const dayPresentCount = dayRecords.filter(record =>
                record.status === 'PRESENT' || record.status === 'LATE'
            ).length;

            const dayAbsentCount = dayRecords.filter(record =>
                record.status === 'ABSENT'
            ).length;

            const dayLateCount = dayRecords.filter(record =>
                record.status === 'LATE'
            ).length;

            trendData.push({
                date: new Date(currentDate),
                present: dayPresentCount,
                absent: dayAbsentCount,
                late: dayLateCount,
                total: dayRecords.length
            });

            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return {
            totalEmployees: totalRecords,
            presentCount,
            absentCount: statusCounts.ABSENT || 0,
            lateCount: statusCounts.LATE || 0,
            onLeaveCount: statusCounts.ON_LEAVE || 0,
            presentPercentage,
            avgCheckInTime: `${avgCheckInHours}:${avgCheckInMins.toString().padStart(2, '0')}`,
            avgWorkingHours,
            trendData
        };
    };

    // Handle timeframe change
    const handleTimeframeChange = (e) => {
        setTimeframe(e.target.value);
    };

    // Get timeframe label for display
    const getTimeframeLabel = () => {
        const date = new Date(selectedYear, selectedMonth, 1);

        if (timeframe === 'week') {
            return 'Weekly Statistics';
        } else if (timeframe === 'month') {
            return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
        } else if (timeframe === 'quarter') {
            const quarter = Math.floor(selectedMonth / 3) + 1;
            return `Q${quarter} ${date.getFullYear()}`;
        }

        return '';
    };

    return (
        <div className="attendance-stats">
            <div className="stats-header">
                <h2>{getTimeframeLabel()}</h2>

                <div className="timeframe-selector">
                    <label>Timeframe:</label>
                    <select value={timeframe} onChange={handleTimeframeChange}>
                        <option value="week">Weekly</option>
                        <option value="month">Monthly</option>
                        <option value="quarter">Quarterly</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading-indicator">
                    <div className="spinner"></div>
                    <p>Loading statistics...</p>
                </div>
            ) : error ? (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            ) : stats ? (
                <div className="stats-content">
                    <div className="stats-summary">
                        <div className="summary-card">
                            <div className="card-icon attendance-icon"></div>
                            <div className="card-content">
                                <h3>Attendance Rate</h3>
                                <div className="card-value">{stats.presentPercentage.toFixed(1)}%</div>
                                <div className="card-detail">
                                    {stats.presentCount} of {stats.totalEmployees} employees
                                </div>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="card-icon late-icon"></div>
                            <div className="card-content">
                                <h3>Late Arrivals</h3>
                                <div className="card-value">{stats.lateCount}</div>
                                <div className="card-detail">
                                    {stats.totalEmployees > 0
                                        ? ((stats.lateCount / stats.totalEmployees) * 100).toFixed(1)
                                        : 0}% of total
                                </div>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="card-icon time-icon"></div>
                            <div className="card-content">
                                <h3>Avg. Check-in Time</h3>
                                <div className="card-value">{stats.avgCheckInTime}</div>
                                <div className="card-detail">
                                    HH:MM format
                                </div>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="card-icon hours-icon"></div>
                            <div className="card-content">
                                <h3>Avg. Working Hours</h3>
                                <div className="card-value">{stats.avgWorkingHours.toFixed(1)}</div>
                                <div className="card-detail">
                                    hours per day
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="stats-details">
                        <div className="stats-chart">
                            <h3>Attendance Trends</h3>
                            <div className="chart-container">
                                <AttendanceTrendChart data={stats.trendData} />
                            </div>
                        </div>

                        <div className="stats-breakdown">
                            <h3>Status Breakdown</h3>
                            <div className="breakdown-container">
                                <div className="breakdown-item">
                                    <div className="breakdown-label">Present</div>
                                    <div className="breakdown-bar">
                                        <div
                                            className="bar-fill present-bar"
                                            style={{ width: `${(stats.presentCount / stats.totalEmployees) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="breakdown-value">{stats.presentCount}</div>
                                </div>

                                <div className="breakdown-item">
                                    <div className="breakdown-label">Absent</div>
                                    <div className="breakdown-bar">
                                        <div
                                            className="bar-fill absent-bar"
                                            style={{ width: `${(stats.absentCount / stats.totalEmployees) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="breakdown-value">{stats.absentCount}</div>
                                </div>

                                <div className="breakdown-item">
                                    <div className="breakdown-label">Late</div>
                                    <div className="breakdown-bar">
                                        <div
                                            className="bar-fill late-bar"
                                            style={{ width: `${(stats.lateCount / stats.totalEmployees) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="breakdown-value">{stats.lateCount}</div>
                                </div>

                                <div className="breakdown-item">
                                    <div className="breakdown-label">On Leave</div>
                                    <div className="breakdown-bar">
                                        <div
                                            className="bar-fill leave-bar"
                                            style={{ width: `${(stats.onLeaveCount / stats.totalEmployees) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="breakdown-value">{stats.onLeaveCount}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="no-data-message">
                    <p>No attendance data available for the selected period</p>
                </div>
            )}
        </div>
    );
};

// Simplified chart component for attendance trends
const AttendanceTrendChart = ({ data }) => {
    // For a real application, you would use a proper charting library like Chart.js or recharts
    // This is a simplified visual representation

    const maxValue = Math.max(...data.map(d => d.total));

    return (
        <div className="trend-chart">
            <div className="chart-y-axis">
                <div className="y-axis-label">Employees</div>
                <div className="y-axis-ticks">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="y-axis-tick">
                            <span>{Math.round((maxValue / 4) * (4 - i))}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="chart-bars">
                {data.map((day, index) => (
                    <div key={index} className="chart-bar-group">
                        <div className="chart-date">
                            {day.date.getDate()}
                        </div>

                        <div className="stacked-bar-container" style={{ height: '200px' }}>
                            <div
                                className="bar-section present-section"
                                style={{
                                    height: `${(day.present / maxValue) * 100}%`
                                }}
                            ></div>
                            <div
                                className="bar-section late-section"
                                style={{
                                    height: `${(day.late / maxValue) * 100}%`
                                }}
                            ></div>
                            <div
                                className="bar-section absent-section"
                                style={{
                                    height: `${(day.absent / maxValue) * 100}%`
                                }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="chart-legend">
                <div className="legend-item">
                    <div className="legend-color present-color"></div>
                    <div className="legend-label">Present</div>
                </div>
                <div className="legend-item">
                    <div className="legend-color late-color"></div>
                    <div className="legend-label">Late</div>
                </div>
                <div className="legend-item">
                    <div className="legend-color absent-color"></div>
                    <div className="legend-label">Absent</div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceStats;