import React, { useState, useEffect } from "react";
import DataTable from "../../../components/common/DataTable/DataTable.jsx";
import { FaInfoCircle } from 'react-icons/fa';
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
        },
        {
            header: 'Approved By',
            accessor: 'approvedBy',
            sortable: true
        },
        {
            header: 'Status',
            accessor: 'status',
            sortable: true,
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
                            <FaInfoCircle />
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="transaction-table-pending">
            <div className="left-section3">
                <h2 className="transaction-section-title">Validated Transactions</h2>
                <div className="item-count3">{validatedTransactions.length} validated transactions</div>
            </div>
            <div className="section-description">(Completed transactions - accepted or rejected)</div>

            <DataTable
                data={validatedTransactions}
                columns={columns}
                loading={loading}
                showSearch={true}
                showFilters={true}
                filterableColumns={columns.filter(col => col.sortable)}
                itemsPerPageOptions={[10, 25, 50]}
                defaultItemsPerPage={10}
                className="validated-transactions-table"
            />

            {/* Info Modal */}
            {modalInfo && (
                <div className="modal-backdrop" onClick={handleOverlayClick}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{modalInfo.title}</h3>
                            <button className="close-button" onClick={closeModal}>
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>{modalInfo.content}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ValidatedTransactionsTable;