import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './ChartComponents.css';

const DepartmentSalaryChart = ({ departmentSalaries }) => {
    const { t } = useTranslation();

    if (!departmentSalaries || Object.keys(departmentSalaries).length === 0) {
        return (
            <div className="chart-container">
                <h3>{t('hr.dashboard.departmentSalaries')}</h3>
                <div className="no-data-message">{t('common.noData')}</div>
            </div>
        );
    }

    // Format data for the chart
    const chartData = Object.keys(departmentSalaries).map(dept => ({
        department: dept,
        averageSalary: parseFloat(departmentSalaries[dept])
    }));

    // Sort by average salary in descending order
    chartData.sort((a, b) => b.averageSalary - a.averageSalary);

    // Format currency for the tooltip
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{label}</p>
                    <p className="tooltip-value">
                        {t('hr.dashboard.averageSalary')}: {formatCurrency(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="chart-container">
            <h3>{t('hr.dashboard.departmentSalaries')}</h3>
            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="department"
                            angle={-45}
                            textAnchor="end"
                            height={70}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            tickFormatter={(value) => formatCurrency(value)}
                            width={80}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="averageSalary" name={t('hr.dashboard.averageSalary')} fill="#3b82f6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DepartmentSalaryChart;