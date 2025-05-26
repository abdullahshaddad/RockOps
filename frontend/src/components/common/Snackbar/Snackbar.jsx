import React, { useEffect } from 'react';
import './Snackbar.scss';

/**
 * Snackbar component for displaying Snackbar messages
 * @param {Object} props - Component props
 * @param {string} props.type - Snackbar type: 'success', 'error', 'info', 'warning'
 * @param {string} props.message - Snackbar message text
 * @param {boolean} props.show - Whether to show the Snackbar
 * @param {function} props.onClose - Function to call when Snackbar should close
 * @param {number} props.duration - Duration to show Snackbar in ms (default: 3000)
 */
const Snackbar = ({ type = 'success', message, show, onClose, duration = 3000 }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                if (onClose) onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [show, onClose, duration]);

    if (!show) return null;

    // Define icons for different Snackbar types
    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                        <path d="M22 4L12 14.01l-3-3"/>
                    </svg>
                );
            case 'error':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                );
            case 'info':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`global-notification ${type}-notification`}>
            {getIcon()}
            <span>{message}</span>
        </div>
    );
};

export default Snackbar;