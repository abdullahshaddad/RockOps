import React, { useState, useEffect } from "react";
import "./WarehouseViewTransactions.scss";
import UpdatePendingTransactionModal from "./UpdatePendingTransactionModal.jsx";
import Table from "../../../components/common/OurTable/Table.jsx";
import Snackbar from "../../../components/common/Snackbar/Snackbar.jsx"; // Import your existing snackbar

const PendingTransactionsTable = ({ warehouseId }) => {
    const [loading, setLoading] = useState(false);
    const [pendingTransactions, setPendingTransactions] = useState([]);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    // Replace old notification states with snackbar state
    const [snackbar, setSnackbar] = useState({
        isOpen: false,
        message: "",
        type: "success"
    });

    // Helper function to show snackbar
    const showSnackbar = (message, type = "success") => {
        setSnackbar({
            isOpen: true,
            message,
            type
        });
    };

    // Helper function to close snackbar
    const closeSnackbar = () => {
        setSnackbar({
            ...snackbar,
            isOpen: false
        });
    };

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

                // Show success snackbar
                showSnackbar("Transaction successfully updated", "success");
                return true;
            } else {
                const errorData = await response.json();
                showSnackbar("Failed to update transaction", "error");
                throw new Error(errorData.message || "Failed to update transaction");
            }
        } catch (error) {
            console.error("Error updating transaction:", error);
            showSnackbar("Error updating transaction", "error");
            throw error;
        }
    };

    // Function to close the update modal
    const handleCloseUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setSelectedTransaction(null);
    };

    // Format date helper function
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    // Define table columns
    const columns = [
        {
            id: 'items',
            label: 'ITEMS',
            width: '200px',
            render: (row) => row.items?.length || 0,
            sortType: 'number',
            filterType: 'number'
        },
        {
            id: 'sender',
            label: 'SENDER',
            width: '200px',
            render: (row) => {
                if (!row.sender) return "N/A";
                return row.sender.name || row.sender.fullModelName || row.sender.equipment?.fullModelName || "N/A";
            },
            filterType: 'text'
        },
        {
            id: 'receiver',
            label: 'RECEIVER',
            width: '200px',
            render: (row) => {
                if (!row.receiver) return "N/A";
                return row.receiver.name || row.receiver.fullModelName || row.receiver.equipment?.fullModelName || "N/A";
            },
            filterType: 'text'
        },
        {
            id: 'batchNumber',
            label: 'BATCH NUMBER',
            width: '200px',
            render: (row) => row.batchNumber || "N/A",
            sortType: 'number',
            filterType: 'number'
        },
        {
            id: 'transactionDate',
            label: 'TRANSACTION DATE',
            width: '200px',
            render: (row) => formatDate(row.transactionDate),
            sortType: 'date',
            filterType: 'text'
        },
        {
            id: 'createdAt',
            label: 'CREATED AT',
            width: '200px',
            render: (row) => formatDateTime(row.createdAt),
            sortType: 'date',
            filterType: 'text'
        },
        {
            id: 'addedBy',
            label: 'ADDED BY',
            width: '200px',
            render: (row) => row.addedBy || "N/A",
            filterType: 'text'
        },
        {
            id: 'status',
            label: 'STATUS',
            width: '200px',
            render: (row) => (
                <span className={`status-badge3 ${row.status?.toLowerCase()}`}>
                    {row.status}
                </span>
            ),
            filterType: 'select'
        }
    ];

    // Define action configuration
    const actionConfig = {
        label: 'ACTIONS',
        width: '200px',
        renderActions: (row) => (
            <button
                className="edit-button3"
                onClick={() => handleOpenUpdateModal(row)}
                title="Edit transaction"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
            </button>
        )
    };

    return (
        <div className="transaction-table-section">
            <div className="table-header-section">
                <div className="left-section3">
                    <h2 className="transaction-section-title">Pending Transactions</h2>
                    <div className="item-count3">{pendingTransactions.length} pending transactions</div>
                </div>
            </div>

            <div className="section-description">
                (Transactions you've initiated that are waiting for approval)
            </div>

            {/* New Table Component */}
            <Table
                columns={columns}
                data={pendingTransactions}
                isLoading={loading}
                emptyMessage="You haven't created any transactions that are waiting for approval"
                actionConfig={actionConfig}
                className="pending-transactions-table"
                itemsPerPage={10}
                enablePagination={true}
                enableSorting={true}
                enableFiltering={true}
            />

            {/* Update Transaction Modal */}
            {isUpdateModalOpen && selectedTransaction && (
                <UpdatePendingTransactionModal
                    transaction={selectedTransaction}
                    isOpen={isUpdateModalOpen}
                    onClose={handleCloseUpdateModal}
                    onUpdate={handleUpdateTransaction}
                    warehouseId={warehouseId}
                />
            )}

            {/* Snackbar Component - Replace old notifications */}
            <Snackbar
                isOpen={snackbar.isOpen}
                message={snackbar.message}
                type={snackbar.type}
                onClose={closeSnackbar}
                duration={3000}
            />
        </div>
    );
};

export default PendingTransactionsTable;