import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../../../Components/OurTable/Table';
import Snackbar from '../../../../Components/Snackbar/Snackbar';
import './IncomingRequestOrders.scss';

const IncomingRequestOrders = ({ onEditRequest, onDataChange, requestOrders, loading }) => {
    const navigate = useNavigate();
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('success');

    // Remove the local fetchRequestOrders function and state since data comes from props

    useEffect(() => {
        // Filter orders based on search term and props data
        const term = searchTerm.toLowerCase();
        const pendingOrders = requestOrders.filter(order => order.status === 'PENDING');

        setFilteredOrders(
            pendingOrders.filter((order) =>
                order.title?.toLowerCase().includes(term) ||
                order.requesterName?.toLowerCase().includes(term)
            )
        );
    }, [searchTerm, requestOrders]); // Update when props change

    const handleRowClick = (row) => {
        navigate(`/procurement/request-orders/${row.id}`);
    };

    const handleApproveClick = async (row, e) => {
        e.stopPropagation(); // Prevent row click

        if (window.confirm('Are you sure you want to approve this request and create an offer?')) {
            try {
                // Step 1: Update the request order status
                const token = localStorage.getItem('token');
                const updateResponse = await fetch(`http://localhost:8080/api/v1/requestOrders/${row.id}/status`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status: 'APPROVED' })
                });

                if (!updateResponse.ok) {
                    throw new Error('Failed to update request order status');
                }

                // Step 2: Create a new offer based on this request order
                const offerData = {
                    requestOrderId: row.id,
                    title: `Procurement Offer for: ${row.title}`,
                    description: `This procurement offer responds to the request "${row.title}".
            Original request description: ${row.description}`,
                    status: 'UNSTARTED',
                    validUntil: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    offerItems: []
                };

                const createOfferResponse = await fetch('http://localhost:8080/api/v1/offers', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(offerData)
                });

                if (!createOfferResponse.ok) {
                    setNotificationMessage('Failed to accept request order');
                    setShowNotification(true);
                    setNotificationType("error");
                    return;
                }

                // Success notification
                setNotificationMessage('Request Order accepted successfully, Visit Offers to start on the offer.');
                setShowNotification(true);
                setNotificationType("success");

                // Refresh the request orders list in parent
                if (onDataChange) {
                    onDataChange();
                }
            } catch (err) {
                console.error('Error approving request order:', err);
                setNotificationMessage(`Error: ${err.message}`);
                setShowNotification(true);
                setNotificationType("error");
            }
        }
    };

    const handleEditClick = (row, e) => {
        e.stopPropagation(); // Prevent row click

        if (onEditRequest) {
            onEditRequest(row);
        }
    };

    // Define columns for the table
    const columns = [
        {
            id: 'title',
            label: 'TITLE',
            width: '250px'
        },
        {
            id: 'requesterName',
            label: 'REQUESTER',
            width: '250px'
        },
        {
            id: 'deadline',
            label: 'DEADLINE',
            width: '250px',
            render: (row) => (
                <span className="date-cell">
                    {new Date(row.deadline).toLocaleDateString()}
                </span>
            )
        },
        {
            id: 'createdBy',
            label: 'CREATED BY',
            width: '250px'
        },
        {
            id: 'createdAt',
            label: 'CREATED AT',
            width: '250px',
            render: (row) => (
                <span className="date-cell">
                    {new Date(row.createdAt).toLocaleDateString()}
                </span>
            )
        }
    ];

    // Action column configuration
    const actionConfig = {
        label: 'ACTIONS',
        width: '200px',
        renderActions: (row) => (
            <>
                <button
                    className="custom-table-action-button approve"
                    onClick={(e) => handleApproveClick(row, e)}
                    title="Approve request"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5" />
                    </svg>
                </button>
                <button
                    className="custom-table-action-button edit"
                    onClick={(e) => handleEditClick(row, e)}
                    title="Edit request"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                </button>
            </>
        )
    };

    return (
        <div className="incoming-requests-container">


            <Table
                columns={columns}
                data={filteredOrders}
                onRowClick={handleRowClick}
                isLoading={loading}
                emptyMessage="No incoming requests found"
                actionConfig={actionConfig}
                className="incoming-requests-table"
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

export default IncomingRequestOrders;