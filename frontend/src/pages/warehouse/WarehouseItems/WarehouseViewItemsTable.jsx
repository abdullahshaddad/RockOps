import React, { useState, useEffect } from "react";
import "./WarehouseViewItems.scss";
import { useParams } from 'react-router-dom';
import Table from "../../../../OurTable/Table";

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

  const filteredData = tableData.filter((item) => {
    const textMatch = item.itemType?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemType?.itemCategory?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemStatus?.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'inWarehouse') {
      return textMatch && item.itemStatus === 'IN_WAREHOUSE' && !item.resolved;
    }
    if (activeTab === 'missingItems') {
      return textMatch && item.itemStatus === 'MISSING' && !item.resolved;
    }
    if (activeTab === 'excessItems') {
      return textMatch && item.itemStatus === 'OVERRECEIVED' && !item.resolved;
    }
    if (activeTab === 'resolvedHistory') {
      return textMatch && item.resolved;
    }

    return textMatch;
  });

  const filteredResolutionHistory = resolutionHistory.filter((resolution) => {
    return resolution.item?.itemType?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resolution.item?.itemType?.itemCategory?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resolution.resolutionType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resolution.resolvedBy?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusLabel = (status) => {
    switch (status) {
      case 'IN_WAREHOUSE':
        return 'In Warehouse';
      case 'DELIVERING':
        return 'Delivering';
      case 'PENDING':
        return 'Pending';
      case 'MISSING':
        return 'Missing Items';
      case 'OVERRECEIVED':
        return 'Excess Items';
      default:
        return status;
    }
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

  // Define columns for regular items table (In Warehouse - no batch number needed)
  const itemColumns = [
    {
      id: 'category',
      label: 'CATEGORY',
      width: '255px',
      render: (row) => (
          <span className="category-tag">
          {row.itemType?.itemCategory?.name || "No Category"}
        </span>
      )
    },
    {
      id: 'name',
      label: 'ITEM',
      width: '250px',
      render: (row) => row.itemType?.name || "N/A"
    },
    {
      id: 'quantity',
      label: 'QUANTITY',
      width: '250px',
      render: (row) => row.quantity || 0
    },
    {
      id: 'unit',
      label: 'UNIT',
      width: '230px',
      render: (row) => row.itemType?.measuringUnit || "N/A"
    }
  ];

  // Define columns for discrepancy items (Missing/Excess Items - WITH batch number)
  const discrepancyItemColumns = [
    {
      id: 'category',
      label: 'CATEGORY',
      width: '210px',
      render: (row) => (
          <span className="category-tag">
          {row.itemType?.itemCategory?.name || "No Category"}
        </span>
      )
    },
    {
      id: 'name',
      label: 'ITEM',
      width: '210px',
      render: (row) => row.itemType?.name || "N/A"
    },
    {
      id: 'quantity',
      label: 'QUANTITY',
      width: '210px',
      render: (row) => row.quantity || 0
    },
    {
      id: 'unit',
      label: 'UNIT',
      width: '210px',
      render: (row) => row.itemType?.measuringUnit || "N/A"
    },
    {
      id: 'batchNumber',
      label: 'BATCH #',
      width: '200px',
      render: (row) => (
          <span className="batch-number">
          {row.transaction?.batchNumber || row.batchNumber || 'N/A'}
        </span>
      )
    }
  ];

  // Define columns for resolution history table (WITH batch number)
  const historyColumns = [
    {
      id: 'category',
      label: 'CATEGORY',
      width: '210px',
      render: (row) => (
          <span className="category-tag">
          {row.item?.itemType?.itemCategory?.name || "No Category"}
        </span>
      )
    },
    {
      id: 'name',
      label: 'ITEM',
      width: '210px',
      render: (row) => row.item?.itemType?.name || "N/A"
    },
    {
      id: 'quantity',
      label: 'QUANTITY',
      width: '210px',
      render: (row) => row.originalQuantity || 0
    },
    {
      id: 'batchNumber',
      label: 'BATCH #',
      width: '210px',
      render: (row) => (
          <span className="batch-number">
          {row.item?.transaction?.batchNumber || row.item?.batchNumber || 'N/A'}
        </span>
      )
    },
    {
      id: 'resolutionType',
      label: 'RESOLUTION',
      width: '180px',
      render: (row) => (
          <span className={`resolution-badge ${row.resolutionType?.toLowerCase().replace('_', '-')}`}>
          {getResolutionTypeLabel(row.resolutionType)}
        </span>
      )
    },
    {
      id: 'resolvedBy',
      label: 'RESOLVED BY',
      width: '210px',
      render: (row) => row.resolvedBy || "System"
    },
    {
      id: 'resolvedAt',
      label: 'RESOLVED AT',
      width: '250px',
      render: (row) => (
          <span className="date-cell">
          {formatDate(row.resolvedAt)}
        </span>
      )
    },
    {
      id: 'notes',
      label: 'NOTES',
      width: '210px',
      render: (row) => (
          <div className="notes-preview" title={row.notes}>
            {row.notes?.length > 50 ? `${row.notes.substring(0, 50)}...` : row.notes}
          </div>
      )
    }
  ];

  // Action configuration for regular items
// Action configuration for regular items (In Warehouse) - smaller width
  const itemActionConfig = {
    label: 'ACTIONS',
    width: '150px',  // Smaller width for In Warehouse
    renderActions: (row) => (
        <>
          {row.itemStatus === 'MISSING' || row.itemStatus === 'OVERRECEIVED' ? (
              <button
                  className="custom-table-action-button resolve"
                  title="Resolve Discrepancy"
                  onClick={() => handleOpenResolutionModal(row)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
          ) : (
              <button className="custom-table-action-button edit" title="Edit Item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
          )}
          <button
              className="custom-table-action-button delete"
              title="Delete Item"
              onClick={() => handleDeleteItem(row.id)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </>
    )
  };

// Action configuration for discrepancy items (Missing/Excess) - keep original width
  const discrepancyActionConfig = {
    label: 'ACTIONS',
    width: '150px',  // Keep original width for Missing/Excess
    renderActions: (row) => (
        <>
          {row.itemStatus === 'MISSING' || row.itemStatus === 'OVERRECEIVED' ? (
              <button
                  className="custom-table-action-button resolve"
                  title="Resolve Discrepancy"
                  onClick={() => handleOpenResolutionModal(row)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
          ) : (
              <button className="custom-table-action-button edit" title="Edit Item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
          )}
          <button
              className="custom-table-action-button delete"
              title="Delete Item"
              onClick={() => handleDeleteItem(row.id)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </>
    )
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
                  : `${tableData.length} items`}
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
            Resolution History
          </button>
        </div>

        {/* Resolution info cards */}
        {(activeTab === 'missingItems' || activeTab === 'excessItems') && (
            <div className="resolution-info-card">
              <div className="resolution-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="resolution-info-content">
                <h3>Inventory Discrepancy Resolution</h3>
                <p>
                  {activeTab === 'missingItems'
                      ? 'Items marked as "Missing" represent inventory shortages identified during transactions. These items were expected to be received but were not found. Review and resolve these discrepancies to maintain accurate inventory records.'
                      : 'Items marked as "Excess" represent inventory surpluses identified during transactions. These are items that were received beyond expected quantities. Review and resolve these discrepancies to determine appropriate action.'}
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

        {/* Table Component - Different column sets for different tabs */}
        {/* Table Component - Different column sets for different tabs */}
        {activeTab === 'resolvedHistory' ? (
            <Table
                columns={historyColumns}
                data={filteredResolutionHistory}
                isLoading={historyLoading}
                emptyMessage="No resolution history found"
                className="resolution-history-table"
            />
        ) : activeTab === 'inWarehouse' ? (
            <Table
                columns={itemColumns}
                data={filteredData}
                isLoading={loading}
                emptyMessage="No warehouse items found"
                actionConfig={itemActionConfig}  // Use smaller width config
                className="inventory-items-table"
            />
        ) : (
            <Table
                columns={discrepancyItemColumns}
                data={filteredData}
                isLoading={loading}
                emptyMessage={`No ${activeTab === 'missingItems' ? 'missing' : 'excess'} items found`}
                actionConfig={discrepancyActionConfig}  // Use original width config
                className="discrepancy-items-table"
            />
        )}

        {/* Resolution Modal */}
        {isResolutionModalOpen && selectedItem && (
            <div className="resolution-modal-backdrop">
              <div className="resolution-modal">
                <div className="resolution-modal-header">
                  <h2>Resolve Inventory Discrepancy</h2>
                  <button
                      className="close-modal-button"
                      onClick={() => setIsResolutionModalOpen(false)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="resolution-modal-body">
                  <div className="resolution-item-details">
                    <div className="resolution-detail">
                      <span className="resolution-label">Item:</span>
                      <span className="resolution-value">{selectedItem.itemType?.name}</span>
                    </div>

                    <div className="resolution-detail">
                      <span className="resolution-label">Quantity:</span>
                      <span className="resolution-value">{selectedItem.quantity} {selectedItem.itemType?.measuringUnit || ''}</span>
                    </div>

                    <div className="resolution-detail">
                      <span className="resolution-label">Status:</span>
                      <span className="resolution-value">{getStatusLabel(selectedItem.itemStatus)}</span>
                    </div>

                    <div className="resolution-detail">
                      <span className="resolution-label">Batch Number:</span>
                      <span className="resolution-value">{selectedItem.transaction?.batchNumber || selectedItem.batchNumber || 'N/A'}</span>
                    </div>
                  </div>

                  <form onSubmit={handleResolutionSubmit} className="resolution-form">
                    <div className="resolution-form-group">
                      <label htmlFor="resolutionType">Resolution Type</label>
                      <select
                          id="resolutionType"
                          name="resolutionType"
                          value={resolutionData.resolutionType}
                          onChange={handleResolutionInputChange}
                          required
                      >
                        <option value="">Select Resolution Type</option>
                        {selectedItem.itemStatus === 'MISSING' ? (
                            <>
                              <option value="ACKNOWLEDGE_LOSS">Acknowledge Loss</option>
                              <option value="COUNTING_ERROR">Counting Error</option>
                              <option value="FOUND_ITEMS">Items Found</option>
                              <option value="REPORT_THEFT">Report Theft</option>
                            </>
                        ) : (
                            <>
                              <option value="ACCEPT_SURPLUS">Accept Surplus</option>
                              <option value="RETURN_TO_SENDER">Return to Sender</option>
                              <option value="COUNTING_ERROR">Counting Error</option>
                            </>
                        )}
                      </select>
                    </div>

                    <div className="resolution-form-group">
                      <label htmlFor="notes">Resolution Notes</label>
                      <textarea
                          id="notes"
                          name="notes"
                          value={resolutionData.notes}
                          onChange={handleResolutionInputChange}
                          placeholder="Provide details about this resolution"
                          rows={4}
                          required
                      />
                    </div>

                    <div className="resolution-confirmation">
                      <p className="resolution-confirmation-text">
                        {resolutionData.resolutionType === 'ACKNOWLEDGE_LOSS' &&
                            "You are confirming that these items are lost and will be removed from inventory."}
                        {resolutionData.resolutionType === 'COUNTING_ERROR' &&
                            "You are indicating this was a counting error and inventory will be adjusted."}
                        {resolutionData.resolutionType === 'FOUND_ITEMS' &&
                            "You are confirming items were found and will be returned to regular inventory."}
                        {resolutionData.resolutionType === 'REPORT_THEFT' &&
                            "You are reporting theft. This will be logged and items will be written off."}
                        {resolutionData.resolutionType === 'ACCEPT_SURPLUS' &&
                            "You are accepting the surplus items into regular inventory."}
                        {resolutionData.resolutionType === 'RETURN_TO_SENDER' &&
                            "You are initiating a return of these items to the sender."}
                      </p>
                    </div>

                    <div className="resolution-modal-footer">
                      <button
                          type="button"
                          className="cancel-button"
                          onClick={() => setIsResolutionModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                          type="submit"
                          className="resolve-submit-button"
                          disabled={!resolutionData.resolutionType || !resolutionData.notes}
                      >
                        Resolve Discrepancy
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
        )}

        {/* Notifications */}
        {showNotification && (
            <div className="notification success-notification">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
              <span>Operation completed successfully</span>
            </div>
        )}

        {showNotification2 && (
            <div className="notification success-notification">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
              <span>Item deleted successfully</span>
            </div>
        )}
      </div>
  );
};

export default WarehouseViewItemsTable;