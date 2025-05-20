import React, {useEffect, useState} from 'react';
import {NavLink, useLocation} from 'react-router-dom';
import {useAuth} from '../../contexts/AuthContext';
import {useTheme} from '../../contexts/ThemeContext';
import {useTranslation} from 'react-i18next';
import {
    FaBars,
    FaBoxes,
    FaBriefcase,
    FaChartLine,
    FaChevronDown,
    FaChevronRight,
    FaClipboard,
    FaCog,
    FaFileContract,
    FaFileInvoice,
    FaFileInvoiceDollar,
    FaIdCard,
    FaMapMarkerAlt,
    FaMoon,
    FaShoppingCart,
    FaSignOutAlt,
    FaSitemap,
    FaStore,
    FaSun,
    FaTasks,
    FaTimes,
    FaTools,
    FaTruck,
    FaUser,
    FaUsers,
    FaWarehouse
} from 'react-icons/fa';

import logoImage from '../../Assets/Logos/Logo.png';
import './Sidebar.css';
import {BsFillPersonVcardFill} from "react-icons/bs";


const Sidebar = () => {
    const {currentUser, logout} = useAuth();
    const {theme, toggleTheme} = useTheme();
    const {t} = useTranslation();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState({});

    const userRole = currentUser?.role || 'USER';

    // Check if screen is mobile
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Initial check
        checkIfMobile();

        // Add resize listener
        window.addEventListener('resize', checkIfMobile);

        // Clean up
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    // Toggle submenu expansion
    const toggleSubmenu = (title) => {
        setExpandedMenus(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    // Check if current path is in a submenu to determine if parent should be highlighted
    const isInSubmenu = (parentPath, currentPath) => {
        return currentPath.startsWith(parentPath);
    };

    // Menu items with role-based access control - with updated role names
    const menuItems = [
        {
            title: 'Admin',
            icon: <FaUser/>,
            path: '/admin',
            roles: ['ADMIN']
        },
        {
            title: 'Dashboard',
            icon: <FaChartLine/>,
            path: '/dashboard',
            roles: ['ADMIN', 'USER', 'SITE_ADMIN', 'PROCUREMENT', 'WAREHOUSE_MANAGER', 'SECRETARY', 'EQUIPMENT_MANAGER', 'HR_MANAGER', 'HR_EMPLOYEE']
        },
        {
            title: 'Sites',
            icon: <FaMapMarkerAlt/>,
            path: '/sites',
            roles: ['ADMIN', 'USER', 'SITE_ADMIN', 'PROCUREMENT', 'WAREHOUSE_MANAGER', 'SECRETARY', 'EQUIPMENT_MANAGER', 'HR_MANAGER', 'HR_EMPLOYEE']
        },
        {
            title: 'Partners',
            icon: <FaUsers/>,
            path: '/partners',
            roles: ['ADMIN', 'SITE_ADMIN']
        },
        {
            title: 'Equipment',
            icon: <FaTruck/>,
            path: '/equipment',
            roles: ['ADMIN', 'USER', 'SITE_ADMIN', 'PROCUREMENT', 'WAREHOUSE_MANAGER', 'SECRETARY', 'EQUIPMENT_MANAGER', 'HR_MANAGER', 'HR_EMPLOYEE']
        },
        {
            title: 'Warehouses',
            icon: <FaWarehouse/>,
            path: '/warehouses',
            roles: ['ADMIN', 'USER', 'SITE_ADMIN', 'PROCUREMENT', 'WAREHOUSE_MANAGER', 'SECRETARY', 'EQUIPMENT_MANAGER', 'HR_MANAGER', 'HR_EMPLOYEE'],
        },
        {
            title: 'Merchants',
            icon: <FaStore/>,
            path: '/merchants',
            roles: ['ADMIN', 'USER', 'SITE_ADMIN', 'PROCUREMENT']
        },
        {
            title: 'Assets',
            icon: <FaBoxes/>,
            path: '/assets',
            roles: ['ADMIN', 'USER', 'SITE_ADMIN', 'EQUIPMENT_MANAGER', 'WAREHOUSE_MANAGER']
        },
        {
            title: 'HR',
            icon: <FaUsers/>,
            path: '/hr',
            roles: ['ADMIN', 'USER', 'HR_MANAGER', 'HR_EMPLOYEE'],
            hasSubmenu: true,
            submenuItems: [
                {
                    title: 'Vacancies',
                    icon: <FaBriefcase/>,
                    path: '/hr/vacancies',
                    roles: ['ADMIN', 'USER', 'HR_MANAGER', 'HR_EMPLOYEE'],
                },
                {
                    title: 'Positions',
                    icon: <FaSitemap/>,
                    path: '/hr/positions',
                    roles: ['ADMIN', 'USER', 'HR_MANAGER', 'HR_EMPLOYEE'],
                },
                {
                    title: 'Attendance',
                    icon: <FaTasks/>,
                    path: '/hr/attendance',
                    roles: ['ADMIN', 'USER', 'HR_MANAGER', 'HR_EMPLOYEE'],
                },
                {
                    title: 'Employees',
                    icon: <FaIdCard/>,
                    path: '/hr/employees',
                    roles: ['ADMIN', 'USER', 'HR_MANAGER', 'HR_EMPLOYEE'],
                },
            ]
        },
        {
            title: 'Finance',
            icon: <FaFileInvoiceDollar/>,
            path: '/finance',
            roles: ['ADMIN', 'USER', 'FINANCE_MANAGER', 'FINANCE_EMPLOYEE'],
            hasSubmenu: true,
            submenuItems: []
        },
        {
            title: 'Procurement',
            icon: <FaShoppingCart/>,
            path: '/procurement',
            roles: ['ADMIN', 'USER', 'SITE_ADMIN', 'PROCUREMENT'],
            hasSubmenu: true,
            submenuItems: [
                {
                    title: 'Merchants',
                    icon: <BsFillPersonVcardFill/>,
                    path: '/procurement/merchants',
                    roles: ['ADMIN', 'USER', 'SITE_ADMIN', 'PROCUREMENT']
                },
                {
                    title: 'Request Orders',
                    icon: <FaFileContract/>,
                    path: '/procurement/request-orders',
                    roles: ['ADMIN', 'USER', 'SITE_ADMIN', 'PROCUREMENT']
                },
                {
                    title: 'Offers',
                    icon: <FaFileInvoice/>,
                    path: '/procurement/offers',
                    roles: ['ADMIN', 'USER', 'SITE_ADMIN', 'PROCUREMENT']
                },
                {
                    title: 'Purchase Orders',
                    icon: <FaFileInvoice/>,
                    path: '/procurement/purchase-orders',
                    roles: ['ADMIN', 'USER', 'SITE_ADMIN', 'PROCUREMENT']
                }
            ]
        },
        {
            title: 'Maintenance',
            icon: <FaTools/>,
            path: '/maintenance',
            roles: ['ADMIN', 'USER', 'SITE_ADMIN', 'EQUIPMENT_MANAGER']
        },
        {
            title: 'Secretary',
            icon: <FaClipboard/>,
            path: '/secretary',
            roles: ['ADMIN', 'USER', 'SITE_ADMIN', 'SECRETARY']
        },
        {
            title: 'Equipment MT ',
            icon: <FaTruck/>,
            path: '/equipment-team',
            roles: ['ADMIN', 'USER', 'EQUIPMENT_MANAGER']
        },
        {
            title: 'Settings',
            icon: <FaCog/>,
            path: '/settings',
            roles: ['ADMIN', 'USER', 'SITE_ADMIN', 'PROCUREMENT', 'WAREHOUSE_MANAGER', 'SECRETARY', 'EQUIPMENT_MANAGER', 'HR_MANAGER', 'HR_EMPLOYEE', 'FINANCE_MANAGER', 'FINANCE_EMPLOYEE']
        }
    ];

    // Filter menu items based on user role
    const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <>
            {/* Mobile menu toggle button - only visible on small screens */}
            {isMobile && (
                <button className="mobile-sidebar-toggle" onClick={toggleMobileMenu}>
                    {mobileMenuOpen ? <FaTimes/> : <FaBars/>}
                </button>
            )}

            <div className={`sidebar ${isMobile ? (mobileMenuOpen ? 'mobile-open' : 'mobile-closed') : ''}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <img src={logoImage} alt="Rock4Mining Logo" className="logo-image"/>
                    </div>
                </div>

                <div className="sidebar-menu">
                    {filteredMenuItems.map((item, index) => (
                        <div key={index} className="menu-item-container">
                            {item.hasSubmenu ? (
                                // Item with submenu
                                <>
                                    <div
                                        className={`menu-item ${isInSubmenu(item.path, location.pathname) ? 'active' : ''}`}
                                        onClick={() => toggleSubmenu(item.title)}
                                    >
                                        <div className="menu-icon">{item.icon}</div>
                                        <div className="menu-title">{item.title}</div>
                                        <div className="submenu-toggle">
                                            {expandedMenus[item.title] ? <FaChevronDown/> : <FaChevronRight/>}
                                        </div>
                                    </div>

                                    {/* Submenu items */}
                                    {expandedMenus[item.title] && (
                                        <div className="submenu">
                                            {item.submenuItems
                                                .filter(subItem => subItem.roles.includes(userRole))
                                                .map((subItem, subIndex) => (
                                                    <NavLink
                                                        key={`${index}-${subIndex}`}
                                                        to={subItem.path}
                                                        className={({isActive}) =>
                                                            isActive ? 'submenu-item active' : 'submenu-item'
                                                        }
                                                        onClick={() => isMobile && setMobileMenuOpen(false)}
                                                    >
                                                        <div className="menu-icon">{subItem.icon}</div>
                                                        <div className="menu-title">{subItem.title}</div>
                                                    </NavLink>
                                                ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                // Regular menu item with no submenu
                                <NavLink
                                    to={item.path}
                                    className={({isActive}) =>
                                        isActive ? 'menu-item active' : 'menu-item'
                                    }
                                    onClick={() => isMobile && setMobileMenuOpen(false)}
                                >
                                    <div className="menu-icon">{item.icon}</div>
                                    <div className="menu-title">{item.title}</div>
                                </NavLink>
                            )}
                        </div>
                    ))}
                </div>

                <div className="sidebar-footer">
                    {/* Theme toggle switch */}
                    <div className="theme-toggle-container">
                        <div className="theme-toggle-item">
                            <div className="menu-icon">
                                {theme === 'dark' ? <FaMoon/> : <FaSun/>}
                            </div>
                            <div className="menu-title">Dark Mode</div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={theme === 'dark'}
                                    onChange={toggleTheme}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    <button className="logout-btn" onClick={handleLogout}>
                        <FaSignOutAlt/>
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;