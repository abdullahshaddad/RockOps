import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SiteSidebar from './SiteSidebar.jsx'; // Adjust the path based on your project structure
import './SiteLayout.css';

const SiteLayout = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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

    const toggleMobileSidebar = () => {
        setMobileSidebarOpen(!mobileSidebarOpen);
    };

    return (
        <div className="site-module-container">
            {/* Mobile toggle button - only visible on small screens */}
            {isMobile && (
                <button
                    className="site-mobile-toggle"
                    onClick={toggleMobileSidebar}
                    aria-label="Toggle Site sidebar"
                >
                    {mobileSidebarOpen ? '✕' : '☰'}
                </button>
            )}

            <div className="site-module-content">
                <div className={`site-module-sidebar ${isMobile ? (mobileSidebarOpen ? 'mobile-open' : 'mobile-closed') : ''}`}>
                    <SiteSidebar />
                </div>

                <div className="site-module-main">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default SiteLayout;
