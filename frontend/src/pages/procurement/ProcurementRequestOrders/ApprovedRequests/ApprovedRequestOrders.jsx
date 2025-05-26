import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../../../components/common/OurTable/Table.jsx';
import Snackbar from '../../../../components/common/Snackbar2/Snackbar2.jsx'
import './ApprovedRequestOrders.scss';

const ApprovedRequestOrders = ({ onDataChange }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [requestOrders, setRequestOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('success');

    useEffect(() => {
        fetchRequestOrders();
    }, []);

    useEffect(() => {
        // Filter orders based on search term
        const term = searchTerm.toLowerCase();
        setFilteredOrders(
            requestOrders.filter((order) =>
                (order.title?.toLowerCase().includes(term) ||
                    order.requesterName?.toLowerCase().includes(term) ||
                    order.createdBy?.toLowerCase().includes(term) ||
                    order.approvedBy?.toLowerCase().includes(term)) &&
                order.status === 'APPROVED'
            )
        );
    }, [searchTerm, requestOrders]);

    const fetchRequestOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/v1/requestOrders', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to load request orders');
            }

            const data = await response.json();
            setRequestOrders(data);
            setFilteredOrders(data.filter(order => order.status === 'APPROVED'));
            setError(null);

            // Notify parent component if provided
            if (onDataChange) {
                onDataChange();
            }
        } catch (err) {
            setError('Failed to load request orders.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = (row) => {
        navigate(`/procurement/request-orders/${row.id}`);
    };

    const handleViewOfferClick = async (row, e) => {
        e.stopPropagation(); // Prevent row click

        try {
            // Fetch the offer associated with this request order
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/v1/offers/by-request/${row.id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch offer details');
            }

            const offers = await response.json();

            if (offers && offers.length > 0) {
                // Navigate to the first offer associated with this request
                navigate(`/procurement/offers/${offers[0].id}`);
            } else {
                setNotificationMessage('No offers found for this request');
                setShowNotification(true);
                setNotificationType('error');
            }
        } catch (err) {
            console.error('Error fetching offer:', err);
            setNotificationMessage(`Error: ${err.message}`);
            setShowNotification(true);
            setNotificationType('error');
        }
    };

    // Define columns for the table
    const columns = [
        {
            id: 'title',
            label: 'TITLE',
            width: '200px'
        },
        {
            id: 'requesterName',
            label: 'REQUESTER',
            width: '250px'
        },
        {
            id: 'deadline',
            label: 'DEADLINE',
            width: '200px',
            render: (row) => (
                <span className="date-cell">
                    {row.deadline ? new Date(row.deadline).toLocaleDateString() : '-'}
                </span>
            )
        },
        {
            id: 'createdBy',
            label: 'CREATED BY',
            width: '200px',
            render: (row) => row.createdBy || '-'
        },
        {
            id: 'createdAt',
            label: 'CREATED AT',
            width: '200px',
            render: (row) => (
                <span className="date-cell">
                    {new Date(row.createdAt).toLocaleDateString()}
                </span>
            )
        },

        {
            id: 'updatedAt',
            label: 'APPROVED AT',
            width: '200px',
            render: (row) => (
                <span className="date-cell">
                    {new Date(row.approvedAt).toLocaleDateString()}
                </span>
            )
        },
        {
            id: 'updatedBy',
            label: 'APPROVED BY',
            width: '200px',
            render: (row) => row.approvedBy || '-'
        }
    ];

    // Action column configuration
    // const actionConfig = {
    //     label: 'ACTIONS',
    //     width: '100px',
    //     renderActions: (row) => (
    //         <button
    //             className="custom-table-action-button view"
    //             onClick={(e) => handleViewOfferClick(row, e)}
    //             title="View associated offer"
    //         >
    //             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //                 <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    //                 <circle cx="12" cy="12" r="3"></circle>
    //             </svg>
    //         </button>
    //     )
    // };

    return (
        <div className="approved-requests-container">


            <Table
                columns={columns}
                data={filteredOrders}
                onRowClick={handleRowClick}
                isLoading={loading}
                emptyMessage="No approved requests found"
                // actionConfig={actionConfig}
                className="approved-requests-table"
            />

            <Snackbar
                type={notificationType}
                text={notificationMessage}
                isVisible={showNotification}
                onClose={() => setShowNotification(false)}
                duration={3000}
            />
        </div>
    );
};

export default ApprovedRequestOrders;