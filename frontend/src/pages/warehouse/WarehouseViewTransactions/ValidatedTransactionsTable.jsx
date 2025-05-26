import React, { useState, useEffect } from "react";
import "./WarehouseViewTransactions.scss";

const ValidatedTransactionsTable = ({ warehouseId }) => {
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [validatedTransactions, setValidatedTransactions] = useState([]);
    const [modalInfo, setModalInfo] = useState(null);

    useEffect(() => {
        fetchValidatedTransactions();
    }, [warehouseId]);

    const fetchValidatedTransactions = async () => {
        if (!warehouseId) return;
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/api/v1/transactions/warehouse/${warehouseId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                const validatedData = await Promise.all(
                    data
                        .filter(tx =>
                            (tx.status === "ACCEPTED" || tx.status === "REJECTED") &&
                            (tx.senderId === warehouseId || tx.receiverId === warehouseId)
                        )
                        .map(async (tx) => {
                            const sender = await fetchEntityDetails(tx.senderType, tx.senderId);
                            const receiver = await fetchEntityDetails(tx.receiverType, tx.receiverId);
                            return { ...tx, sender, receiver };
                        })
                );
                setValidatedTransactions(validatedData);
            }
        } catch (err) {
            console.error("Error fetching validated transactions:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEntityDetails = async (entityType, entityId) => {
        if (!entityType || !entityId) return null;
        try {
            const token = localStorage.getItem("token");
            let endpoint;
            if (entityType === "WAREHOUSE") {
                endpoint = `http://localhost:8080/api/v1/warehouses/${entityId}`;
            } else if (entityType === "SITE") {
                endpoint = `http://localhost:8080/api/v1/sites/${entityId}`;
            } else {
                endpoint = `http://localhost:8080/api/${entityType.toLowerCase()}/${entityId}`;
            }

            const response = await fetch(endpoint, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            return response.ok ? await response.json() : null;
        } catch {
            return null;
        }
    };

    const filteredTransactions = searchTerm
        ? validatedTransactions.filter((item) =>
            item.sender?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.receiver?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.status?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : validatedTransactions;

    const handleInfoClick = (event, transaction) => {
        event.stopPropagation();

        // Set modal info based on transaction status
        if (transaction.status === "REJECTED" && transaction.rejectionReason) {
            setModalInfo({
                title: "Rejection Reason",
                content: transaction.rejectionReason,
                transaction: transaction
            });
        } else if (transaction.status === "ACCEPTED" && transaction.acceptanceComment) {
            setModalInfo({
                title: "Acceptance Comments",
                content: transaction.acceptanceComment,
                transaction: transaction
            });
        }
    };

    const closeModal = () => {
        setModalInfo(null);
    };

    // Close modal when clicking outside of it
    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
            closeModal();
        }
    };

    return (
        <div className="transaction-table-pending">
            <div className="left-section3">
                <h2 className="transaction-section-title">Validated Transactions</h2>
                <div className="item-count3">{validatedTransactions.length} validated transactions</div>
            </div>
            <div className="section-description">(Completed transactions - accepted or rejected)</div>
            <div className="right-section3">
                <div className="table-search-container-pending">
                    <input
                        type="text"
                        placeholder="Search validated transactions..."
                        className="search-input3"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                </div>
            </div>

            <div className="table-card3" style={{ minHeight: filteredTransactions.length === 0 ? '300px' : 'auto' }}>
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
                            <div className="table-header-cell date-cell3">Batch Number</div>
                            <div className="table-header-cell date-cell3">Transaction Date</div>
                            <div className="table-header-cell created-at-cell3">Created At</div>
                            <div className="table-header-cell added-by-cell3">Added By</div>
                            <div className="table-header-cell approved-by-cell3">Approved By</div>
                            <div className="table-header-cell status-cell3">Status</div>
                        </div>

                        <div className="table-body3">
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map((item, index) => (
                                    <div className="table-row3" key={index}>
                                        <div className="table-cell item-type-cell3">{item.items?.length || 0}</div>
                                        <div className="table-cell sender-cell3">{item.sender?.name || "N/A"}</div>
                                        <div className="table-cell receiver-cell3">{item.receiver?.name || item.receiver?.equipment?.fullModelName || "N/A"}</div>
                                        <div className="table-cell date-cell3">
                                            {item.batchNumber || "N/A"}
                                        </div>
                                        <div className="table-cell date-cell3">
                                            {item.transactionDate ? new Date(item.transactionDate).toLocaleDateString('en-GB') : "N/A"}
                                        </div>
                                        <div className="table-cell created-at-cell3">
                                            {item.createdAt ? new Date(item.createdAt).toLocaleString('en-GB', {
                                                day: '2-digit', month: '2-digit', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit', second: '2-digit'
                                            }) : "N/A"}
                                        </div>
                                        <div className="table-cell added-by-cell3">{item.addedBy}</div>
                                        <div className="table-cell approved-by-cell3">{item.approvedBy}</div>
                                        <div className="table-cell status-cell3">
                                            <div className="status-container">
                                                <span className={`status-badge3 ${item.status.toLowerCase()}`}>
                                                    {item.status}
                                                </span>

                                                {((item.status === "REJECTED" && item.rejectionReason) ||
                                                    (item.status === "ACCEPTED" && item.acceptanceComment)) && (
                                                    <button
                                                        className="info-button"
                                                        onClick={(e) => handleInfoClick(e, item)}
                                                        aria-label={item.status === "REJECTED" ? "View rejection reason" : "View acceptance comment"}
                                                    >
                                                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="10" />
                                                            <line x1="12" y1="16" x2="12" y2="12" />
                                                            <circle cx="12" cy="8" r="0.5" fill="currentColor" stroke="none" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state3">
                                    <div className="empty-icon3">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    </div>
                                    <h3>No validated transactions</h3>
                                    <p>There are no accepted or rejected transactions for this warehouse</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Modal for comments/reasons */}
            {modalInfo && (
                <div className="modal-backdrop" onClick={handleOverlayClick}>
                    <div className="comment-modal">
                        <div className="comment-modal-header">
                            <h3>{modalInfo.title}</h3>
                            <button className="close-modal-btn" onClick={closeModal}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="comment-modal-content">
                            <div className="transaction-summary">
                                <div className="summary-row">
                                    <span className="label">Transaction:</span>
                                    <span className="value">Batch #{modalInfo.transaction.batchNumber}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="label">From:</span>
                                    <span className="value">{modalInfo.transaction.sender?.name || "N/A"}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="label">To:</span>
                                    <span className="value">{modalInfo.transaction.receiver?.name || "N/A"}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="label">Date:</span>
                                    <span className="value">
                                        {modalInfo.transaction.transactionDate
                                            ? new Date(modalInfo.transaction.transactionDate).toLocaleDateString('en-GB')
                                            : "N/A"}
                                    </span>
                                </div>
                                <div className="summary-row">
                                    <span className="label">Status:</span>
                                    <span className={`value status-${modalInfo.transaction.status.toLowerCase()}`}>
                                        {modalInfo.transaction.status}
                                    </span>
                                </div>
                            </div>

                            <div className="comment-content">
                                <h4>{modalInfo.title}:</h4>
                                <p>{modalInfo.content || "No comments provided."}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ValidatedTransactionsTable;