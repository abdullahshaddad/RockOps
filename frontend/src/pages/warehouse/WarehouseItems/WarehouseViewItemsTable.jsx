import React, { useState, useEffect, useMemo } from "react";
import "./WarehouseViewItems.scss";
import { useParams } from 'react-router-dom';
import DataTable from "../../../components/common/DataTable/DataTable.jsx";
import { FaEdit, FaTrash, FaCheckCircle } from 'react-icons/fa';

const WarehouseViewItemsTable = ({ warehouseId }) => {
  const [tableData, setTableData] = useState([]);
  const [resolutionHistory, setResolutionHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [resolutionData, setResolutionData] = useState({
    resolutionType: "",
    notes: "",
    transactionId: ""
  });
  const [newItem, setNewItem] = useState({
    itemType: { id: "" },
    quantity: "",
    status: "AVAILABLE",
    comment: "",
  });
  const [itemTypes, setItemTypes] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [showNotification2, setShowNotification2] = useState(false);
  const [activeTab, setActiveTab] = useState('inWarehouse');
  const [warehouseData, setWarehouseData] = useState({
    site: {},
    name: "",
    id: "",
    employees: []
  });

  const fetchItems = async () => {
    if (!warehouseId) {
      console.error("Warehouse ID is not available");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/api/v1/items/warehouse/${warehouseId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTableData(data);
      } else {
        console.error("Failed to fetch items, status:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResolutionHistory = async () => {
    if (!warehouseId) {
      console.error("Warehouse ID is not available");
      return;
    }
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/api/v1/items/resolution-history/warehouse/${warehouseId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setResolutionHistory(data);
      } else {
        console.error("Failed to fetch resolution history, status:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch resolution history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchItemTypes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/api/v1/itemTypes/warehouse/${warehouseId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setItemTypes(data);
      } else {
        console.error("Failed to fetch item types, status:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch item types:", error);
    }
  };

  const fetchWarehouseDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/api/v1/warehouses/${warehouseId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setWarehouseData({
        site: data.site || {},
        name: data.name || "",
        id: data.id || "",
        employees: data.employees || []
      });
    } catch (error) {
      console.error("Error fetching warehouse details:", error);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchItemTypes();
    fetchWarehouseDetails();
  }, [warehouseId]);

  useEffect(() => {
    if (activeTab === 'resolvedHistory') {
      fetchResolutionHistory();
    }
  }, [activeTab, warehouseId]);

  const handleDeleteItem = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/api/v1/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setTableData((prev) => prev.filter(item => item.id !== itemId));
        setShowNotification2(true);
        setTimeout(() => {
          setShowNotification2(false);
        }, 3000);
      } else {
        const errorText = await response.text();
        console.error("Failed to delete item:", response.status, errorText);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleOpenResolutionModal = (item) => {
    setSelectedItem(item);
    setResolutionData({
      resolutionType: "",
      notes: "",
      transactionId: item.relatedTransactionId || ""
    });
    setIsResolutionModalOpen(true);
  };

  const handleResolutionSubmit = async (e) => {
    e.preventDefault();

    if (!selectedItem) return;

    try {
      const token = localStorage.getItem("token");

      const resolution = {
        itemId: selectedItem.id,
        resolutionType: resolutionData.resolutionType,
        notes: resolutionData.notes,
        transactionId: resolutionData.transactionId,
        resolvedBy: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).username : "system"
      };

      const response = await fetch(`http://localhost:8080/api/v1/items/resolve-discrepancy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resolution),
      });

      if (response.ok) {
        fetchItems();
        setIsResolutionModalOpen(false);
        setShowNotification(true);
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
      } else {
        const errorText = await response.text();
        console.error("Failed to resolve item:", response.status, errorText);
      }
    } catch (error) {
      console.error("Failed to resolve item:", error);
    }
  };

  const handleResolutionInputChange = (e) => {
    const { name, value } = e.target;
    setResolutionData({
      ...resolutionData,
      [name]: value,
    });
  };

  const getResolutionTypeLabel = (resolutionType) => {
    switch (resolutionType) {
      case 'ACKNOWLEDGE_LOSS':
        return 'Acknowledge Loss';
      case 'COUNTING_ERROR':
        return 'Counting Error';
      case 'FOUND_ITEMS':
        return 'Items Found';
      case 'REPORT_THEFT':
        return 'Report Theft';
      case 'ACCEPT_SURPLUS':
        return 'Accept Surplus';
      case 'RETURN_TO_SENDER':
        return 'Return to Sender';
      default:
        return resolutionType;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Define columns for regular items table (In Warehouse)
  const itemColumns = [
    {
      header: 'CATEGORY',
      accessor: 'itemType.itemCategory.name',
      sortable: true,
      render: (row) => (
        <span className="category-tag">
          {row.itemType?.itemCategory?.name || "No Category"}
        </span>
      )
    },
    {
      header: 'ITEM',
      accessor: 'itemType.name',
      sortable: true,
      render: (row) => row.itemType?.name || "N/A"
    },
    {
      header: 'QUANTITY',
      accessor: 'quantity',
      sortable: true,
      render: (row) => row.quantity || 0
    },
    {
      header: 'UNIT',
      accessor: 'itemType.measuringUnit',
      sortable: true,
      render: (row) => row.itemType?.measuringUnit || "N/A"
    }
  ];

  // Define columns for discrepancy items (Missing/Excess Items - WITH batch number)
  const discrepancyItemColumns = [
    {
      header: 'CATEGORY',
      accessor: 'itemType.itemCategory.name',
      sortable: true,
      render: (row) => (
        <span className="category-tag">
          {row.itemType?.itemCategory?.name || "No Category"}
        </span>
      )
    },
    {
      header: 'ITEM',
      accessor: 'itemType.name',
      sortable: true,
      render: (row) => row.itemType?.name || "N/A"
    },
    {
      header: 'QUANTITY',
      accessor: 'quantity',
      sortable: true,
      render: (row) => row.quantity || 0
    },
    {
      header: 'UNIT',
      accessor: 'itemType.measuringUnit',
      sortable: true,
      render: (row) => row.itemType?.measuringUnit || "N/A"
    },
    {
      header: 'BATCH #',
      accessor: 'transaction.batchNumber',
      sortable: true,
      render: (row) => (
        <span className="batch-number">
          {row.transaction?.batchNumber || row.batchNumber || 'N/A'}
        </span>
      )
    }
  ];

  // Define columns for resolution history table
  const historyColumns = [
    {
      header: 'CATEGORY',
      accessor: 'item.itemType.itemCategory.name',
      sortable: true,
      render: (row) => (
        <span className="category-tag">
          {row.item?.itemType?.itemCategory?.name || "No Category"}
        </span>
      )
    },
    {
      header: 'ITEM',
      accessor: 'item.itemType.name',
      sortable: true,
      render: (row) => row.item?.itemType?.name || "N/A"
    },
    {
      header: 'QUANTITY',
      accessor: 'originalQuantity',
      sortable: true,
      render: (row) => row.originalQuantity || 0
    },
    {
      header: 'BATCH #',
      accessor: 'item.transaction.batchNumber',
      sortable: true,
      render: (row) => (
        <span className="batch-number">
          {row.item?.transaction?.batchNumber || row.item?.batchNumber || 'N/A'}
        </span>
      )
    },
    {
      header: 'RESOLUTION',
      accessor: 'resolutionType',
      sortable: true,
      render: (row) => (
        <span className={`resolution-badge ${row.resolutionType?.toLowerCase().replace('_', '-')}`}>
          {getResolutionTypeLabel(row.resolutionType)}
        </span>
      )
    },
    {
      header: 'RESOLVED BY',
      accessor: 'resolvedBy',
      sortable: true,
      render: (row) => row.resolvedBy || "System"
    },
    {
      header: 'RESOLVED AT',
      accessor: 'resolvedAt',
      sortable: true,
      render: (row) => (
        <span className="date-cell">
          {formatDate(row.resolvedAt)}
        </span>
      )
    },
    {
      header: 'NOTES',
      accessor: 'notes',
      sortable: true,
      render: (row) => (
        <div className="notes-preview" title={row.notes}>
          {row.notes?.length > 50 ? `${row.notes.substring(0, 50)}...` : row.notes}
        </div>
      )
    }
  ];

  // Action configuration for regular items - static array with conditional logic
  const itemActions = useMemo(() => [
    {
      label: 'Resolve Discrepancy',
      icon: <FaCheckCircle />,
      onClick: (row) => handleOpenResolutionModal(row),
      className: 'success',
      isDisabled: (row) => !(row.itemStatus === 'MISSING' || row.itemStatus === 'OVERRECEIVED')
    },
    {
      label: 'Edit Item',
      icon: <FaEdit />,
      onClick: (row) => console.log('Edit item:', row),
      className: 'primary',
      isDisabled: (row) => row.itemStatus === 'MISSING' || row.itemStatus === 'OVERRECEIVED'
    },
    {
      label: 'Delete Item',
      icon: <FaTrash />,
      onClick: (row) => handleDeleteItem(row.id),
      className: 'danger',
      isDisabled: () => false // Always enabled
    }
  ], []);

  // Get current actions based on active tab
  const getCurrentActions = useMemo(() => {
    if (activeTab === 'resolvedHistory') {
      return []; // No actions for resolved history
    }
    return itemActions;
  }, [activeTab, itemActions]);

  // Filter data based on active tab
  const getFilteredData = () => {
    switch (activeTab) {
      case 'inWarehouse':
        return tableData.filter(item => 
          item.itemStatus !== 'MISSING' && 
          item.itemStatus !== 'OVERRECEIVED' || 
          item.resolved
        );
      case 'missingItems':
        return tableData.filter(item => 
          item.itemStatus === 'MISSING' && !item.resolved
        );
      case 'excessItems':
        return tableData.filter(item => 
          item.itemStatus === 'OVERRECEIVED' && !item.resolved
        );
      case 'resolvedHistory':
        return resolutionHistory;
      default:
        return tableData;
    }
  };

  const getCurrentColumns = () => {
    switch (activeTab) {
      case 'resolvedHistory':
        return historyColumns;
      case 'inWarehouse':
        return itemColumns;
      case 'missingItems':
      case 'excessItems':
        return discrepancyItemColumns;
      default:
        return itemColumns;
    }
  };

  return (
    <div className="warehouse-view4">
      {/* Header with count and search */}
      <div className="header-container4">
        <div className="left-section4">
          <h1 className="page-title4">Inventory</h1>
          <div className="item-count4">
            {activeTab === 'resolvedHistory'
              ? `${resolutionHistory.length} resolutions`
              : `${getFilteredData().length} items`}
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="inventory-tabs">
        <button
          className={`inventory-tab ${activeTab === 'inWarehouse' ? 'active' : ''}`}
          onClick={() => setActiveTab('inWarehouse')}
        >
          In Warehouse
        </button>
        <button
          className={`inventory-tab ${activeTab === 'missingItems' ? 'active' : ''}`}
          onClick={() => setActiveTab('missingItems')}
        >
          Missing Items
          {tableData.filter(item => item.itemStatus === 'MISSING' && !item.resolved).length > 0 && (
            <span className="tab-badge">
              {tableData.filter(item => item.itemStatus === 'MISSING' && !item.resolved).length}
            </span>
          )}
        </button>
        <button
          className={`inventory-tab ${activeTab === 'excessItems' ? 'active' : ''}`}
          onClick={() => setActiveTab('excessItems')}
        >
          Excess Items
          {tableData.filter(item => item.itemStatus === 'OVERRECEIVED' && !item.resolved).length > 0 && (
            <span className="tab-badge">
              {tableData.filter(item => item.itemStatus === 'OVERRECEIVED' && !item.resolved).length}
            </span>
          )}
        </button>
        <button
          className={`inventory-tab ${activeTab === 'resolvedHistory' ? 'active' : ''}`}
          onClick={() => setActiveTab('resolvedHistory')}
        >
          Resolved History
        </button>
      </div>

      {/* Info cards for different tabs */}
      {activeTab === 'missingItems' && (
        <div className="missing-info-card">
          <div className="missing-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="missing-info-content">
            <h3>Missing Items</h3>
            <p>
              These items are expected to be in the warehouse but cannot be found during inventory checks. 
              Each item requires resolution to maintain accurate inventory records.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'excessItems' && (
        <div className="excess-info-card">
          <div className="excess-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div className="excess-info-content">
            <h3>Excess Items</h3>
            <p>
              These items were found in quantities higher than expected during inventory checks. 
              Review and resolve each discrepancy to ensure accurate inventory tracking.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'resolvedHistory' && (
        <div className="resolution-info-card">
          <div className="resolution-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="resolution-info-content">
            <h3>Resolution History</h3>
            <p>
              This tab shows the complete history of all resolved inventory discrepancies. Each entry includes details about the original issue, the resolution action taken, and who resolved it.
            </p>
          </div>
        </div>
      )}

      {/* DataTable Component */}
      <DataTable
        data={getFilteredData()}
        columns={getCurrentColumns()}
        loading={activeTab === 'resolvedHistory' ? historyLoading : loading}
        showSearch={true}
        showFilters={true}
        filterableColumns={getCurrentColumns().filter(col => col.sortable)}
        itemsPerPageOptions={[10, 25, 50, 100]}
        defaultItemsPerPage={10}
        actions={getCurrentActions}
        className={`inventory-table ${activeTab}-table`}
      />

      {/* Resolution Modal */}
      {isResolutionModalOpen && selectedItem && (
        <div className="modal-backdrop4">
          <div className="modal4">
            <div className="modal-header4">
              <h2>Resolve Inventory Discrepancy</h2>
              <button className="close-modal4" onClick={() => setIsResolutionModalOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="modal-content4">
              <div className="item-details">
                <h3>Item Details</h3>
                <div className="resolution-detail">
                  <span className="resolution-label">Item:</span>
                  <span className="resolution-value">{selectedItem.itemType?.name}</span>
                </div>
                <div className="resolution-detail">
                  <span className="resolution-label">Category:</span>
                  <span className="resolution-value">{selectedItem.itemType?.itemCategory?.name}</span>
                </div>
                <div className="resolution-detail">
                  <span className="resolution-label">Quantity:</span>
                  <span className="resolution-value">{selectedItem.quantity}</span>
                </div>
                <div className="resolution-detail">
                  <span className="resolution-label">Status:</span>
                  <span className="resolution-value">{selectedItem.itemStatus === 'MISSING' ? 'Missing' : selectedItem.itemStatus === 'OVERRECEIVED' ? 'Excess' : 'In Warehouse'}</span>
                </div>
              </div>

              <form onSubmit={handleResolutionSubmit}>
                <div className="form-group4">
                  <label htmlFor="resolutionType">Resolution Type</label>
                  <select
                    id="resolutionType"
                    name="resolutionType"
                    value={resolutionData.resolutionType}
                    onChange={handleResolutionInputChange}
                    required
                  >
                    <option value="">Select Resolution Type</option>
                    <option value="ACKNOWLEDGE_LOSS">Acknowledge Loss</option>
                    <option value="COUNTING_ERROR">Counting Error</option>
                    <option value="FOUND_ITEMS">Items Found</option>
                    <option value="REPORT_THEFT">Report Theft</option>
                    <option value="ACCEPT_SURPLUS">Accept Surplus</option>
                    <option value="RETURN_TO_SENDER">Return to Sender</option>
                  </select>
                </div>

                <div className="form-group4">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={resolutionData.notes}
                    onChange={handleResolutionInputChange}
                    placeholder="Add any additional notes about this resolution..."
                    rows="4"
                  />
                </div>

                <div className="form-group4">
                  <label htmlFor="transactionId">Related Transaction ID (Optional)</label>
                  <input
                    type="text"
                    id="transactionId"
                    name="transactionId"
                    value={resolutionData.transactionId}
                    onChange={handleResolutionInputChange}
                    placeholder="Enter transaction ID if applicable"
                  />
                </div>

                <div className="modal-footer4">
                  <button type="button" className="cancel-button4" onClick={() => setIsResolutionModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-button4">
                    Resolve Discrepancy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Success notification */}
      {showNotification && (
        <div className="notification4 success-notification4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <path d="M22 4L12 14.01l-3-3"/>
          </svg>
          <span>Discrepancy resolved successfully</span>
        </div>
      )}

      {/* Delete notification */}
      {showNotification2 && (
        <div className="notification4 delete-notification4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <path d="M22 4L12 14.01l-3-3"/>
          </svg>
          <span>Item deleted successfully</span>
        </div>
      )}
    </div>
  );
};

export default WarehouseViewItemsTable;