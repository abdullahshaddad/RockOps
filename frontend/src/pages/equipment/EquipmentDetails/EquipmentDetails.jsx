import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaInfoCircle, FaWrench, FaTools, FaBoxOpen, FaTachometerAlt, FaCalendarAlt } from "react-icons/fa";
import axios from "axios";
import "./EquipmentDetails.scss";
import SarkyAttendance from "../SarkyAttendance/SarkyAttendance";
import InSiteMaintenanceLog from "../InSiteMaintenanceLog/InSiteMaintenanceLog";
import EquipmentConsumablesInventory from "../EquipmentConsumablesInventory/EquipmentConsumablesInventory ";
import EquipmentDashboard from "./EquipmentDashboard/EquipmentDashboard";
import Modal from "react-modal";
import MaintenanceTransactionModal from '../MaintenanceTransactionModal/MaintenanceTransactionModal';
import MaintenanceAddModal from '../MaintenanceAddModal/MaintenanceAddModal';
import { equipmentService } from "../../../services/equipmentService";
import { useSnackbar } from "../../../Contexts/SnackbarContext";
import UnifiedTransactionsView from "../UnifiedTransactionsView/UnifiedTransactionsView";
import {sarkyService} from "../../../services/sarkyService";

// Set the app element for accessibility
Modal.setAppElement('#root'); // Adjust this to match your root element ID

const EquipmentDetails = () => {
    const params = useParams();
    const navigate = useNavigate();
    const { showSuccess, showError } = useSnackbar();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [equipmentData, setEquipmentData] = useState({
        fullModelName: "",
        site: { name: "" },
        mainDriver: { firstName: "", lastName: "" },
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const [selectedMaintenanceId, setSelectedMaintenanceId] = useState(null);

    // Modal states
    const [isAddConsumableModalOpen, setIsAddConsumableModalOpen] = useState(false);
    const [showCreateNotification, setShowCreateNotification] = useState(false);
    const [isAddMaintenanceModalOpen, setIsAddMaintenanceModalOpen] = useState(false);
    const [isMaintenanceTransactionModalOpen, setIsMaintenanceTransactionModalOpen] = useState(false);

    // Format current date and time to ISO format for datetime-local input
    const formatDateForInput = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Transaction state
    const [newTransaction, setNewTransaction] = useState({
        transactionDate: formatDateForInput(new Date()), // Set default to current date/time
        items: [{ itemType: { id: "" }, quantity: "1" }],
        senderType: "WAREHOUSE",
        senderId: "",
        receiverType: "EQUIPMENT",
        receiverId: params.EquipmentID,
        batchNumber: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Site and warehouse related states
    const [sites, setSites] = useState([]);
    const [selectedSite, setSelectedSite] = useState("");
    const [warehouses, setWarehouses] = useState([]);
    const [allItemTypes, setAllItemTypes] = useState([]);
    const [filteredItemTypes, setFilteredItemTypes] = useState([]);
    const [categories, setCategories] = useState([]);

    // Refs for child components
    const dashboardRef = useRef(null);
    const sarkyAttendanceRef = useRef(null);
    const consumablesLogRef = useRef(null);
    const inSiteMaintenanceLogRef = useRef(null);
    const consumablesInventoryRef = useRef(null);
    const unifiedTransactionsRef = useRef();

    const token = localStorage.getItem("token");
    const axiosInstance = axios.create({
        headers: { Authorization: `Bearer ${token}` }
    });

    // Add state for batch verification
    const [isVerifyingBatch, setIsVerifyingBatch] = useState(false);
    const [batchVerificationResult, setBatchVerificationResult] = useState(null);

    // Fetch equipment data
    useEffect(() => {
        const fetchEquipmentData = async () => {
            try {
                const response = await equipmentService.getEquipmentById(params.EquipmentID);
                setEquipmentData(response.data);
                console.log("=== EQUIPMENT DATA FETCHED ===");
                console.log("Equipment response:", response.data);
                console.log("Main Driver ID:", response.data?.mainDriverId);
                console.log("Main Driver Name:", response.data?.mainDriverName);
                console.log("===============================");

                if (response.data?.siteId) {
                    setSelectedSite(response.data.siteId);
                }

                setLoading(false);
            } catch (error) {
                console.error("Error fetching equipment data:", error);
                setError(error.message);
                setLoading(false);
            }
        };
        const fetchEquipmentPhoto = async () => {
            try {
                // You can use the custom equipmentService method for fetching photos
                const response = await equipmentService.getEquipmentMainPhoto(params.EquipmentID);
                setPreviewImage(response.data);
            } catch (error) {
                console.error("Error fetching equipment photo:", error);
            }
        };

        fetchEquipmentData();
        fetchEquipmentPhoto();
        fetchAllSites();
    }, [params.EquipmentID]);

    const handleAddTransactionToMaintenance = (maintenanceId) => {
        setSelectedMaintenanceId(maintenanceId);
        setIsMaintenanceTransactionModalOpen(true);
    };

    // Refresh Sarky log after adding new entry
    const refreshSarkyLog = () => {
        if (sarkyAttendanceRef.current) {
            sarkyAttendanceRef.current.refreshData();
        }
        if (dashboardRef.current) {
            dashboardRef.current.refreshDashboard();
        }
    };

    // Handle input changes for the transaction form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTransaction({
            ...newTransaction,
            [name]: value,
        });

        // Automatically verify batch number when it changes
        if (name === 'batchNumber') {
            // Reset verification result
            setBatchVerificationResult(null);

            // Only verify if there's a value - pass the new value directly
            if (value) {
                verifyBatchNumber(value); // Pass the new value directly
            }
        }
    };
    // Handle changes to item fields
    const handleItemChange = (index, field, value) => {
        const updatedItems = [...newTransaction.items];

        if (field === 'itemTypeId') {
            updatedItems[index] = {
                ...updatedItems[index],
                itemType: { id: value }
            };
        } else {
            updatedItems[index] = {
                ...updatedItems[index],
                [field]: value
            };
        }

        setNewTransaction({
            ...newTransaction,
            items: updatedItems
        });
    };

    // Add a new item to the transaction
    const addItem = () => {
        setNewTransaction({
            ...newTransaction,
            items: [...newTransaction.items, { itemType: { id: "" }, quantity: "1" }]
        });
    };

    // Remove an item from the transaction
    const removeItem = (index) => {
        if (newTransaction.items.length <= 1) {
            // Don't remove if it's the last item
            return;
        }

        const updatedItems = newTransaction.items.filter((_, i) => i !== index);
        setNewTransaction({
            ...newTransaction,
            items: updatedItems
        });
    };

    // Get available item types for a specific item dropdown
    const getAvailableItemTypes = (currentIndex) => {
        // Get all selected item type IDs except the current one
        const selectedItemTypeIds = newTransaction.items
            .filter((_, idx) => idx !== currentIndex && !!_.itemType.id)
            .map(item => item.itemType.id);

        // Return items that aren't selected elsewhere
        return filteredItemTypes.filter(itemType =>
            !selectedItemTypeIds.includes(itemType.id)
        );
    };

    // Function to render the item options in the dropdown
    const renderItemOptions = (currentIndex) => {
        const availableItems = getAvailableItemTypes(currentIndex);

        return availableItems.map((itemType) => (
            <option key={itemType.id} value={itemType.id}>
                {itemType.name} {itemType.unit ? `(${itemType.unit})` : ""}
            </option>
        ));
    };

    // Submit transaction form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Check if there's a batch verification result and if it found a transaction
            if (batchVerificationResult && batchVerificationResult.found) {
                showError("Cannot add transaction: This batch number is already in use.");
                setIsSubmitting(false);
                return;
            }

            // Validate items
            for (const item of newTransaction.items) {
                if (!item.itemType.id || !item.quantity) {
                    alert("Please complete all item fields");
                    setIsSubmitting(false);
                    return;
                }
            }

            // Format items array directly as expected by the API
            const itemsArray = newTransaction.items.map(item => ({
                itemTypeId: item.itemType.id,
                quantity: parseInt(item.quantity)
            }));

            // Format the transaction date correctly - this is the key fix
            let transactionDateParam = '';
            if (newTransaction.transactionDate) {
                // Format as ISO string and remove milliseconds
                const formattedDate = new Date(newTransaction.transactionDate)
                    .toISOString()
                    .split('.')[0]; // Remove milliseconds part
                transactionDateParam = `&transactionDate=${encodeURIComponent(formattedDate)}`;
            }

            // Use query parameters to match the Postman request
            const response = await axiosInstance.post(
                `http://localhost:8080/api/equipment/${params.EquipmentID}/receive-transaction?` +
                `senderId=${newTransaction.senderId}&` +
                `senderType=WAREHOUSE&` +
                `batchNumber=${parseInt(newTransaction.batchNumber)}&` +
                `purpose=CONSUMABLE` +
                transactionDateParam,  // Add the transaction date parameter
                itemsArray  // Send items array directly
            );

            console.log("Transaction created:", response.data);

            // Refresh all data after a successful transaction
            refreshAllTabs();

            // Show notification and close modal
            setIsAddConsumableModalOpen(false);
            showSuccess("Transaction Request Sent Successfully");

        } catch (error) {
            showError("Error submitting form: " + (error.response?.data?.message || error.message));
            console.error("Error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Refresh all data after a successful transaction
    const refreshAllTabs = () => {
        if (consumablesInventoryRef.current) {
            consumablesInventoryRef.current.refreshLogs();
        }
        if (sarkyAttendanceRef.current) {
            sarkyAttendanceRef.current.refreshData();
        }
        if (inSiteMaintenanceLogRef.current) {
            inSiteMaintenanceLogRef.current.refreshLogs();
        }
        if (dashboardRef.current) {
            dashboardRef.current.refreshDashboard();
        }
        if (unifiedTransactionsRef.current) {
            unifiedTransactionsRef.current.refreshTransactions();
        }
    };

    const refreshMaintenanceLog = () => {
        if (inSiteMaintenanceLogRef.current) {
            inSiteMaintenanceLogRef.current.refreshLogs();
        }
        if (dashboardRef.current) {
            dashboardRef.current.refreshDashboard();
        }
    };

    // Add handler for adding maintenance
    const handleAddInSiteMaintenance = () => {
        setIsAddMaintenanceModalOpen(true);
    };

    // Add handlers for transaction accept/reject
    const handleAcceptTransaction = (transaction) => {
        // You can implement accept logic here
        // For now, just show an alert - you can expand this later
        alert(`Accept transaction ${transaction.id} - Feature to be implemented`);
        console.log('Accepting transaction:', transaction);
    };

    const handleRejectTransaction = (transaction) => {
        // You can implement reject logic here
        // For now, just show an alert - you can expand this later
        alert(`Reject transaction ${transaction.id} - Feature to be implemented`);
        console.log('Rejecting transaction:', transaction);
    };

    const handleUpdateTransaction = (transaction) => {
        // Implement update transaction logic
        console.log('Updating transaction:', transaction);
        alert(`Update transaction ${transaction.id} - Feature to be implemented`);
    };

    // Add verifyBatchNumber function
    // Updated verifyBatchNumber function to accept batch number as parameter
    const verifyBatchNumber = async (batchNumber = null) => {
        // Use the passed parameter or fall back to state value
        const batchToVerify = batchNumber || newTransaction.batchNumber;

        if (!batchToVerify) {
            showError("Please enter a batch number to verify");
            return;
        }

        setIsVerifyingBatch(true);
        try {
            const response = await axiosInstance.get(
                `http://localhost:8080/api/v1/transactions/batch/${batchToVerify}`
            );

            if (response.data && response.data.id) {
                // Transaction found
                let transactionStatus = response.data.status;
                let isPendingTransaction = transactionStatus === "PENDING";

                if (!isPendingTransaction) {
                    setBatchVerificationResult({
                        found: true,
                        error: true,
                        transaction: response.data,
                        message: `Transaction found but it's already ${transactionStatus}. Only PENDING transactions can be linked.`
                    });
                } else {
                    setBatchVerificationResult({
                        found: true,
                        transaction: response.data,
                        message: "Transaction found! It will be linked to this consumable record."
                    });
                }
            }
        } catch (error) {
            console.error("Error verifying batch number:", error);

            if (error.response && error.response.status === 404) {
                // 404 is expected when no transaction is found
                setBatchVerificationResult({
                    found: false,
                    message: "No transaction found with this batch number. You can proceed with creating a new transaction."
                });
            } else {
                setBatchVerificationResult({
                    found: false,
                    error: true,
                    message: "Error verifying batch number: " + (error.response?.data?.message || error.message)
                });
            }
        } finally {
            setIsVerifyingBatch(false);
        }
    };

    const handleViewFullDetails = () => {
        navigate(`../ViewEquipment/${params.EquipmentID}`);
    };

    // Fetch all sites
    const fetchAllSites = async () => {
        try {
            const response = await axiosInstance.get('http://localhost:8080/api/v1/site');
            setSites(response.data);
        } catch (error) {
            console.error("Error fetching sites:", error);
        }
    };

    // Fetch warehouses by site
    const fetchWarehousesBySite = async (siteId) => {
        try {
            const response = await axiosInstance.get(`http://localhost:8080/api/v1/site/${siteId}/warehouses`);
            setWarehouses(response.data);
        } catch (error) {
            console.error("Error fetching warehouses for site:", error);
        }
    };

    // Effect to fetch warehouses when site changes
    useEffect(() => {
        if (selectedSite) {
            fetchWarehousesBySite(selectedSite);
            // Reset warehouse selection when site changes
            setNewTransaction(prev => ({
                ...prev,
                senderId: ""
            }));
        }
    }, [selectedSite]);

    // Effect to fetch item types when warehouse changes
    useEffect(() => {
        if (newTransaction.senderId) {
            // Reset selections when warehouse changes
            setNewTransaction(prev => {
                const updatedItems = prev.items.map(item => ({
                    ...item,
                    itemType: { id: "" },
                    quantity: "1"
                }));

                return {
                    ...prev,
                    items: updatedItems
                };
            });

            setFilteredItemTypes([]);

            // Fetch all item types for the selected warehouse
            axiosInstance.get(`http://localhost:8080/api/v1/itemTypes`)
                .then(response => {
                    setAllItemTypes(response.data);
                    setFilteredItemTypes(response.data); // Initially show all item types
                })
                .catch(error => console.error("Error fetching item types:", error));

            // Fetch categories for the selected warehouse
            axiosInstance.get(`http://localhost:8080/api/v1/warehouses/itemCategories/${newTransaction.senderId}`)
                .then(response => {
                    setCategories(response.data);
                })
                .catch(error => console.error("Error fetching categories:", error));
        }
    }, [newTransaction.senderId]);

    // Reset form when modal is opened
    useEffect(() => {
        if (isAddConsumableModalOpen) {
            setNewTransaction({
                transactionDate: formatDateForInput(new Date()), // Reset to current date/time
                items: [{ itemType: { id: "" }, quantity: "1" }],
                senderType: "WAREHOUSE",
                senderId: "",
                receiverType: "EQUIPMENT",
                receiverId: params.EquipmentID,
                batchNumber: "",
            });

            // Set default site to equipment's site if available
            if (equipmentData?.equipment?.site?.id) {
                setSelectedSite(equipmentData.equipment.site.id);
                // Fetch warehouses for this site
                fetchWarehousesBySite(equipmentData.equipment.site.id);
            }
        }
    }, [isAddConsumableModalOpen, params.EquipmentID, equipmentData]);

    if (loading) return <div className="loading-spinner">Loading...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;

    return (
        <div className="equipment-details-container">

            {/* Equipment Summary Section */}
            {/* Equipment Summary Section */}

            {/*<h1 className="SectionHeaderLabel">Equipment Details</h1>*/}

            {/* Equipment Card - styled like warehouse card */}

            <div className="equipment-card-header">
                <div className="left-side">
                    <img
                        src={previewImage || equipmentData?.imageUrl}
                        alt="Equipment"
                        className="equipment-image"
                        onError={(e) => { e.target.src = previewImage; }}
                    />
                </div>
                <div className="center-content">
                    <div className="label">EQUIPMENT NAME</div>
                    <div className="value">{equipmentData?.name || "Equipment"}</div>
                </div>
                <div className="right-side">
                    <button className="info-button-eq" onClick={handleViewFullDetails}>
                        <FaInfoCircle />
                    </button>
                    <button className="delete-button-eq" title="Delete Equipment">
                        <RiDeleteBin6Line />
                    </button>
                </div>
            </div>
            {/* Tab Navigation */}

            <div className="new-tabs-container">

                <div className="new-tabs-header">
                    <button
                        className={`new-tab-button ${activeTab === "dashboard" ? "active" : ""}`}
                        onClick={() => setActiveTab("dashboard")}
                    >
                        <FaTachometerAlt /> Dashboard
                    </button>
                    <button
                        className={`new-tab-button ${activeTab === "consumables" ? "active" : ""}`}
                        onClick={() => setActiveTab("consumables")}
                    >
                        <FaBoxOpen /> Consumables
                    </button>
                    <button
                        className={`new-tab-button ${activeTab === "sarky" ? "active" : ""}`}
                        onClick={() => setActiveTab("sarky")}
                    >
                        <FaCalendarAlt /> Sarky Management
                    </button>
                    <button
                        className={`new-tab-button ${activeTab === "maintenance" ? "active" : ""}`}
                        onClick={() => setActiveTab("maintenance")}
                    >
                        <FaWrench /> In-Site Maintenance
                    </button>
                    <button
                        className={`new-tab-button ${activeTab === "transactions" ? "active" : ""}`}
                        onClick={() => setActiveTab("transactions")}
                    >
                        <FaTools /> All Transactions
                    </button>
                </div>
                {/* Tab Content */}
                <div className="tab-content">
                    {activeTab === "dashboard" && (
                        <div className="tab-panel">
                            <div className="panel-header">
                                <h2 className="panel-title">Equipment Dashboard</h2>
                            </div>
                            <div className="tab-content-container">
                                <EquipmentDashboard
                                    ref={dashboardRef}
                                    equipmentId={params.EquipmentID}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === "consumables" && (
                        <div className="tab-panel">
                            <div className="panel-header">
                                <h2 className="panel-title">Consumables Inventory</h2>
                            </div>
                            <div className="tab-content-container">
                                <EquipmentConsumablesInventory
                                    ref={consumablesInventoryRef}
                                    equipmentId={params.EquipmentID}
                                    onAddClick={() => setIsAddConsumableModalOpen(true)}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === "sarky" && (
                        <div className="tab-panel">
                            <div className="panel-header">
                                <h2 className="panel-title">Sarky Management</h2>
                                <div className="panel-actions">
                                    <button
                                        className="help-button"
                                        onClick={() => {
                                            alert(`Sarky Management Help:
• Select month and year to view sarky records
• Click "Generate Monthly Sarky" to create entries for the entire month
• Fill in Work Type, Hours, and Driver for each day using inline editing
• Click "Save" for individual entries or "Save All" for bulk saving
• Green entries are completed, blue entries are drafts
• Range entries (orange) are read-only and part of multi-day ranges`);
                                        }}
                                        title="Help & Instructions"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                            <circle cx="12" cy="12" r="10"/>
                                            <path d="M9,9a3,3,0,0,1,5.5-1.5"/>
                                            <path d="M12,17.02v.01"/>
                                        </svg>
                                        Help
                                    </button>

                                    <button
                                        className="export-button"
                                        onClick={async () => {
                                            try {
                                                // Export sarky data for the current month
                                                const month = new Date().getMonth();
                                                const year = new Date().getFullYear();

                                                const singleResponse = await sarkyService.getByEquipment(params.EquipmentID);
                                                const rangeResponse = await sarkyService.getRangeByEquipment(params.EquipmentID);

                                                let exportData = [];

                                                // Process single entries
                                                if (singleResponse.data) {
                                                    singleResponse.data.forEach(sarky => {
                                                        const date = new Date(sarky.date);
                                                        if (date.getMonth() === month && date.getFullYear() === year) {
                                                            exportData.push({
                                                                date: sarky.date,
                                                                type: 'Single Day',
                                                                workType: sarky.workType?.name || 'Unknown',
                                                                hours: sarky.workedHours,
                                                                driver: sarky.driverName,
                                                                status: 'Completed'
                                                            });
                                                        }
                                                    });
                                                }

                                                // Process range entries
                                                if (rangeResponse.data) {
                                                    rangeResponse.data.forEach(range => {
                                                        if (range.workEntries) {
                                                            range.workEntries.forEach(entry => {
                                                                const date = new Date(entry.date);
                                                                if (date.getMonth() === month && date.getFullYear() === year) {
                                                                    exportData.push({
                                                                        date: entry.date,
                                                                        type: 'Range Entry',
                                                                        workType: entry.workType?.name || 'Unknown',
                                                                        hours: entry.workedHours,
                                                                        driver: entry.driverName,
                                                                        status: range.status || 'Completed'
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    });
                                                }

                                                // Create CSV content
                                                const csvContent = [
                                                    ['Date', 'Type', 'Work Type', 'Hours', 'Driver', 'Status'],
                                                    ...exportData.map(row => [
                                                        row.date, row.type, row.workType, row.hours, row.driver, row.status
                                                    ])
                                                ].map(row => row.join(',')).join('\n');

                                                // Download CSV
                                                const blob = new Blob([csvContent], { type: 'text/csv' });
                                                const url = window.URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `sarky-data-${equipmentData?.name || 'equipment'}-${year}-${month + 1}.csv`;
                                                a.click();
                                                window.URL.revokeObjectURL(url);

                                                showSuccess('Sarky data exported successfully');
                                            } catch (error) {
                                                console.error('Error exporting sarky data:', error);
                                                showError('Failed to export sarky data');
                                            }
                                        }}
                                        title="Export current month's data"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                            <polyline points="7,10 12,15 17,10"/>
                                            <line x1="12" y1="15" x2="12" y2="3"/>
                                        </svg>
                                        Export
                                    </button>
                                </div>
                            </div>
                            <div className="tab-content-container">
                                <SarkyAttendance
                                    ref={sarkyAttendanceRef}
                                    equipmentId={params.EquipmentID}
                                    onSarkyAdded={refreshSarkyLog}
                                    equipmentData={equipmentData}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === "maintenance" && (
                        <div className="tab-panel">
                            <div className="panel-header">
                                <h2 className="panel-title">In-Site Maintenance History</h2>
                            </div>
                            <div className="tab-content-container">
                                <InSiteMaintenanceLog
                                    ref={inSiteMaintenanceLogRef}
                                    equipmentId={params.EquipmentID}
                                    onAddMaintenanceClick={handleAddInSiteMaintenance}
                                    onAddTransactionClick={handleAddTransactionToMaintenance}
                                    showAddButton={false} // Hide floating add button since we have one in header
                                />
                            </div>
                            <button className="add-button-warehouse" onClick={handleAddInSiteMaintenance}>
                                <svg className="plus-icon-warehouse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 5v14M5 12h14"/>
                                </svg>
                            </button>
                        </div>
                    )}

                    {activeTab === "transactions" && (
                        <div className="tab-panel">
                            <div className="panel-header">
                                <h2 className="panel-title">Equipment Transactions</h2>
                            </div>
                            <div className="tab-content-container">
                                <UnifiedTransactionsView
                                    ref={unifiedTransactionsRef}
                                    entityId={params.EquipmentID}
                                    entityType="EQUIPMENT"
                                    onAcceptTransaction={handleAcceptTransaction}
                                    onRejectTransaction={handleRejectTransaction}
                                    onUpdateTransaction={handleUpdateTransaction}
                                />
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Add Consumable Modal */}
            {isAddConsumableModalOpen && (
                <div className="modal-backdrop3">
                    <div className="modal3">
                        <div className="modal-header3">
                            <h2>Add Consumables Transaction</h2>
                            <button className="close-modal3" onClick={() => setIsAddConsumableModalOpen(false)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>

                        <form className="form-transaction" onSubmit={handleSubmit}>
                            {/* Transaction Date - Full Width */}
                            <div className="form-group3 full-width">
                                <label htmlFor="transactionDate">Transaction Date</label>
                                <input
                                    type="datetime-local"
                                    id="transactionDate"
                                    name="transactionDate"
                                    value={newTransaction.transactionDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* Batch Number - Full Width */}
                            <div className="form-group3 full-width">
                                <label htmlFor="batchNumber">Batch Number</label>
                                <div className="batch-input-group">
                                    <input
                                        type="number"
                                        id="batchNumber"
                                        name="batchNumber"
                                        value={newTransaction.batchNumber}
                                        onChange={handleInputChange}
                                        min="1"
                                        placeholder="Enter batch number"
                                        required
                                    />
                                </div>
                                {batchVerificationResult && (
                                    <div className={`batch-verification-result ${batchVerificationResult.found && !batchVerificationResult.error ? 'success' : 'warning'}`}>
                                        <div className="verification-icon">
                                            {batchVerificationResult.found && !batchVerificationResult.error ? (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                                                    <path d="M22 4L12 14.01l-3-3"/>
                                                </svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="10"/>
                                                    <path d="M12 8v4M12 16h.01"/>
                                                </svg>
                                            )}
                                        </div>
                                        <span>{batchVerificationResult.message}</span>
                                    </div>
                                )}
                            </div>

                            {/* Source and Destination */}
                            <div className="form-row3">
                                {/* Site Selection */}
                                <div className="form-group3">
                                    <label htmlFor="site">Source Site</label>
                                    <select
                                        id="site"
                                        value={selectedSite}
                                        onChange={(e) => setSelectedSite(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Site</option>
                                        {sites.map((site) => (
                                            <option key={site.id} value={site.id}>
                                                {site.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Warehouse Selection */}
                                <div className="form-group3">
                                    <label>Source Warehouse</label>
                                    <select
                                        value={newTransaction.senderId}
                                        onChange={(e) => setNewTransaction({
                                            ...newTransaction,
                                            senderId: e.target.value
                                        })}
                                        required
                                        disabled={!selectedSite}
                                    >
                                        <option value="">Select Warehouse</option>
                                        {warehouses.map((warehouse) => (
                                            <option key={warehouse.id} value={warehouse.id}>
                                                {warehouse.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Destination (Fixed) */}
                            <div className="form-group3 full-width">
                                <label>Destination (This Equipment)</label>
                                <input
                                    type="text"
                                    value={equipmentData?.name || "This Equipment"}
                                    disabled
                                    className="disabled-input"
                                />
                            </div>

                            {/* Items Section - Full Width */}
                            <div className="form-group3 full-width">
                                <div className="items-section-header">
                                    <label>Requested Items</label>
                                    <button
                                        type="button"
                                        className="add-item-button"
                                        onClick={addItem}
                                        disabled={!newTransaction.senderId}
                                    >
                                        Add Another Item
                                    </button>
                                </div>

                                {newTransaction.items.map((item, index) => (
                                    <div key={index} className="transaction-item-container">
                                        <div className="transaction-item-header">
                                            <span>Item {index + 1}</span>
                                            {newTransaction.items.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="remove-item-button"
                                                    onClick={() => removeItem(index)}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M18 6L6 18M6 6l12 12"/>
                                                    </svg>
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <div className="form-row3">
                                            <div className="form-group3">
                                                <label>Item Type</label>
                                                <select
                                                    value={item.itemType.id}
                                                    onChange={(e) => handleItemChange(index, 'itemTypeId', e.target.value)}
                                                    required
                                                    disabled={!newTransaction.senderId}
                                                >
                                                    <option value="" disabled>Select Item Type</option>
                                                    {renderItemOptions(index)}
                                                </select>
                                            </div>

                                            <div className="form-group3">
                                                <label>Quantity</label>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                    min="1"
                                                    required
                                                    disabled={!item.itemType.id}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="modal-footer3">
                                <button type="submit" className="submit-button3" disabled={isSubmitting}>
                                    {isSubmitting ? "Processing..." : "Request Consumables"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modals */}
            {isAddMaintenanceModalOpen && (
                <MaintenanceAddModal
                    isOpen={isAddMaintenanceModalOpen}
                    onClose={() => setIsAddMaintenanceModalOpen(false)}
                    equipmentId={params.EquipmentID}
                    onMaintenanceAdded={refreshMaintenanceLog}
                />
            )}

            {isMaintenanceTransactionModalOpen && (
                <MaintenanceTransactionModal
                    isOpen={isMaintenanceTransactionModalOpen}
                    onClose={() => setIsMaintenanceTransactionModalOpen(false)}
                    equipmentId={params.EquipmentID}
                    maintenanceId={selectedMaintenanceId}
                    onTransactionAdded={refreshMaintenanceLog}
                />
            )}
        </div>
    );
};

export default EquipmentDetails;