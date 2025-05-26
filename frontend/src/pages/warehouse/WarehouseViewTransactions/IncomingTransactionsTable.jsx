import React, { useState, useEffect } from "react";
import DataTable from "../../../components/common/DataTable/DataTable.jsx";
import { FaCheck, FaTimes } from 'react-icons/fa';
import "./WarehouseViewTransactions.scss";
import "./AcceptRejectModal.scss";

const IncomingTransactionsTable = ({ warehouseId }) => {
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [pendingTransactions, setPendingTransactions] = useState([]);
    const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [receivedQuantities, setReceivedQuantities] = useState({});
    const [rejectionReason, setRejectionReason] = useState("");
    const [showAcceptNotification, setShowAcceptNotification] = useState(false);
    const [showRejectNotification, setShowRejectNotification] = useState(false);
    const [comments, setComments] = useState("");
    const [acceptError, setAcceptError] = useState("");
    const [rejectError, setRejectError] = useState("");
    const [processingAction, setProcessingAction] = useState(false);

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
            // Fetch all transactions for this warehouse
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:8080/api/v1/transactions/warehouse/${warehouseId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Filter for only pending transactions where:
                // 1. Status is PENDING
                // 2. Current warehouse is involved (as sender or receiver)
                // 3. Current warehouse is NOT the entity that initiated the transaction (sentFirst)
                const pendingData = await Promise.all(
                    data
                        .filter(transaction =>
                            transaction.status === "PENDING" &&
                            (transaction.receiverId === warehouseId || transaction.senderId === warehouseId) &&
                            transaction.sentFirst !== warehouseId // Filter transactions where warehouse is not the initiator
                        )
                        .map(async (transaction) => {
                            const sender = await fetchEntityDetails(transaction.senderType, transaction.senderId);
                            const receiver = await fetchEntityDetails(transaction.receiverType, transaction.receiverId);

                            // Process entity data for consistent display
                            const processedSender = processEntityData(transaction.senderType, sender);
                            const processedReceiver = processEntityData(transaction.receiverType, receiver);

                            return {
                                ...transaction,
                                sender: processedSender,
                                receiver: processedReceiver
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

    // Helper function to process entity data for consistent display
    const processEntityData = (entityType, entityData) => {
        if (!entityData) return null;

        switch (entityType) {
            case "EQUIPMENT":
                // Handle equipment data structure
                return {
                    id: entityData.equipment?.id || entityData.id,
                    name: entityData.name || entityData.equipment?.fullModelName ||
                        `${entityData.equipment?.brand || ''} ${entityData.equipment?.type || ''} ${entityData.equipment?.serialNumber || ''}`.trim(),
                    type: "EQUIPMENT"
                };
            case "WAREHOUSE":
                // Handle warehouse data structure
                return {
                    id: entityData.id,
                    name: entityData.name,
                    type: "WAREHOUSE"
                };
            case "SITE":
                // Handle site data structure
                return {
                    id: entityData.id,
                    name: entityData.name,
                    type: "SITE"
                };
            default:
                // Default handling
                return {
                    id: entityData.id,
                    name: entityData.name || "Unknown",
                    type: entityType
                };
        }
    };

    // Helper function to fetch entity details
    const fetchEntityDetails = async (entityType, entityId) => {
        if (!entityType || !entityId) return null;

        try {
            const token = localStorage.getItem('token');

            let endpoint = '';
            if (entityType === "WAREHOUSE") {
                endpoint = `http://localhost:8080/api/v1/warehouses/${entityId}`;
            } else if (entityType === "SITE") {
                endpoint = `http://localhost:8080/api/v1/site/${entityId}`;
            } else if (entityType === "EQUIPMENT") {
                endpoint = `http://localhost:8080/api/equipment/${entityId}`;
            } else {
                endpoint = `http://localhost:8080/${entityType.toLowerCase()}/${entityId}`;
            }

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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

    // Function to open accept modal
    const openAcceptModal = (transaction) => {
        setSelectedTransaction(transaction);
        setComments("");
        setAcceptError("");

        // Initialize received quantities with empty values
        if (transaction.items && transaction.items.length > 0) {
            const initialQuantities = {};
            transaction.items.forEach((item, index) => {
                initialQuantities[index] = ""; // Start with empty values
            });
            setReceivedQuantities(initialQuantities);
        }

        setIsAcceptModalOpen(true);
    };

    // Function to open reject modal
    const openRejectModal = (transaction) => {
        setSelectedTransaction(transaction);
        setRejectionReason("");
        setRejectError("");
        setIsRejectModalOpen(true);
    };

    // Handle item quantity change
    const handleItemQuantityChange = (index, value) => {
        setReceivedQuantities(prev => ({
            ...prev,
            [index]: value
        }));
    };

    // Function to accept transaction
    const handleAcceptTransaction = async (e) => {
        e.preventDefault();
        setProcessingAction(true);
        setAcceptError("");

        // Check if all quantities are valid
        const hasInvalidQuantities = Object.values(receivedQuantities).some(
            qty => isNaN(qty) || qty === "" || parseInt(qty) < 0
        );

        if (hasInvalidQuantities) {
            setAcceptError("Please enter valid quantities for all items");
            setProcessingAction(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');


            let username = "system"; // Default fallback
            const userInfoString = localStorage.getItem('userInfo');

            if (userInfoString) {
                try {
                    const userInfo = JSON.parse(userInfoString);
                    if (userInfo.username) {
                        username = userInfo.username;
                    }
                } catch (error) {
                    console.error("Error parsing user info:", error);
                }
            }

            // Format the received quantities for the API - using transactionItemId instead of itemTypeId
            const receivedItems = selectedTransaction.items.map((item, index) => ({
                transactionItemId: item.id, // Using the transaction item ID instead of item type ID
                receivedQuantity: parseInt(receivedQuantities[index])
            }));

            const response = await fetch(`http://localhost:8080/api/v1/transactions/${selectedTransaction.id}/accept`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    receivedItems: receivedItems,
                    username: username,
                    acceptanceComment: comments
                }),
            });

            if (response.ok) {
                // Successfully accepted transaction
                fetchPendingTransactions(); // Refresh data
                setIsAcceptModalOpen(false);
                setShowAcceptNotification(true);

                // Show notification for 3 seconds
                setTimeout(() => {
                    setShowAcceptNotification(false);
                }, 3000);
            } else {
                // Try to get error details from the response
                let errorMessage = "Failed to accept transaction";
                try {
                    const errorData = await response.text();
                    errorMessage = errorData || errorMessage;
                } catch (e) {
                    console.error("Error parsing error response:", e);
                }
                setAcceptError(errorMessage);
                console.error("Failed to accept transaction:", errorMessage);
            }
        } catch (error) {
            setAcceptError("Network error. Please try again.");
            console.error("Error accepting transaction:", error);
        } finally {
            setProcessingAction(false);
        }
    };

    // Function to reject transaction
    const handleRejectTransaction = async (e) => {
        e.preventDefault();
        setProcessingAction(true);
        setRejectError("");

        if (!rejectionReason.trim()) {
            setRejectError("Please provide a rejection reason");
            setProcessingAction(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');

            let username = "system"; // Default fallback
            const userInfoString = localStorage.getItem('userInfo');

            if (userInfoString) {
                try {
                    const userInfo = JSON.parse(userInfoString);
                    if (userInfo.username) {
                        username = userInfo.username;
                    }
                } catch (error) {
                    console.error("Error parsing user info:", error);
                }
            }

            const response = await fetch(`http://localhost:8080/api/v1/transactions/${selectedTransaction.id}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: username,
                    rejectionReason: rejectionReason
                }),
            });

            if (response.ok) {
                // Successfully rejected transaction
                fetchPendingTransactions(); // Refresh data
                setIsRejectModalOpen(false);
                setShowRejectNotification(true);

                // Show notification for 3 seconds
                setTimeout(() => {
                    setShowRejectNotification(false);
                }, 3000);
            } else {
                // Try to get error details from the response
                let errorMessage = "Failed to reject transaction";
                try {
                    const errorData = await response.text();
                    errorMessage = errorData || errorMessage;
                } catch (e) {
                    console.error("Error parsing error response:", e);
                }
                setRejectError(errorMessage);
                console.error("Failed to reject transaction:", errorMessage);
            }
        } catch (error) {
            setRejectError("Network error. Please try again.");
            console.error("Error rejecting transaction:", error);
        } finally {
            setProcessingAction(false);
        }
    };

    // Helper function to format entity name for display
    const getEntityDisplayName = (entity, entityType) => {
        if (!entity) return "N/A";

        // Return formatted name based on entity type
        return entity.name || "N/A";
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
            render: (row) => getEntityDisplayName(row.sender, row.senderType)
        },
        {
            header: 'Receiver',
            accessor: 'receiver.name',
            sortable: true,
            render: (row) => getEntityDisplayName(row.receiver, row.receiverType)
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
    const getActions = (row) => [
        {
            label: 'Accept transaction',
            icon: <FaCheck />,
            onClick: (row) => openAcceptModal(row),
            className: 'success'
        },
        {
            label: 'Reject transaction',
            icon: <FaTimes />,
            onClick: (row) => openRejectModal(row),
            className: 'danger'
        }
    ];

    return (
        <div className="transaction-table-pending">
            <div className="left-section3">
                <h2 className="transaction-section-title">Incoming Transactions</h2>
                <div className="item-count3">{pendingTransactions.length} incoming transactions</div>
            </div>
            <div className="section-description">(Transactions waiting for your approval)</div>

            <DataTable
                data={pendingTransactions}
                columns={columns}
                loading={loading}
                showSearch={true}
                showFilters={true}
                filterableColumns={columns.filter(col => col.sortable)}
                itemsPerPageOptions={[10, 25, 50]}
                defaultItemsPerPage={10}
                actions={getActions}
                className="incoming-transactions-table"
            />

            {/* Modal for accepting transaction with multiple items */}
            {isAcceptModalOpen && selectedTransaction && (
                <div className="modal-backdrop">
                    <div className="flat-modal">
                        {/* Header */}
                        <div className="flat-modal-header">
                            <h2>Accept Transaction</h2>
                            <button
                                className="close-modal-btn"
                                onClick={() => setIsAcceptModalOpen(false)}
                                disabled={processingAction}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flat-modal-content">
                            {/* Transaction Info */}
                            <div className="transaction-info-section">
                                <div className="info-row">
                                    <div className="info-col">
                                        <div className="info-label">Batch Number</div>
                                        <div className="info-value">{selectedTransaction.batchNumber || "N/A"}</div>
                                    </div>
                                    <div className="info-col">
                                        <div className="info-label">Transaction Date</div>
                                        <div className="info-value">
                                            {selectedTransaction.transactionDate
                                                ? new Date(selectedTransaction.transactionDate).toLocaleDateString("en-GB")
                                                : "N/A"}
                                        </div>
                                    </div>
                                </div>

                                <div className="info-row">
                                    <div className="info-col">
                                        <div className="info-label">Sender</div>
                                        <div className="info-value">{getEntityDisplayName(selectedTransaction.sender, selectedTransaction.senderType)}</div>
                                    </div>
                                    <div className="info-col">
                                        <div className="info-label">Receiver</div>
                                        <div className="info-value">{getEntityDisplayName(selectedTransaction.receiver, selectedTransaction.receiverType)}</div>
                                    </div>
                                </div>

                                <div className="info-row">
                                    <div className="info-col">
                                        <div className="info-label">Created At</div>
                                        <div className="info-value">
                                            {selectedTransaction.createdAt
                                                ? new Date(selectedTransaction.createdAt).toLocaleString('en-GB', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })
                                                : "N/A"}
                                        </div>
                                    </div>
                                    <div className="info-col">
                                        <div className="info-label">Added By</div>
                                        <div className="info-value">{selectedTransaction.addedBy || "N/A"}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Transaction Items */}
                            <div className="items-section">
                                <h3>Transaction Items</h3>

                                {selectedTransaction.items && selectedTransaction.items.length > 0 ? (
                                    selectedTransaction.items.map((item, index) => (
                                        <div className="item-container" key={index}>
                                            <div className="item-details">
                                                <div className="item-name-block">
                                                    <span className="item-number">{index + 1}.</span>
                                                    <div className="item-name-wrapper">
                                                        <div className="item-name">
                                                            {item.itemType?.name || "Unknown Item"}
                                                            {item.itemType?.measuringUnit && (
                                                                <span className="item-unit"> ({item.itemType.measuringUnit})</span>
                                                            )}
                                                        </div>
                                                        <div className="item-category">{item.itemType?.itemCategory?.name || ""}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="quantity-section">
                                                <div className="quantity-label">
                                                    Sent/Received Quantity <span className="required-mark">*</span>
                                                    {item.itemType?.measuringUnit && (
                                                        <span className="quantity-unit"> ({item.itemType.measuringUnit})</span>
                                                    )}
                                                </div>
                                                <div className="quantity-controls">
                                                    <button
                                                        type="button"
                                                        className="decrement-btn"
                                                        onClick={() => {
                                                            const current = parseInt(receivedQuantities[index]) || 0;
                                                            handleItemQuantityChange(index, Math.max(0, current - 1));
                                                        }}
                                                        disabled={processingAction || (parseInt(receivedQuantities[index]) || 0) <= 0}
                                                    >
                                                        −
                                                    </button>
                                                    <input
                                                        type="text"
                                                        value={receivedQuantities[index] || ""}
                                                        onChange={(e) => handleItemQuantityChange(index, e.target.value)}
                                                        placeholder="Enter quantity"
                                                        required
                                                        disabled={processingAction}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="increment-btn"
                                                        onClick={() => {
                                                            const current = parseInt(receivedQuantities[index]) || 0;
                                                            handleItemQuantityChange(index, current + 1);
                                                        }}
                                                        disabled={processingAction}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-items-message">No items found in this transaction</div>
                                )}
                            </div>

                            {/* Comments */}
                            <div className="comments-section">
                                <div className="comments-label">
                                    Comments <span className="optional-text">(optional)</span>
                                </div>
                                <textarea
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder="Enter any additional comments about this transaction..."
                                    disabled={processingAction}
                                />
                            </div>

                            {/* Error message */}
                            {acceptError && (
                                <div className="error-message">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    <span>{acceptError}</span>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="accept-button"
                                onClick={handleAcceptTransaction}
                                disabled={processingAction || selectedTransaction.items?.some((_, index) =>
                                    receivedQuantities[index] === undefined ||
                                    receivedQuantities[index] === "" ||
                                    parseInt(receivedQuantities[index]) < 0
                                )}
                            >
                                {processingAction ? "Processing..." : (
                                    <>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 13l4 4L19 7" />
                                        </svg>
                                        Accept Transaction
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for rejecting transaction */}
            {isRejectModalOpen && selectedTransaction && (
                <div className="modal-backdrop">
                    <div className="flat-modal">
                        {/* Header */}
                        <div className="flat-modal-header">
                            <h2>Reject Transaction</h2>
                            <button
                                className="close-modal-btn"
                                onClick={() => setIsRejectModalOpen(false)}
                                disabled={processingAction}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flat-modal-content">
                            {/* Transaction Info */}
                            <div className="transaction-info-section">
                                <div className="info-row">
                                    <div className="info-col">
                                        <div className="info-label">Batch Number</div>
                                        <div className="info-value">{selectedTransaction.batchNumber || "N/A"}</div>
                                    </div>
                                    <div className="info-col">
                                        <div className="info-label">Transaction Date</div>
                                        <div className="info-value">
                                            {selectedTransaction.transactionDate
                                                ? new Date(selectedTransaction.transactionDate).toLocaleDateString("en-GB")
                                                : "N/A"}
                                        </div>
                                    </div>
                                </div>

                                <div className="info-row">
                                    <div className="info-col">
                                        <div className="info-label">Sender</div>
                                        <div className="info-value">{getEntityDisplayName(selectedTransaction.sender, selectedTransaction.senderType)}</div>
                                    </div>
                                    <div className="info-col">
                                        <div className="info-label">Receiver</div>
                                        <div className="info-value">{getEntityDisplayName(selectedTransaction.receiver, selectedTransaction.receiverType)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Rejection Reason */}
                            <div className="rejection-section">
                                <div className="rejection-label">
                                    Rejection Reason <span className="required-mark">*</span>
                                </div>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Please provide a reason for rejecting this transaction..."
                                    required
                                    disabled={processingAction}
                                />
                            </div>

                            {/* Error message */}
                            {rejectError && (
                                <div className="error-message">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    <span>{rejectError}</span>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="reject-button"
                                onClick={handleRejectTransaction}
                                disabled={processingAction || !rejectionReason.trim()}
                            >
                                {processingAction ? "Processing..." : (
                                    <>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M18 6L6 18M6 6l12 12" />
                                        </svg>
                                        Reject Transaction
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notifications */}
            {showAcceptNotification && (
                <div className="notification3 success-notification3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                        <path d="M22 4L12 14.01l-3-3"/>
                    </svg>
                    <span>Transaction Accepted Successfully</span>
                </div>
            )}

            {showRejectNotification && (
                <div className="notification3 reject-notification3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                    <span>Transaction Rejected Successfully</span>
                </div>
            )}
        </div>
    );
};

export default IncomingTransactionsTable;