import React from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './ChartComponents.css';

const MonthlySalaryChart = ({ monthlySalaries }) => {
    const { t } = useTranslation();

    if (!monthlySalaries || Object.keys(monthlySalaries).length === 0) {
        return (
            <div className="chart-container">
                <h3>{t('hr.dashboard.monthlySalaries')}</h3>
                <div className="no-data-message">{t('common.noData')}</div>
            </div>
        );
    }

    // Format data for the chart
    const chartData = Object.entries(monthlySalaries).map(([month, salary]) => ({
        month,
        salary: parseFloat(salary)
    }));

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
                        {t('hr.dashboard.totalSalary')}: {formatCurrency(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="chart-container">
            <h3>{t('hr.dashboard.monthlySalaries')}</h3>
            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis
                            tickFormatter={(value) => formatCurrency(value)}
                            width={80}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="salary"
                            name={t('hr.dashboard.totalSalary')}
                            stroke="#3b82f6"
                            activeDot={{ r: 8 }}
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MonthlySalaryChart;