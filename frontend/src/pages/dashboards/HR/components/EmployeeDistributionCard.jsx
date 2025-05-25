import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaMapMarkerAlt, FaUserFriends, FaBuilding, FaBriefcase, FaHourglass } from 'react-icons/fa';
import './EmployeeDistributionCard.css';

const EmployeeDistributionCard = ({ data }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('departments');

    if (!data) {
        return null;
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'departments':
                return renderDistributionList(data.departmentCounts, t('hr.dashboard.department'));
            case 'positions':
                return renderDistributionList(data.positionCounts, t('hr.dashboard.position'));
            case 'employmentTypes':
                return renderDistributionList(data.employmentTypeCounts, t('hr.dashboard.employmentType'));
            default:
                return null;
        }
    };

    const renderDistributionList = (data, labelKey) => {
        if (!data || Object.keys(data).length === 0) {
            return <p className="no-data-message">{t('common.noData')}</p>;
        }

        // Sort entries by count in descending order
        const sortedEntries = Object.entries(data).sort((a, b) => b[1] - a[1]);

        return (
            <div className="distribution-list">
                {sortedEntries.map(([name, count], index) => (
                    <div key={index} className="distribution-item">
                        <div className="distribution-label">{name}</div>
                        <div className="distribution-bar-container">
                            <div
                                className="distribution-bar"
                                style={{ width: `${(count / data.totalEmployees) * 100}%` }}
                            ></div>
                        </div>
                        <div className="distribution-count">{count}</div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="employee-distribution-card">
            <div className="distribution-card-header">
                <div className="site-info">
                    <div className="site-icon">
                        <FaBuilding />
                    </div>
                    <div>
                        <h3 className="site-name">{data.siteName}</h3>
                        <p className="site-location">
                            <FaMapMarkerAlt /> {data.siteLocation}
                        </p>
                    </div>
                </div>
                <div className="employee-count">
                    <FaUserFriends />
                    <span>{data.totalEmployees} {t('hr.dashboard.employees')}</span>
                </div>
            </div>

            <div className="distribution-tabs">
                <button
                    className={`tab-button ${activeTab === 'departments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('departments')}
                >
                    <FaBuilding /> {t('hr.dashboard.departments')}
                </button>
                <button
                    className={`tab-button ${activeTab === 'positions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('positions')}
                >
                    <FaBriefcase /> {t('hr.dashboard.positions')}
                </button>
                <button
                    className={`tab-button ${activeTab === 'employmentTypes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('employmentTypes')}
                >
                    <FaHourglass /> {t('hr.dashboard.employmentTypes')}
                </button>
            </div>

            <div className="distribution-content">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default EmployeeDistributionCard;