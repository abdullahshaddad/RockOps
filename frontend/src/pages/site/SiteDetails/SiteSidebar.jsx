import React from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    BsPeople,
    BsGear
} from 'react-icons/bs';
import {
    FaTools,
    FaWarehouse,
    FaPeopleCarry
} from 'react-icons/fa';
import './SiteSidebar.css';  // Renamed CSS file to avoid conflicts

const SiteSidebar = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { siteId } = useParams(); // Get siteId dynamically from the URL

    const siteMenuItems = [
        {
            title: t('equipment.equipment'),
            icon: <FaTools />,
            path: `/sites/sitedetails/equipment/${siteId}` // Use dynamic site ID
        },
        {
            title: t('hr.employees'),
            icon: <BsPeople />,
            path: `/sites/sitedetails/employees/${siteId}`
        },
        {
            title: t('warehouse.warehouses'),
            icon: <FaWarehouse />,
            path: `/sites/sitedetails/warehouses/${siteId}`
        },
        {
            title: t('fixedAssets.fixedAssets'),
            icon: <BsGear />,
            path: `/sites/sitedetails/fixedassets/${siteId}`
        },
        {
            title: t('merchants.merchants'),
            icon: <FaPeopleCarry />,
            path: `/sites/sitedetails/sitemerchants/${siteId}`
        },
        {
            title: 'Partners',
            icon: <BsPeople />,
            path: `/sites/sitedetails/sitepartners/${siteId}`
        }
    ];

    return (
        <div className="rm-site-sidebar">
            <div className="rm-site-header">
                <h2>{t('site.site')}</h2>
            </div>
            <div className="rm-site-menu">
                {siteMenuItems.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        className={({ isActive }) =>
                            isActive ? 'rm-menu-item rm-active' : 'rm-menu-item'
                        }
                    >
                        <div className="rm-menu-icon">{item.icon}</div>
                        <div className="rm-menu-title">{item.title}</div>
                    </NavLink>
                ))}
            </div>
        </div>
    );
};

export default SiteSidebar;