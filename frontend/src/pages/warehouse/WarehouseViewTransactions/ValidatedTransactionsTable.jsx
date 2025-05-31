import React, { useState, useEffect } from "react";
import "./WarehouseViewTransactions.scss";
import DataTable from "../../../components/common/DataTable/DataTable.jsx"; // Updated import
import Snackbar from "../../../components/common/Snackbar/Snackbar.jsx";

const ValidatedTransactionsTable = ({ warehouseId }) => {
    const [loading, setLoading] = useState(false);
    const [validatedTransactions, setValidatedTransactions] = useState([]);
    const [modalInfo, setModalInfo] = useState(null);

    // Snackbar state for potential future use
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
            } else {
                showSnackbar("Failed to fetch validated transactions", "error");
            }
        } catch (err) {
            console.error("Error fetching validated transactions:", err);
            showSnackbar("Error fetching validated transactions", "error");
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

    // Helper function to get entity display name
    const getEntityDisplayName = (entity, entityType) => {
        if (!entity) return "N/A";
        return entity.name || entity.equipment?.fullModelName || "N/A";
    };

    // Define table columns for DataTable
    const columns = [
        {
            header: 'ITEMS',
            accessor: 'items',
            sortable: true,
            width: '200px',
            minWidth: '120px',
            render: (row) => row.items?.length || 0
        },
        {
            header: 'SENDER',
            accessor: 'sender',
            sortable: true,
            width: '200px',
            minWidth: '150px',
            render: (row) => getEntityDisplayName(row.sender, row.senderType)
        },
        {
            header: 'RECEIVER',
            accessor: 'receiver',
            sortable: true,
            width: '200px',
            minWidth: '150px',
            render: (row) => getEntityDisplayName(row.receiver, row.receiverType)
        },
        {
            header: 'BATCH NUMBER',
            accessor: 'batchNumber',
            sortable: true,
            width: '200px',
            minWidth: '120px',
            render: (row) => row.batchNumber || "N/A"
        },
        {
            header: 'TRANSACTION DATE',
            accessor: 'transactionDate',
            sortable: true,
            width: '200px',
            minWidth: '150px',
            render: (row) => formatDate(row.transactionDate)
        },
        {
            header: 'CREATED AT',
            accessor: 'createdAt',
            sortable: true,
            width: '200px',
            minWidth: '150px',
            render: (row) => formatDateTime(row.createdAt)
        },
        {
            header: 'ADDED BY',
            accessor: 'addedBy',
            sortable: true,
            width: '200px',
            minWidth: '120px',
            render: (row) => row.addedBy || "N/A"
        },
        {
            header: 'APPROVED BY',
            accessor: 'approvedBy',
            sortable: true,
            width: '200px',
            minWidth: '120px',
            render: (row) => row.approvedBy || "N/A"
        },
        {
            header: 'STATUS',
            accessor: 'status',
            sortable: true,
            width: '200px',
            minWidth: '120px',
            render: (row) => (
                <div className="status-container">
                    <span className={`status-badge3 ${row.status.toLowerCase()}`}>
                        {row.status}
                    </span>

                    {((row.status === "REJECTED" && row.rejectionReason) ||
                        (row.status === "ACCEPTED" && row.acceptanceComment)) && (
                        <button
                            className="info-button"
                            onClick={(e) => handleInfoClick(e, row)}
                            aria-label={row.status === "REJECTED" ? "View rejection reason" : "View acceptance comment"}
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <circle cx="12" cy="8" r="0.5" fill="currentColor" stroke="none" />
                            </svg>
                        </button>
                    )}
                </div>
            )
        }
    ];

    // Filterable columns for DataTable
    const filterableColumns = [
        {
            header: 'ITEMS',
            accessor: 'items',
            filterType: 'number'
        },
        {
            header: 'SENDER',
            accessor: 'sender',
            filterType: 'text'
        },
        {
            header: 'RECEIVER',
            accessor: 'receiver',
            filterType: 'text'
        },
        {
            header: 'BATCH NUMBER',
            accessor: 'batchNumber',
            filterType: 'number'
        },
        {
            header: 'TRANSACTION DATE',
            accessor: 'transactionDate',
            filterType: 'text'
        },
        {
            header: 'CREATED AT',
            accessor: 'createdAt',
            filterType: 'text'
        },
        {
            header: 'ADDED BY',
            accessor: 'addedBy',
            filterType: 'text'
        },
        {
            header: 'APPROVED BY',
            accessor: 'approvedBy',
            filterType: 'text'
        },
        {
            header: 'STATUS',
            accessor: 'status',
            filterType: 'select'
        }
    ];

    return (
        <div className="transaction-table-section">
            <div className="table-header-section">
                <div className="left-section3">
                    <h2 className="transaction-section-title">Validated Transactions</h2>
                    <div className="item-count3">{validatedTransactions.length} validated transactions</div>
                </div>
            </div>

            <div className="section-description">
                (Completed transactions - accepted or rejected)
            </div>

            {/* DataTable Component */}
            <DataTable
                data={validatedTransactions}
                columns={columns}
                loading={loading}
                emptyMessage="There are no accepted or rejected transactions for this warehouse"
                className="validated-transactions-table"
                showSearch={true}
                showFilters={true}
                filterableColumns={filterableColumns}
                itemsPerPageOptions={[5, 10, 15, 20]}
                defaultItemsPerPage={10}
            />

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

            {/* Snackbar Component */}
            <Snackbar
                isOpen={snackbar.isOpen}
                message={snackbar.message}
                type={snackbar.type}
                onClose={closeSnackbar}
                duration={3000}
                position="bottom-right"
            />
        </div>
    );
};

export default ValidatedTransactionsTable;