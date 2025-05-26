// InSiteMaintenanceLog.jsx
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import './InSiteMaintenanceLog.scss';
import MaintenanceTransactionModal from '../MaintenanceTransactionModal/MaintenanceTransactionModal';
import DataTable from '../../../components/common/DataTable/DataTable.jsx';

const InSiteMaintenanceLog = forwardRef(({ equipmentId, onAddMaintenanceClick, onAddTransactionClick, showAddButton = true, showHeader = true }, ref) => {
    const [maintenanceRecords, setMaintenanceRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMaintenanceTransactionModalOpen, setIsMaintenanceTransactionModalOpen] = useState(false);
    const [selectedMaintenanceId, setSelectedMaintenanceId] = useState(null);
    const [selectedBatchNumber, setSelectedBatchNumber] = useState(null);

    const token = localStorage.getItem('token');
    const axiosInstance = axios.create({
        headers: { Authorization: `Bearer ${token}` }
    });

    const fetchMaintenanceRecords = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`http://localhost:8080/api/equipment/${equipmentId}/maintenance`);

            // Transform data for display
            const transformedData = await Promise.all(
                response.data.map(async (record) => {
                    // Get transaction info
                    const transactionCount = record.relatedTransactions?.length || 0;

                    return {
                        id: record.id,
                        technicianName: record.technician ? `${record.technician.firstName} ${record.technician.lastName}` : "N/A",
                        technicianId: record.technician?.id || null,
                        maintenanceDate: record.maintenanceDate,
                        maintenanceType: record.maintenanceType,
                        description: record.description,
                        status: record.status,
                        batchNumber: record.batchNumber,
                        transactionCount: transactionCount,
                        relatedTransactions: record.relatedTransactions || []
                    };
                })
            );

            setMaintenanceRecords(transformedData);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching maintenance records:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    // Expose fetchMaintenanceRecords to parent component
    useImperativeHandle(ref, () => ({
        refreshLogs: fetchMaintenanceRecords
    }));

    useEffect(() => {
        if (equipmentId) {
            fetchMaintenanceRecords();
        }
    }, [equipmentId]);

    // Filter maintenance records based on search term
    const filteredRecords = searchTerm
        ? maintenanceRecords.filter(record =>
            (record.technicianName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (record.maintenanceType?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (record.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (record.status?.toLowerCase() || '').includes(searchTerm.toLowerCase()))
        : maintenanceRecords;

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";

        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    // View transactions details
    const handleViewTransactions = (record) => {
        if (record.transactionCount === 0) {
            alert("No transactions linked to this maintenance record.");
            return;
        }

        // Format transaction details for display
        const transactionDetails = record.relatedTransactions.map(t =>
            `Transaction ID: ${t.id}\nBatch Number: ${t.batchNumber}\nStatus: ${t.status}\nItems: ${t.items?.length || 0}`
        ).join('\n\n');

        alert(`Maintenance: ${record.maintenanceType}\n\nLinked Transactions:\n${transactionDetails}`);
    };

    // Handle adding transaction to maintenance
    const handleAddTransactionToMaintenance = (record) => {
        setSelectedMaintenanceId(record.id);
        setSelectedBatchNumber(record.batchNumber || null);
        setIsMaintenanceTransactionModalOpen(true);
    };

    // Close maintenance transaction modal
    const handleCloseTransactionModal = () => {
        setIsMaintenanceTransactionModalOpen(false);
        setSelectedMaintenanceId(null);
        setSelectedBatchNumber(null);
    };

    // Refresh after transaction added
    const handleTransactionAdded = () => {
        fetchMaintenanceRecords();
        handleCloseTransactionModal();
    };

    const handleRowClick = (row) => {
        // Handle row click logic here
        console.log('Row clicked:', row);
    };

    const handleEditMaintenance = (row) => {
        // Handle edit maintenance logic here
        console.log('Edit maintenance:', row);
    };

    const handleDeleteMaintenance = (row) => {
        // Handle delete maintenance logic here
        console.log('Delete maintenance:', row);
    };

    // Define filterable columns - these should match the column objects
    const filterableColumns = [
        { header: 'Technician', accessor: 'technicianName' },
        { header: 'Type', accessor: 'maintenanceType' },
        { header: 'Status', accessor: 'status' }
    ];

    return (
        <div className="r4m-maintenance-log-container">
            {showHeader && (
                <div className="r4m-maintenance-header">
                    <div className="r4m-left-section">
                        <h2 className="r4m-maintenance-section-title">Maintenance Records</h2>
                        <div className="r4m-item-count">{maintenanceRecords.length} records</div>
                    </div>

                    <div className="r4m-search-container">
                        <input
                            type="text"
                            placeholder="Search maintenance records..."
                            className="r4m-search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg className="r4m-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                    </div>
                </div>
            )}

            <div className="r4m-maintenance-content">
                {loading ? (
                    <div className="r4m-loading-state">
                        <div className="r4m-loading-spinner"></div>
                        <p>Loading maintenance records...</p>
                    </div>
                ) : error ? (
                    <div className="r4m-error-state">
                        <p>Error loading maintenance records: {error}</p>
                    </div>
                ) : (
                    <DataTable
                        data={filteredRecords}
                        columns={[
                            { header: 'Technician', accessor: 'technicianName' },
                            { header: 'Date', accessor: 'maintenanceDate', body: (rowData) => formatDate(rowData.maintenanceDate) },
                            { header: 'Type', accessor: 'maintenanceType' },
                            { header: 'Description', accessor: 'description', body: (rowData) => rowData.description?.length > 50 ? `${rowData.description.substring(0, 50)}...` : rowData.description },
                            { header: 'Status', accessor: 'status', body: (rowData) => <span className={`r4m-status-badge r4m-${rowData.status.toLowerCase()}`}>{rowData.status}</span> },
                            { header: 'Related Transactions', accessor: 'transactionCount', body: (rowData) => rowData.transactionCount > 0 ? <button className="r4m-view-transactions-button" onClick={() => handleViewTransactions(rowData)}>{rowData.transactionCount} transaction{rowData.transactionCount !== 1 ? 's' : ''}</button> : <span className="r4m-no-transactions">None</span> },
                            { header: 'Actions', accessor: 'actions', body: (rowData) => (
                                <div className="r4m-actions-cell">
                                    <button className="r4m-edit-button" title="Edit Maintenance">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </button>
                                    <button className="r4m-transaction-button" title="Add Transaction" onClick={() => handleAddTransactionToMaintenance(rowData)}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 2v20M2 12h20" />
                                        </svg>
                                    </button>
                                    <button className="r4m-delete-button" title="Delete Maintenance">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                        </svg>
                                    </button>
                                </div>
                            ) }
                        ]}
                        onRowClick={handleRowClick}
                        loading={loading}
                        tableTitle="Maintenance Records"
                        showSearch={true}
                        showFilters={true}
                        filterableColumns={filterableColumns}
                        actions={[
                            { label: 'Edit', onClick: (row) => handleEditMaintenance(row) },
                            { label: 'Delete', onClick: (row) => handleDeleteMaintenance(row) }
                        ]}
                    />
                ) }
            </div>

            {showAddButton && (
                <button className="r4m-add-maintenance-button" onClick={onAddMaintenanceClick}>
                    <svg className="r4m-plus-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                </button>
            )}

            {/* Maintenance Transaction Modal */}
            {isMaintenanceTransactionModalOpen && (
                <MaintenanceTransactionModal
                    isOpen={isMaintenanceTransactionModalOpen}
                    onClose={handleCloseTransactionModal}
                    equipmentId={equipmentId}
                    maintenanceId={selectedMaintenanceId}
                    initialBatchNumber={selectedBatchNumber}
                    onTransactionAdded={handleTransactionAdded}
                />
            )}
        </div>
    );
});

export default InSiteMaintenanceLog;