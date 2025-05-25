import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import './ChartComponents.css';

const EmployeePositionChart = ({ data }) => {
    const { t } = useTranslation();
    const [selectedSite, setSelectedSite] = useState('all');

    // Colors for the pie chart
    const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#6366f1', '#84cc16'];

    // Combine position counts from all sites
    const combinedPositionCounts = useMemo(() => {
        if (!data || data.length === 0) return [];

        const positionMap = new Map();

        data.forEach(site => {
            // Skip if site is not selected and selection is not 'all'
            if (selectedSite !== 'all' && site.siteName !== selectedSite) {
                return;
            }

            const positions = site.positionCounts || {};
            Object.entries(positions).forEach(([position, count]) => {
                const current = positionMap.get(position) || 0;
                positionMap.set(position, current + count);
            });
        });

        return Array.from(positionMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10); // Show top 10 positions only
    }, [data, selectedSite]);

    // Get list of sites for the dropdown
    const siteOptions = useMemo(() => {
        if (!data) return [];
        return [
            { value: 'all', label: t('hr.dashboard.allSites') },
            ...data.map(site => ({ value: site.siteName, label: site.siteName }))
        ];
    }, [data, t]);

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="position-tooltip">
                    <p className="position-name">{payload[0].name}</p>
                    <p className="position-count">
                        {payload[0].value} {t('hr.dashboard.employees')}
                    </p>
                    <p className="position-percent">
                        {`${(payload[0].percent * 100).toFixed(1)}%`}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (!data || data.length === 0 || combinedPositionCounts.length === 0) {
        return (
            <div className="chart-container">
                <h3>{t('hr.dashboard.employeesByPosition')}</h3>
                <div className="no-data-message">{t('common.noData')}</div>
            </div>
        );
    }

    return (
        <div className="position-chart-container">
            <div className="chart-header">
                <h3>{t('hr.dashboard.employeesByPosition')}</h3>
                <select
                    className="site-selector"
                    value={selectedSite}
                    onChange={(e) => setSelectedSite(e.target.value)}
                >
                    {siteOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="position-chart-wrapper">
                <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                        <Pie
                            data={combinedPositionCounts}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            labelLine={false}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            dataKey="value"
                            nameKey="name"
                        >
                            {combinedPositionCounts.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            wrapperStyle={{ paddingLeft: "20px" }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default EmployeePositionChart;