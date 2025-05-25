import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SalaryStatisticsCard from './components/SalaryStatisticsCard.jsx';
import EmployeeDistributionCard from './components/EmployeeDistributionCard.jsx';
import DepartmentSalaryChart from './components/DepartmentSalaryChart.jsx';
import MonthlySalaryChart from './components/MonthlySalaryChart.jsx';
import EmployeePositionChart from './components/EmployeePositionChart.jsx';
import './HRDashboard.css';

const HRDashboard = () => {
    const { t } = useTranslation();
    const [salaryStats, setSalaryStats] = useState(null);
    const [employeeDistribution, setEmployeeDistribution] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Get token from localStorage
                const token = localStorage.getItem('token');

                // Fetch salary statistics
                const salaryResponse = await fetch('http://localhost:8080/api/v1/hr/dashboard/salary-statistics', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!salaryResponse.ok) {
                    throw new Error(`Error fetching salary statistics: ${salaryResponse.status}`);
                }

                // Fetch employee distribution
                const distributionResponse = await fetch('http://localhost:8080/api/v1/hr/dashboard/employee-distribution', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!distributionResponse.ok) {
                    throw new Error(`Error fetching employee distribution: ${distributionResponse.status}`);
                }

                // Parse responses
                const salaryData = await salaryResponse.json();
                const distributionData = await distributionResponse.json();

                setSalaryStats(salaryData);
                setEmployeeDistribution(distributionData);
                setError(null);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="hr-dashboard-loading">
                <div className="loading-spinner"></div>
                <p>{t('common.loading')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="hr-dashboard-error">
                <h3>{t('common.error')}</h3>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="hr-dashboard">
            <div className="hr-dashboard-header">
                <h1>{t('hr.dashboard.title')}</h1>
            </div>

            <div className="hr-dashboard-content">
                {/* Salary Statistics Section */}
                <div className="dashboard-section">
                    <h2>{t('hr.dashboard.salaryStatistics')}</h2>
                    <div className="stats-cards">
                        <SalaryStatisticsCard data={salaryStats} />
                    </div>

                    <div className="stats-charts">
                        <DepartmentSalaryChart
                            departmentSalaries={salaryStats?.departmentAverageSalaries || {}}
                        />
                        <MonthlySalaryChart
                            monthlySalaries={salaryStats?.monthlySalaryTotals || {}}
                        />
                    </div>
                </div>

                {/* Employee Distribution Section */}
                <div className="dashboard-section">
                    <h2>{t('hr.dashboard.employeeDistribution')}</h2>
                    <div className="distribution-cards">
                        {employeeDistribution.map((site, index) => (
                            <EmployeeDistributionCard key={index} data={site} />
                        ))}
                    </div>

                    {employeeDistribution.length > 0 && (
                        <div className="distribution-charts">
                            <EmployeePositionChart data={employeeDistribution} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HRDashboard;