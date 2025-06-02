import React from "react";
import "./TransactionViewModal.scss";

const TransactionViewModal = ({ transaction, isOpen, onClose, hideItemQuantities = false }) => {
    if (!isOpen || !transaction) return null;

    // Format date helper functions
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

    // Get entity name helper
    const getEntityName = (entity) => {
        if (!entity) return "N/A";
        return entity.name || entity.fullModelName || entity.equipment?.fullModelName || "N/A";
    };

    // Get status badge class
    const getStatusClass = (status) => {
        return `warehouse-transaction-view-status-badge ${status?.toLowerCase() || 'unknown'}`;
    };

    return (
        <div className="warehouse-transaction-view-modal-overlay" onClick={onClose}>
            <div className="warehouse-transaction-view-modal" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="warehouse-transaction-view-modal-header">
                    <h2>Transaction Details</h2>
                    <button className="warehouse-transaction-view-close-button" onClick={onClose}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Modal Content */}
                <div className="warehouse-transaction-view-modal-content">
                    {/* Transaction Overview */}
                    <div className="warehouse-transaction-view-overview">
                        <div className="warehouse-transaction-view-overview-header">
                            <h3>Transaction Overview</h3>
                            <span className={getStatusClass(transaction.status)}>
                                {transaction.status}
                            </span>
                        </div>

                        <div className="warehouse-transaction-view-overview-grid">

                            <div className="warehouse-transaction-view-overview-item">
                                <label>Batch Number</label>
                                <span>{transaction.batchNumber || "N/A"}</span>
                            </div>

                            <div className="warehouse-transaction-view-overview-item">
                                <label>Transaction Date</label>
                                <span>{formatDate(transaction.transactionDate)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Party Information */}
                    <div className="warehouse-transaction-view-party-information">
                        <h3>Party Information</h3>
                        <div className="warehouse-transaction-view-party-grid">
                            <div className="warehouse-transaction-view-party-card warehouse-transaction-view-sender">
                                <div className="warehouse-transaction-view-party-header">
                                    <h4>Sender</h4>
                                    <span className="warehouse-transaction-view-party-type">{transaction.senderType}</span>
                                </div>
                                <div className="warehouse-transaction-view-party-details">
                                    <div className="warehouse-transaction-view-party-name">{getEntityName(transaction.sender)}</div>

                                </div>
                            </div>

                            <div className="warehouse-transaction-view-arrow-container">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12,5 19,12 12,19"></polyline>
                                </svg>
                            </div>

                            <div className="warehouse-transaction-view-party-card warehouse-transaction-view-receiver">
                                <div className="warehouse-transaction-view-party-header">
                                    <h4>Receiver</h4>
                                    <span className="warehouse-transaction-view-party-type">{transaction.receiverType}</span>
                                </div>
                                <div className="warehouse-transaction-view-party-details">
                                    <div className="warehouse-transaction-view-party-name">{getEntityName(transaction.receiver)}</div>

                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Items */}
                    <div className="warehouse-transaction-view-items">
                        <h3>Transaction Items ({transaction.items?.length || 0})</h3>
                        {transaction.items && transaction.items.length > 0 ? (
                            <div className="warehouse-transaction-view-items-list">
                                {transaction.items.map((item, index) => (
                                    <div key={index} className="warehouse-transaction-view-item-card">
                                        <div className="warehouse-transaction-view-item-header">
                                            <h4>{item.itemType?.name || "Unknown Item"}</h4>
                                            {!hideItemQuantities && (
                                                <span className="warehouse-transaction-view-item-quantity">Qty: {item.quantity}</span>
                                            )}
                                        </div>
                                        <div className="warehouse-transaction-view-item-details">
                                            {item.itemType?.description && (
                                                <div className="warehouse-transaction-view-item-detail">
                                                    <label>Description</label>
                                                    <span>{item.itemType.description}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="warehouse-transaction-view-no-items">
                                <p>No items in this transaction</p>
                            </div>
                        )}
                    </div>

                    {/* Timeline Information */}
                    <div className="warehouse-transaction-view-timeline">
                        <h3>Transaction Timeline</h3>
                        <div className="warehouse-transaction-view-timeline-grid">
                            <div className="warehouse-transaction-view-timeline-item">
                                <label>Created At</label>
                                <span>{formatDateTime(transaction.createdAt)}</span>
                            </div>
                            <div className="warehouse-transaction-view-timeline-item">
                                <label>Created By</label>
                                <span>{transaction.addedBy || "N/A"}</span>
                            </div>
                            {transaction.completedAt && (
                                <div className="warehouse-transaction-view-timeline-item">
                                    <label>Completed At</label>
                                    <span>{formatDateTime(transaction.completedAt)}</span>
                                </div>
                            )}
                            {transaction.approvedBy && (
                                <div className="warehouse-transaction-view-timeline-item">
                                    <label>Completed By</label>
                                    <span>{transaction.approvedBy}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Comments & Rejection Reason */}
                    {(transaction.acceptanceComment || transaction.rejectionReason) && (
                        <div className="warehouse-transaction-view-comments">
                            <h3>Comments & Notes</h3>
                            {transaction.acceptanceComment && (
                                <div className="warehouse-transaction-view-comment-item warehouse-transaction-view-acceptance">
                                    <label>Acceptance Comment</label>
                                    <p>{transaction.acceptanceComment}</p>
                                </div>
                            )}
                            {transaction.rejectionReason && (
                                <div className="warehouse-transaction-view-comment-item warehouse-transaction-view-rejection">
                                    <label>Rejection Reason</label>
                                    <p>{transaction.rejectionReason}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Maintenance Information (if applicable) */}
                    {transaction.maintenance && (
                        <div className="warehouse-transaction-view-maintenance-info">
                            <h3>Related Maintenance</h3>
                            <div className="warehouse-transaction-view-maintenance-details">
                                <div className="warehouse-transaction-view-maintenance-item">
                                    <label>Maintenance ID</label>
                                    <span>{transaction.maintenance.id}</span>
                                </div>
                                {/* Add more maintenance details as needed */}
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="warehouse-transaction-view-modal-footer">

                </div>
            </div>
        </div>
    );
};

export default TransactionViewModal;