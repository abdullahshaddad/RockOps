import React, { useState, useEffect } from "react";
import DataTable from "../../../components/common/DataTable/DataTable.jsx";
import { FaEdit } from 'react-icons/fa';
import "./WarehouseViewTransactions.scss";
import UpdatePendingTransactionModal from "./UpdatePendingTransactionModal.jsx";

const PendingTransactionsTable = ({ warehouseId }) => {
    const [loading, setLoading] = useState(false);
    const [pendingTransactions, setPendingTransactions] = useState([]);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState("");

    // Fetch transactions when component mounts or warehouseId changes
    useEffect(() => {
        fetchPendingTransactions();
    }, [warehouseId]);

    // Function to fetch pending transactions directly from backend
    const fetchPendingTransactions = async () => {
        if (!warehouseId) {
            console.error("Warehouse ID is not available");
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            // Fetch all transactions for this warehouse
            const response = await fetch(`http://localhost:8080/api/v1/transactions/warehouse/${warehouseId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                // Filter for only pending transactions where this warehouse is the sentFirst (initiator)
                const pendingData = await Promise.all(
                    data
                        .filter(transaction =>
                            transaction.status === "PENDING" &&
                            (transaction.receiverId === warehouseId || transaction.senderId === warehouseId) &&
                            transaction.sentFirst === warehouseId // Filter for transactions where current warehouse is the initiator
                        )
                        .map(async (transaction) => {
                            const sender = await fetchEntityDetails(transaction.senderType, transaction.senderId);
                            const receiver = await fetchEntityDetails(transaction.receiverType, transaction.receiverId);
                            return {
                                ...transaction,
                                sender,
                                receiver
                            };
                        })
                );
                setPendingTransactions(pendingData);
            } else {
                console.error("Failed to fetch transactions, status:", response.status);
            }
        } catch (error) {
            console.error("Failed to fetch transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to fetch entity details
    const fetchEntityDetails = async (entityType, entityId) => {
        if (!entityType || !entityId) return null;

        try {
            const token = localStorage.getItem("token");
            let endpoint;

            // Handle different entity types
            if (entityType === "WAREHOUSE") {
                endpoint = `http://localhost:8080/api/v1/warehouses/${entityId}`;
            } else if (entityType === "SITE") {
                endpoint = `http://localhost:8080/api/v1/sites/${entityId}`;
            } else if (entityType === "EQUIPMENT") {
                endpoint = `http://localhost:8080/equipment/${entityId}`;
            } else {
                // Fallback for other entity types using lowercase pluralization
                endpoint = `http://localhost:8080/api/v1/${entityType.toLowerCase()}s/${entityId}`;
            }

            const response = await fetch(endpoint, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                return await response.json();
            } else {
                console.error(`Failed to fetch ${entityType} details, status:`, response.status);
                return null;
            }
        } catch (error) {
            console.error(`Failed to fetch ${entityType} details:`, error);
            return null;
        }
    };

    // Function to handle opening the update modal
    const handleOpenUpdateModal = (transaction) => {
        setSelectedTransaction(transaction);
        setIsUpdateModalOpen(true);
    };

    // Function to handle update transaction
    const handleUpdateTransaction = async (updatedData) => {
        try {
            const token = localStorage.getItem("token");

            // Create a proper request body
            const requestBody = {
                ...updatedData,
                // Ensure we send the IDs, not entire object references
                items: updatedData.items.map(item => ({
                    id: item.id, // Include ID if it exists
                    itemType: {
                        id: item.itemType.id
                    },
                    quantity: parseInt(item.quantity)
                }))
            };

            const response = await fetch(`http://localhost:8080/api/v1/transactions/${updatedData.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                // Refresh the transactions list
                await fetchPendingTransactions();

                // Show success notification
                setNotificationMessage("Transaction successfully updated");
                setShowSuccessNotification(true);
                setTimeout(() => {
                    setShowSuccessNotification(false);
                }, 3000);

                return true;
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update transaction");
            }
        } catch (error) {
            console.error("Error updating transaction:", error);
            throw error;
        }
    };

    // Function to close the update modal
    const handleCloseUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setSelectedTransaction(null);
    };

    // Define columns for DataTable
    const columns = [
        {
            header: 'Items',
            accessor: 'items.length',
            sortable: true,
            render: (row) => row.items?.length || 0
        },
        {
            header: 'Sender',
            accessor: 'sender.name',
            sortable: true,
            render: (row) => row.sender?.name || "N/A"
        },
        {
            header: 'Receiver',
            accessor: 'receiver.name',
            sortable: true,
            render: (row) => row.receiver?.name || row.receiver?.equipment?.fullModelName || "N/A"
        },
        {
            header: 'Batch Number',
            accessor: 'batchNumber',
            sortable: true,
            render: (row) => row.batchNumber || "N/A"
        },
        {
            header: 'Transaction Date',
            accessor: 'transactionDate',
            sortable: true,
            render: (row) => row.transactionDate ? new Date(row.transactionDate).toLocaleDateString('en-GB') : "N/A"
        },
        {
            header: 'Created At',
            accessor: 'createdAt',
            sortable: true,
            render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleString('en-GB', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            }) : "N/A"
        },
        {
            header: 'Added By',
            accessor: 'addedBy',
            sortable: true
        }
    ];

    // Action configuration for DataTable
    const actions = [
        {
            label: 'Edit transaction',
            icon: <FaEdit />,
            onClick: (row) => handleOpenUpdateModal(row),
            className: 'primary'
        }
    ];

    return (
        <div className="transaction-table-pending">
            <div className="left-section3">
                <h2 className="transaction-section-title">Pending Transactions</h2>
                <div className="item-count3">{pendingTransactions.length} pending transactions</div>
            </div>
            <div className="section-description">(Transactions you've initiated that are waiting for approval)</div>

            <DataTable
                data={pendingTransactions}
                columns={columns}
                loading={loading}
                showSearch={true}
                showFilters={true}
                filterableColumns={columns.filter(col => col.sortable)}
                itemsPerPageOptions={[10, 25, 50]}
                defaultItemsPerPage={10}
                actions={actions}
                className="pending-transactions-table"
            />

            {/* Update Modal */}
            {isUpdateModalOpen && selectedTransaction && (
                <UpdatePendingTransactionModal
                    isOpen={isUpdateModalOpen}
                    onClose={handleCloseUpdateModal}
                    transaction={selectedTransaction}
                    onUpdate={handleUpdateTransaction}
                />
            )}

            {/* Success notification */}
            {showSuccessNotification && (
                <div className="notification3 success-notification3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                        <path d="M22 4L12 14.01l-3-3"/>
                    </svg>
                    <span>{notificationMessage}</span>
                </div>
            )}
        </div>
    );
};

export default PendingTransactionsTable;