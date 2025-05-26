import React, {forwardRef, useEffect, useImperativeHandle, useState} from 'react';
import axios from 'axios';
import './EquipmentConsumablesInventory.scss';
import DataTable from '../../../components/common/DataTable/DataTable';

const EquipmentConsumablesInventory = forwardRef(({equipmentId, onAddClick}, ref) => {

    const [consumables, setConsumables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('current');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const token = localStorage.getItem('token');
    const axiosInstance = axios.create({
        headers: {Authorization: `Bearer ${token}`}
    });

    const fetchConsumables = async () => {
        try {
            setLoading(true);
            // Fetch all consumables, we'll filter them in the frontend
            const endpoint = `http://localhost:8080/api/equipment/${equipmentId}/consumables`;
            const response = await axiosInstance.get(endpoint);
            setConsumables(response.data);
            console.log("Consumables data:", response.data);

            // Log unique statuses for debugging
            const uniqueStatuses = [...new Set(response.data.map(c => c.status))];
            console.log("Available statuses:", uniqueStatuses);

            setLoading(false);
        } catch (err) {
            console.error('Error fetching consumables inventory:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    // Expose fetchConsumables to parent component
    useImperativeHandle(ref, () => ({
        fetchConsumables,
        refreshLogs: fetchConsumables  // Alias for backward compatibility
    }));

    useEffect(() => {
        if (equipmentId) {
            fetchConsumables();
        }
    }, [equipmentId, activeTab]);

    // Filter consumables based on search term and active tab
    const filteredConsumables = consumables.filter(item => {
        // First apply search filter
        const matchesSearch = !searchTerm ||
            (item.itemTypeName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (item.itemTypeCategory?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        // Then apply tab filter
        switch (activeTab) {
            case 'current':
                return !item.status || item.status === 'REGULAR' || item.status === 'IN_WAREHOUSE' || item.status === 'CONSUMED';
            case 'overReceived':
                return item.status === 'OVERRECEIVED';
            default:
                return true;
        }
    });

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredConsumables.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredConsumables.length / itemsPerPage);

    // Page change handler
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Items per page change handler
    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(parseInt(e.target.value));
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1); // Reset to first page when changing tabs
    };

    // Get count for overReceived badge indicator
    const overReceivedCount = consumables.filter(item => item.status === 'OVERRECEIVED').length;

    // Define columns for the data table
    const columns = [
        {header: 'Item Name', accessor: 'itemTypeName'},
        {header: 'Category', accessor: 'itemTypeCategory'},
        {
            header: 'Quantity',
            accessor: 'quantity',
            render: (row, value) => (
                <span
                    className={`quantity-value ${activeTab === 'overReceived' ? 'over-received' : value <= 5 ? 'low-stock' : ''}`}>
                    {value}
                </span>
            )
        },
        {header: 'Unit', accessor: 'unit'},
        {
            header: 'Transaction Date',
            accessor: 'transactionDate',
            render: (row, value) => value ? new Date(value).toLocaleDateString() : "N/A"
        },
        {
            header: 'Last Updated',
            accessor: 'lastUpdated',
            render: (row, value) => value ? new Date(value).toLocaleDateString() : "N/A"
        },
        ...(activeTab === 'overReceived' ? [{
            header: 'Actions',
            accessor: 'actions',
            render: (row) => (
                <button
                    className="resolve-button"
                    title="Add to Inventory"
                    onClick={() => {/* Add logic to move to regular inventory */
                    }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Add to Inventory
                </button>
            )
        }] : [])
    ];

    // Define filterable columns - these should match the column objects
    const filterableColumns = [
        {header: 'Item Name', accessor: 'itemTypeName'},
        {header: 'Category', accessor: 'itemTypeCategory'},
        {header: 'Quantity', accessor: 'quantity'},
        {header: 'Unit', accessor: 'unit'},
        {header: 'Transaction Date', accessor: 'transactionDate'},
        {header: 'Last Updated', accessor: 'lastUpdated'}
    ];

    return (
        <div className="consumables-inventory">
            <div className="inventory-header">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search consumables..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                    </svg>
                </div>
                <div className="inventory-count">
                    {filteredConsumables.length} items in inventory
                </div>
            </div>

            {/* Inventory Tabs - Removed under-received tab */}
            <div className="inventory-tabs">
                <button
                    className={`inventory-tab ${activeTab === 'current' ? 'active' : ''}`}
                    onClick={() => handleTabChange('current')}
                >
                    Current Inventory
                    <span className="inventory-tab-count">{consumables.length}</span>
                </button>
                <button
                    className={`inventory-tab ${activeTab === 'overReceived' ? 'active' : ''}`}
                    onClick={() => handleTabChange('overReceived')}
                >
                    Surplus Items
                    {overReceivedCount > 0 && (
                        <span className="tab-badge">
                            {overReceivedCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Resolution info card - only show for overReceived tab */}
            {activeTab === 'overReceived' && (
                <div className="resolution-info-card">
                    <div className="resolution-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                    </div>
                    <div className="resolution-info-content">
                        <h3>Inventory Surplus</h3>
                        <p>
                            Items in this section represent surpluses (more received than expected).
                            These items need to be reconciled and properly added to your inventory.
                        </p>
                    </div>
                </div>
            )}

            <div className="inventory-content">
                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading consumables inventory...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <p>Error loading consumables: {error}</p>
                    </div>
                ) : (
                    <DataTable
                        data={currentItems}
                        columns={columns}
                        loading={loading}
                        tableTitle={`${activeTab === 'current' ? 'Current Inventory' : 'Surplus Items'}`}
                        showSearch={true}
                        showFilters={true}
                        filterableColumns={filterableColumns}
                    />
                )}
            </div>

            {filteredConsumables.length > 0 && (
                <div className="pagination-controls">
                    <div className="items-per-page">
                        <label>Items per page:</label>
                        <select
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>

                    <div className="pagination">
                        <button
                            className="page-button"
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                        >
                            ⟪
                        </button>
                        <button
                            className="page-button"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            ⟨
                        </button>

                        <div className="page-info">
                            Page {currentPage} of {totalPages}
                        </div>

                        <button
                            className="page-button"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            ⟩
                        </button>
                        <button
                            className="page-button"
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                        >
                            ⟫
                        </button>
                    </div>
                </div>
            )}
            <button className="add-button2" onClick={onAddClick}>
                <svg className="plus-icon2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14"/>
                </svg>
            </button>
        </div>
    );
});

export default EquipmentConsumablesInventory;