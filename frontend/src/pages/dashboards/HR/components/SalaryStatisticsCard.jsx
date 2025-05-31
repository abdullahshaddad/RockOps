import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaMoneyBillWave, FaUsers, FaCoins, FaGift } from 'react-icons/fa';
import './SalaryStatisticsCard.css';

const SalaryStatisticsCard = ({ data }) => {
    const { t } = useTranslation();

    if (!data) {
        return null;
    }

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const stats = [
        {
            icon: <FaMoneyBillWave />,
            title: t('hr.dashboard.averageSalary'),
            value: formatCurrency(data.averageSalary),
            color: 'blue'
        },
        {
            icon: <FaUsers />,
            title: t('hr.dashboard.employeeCount'),
            value: data.employeeCount,
            color: 'green'
        },
        {
            icon: <FaGift />,
            title: t('hr.dashboard.totalBonuses'),
            value: formatCurrency(data.totalBonuses),
            color: 'purple'
        },
        {
            icon: <FaCoins />,
            title: t('hr.dashboard.totalCommissions'),
            value: formatCurrency(data.totalCommissions),
            color: 'orange'
        }
    ];

    return (
        <div className="salary-stats-container">
            {stats.map((stat, index) => (
                <div key={index} className={`hr-dashboard-stat-card hr-dashboard-stat-${stat.color}`}>
                    <div className="hr-dashboard-stat-icon">
                        {stat.icon}
                    </div>
                    <div className="hr-dashboard-stat-info">
                        <h3 className="hr-dashboard-stat-value">{stat.value}</h3>
                        <p className="hr-dashboard-stat-title">{stat.title}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SalaryStatisticsCard;