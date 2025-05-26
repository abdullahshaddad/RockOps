import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import axios from 'axios';
import './EquipmentDashboard.scss';

const EquipmentDashboard = forwardRef(({ equipmentId }, ref) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        consumablesOverTime: [],
        workHoursOverTime: [],
        maintenanceHistory: [],
        summaryStats: {
            totalWorkHours: 0,
            totalConsumables: 0,
            maintenanceEvents: 0,
            averageWorkHours: 0
        }
    });

    const token = localStorage.getItem('token');
    const axiosInstance = axios.create({
        headers: { Authorization: `Bearer ${token}` }
    });

    const fetchDashboardData = async () => {
        if (!equipmentId) return;

        try {
            setLoading(true);
            
            // Fetch multiple data sources in parallel
            const [
                consumablesResponse,
                sarkyResponse,
                maintenanceResponse
            ] = await Promise.allSettled([
                // Fetch consumables data
                axiosInstance.get(`http://localhost:8080/api/equipment/${equipmentId}/consumables`),
                // Fetch work hours (sarky) data
                axiosInstance.get(`http://localhost:8080/api/v1/equipment/${equipmentId}/sarky`),
                // Fetch maintenance data (using same endpoint as InSiteMaintenanceLog)
                axiosInstance.get(`http://localhost:8080/api/v1/maintenance/equipment/${equipmentId}`)
            ]);

            // Process consumables data
            let consumablesData = [];
            if (consumablesResponse.status === 'fulfilled' && consumablesResponse.value?.data) {
                consumablesData = processConsumablesData(consumablesResponse.value.data);
            }

            // Process sarky (work hours) data
            let workHoursData = [];
            if (sarkyResponse.status === 'fulfilled' && sarkyResponse.value?.data) {
                workHoursData = processSarkyData(sarkyResponse.value.data);
            }

            // Process maintenance data
            let maintenanceData = [];
            if (maintenanceResponse.status === 'fulfilled' && maintenanceResponse.value?.data) {
                maintenanceData = processMaintenanceData(maintenanceResponse.value.data);
            }

            // Calculate summary statistics
            const summaryStats = calculateSummaryStats(consumablesData, workHoursData, maintenanceData);

            setDashboardData({
                consumablesOverTime: consumablesData,
                workHoursOverTime: workHoursData,
                maintenanceHistory: maintenanceData,
                summaryStats
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const processConsumablesData = (data) => {
        if (!Array.isArray(data)) return [];

        // Group consumables by month and sum quantities
        const monthlyData = {};
        
        data.forEach(item => {
            if (item.transactionDate) {
                const date = new Date(item.transactionDate);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = {
                        month: monthKey,
                        totalQuantity: 0,
                        itemCount: 0
                    };
                }
                
                monthlyData[monthKey].totalQuantity += item.quantity || 0;
                monthlyData[monthKey].itemCount += 1;
            }
        });

        return Object.values(monthlyData)
            .sort((a, b) => a.month.localeCompare(b.month))
            .slice(-12); // Show last 12 months
    };

    const processSarkyData = (data) => {
        if (!Array.isArray(data)) return [];

        // Group work hours by month
        const monthlyData = {};
        
        data.forEach(sarky => {
            if (sarky.workDate) {
                const date = new Date(sarky.workDate);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = {
                        month: monthKey,
                        totalHours: 0,
                        workDays: 0
                    };
                }
                
                monthlyData[monthKey].totalHours += sarky.workedHours || 0;
                monthlyData[monthKey].workDays += 1;
            }
        });

        return Object.values(monthlyData)
            .sort((a, b) => a.month.localeCompare(b.month))
            .slice(-12); // Show last 12 months
    };

    const processMaintenanceData = (data) => {
        if (!Array.isArray(data)) return [];

        // Group maintenance events by month
        const monthlyData = {};
        
        data.forEach(maintenance => {
            if (maintenance.scheduledDate || maintenance.createdAt) {
                const date = new Date(maintenance.scheduledDate || maintenance.createdAt);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = {
                        month: monthKey,
                        maintenanceCount: 0,
                        completedCount: 0
                    };
                }
                
                monthlyData[monthKey].maintenanceCount += 1;
                if (maintenance.status === 'COMPLETED') {
                    monthlyData[monthKey].completedCount += 1;
                }
            }
        });

        return Object.values(monthlyData)
            .sort((a, b) => a.month.localeCompare(b.month))
            .slice(-12); // Show last 12 months
    };

    const calculateSummaryStats = (consumables, workHours, maintenance) => {
        const totalWorkHours = workHours.reduce((sum, item) => sum + item.totalHours, 0);
        const totalConsumables = consumables.reduce((sum, item) => sum + item.totalQuantity, 0);
        const maintenanceEvents = maintenance.reduce((sum, item) => sum + item.maintenanceCount, 0);
        const workingMonths = workHours.filter(item => item.totalHours > 0).length;
        const averageWorkHours = workingMonths > 0 ? totalWorkHours / workingMonths : 0;

        return {
            totalWorkHours: Math.round(totalWorkHours),
            totalConsumables: Math.round(totalConsumables),
            maintenanceEvents,
            averageWorkHours: Math.round(averageWorkHours * 10) / 10
        };
    };

    const formatMonth = (monthString) => {
        const [year, month] = monthString.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    };

    // Expose refresh method to parent
    useImperativeHandle(ref, () => ({
        refreshDashboard: fetchDashboardData
    }));

    useEffect(() => {
        fetchDashboardData();
    }, [equipmentId]);

    if (loading) {
        return (
            <div className="equipment-dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading dashboard data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="equipment-dashboard-error">
                <p>Error: {error}</p>
                <button onClick={fetchDashboardData}>Retry</button>
            </div>
        );
    }

    return (
        <div className="equipment-dashboard">
            {/* Summary Stats */}
            <div className="dashboard-stats">
                <div className="stat-card">
                    <div className="stat-icon work-hours">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                        </svg>
                    </div>
                    <div className="stat-content">
                        <h3>Work Hours</h3>
                        <p className="stat-value">{dashboardData.summaryStats.totalWorkHours}</p>
                        <span className="stat-label">Total hours</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon consumables">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        </svg>
                    </div>
                    <div className="stat-content">
                        <h3>Consumables Used</h3>
                        <p className="stat-value">{dashboardData.summaryStats.totalConsumables}</p>
                        <span className="stat-label">Total quantity</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon maintenance">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                        </svg>
                    </div>
                    <div className="stat-content">
                        <h3>Maintenance Events</h3>
                        <p className="stat-value">{dashboardData.summaryStats.maintenanceEvents}</p>
                        <span className="stat-label">Last 12 months</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="dashboard-charts">
                {/* Work Hours Chart */}
                <div className="chart-card">
                    <h3>Work Hours Over Time</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dashboardData.workHoursOverTime}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="month" 
                                    tickFormatter={formatMonth}
                                />
                                <YAxis />
                                <Tooltip 
                                    labelFormatter={formatMonth}
                                    formatter={(value) => [`${value} hours`, 'Work Hours']}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="totalHours" 
                                    stroke="#4880ff" 
                                    name="Work Hours"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Consumables Usage Chart */}
                <div className="chart-card">
                    <h3>Consumables Usage Over Time</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dashboardData.consumablesOverTime}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="month" 
                                    tickFormatter={formatMonth}
                                />
                                <YAxis />
                                <Tooltip 
                                    labelFormatter={formatMonth}
                                    formatter={(value) => [`${value} items`, 'Total Consumables']}
                                />
                                <Bar dataKey="totalQuantity" fill="#10b981" name="Total Consumables" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Maintenance History Chart */}
                <div className="chart-card">
                    <h3>Maintenance History</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dashboardData.maintenanceHistory}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="month" 
                                    tickFormatter={formatMonth}
                                />
                                <YAxis />
                                <Tooltip 
                                    labelFormatter={formatMonth}
                                    formatter={(value, name) => {
                                        if (name === 'maintenanceCount') return [`${value} events`, 'Total Events'];
                                        if (name === 'completedCount') return [`${value} events`, 'Completed Events'];
                                        return [`${value} events`, name];
                                    }}
                                />
                                <Bar dataKey="maintenanceCount" fill="#f59e0b" name="Total Events" />
                                <Bar dataKey="completedCount" fill="#10b981" name="Completed Events" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default EquipmentDashboard; 