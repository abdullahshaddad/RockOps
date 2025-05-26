import React, { useState, useEffect } from "react";
import "./WarehouseViewTransactions.scss";
import UpdatePendingTransactionModal from "./UpdatePendingTransactionModal.jsx";

const PendingTransactionsTable = ({ warehouseId }) => {
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
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

    // Filter transactions based on search term
    const filteredTransactions = searchTerm ?
        pendingTransactions.filter((item) =>
            item.itemType?.itemCategory?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.itemType?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sender?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.receiver?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.batchNumber && item.batchNumber.toString().includes(searchTerm))
        ) : pendingTransactions;

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

    return (
        <div className="transaction-table-pending">
            <div className="left-section3">
                <h2 className="transaction-section-title">Pending Transactions</h2>
                <div className="item-count3">{pendingTransactions.length} pending transactions</div>
            </div>
            <div className="section-description">(Transactions you've initiated that are waiting for approval)</div>

            {/* Search input for this table only */}
            <div className="right-section3">
            <div className="table-search-container-pending">
                <input
                    type="text"
                    placeholder="Search pending transactions..."
                    className="search-input3"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                </svg>
            </div>
            </div>

            <div
                className="table-card3"
                style={{
                    minHeight: filteredTransactions.length === 0 ? '300px' : 'auto',
                }}
            >
                {loading ? (
                    <div className="loading-container3">
                        <div className="loading-spinner3"></div>
                        <p>Loading transaction data...</p>
                    </div>
                ) : (
                    <>
                        <div className="table-header-row3">
                            <div className="table-header-cell item-type-cell3">Items</div>
                            <div className="table-header-cell sender-cell3">Sender</div>
                            <div className="table-header-cell receiver-cell3">Receiver</div>
                            <div className="table-header-cell quantity-cell3">Batch Number</div>
                            <div className="table-header-cell date-cell3">Transaction Date</div>
                            <div className="table-header-cell created-at-cell3">Created At</div>
                            <div className="table-header-cell added-by-cell3">Added By</div>
                            <div className="table-header-cell status-cell3">Status</div>
                            <div className="table-header-cell actions-cell3">Actions</div>
                        </div>

                        <div className="table-body3">
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map((item, index) => (
                                    <div className="table-row3" key={index}>
                                        <div className="table-cell item-type-cell3">{item.items?.length || 0}</div>

                                        <div className="table-cell sender-cell3">
                                            {item.sender
                                                ? item.sender.name || item.sender.fullModelName || item.sender.equipment?.fullModelName || "N/A"
                                                : "N/A"}
                                        </div>
                                        <div className="table-cell receiver-cell3">
                                            {item.receiver
                                                ? item.receiver.name || item.receiver.fullModelName || item.receiver.equipment?.fullModelName || "N/A"
                                                : "N/A"}
                                        </div>
                                        <div className="table-cell quantity-cell3">{item.batchNumber}</div>

                                        <div className="table-cell date-cell3">
                                            {item.transactionDate ? new Date(item.transactionDate).toLocaleDateString('en-GB') : "N/A"}
                                        </div>
                                        <div className="table-cell created-at-cell3">
                                            {item.createdAt ? new Date(item.createdAt).toLocaleString('en-GB', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit',
                                            }) : "N/A"}
                                        </div>
                                        <div className="table-cell added-by-cell3">
                                            {item.addedBy}
                                        </div>
                                        <div className="table-cell status-cell3">{item.status}</div>
                                        <div className="table-cell actions-cell3">
                                            <button
                                                className="edit-button0"
                                                onClick={() => handleOpenUpdateModal(item)}
                                                title="Edit transaction"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state3">
                                    <div className="empty-icon3">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M20 6L9 17l-5-5"/>
                                        </svg>
                                    </div>
                                    <h3>No pending transactions</h3>
                                    <p>You haven't created any transactions that are waiting for approval</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

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

            {/* Success notification */}
            {showSuccessNotification && (
                <div className="notification success-notification3">
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