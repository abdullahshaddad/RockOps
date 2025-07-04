import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useSnackbar } from '../../../contexts/SnackbarContext';
import { equipmentService } from '../../../services/equipmentService';
import { transactionService } from '../../../services/transactionService';
import './UnifiedTransactionsView.scss';
import DataTable from '../../../components/common/DataTable/DataTable.jsx';

const UnifiedTransactionsView = forwardRef(({
                                                entityId, // Generic - can be equipmentId or warehouseId
                                                entityType = 'EQUIPMENT', // 'EQUIPMENT' or 'WAREHOUSE'
                                                onAcceptTransaction,
                                                onRejectTransaction,
                                                onUpdateTransaction
                                            }, ref) => {
    const [activeTab, setActiveTab] = useState('all');
    const [allTransactions, setAllTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [receivedQuantities, setReceivedQuantities] = useState({});
    const [itemsNotReceived, setItemsNotReceived] = useState({});
    const [acceptComment, setAcceptComment] = useState('');
    const [purpose, setPurpose] = useState('CONSUMABLE');
    const [processingAction, setProcessingAction] = useState(false);

    // Add error state for modal (keeping existing functionality)
    const [acceptError, setAcceptError] = useState('');

    const { showError, showSuccess } = useSnackbar();

    // Keep original quantity change handler (no changes)
    const handleQuantityChange = (itemId, value) => {
        // Convert value to number and ensure it's not negative
        const numericValue = Math.max(0, parseInt(value) || 0);
        setReceivedQuantities(prev => ({
            ...prev,
            [itemId]: numericValue
        }));
    };

    // Keep original not received handler (no changes)
    const handleItemNotReceivedChange = (itemId, notReceived) => {
        setItemsNotReceived(prev => ({
            ...prev,
            [itemId]: notReceived
        }));

        // If marking as not received, set quantity to 0
        if (notReceived) {
            setReceivedQuantities(prev => ({
                ...prev,
                [itemId]: 0
            }));
        }
    };

    // Expose refresh methods to parent (no changes)
    useImperativeHandle(ref, () => ({
        refreshTransactions: fetchAllTransactions,
        refreshLogs: fetchAllTransactions
    }));

    // Keep original fetch function (no changes)
    const fetchAllTransactions = async () => {
        try {
            setLoading(true);
            setError(null);

            let response;
            // Use service methods based on entity type
            if (entityType === 'EQUIPMENT') {
                response = await equipmentService.getEquipmentTransactions(entityId);
            } else {
                response = await transactionService.getTransactionsForWarehouse(entityId);
            }

            if (!response.data || !Array.isArray(response.data)) {
                setAllTransactions([]);
                setLoading(false);
                return;
            }

            // Transform data - now with enhanced DTO structure
            const transformedData = response.data.map(transaction => ({
                ...transaction,
                id: transaction.id,
                date: transaction.transactionDate,
                completedAt: transaction.completedAt,
                sender: transaction.senderName, // Now comes from DTO
                receiver: transaction.receiverName, // Now comes from DTO
                batchNumber: transaction.batchNumber,
                createdAt: transaction.createdAt,
                addedBy: transaction.addedBy,
                approvedBy: transaction.approvedBy,
                status: transaction.status,
                rejectionReason: transaction.rejectionReason,
                acceptanceComment: transaction.acceptanceComment,
                purpose: transaction.purpose || 'GENERAL',
                senderId: transaction.senderId,
                receiverId: transaction.receiverId,
                sentFirst: transaction.sentFirst,
                items: (transaction.items || []).map(item => ({
                    id: item.id,
                    itemType: item.itemTypeName || 'Unknown Item',
                    category: item.itemCategory || 'N/A',
                    quantity: item.quantity,
                    receivedQuantity: item.receivedQuantity
                }))
            }));

            setAllTransactions(transformedData);
            setLoading(false);

        } catch (error) {
            console.error('Error fetching transactions:', error);
            setError(error.message || 'Failed to fetch transactions');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (entityId) {
            fetchAllTransactions();
        }
    }, [entityId, entityType]);

    // Define filterable columns (fixed to match DataTable expectations)
    const filterableColumns = [
        { accessor: 'sender', header: 'Sender' },
        { accessor: 'receiver', header: 'Receiver' },
        { accessor: 'status', header: 'Status' },
        { accessor: 'purpose', header: 'Purpose' },
        { accessor: 'addedBy', header: 'Added By' }
    ];

    // Helper function definitions - moved up to avoid hoisting issues (no changes)
    const getTransactionsForTab = (tabName) => {
        const entityIdStr = String(entityId);

        switch (tabName) {
            case 'incoming':
                return allTransactions.filter(tx => {
                    const isReceiver = String(tx.receiverId) === entityIdStr;
                    const isPending = tx.status === 'PENDING';
                    const notSentByEntity = !tx.sentFirst || String(tx.sentFirst) !== entityIdStr;
                    return isReceiver && isPending && notSentByEntity;
                });
            case 'pending':
                return allTransactions.filter(tx => {
                    const isPending = tx.status === 'PENDING';
                    const sentByEntity = tx.sentFirst && String(tx.sentFirst) === entityIdStr;
                    return isPending && sentByEntity;
                });
            case 'validated':
                return allTransactions.filter(tx => {
                    const isRelated = String(tx.senderId) === entityIdStr || String(tx.receiverId) === entityIdStr;
                    const isCompleted = tx.status === 'ACCEPTED' || tx.status === 'REJECTED';
                    return isRelated && isCompleted;
                });
            case 'all':
            default:
                return allTransactions.filter(tx => {
                    const isRelated = String(tx.senderId) === entityIdStr || String(tx.receiverId) === entityIdStr;
                    return isRelated;
                });
        }
    };

    const getTabCounts = () => {
        return {
            incoming: getTransactionsForTab('incoming').length,
            pending: getTransactionsForTab('pending').length,
            validated: getTransactionsForTab('validated').length,
            all: getTransactionsForTab('all').length
        };
    };

    // Get tab counts (no changes)
    const tabCounts = getTabCounts();

    // Get current data for the active tab (no changes)
    const currentData = getTransactionsForTab(activeTab);

    // Define columns for DataTable (no changes)
    const getColumns = () => {
        const baseColumns = [
            {
                header: 'Batch #',
                accessor: 'batchNumber',
                width: '100px'
            },
            {
                header: 'Items',
                accessor: 'items',
                render: (row) => (
                    <div className="items-count">
                        {row.items?.length || 0} item{row.items?.length !== 1 ? 's' : ''}
                    </div>
                ),
                width: '80px'
            },
            {
                header: 'Sender',
                accessor: 'sender',
                width: '150px'
            },
            {
                header: 'Receiver',
                accessor: 'receiver',
                width: '150px'
            },
            {
                header: 'Purpose',
                accessor: 'purpose',
                render: (row) => (
                    <span className={`purpose-tag ${row.purpose?.toLowerCase() || 'general'}`}>
                        {row.purpose || 'GENERAL'}
                    </span>
                ),
                width: '120px'
            },
            {
                header: 'Request Date',
                accessor: 'date',
                render: (row) => row.date ? new Date(row.date).toLocaleDateString('en-GB') : 'N/A',
                width: '120px'
            },
            {
                header: 'Created At',
                accessor: 'createdAt',
                render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }) : 'N/A',
                width: '140px'
            },
            {
                header: 'Status',
                accessor: 'status',
                render: (row) => (
                    <span className={`status-badge ${row.status?.toLowerCase() || 'unknown'}`}>
                        {row.status || 'UNKNOWN'}
                    </span>
                ),
                width: '100px'
            }
        ];

        // Add conditional columns based on tab
        if (activeTab === 'validated') {
            baseColumns.splice(-1, 0, {
                header: 'Completed At',
                accessor: 'completedAt',
                render: (row) => row.completedAt ? new Date(row.completedAt).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }) : 'N/A',
                width: '140px'
            });

            baseColumns.splice(-1, 0, {
                header: 'Approved By',
                accessor: 'approvedBy',
                width: '120px'
            });
        }

        return baseColumns;
    };

    // Define actions for DataTable (no changes)
    const getActions = () => {
        const actions = [];

        if (activeTab === 'incoming') {
            actions.push(
                {
                    label: 'Accept',
                    icon: (
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ),
                    onClick: handleAcceptTransaction,
                    className: 'accept-action'
                },
                {
                    label: 'Reject',
                    icon: (
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ),
                    onClick: onRejectTransaction,
                    className: 'reject-action'
                }
            );
        } else if (activeTab === 'pending') {
            actions.push({
                label: 'Update',
                icon: (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                ),
                onClick: onUpdateTransaction || (() => alert('Update functionality not implemented')),
                className: 'update-action'
            });
        }

        return actions;
    };

    const getTabTitle = () => {
        switch (activeTab) {
            case 'incoming': return 'Incoming Transactions';
            case 'pending': return 'Pending Transactions';
            case 'validated': return 'Validated Transactions';
            case 'all': return 'All Transactions';
            default: return 'Transactions';
        }
    };

    const getTabDescription = () => {
        switch (activeTab) {
            case 'incoming': return 'Transactions waiting for your approval';
            case 'pending': return 'Transactions you initiated and are waiting to be processed';
            case 'validated': return 'Completed transactions (accepted/rejected)';
            case 'all': return `All ${entityType.toLowerCase()} transactions`;
            default: return '';
        }
    };

    // Keep original accept transaction handler (no changes to logic)
    const handleAcceptTransaction = (transaction) => {
        setSelectedTransaction(transaction);
        setAcceptComment('');
        setPurpose('CONSUMABLE');
        setProcessingAction(false);
        setAcceptError(''); // Reset error state

        // Initialize received quantities with empty values (KEEP ORIGINAL LOGIC)
        const initialQuantities = {};
        const initialNotReceived = {};
        transaction.items.forEach(item => {
            initialQuantities[item.id] = 0;
            initialNotReceived[item.id] = false;
        });
        setReceivedQuantities(initialQuantities);
        setItemsNotReceived(initialNotReceived);
        setShowAcceptModal(true);
    };

    // Keep original accept submit handler (no changes to logic)
    const handleAcceptSubmit = async () => {
        setProcessingAction(true);
        setAcceptError(''); // Reset error state

        try {
            // Validate all quantities are provided (unless item is marked as not received)
            for (const itemId in receivedQuantities) {
                const isNotReceived = itemsNotReceived[itemId];
                if (!isNotReceived && (receivedQuantities[itemId] === undefined || receivedQuantities[itemId] < 0)) {
                    throw new Error("Please specify valid received quantities for all items or mark them as not received");
                }
            }

            // Use appropriate service based on entity type
            if (entityType === 'EQUIPMENT') {
                await equipmentService.acceptEquipmentTransaction(entityId, selectedTransaction.id, {
                    receivedQuantities,
                    comment: acceptComment,
                    purpose: purpose,
                    itemsNotReceived: itemsNotReceived
                });
            } else {
                // For warehouse transactions, use the general transaction service
                await transactionService.accept(selectedTransaction.id, {
                    username: 'current_user', // You might need to get this from auth context
                    acceptanceComment: acceptComment,
                    receivedItems: Object.entries(receivedQuantities).map(([itemId, quantity]) => ({
                        transactionItemId: itemId,
                        receivedQuantity: quantity
                    }))
                });
            }

            // Refresh transactions
            await fetchAllTransactions();
            setShowAcceptModal(false);
            showSuccess("Transaction accepted successfully");
        } catch (error) {
            console.error("Error accepting transaction:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to accept transaction";
            setAcceptError(errorMessage); // Set error for modal display
            showError(errorMessage);
        } finally {
            setProcessingAction(false);
        }
    };

    if (loading) {
        return (
            <div className="unified-transactions-view">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <div>Loading transactions...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="unified-transactions-view">
                <div className="error-state">
                    <div>Error loading transactions: {error}</div>
                    <button onClick={fetchAllTransactions}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="unified-transactions-view">
            {/* Tab Navigation - NO CHANGES */}
            <div className="transaction-tabs">
                <button
                    className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All Transactions
                    <span className="tab-count">{tabCounts.all}</span>
                </button>
                <button
                    className={`tab-button ${activeTab === 'incoming' ? 'active' : ''}`}
                    onClick={() => setActiveTab('incoming')}
                >
                    Incoming
                    <span className="tab-count">{tabCounts.incoming}</span>
                </button>
                <button
                    className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending
                    <span className="tab-count">{tabCounts.pending}</span>
                </button>
                <button
                    className={`tab-button ${activeTab === 'validated' ? 'active' : ''}`}
                    onClick={() => setActiveTab('validated')}
                >
                    Validated
                    <span className="tab-count">{tabCounts.validated}</span>
                </button>
            </div>

            {/* Transaction Table - NO CHANGES */}
            <div className="transaction-content">
                <DataTable
                    data={currentData}
                    columns={getColumns()}
                    loading={loading}
                    tableTitle={getTabTitle()}
                    showSearch={true}
                    showFilters={true}
                    filterableColumns={filterableColumns}
                    actions={getActions()}
                    actionsColumnWidth="140px"
                    defaultItemsPerPage={25}
                    itemsPerPageOptions={[10, 25, 50, 100]}
                    className="transactions-table"
                />

                {/* Tab Description - NO CHANGES */}
                {getTabDescription() && (
                    <div className="tab-description">
                        {getTabDescription()}
                    </div>
                )}
            </div>

            {/* ONLY CHANGE: Update Modal UI to match warehouse style while keeping all functionality */}
            {showAcceptModal && selectedTransaction && (
                <div className="modal-backdrop">
                    <div className="flat-modal">
                        {/* Header - Updated styling only */}
                        <div className="flat-modal-header">
                            <h2>Accept Transaction</h2>
                            <button
                                className="close-modal-btn"
                                onClick={() => setShowAcceptModal(false)}
                                disabled={processingAction}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flat-modal-content">
                            {/* Transaction Info Section - NEW warehouse-style layout */}
                            <div className="transaction-info-section">
                                <div className="info-row">
                                    <div className="info-col">
                                        <div className="info-label">Batch Number</div>
                                        <div className="info-value">{selectedTransaction.batchNumber}</div>
                                    </div>
                                    <div className="info-col">
                                        <div className="info-label">Transaction Date</div>
                                        <div className="info-value">
                                            {selectedTransaction.date ? new Date(selectedTransaction.date).toLocaleDateString('en-GB') : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-col">
                                        <div className="info-label">Sender</div>
                                        <div className="info-value">{selectedTransaction.sender}</div>
                                    </div>
                                    <div className="info-col">
                                        <div className="info-label">Receiver</div>
                                        <div className="info-value">{selectedTransaction.receiver}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Purpose Selection - Keep existing logic */}
                            <div className="purpose-section">
                                <label>Transaction Purpose:</label>
                                <select
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                    disabled={processingAction}
                                >
                                    <option value="CONSUMABLE">Consumable</option>
                                    <option value="MAINTENANCE">Maintenance</option>
                                </select>
                            </div>

                            {/* Items Section - Updated UI only, keep all logic */}
                            <div className="items-section">
                                <h3>Items</h3>
                                {selectedTransaction.items.map((item, index) => (
                                    <div key={item.id} className="item-container">
                                        <div className="item-details">
                                            <div className="item-name-block">
                                                <span className="item-number">{index + 1}</span>
                                                <div className="item-name-wrapper">
                                                    <div className="item-name">{item.itemType}</div>
                                                    <div className="item-category">{item.category}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Keep existing quantity logic, update UI only */}
                                        <div className="quantity-section">
                                            <div className="quantity-label">
                                                Received Quantity {!itemsNotReceived[item.id] && <span className="required-mark">*</span>}
                                            </div>

                                            <div className="quantity-controls">
                                                <div className="received-input">
                                                    <label>Received:</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={item.quantity}
                                                        value={receivedQuantities[item.id] || 0}
                                                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                        disabled={processingAction || itemsNotReceived[item.id]}
                                                    />
                                                </div>
                                            </div>

                                            {/* Keep existing checkbox logic */}
                                            <div className="item-not-received-section">
                                                <label className="item-not-received-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={itemsNotReceived[item.id] || false}
                                                        onChange={(e) => handleItemNotReceivedChange(item.id, e.target.checked)}
                                                        disabled={processingAction}
                                                    />
                                                    <span className="checkbox-label">Item not received/sent</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Comment Section - Updated UI only */}
                            <div className="comments-section">
                                <div className="comments-label">
                                    Comments <span className="optional-text">(optional)</span>
                                </div>
                                <textarea
                                    value={acceptComment}
                                    onChange={(e) => setAcceptComment(e.target.value)}
                                    placeholder="Enter any additional comments about this transaction..."
                                    disabled={processingAction}
                                />
                            </div>

                            {/* Error message - NEW */}
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

                        {/* Footer - Updated styling only */}
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="accept-button"
                                onClick={handleAcceptSubmit}
                                disabled={processingAction}
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
        </div>
    );
});

export default UnifiedTransactionsView;