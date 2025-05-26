// MaintenanceAddModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MaintenanceAddModal.scss';

const MaintenanceAddModal = ({
                                 isOpen,
                                 onClose,
                                 equipmentId,
                                 onMaintenanceAdded
                             }) => {
    const [formData, setFormData] = useState({
        technicianId: '',
        maintenanceDate: '',
        maintenanceType: '',
        description: '',
        status: 'IN_PROGRESS',
        batchNumber: ''
    });

    const [technicians, setTechnicians] = useState([]);
    const [isVerifyingBatch, setIsVerifyingBatch] = useState(false);
    const [batchVerificationResult, setBatchVerificationResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showTransactionForm, setShowTransactionForm] = useState(false);

    // States for transaction creation
    const [sites, setSites] = useState([]);
    const [selectedSite, setSelectedSite] = useState('');
    const [warehouses, setWarehouses] = useState([]);
    const [allItemTypes, setAllItemTypes] = useState([]);
    const [filteredItemTypes, setFilteredItemTypes] = useState([]);
    const [transactionFormData, setTransactionFormData] = useState({
        senderId: '',
        items: [{ itemTypeId: '', quantity: 1 }]
    });

    const token = localStorage.getItem('token');
    const axiosInstance = axios.create({
        headers: { Authorization: `Bearer ${token}` }
    });

    // Format current date to ISO format for datetime-local input
    const formatDateForInput = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Fetch technicians and initialize form
    useEffect(() => {
        if (isOpen) {
            fetchTechnicians();
            fetchSites();
            setFormData({
                ...formData,
                maintenanceDate: formatDateForInput(new Date())
            });
            setBatchVerificationResult(null);
            setShowTransactionForm(false);
        }
    }, [isOpen]);

    // Fetch employees who can be technicians
    const fetchTechnicians = async () => {
        try {
            const response = await axiosInstance.get(
                `http://localhost:8080/api/equipment/${equipmentId}/maintenance/technicians`
            );
            setTechnicians(response.data);
        } catch (error) {
            console.error("Error fetching technicians:", error);
            setError("Failed to load technicians");
        }
    };

    // Fetch sites for transaction form
    const fetchSites = async () => {
        try {
            const response = await axiosInstance.get('http://localhost:8080/api/v1/site');
            setSites(response.data);
        } catch (error) {
            console.error("Error fetching sites:", error);
            setError("Failed to load sites");
        }
    };

    // Fetch warehouses when site is selected
    const fetchWarehousesBySite = async (siteId) => {
        try {
            const response = await axiosInstance.get(`http://localhost:8080/api/v1/site/${siteId}/warehouses`);
            setWarehouses(response.data);
            setTransactionFormData(prev => ({
                ...prev,
                senderId: ''
            }));
        } catch (error) {
            console.error("Error fetching warehouses:", error);
            setError("Failed to load warehouses");
        }
    };

    // Fetch item types when warehouse is selected
    const fetchItemTypes = async () => {
        if (!transactionFormData.senderId) return;

        try {
            const response = await axiosInstance.get(`http://localhost:8080/api/v1/itemTypes`);
            setAllItemTypes(response.data);
            setFilteredItemTypes(response.data);
        } catch (error) {
            console.error("Error fetching item types:", error);
            setError("Failed to load item types");
        }
    };

    // Effect to fetch warehouses when site changes
    useEffect(() => {
        if (selectedSite) {
            fetchWarehousesBySite(selectedSite);
        }
    }, [selectedSite]);

    // Effect to fetch item types when warehouse changes
    useEffect(() => {
        if (transactionFormData.senderId) {
            fetchItemTypes();
        }
    }, [transactionFormData.senderId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Reset batch verification when batch number changes
        if (name === 'batchNumber') {
            setBatchVerificationResult(null);
            setShowTransactionForm(false);
        }
    };

    // Verify batch number
    const verifyBatchNumber = async () => {
        if (!formData.batchNumber) {
            alert("Please enter a batch number to verify");
            return;
        }

        setIsVerifyingBatch(true);
        try {
            const response = await axiosInstance.get(
                `http://localhost:8080/api/v1/transactions/batch/${formData.batchNumber}`
            );

            if (response.data && response.data.id) {
                // Transaction found
                let transactionStatus = response.data.status;
                let isPendingTransaction = transactionStatus === "PENDING";

                if (transactionStatus === "ACCEPTED") {
                    setBatchVerificationResult({
                        found: true,
                        error: true,
                        transaction: response.data,
                        message: `⚠️ Warning: Transaction found but it's already ACCEPTED. Accepted transactions cannot be linked to maintenance records.`
                    });
                    setShowTransactionForm(false);
                } else if (transactionStatus === "REJECTED") {
                    setBatchVerificationResult({
                        found: true,
                        error: true,
                        transaction: response.data,
                        message: `⚠️ Warning: Transaction found but it's already REJECTED. Rejected transactions cannot be linked to maintenance records.`
                    });
                    setShowTransactionForm(false);
                } else if (!isPendingTransaction) {
                    setBatchVerificationResult({
                        found: true,
                        error: true,
                        transaction: response.data,
                        message: `Transaction found but it's already ${transactionStatus}. Only PENDING transactions can be linked.`
                    });
                    setShowTransactionForm(false);
                } else {
                    setBatchVerificationResult({
                        found: true,
                        transaction: response.data,
                        message: "✅ Transaction found! It will be linked to this maintenance record and marked as MAINTENANCE purpose."
                    });
                    setShowTransactionForm(false);
                }
            } else {
                // Transaction not found - show form to create new transaction
                setBatchVerificationResult({
                    found: false,
                    message: "No transaction found with this batch number. You can create a new transaction below."
                });
                setShowTransactionForm(true);
            }
        } catch (error) {
            console.error("Error verifying batch number:", error);

            if (error.response && error.response.status === 404) {
                // 404 is expected when no transaction is found - show form to create new transaction
                setBatchVerificationResult({
                    found: false,
                    message: "No transaction found with this batch number. You can create a new transaction below."
                });
                setShowTransactionForm(true);
            } else {
                setBatchVerificationResult({
                    found: false,
                    error: true,
                    message: "Error verifying batch number: " + (error.response?.data?.message || error.message)
                });
                setShowTransactionForm(false);
            }
        } finally {
            setIsVerifyingBatch(false);
        }
    };

    // Handle site change for transaction form
    const handleSiteChange = (e) => {
        setSelectedSite(e.target.value);
    };

    // Handle warehouse change for transaction form
    const handleWarehouseChange = (e) => {
        setTransactionFormData({
            ...transactionFormData,
            senderId: e.target.value
        });
    };

    // Handle item change in transaction form
    const handleItemChange = (index, field, value) => {
        const updatedItems = [...transactionFormData.items];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value
        };

        setTransactionFormData({
            ...transactionFormData,
            items: updatedItems
        });
    };

    // Add item in transaction form
    const addItem = () => {
        setTransactionFormData({
            ...transactionFormData,
            items: [...transactionFormData.items, { itemTypeId: '', quantity: 1 }]
        });
    };

    // Remove item in transaction form
    const removeItem = (index) => {
        if (transactionFormData.items.length <= 1) return;

        const updatedItems = transactionFormData.items.filter((_, i) => i !== index);
        setTransactionFormData({
            ...transactionFormData,
            items: updatedItems
        });
    };

    // Get available item types (not already selected)
    const getAvailableItemTypes = (currentIndex) => {
        const selectedItemIds = transactionFormData.items
            .filter((_, idx) => idx !== currentIndex && !!_.itemTypeId)
            .map(item => item.itemTypeId);

        return filteredItemTypes.filter(itemType =>
            !selectedItemIds.includes(itemType.id)
        );
    };

    // Create maintenance record and transaction if needed
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Create the maintenance record first
            const maintenanceResponse = await axiosInstance.post(
                `http://localhost:8080/api/equipment/${equipmentId}/maintenance`,
                formData
            );

            console.log("Maintenance response:", maintenanceResponse.data);

            // Check if there was an error with transaction linking
            if (maintenanceResponse.data.status === "transaction_status_invalid") {
                setError(maintenanceResponse.data.error);
                setIsLoading(false);
                return;
            }

            // Extract the ID correctly
            const maintenanceId = maintenanceResponse.data?.maintenance?.id;
            console.log("Maintenance ID:", maintenanceId);

            // If we're creating a new transaction (batch number is provided, form is shown, and warehouse is selected)
            if (formData.batchNumber && showTransactionForm && transactionFormData.senderId) {
                // Validate transaction form data
                if (transactionFormData.items.some(item => !item.itemTypeId || item.quantity < 1)) {
                    throw new Error("Please complete all transaction item fields with valid quantities");
                }

                // Create the transaction and link it to the maintenance record
                await axiosInstance.post(
                    `http://localhost:8080/api/equipment/${equipmentId}/maintenance/${maintenanceId}/transactions`,
                    transactionFormData.items,
                    {
                        params: {
                            senderId: transactionFormData.senderId,
                            senderType: 'WAREHOUSE',
                            batchNumber: formData.batchNumber
                        }
                    }
                );
            } else if (formData.batchNumber && batchVerificationResult?.found && !batchVerificationResult?.error) {
                // If we're linking to an existing transaction, it should already be handled by the backend
                // No additional action needed here as the backend handles the linking
                console.log("Transaction linking handled by backend");
            }

            // Show success message based on response status
            let successMessage = "Maintenance record created successfully";
            if (maintenanceResponse.data.status === "linked") {
                successMessage = "Maintenance record created and linked to existing transaction";
            } else if (maintenanceResponse.data.status === "transaction_not_found") {
                successMessage = "Maintenance record created (no transaction found with provided batch number)";
            }

            // You could show a success toast here if you have a toast system
            console.log(successMessage);

            // Notify parent component and close
            if (onMaintenanceAdded) {
                onMaintenanceAdded();
            }
            onClose();
        } catch (error) {
            console.error("Error adding maintenance:", error);
            
            // Handle different types of errors
            if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else if (error.message) {
                setError(error.message);
            } else {
                setError("Failed to add maintenance record");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="maintenance-modal-backdrop">
            <div className="maintenance-modal">
                <div className="maintenance-modal-header">
                    <h2>Add Maintenance Record</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="maintenance-form">
                    <div className="form-section">
                        <h3>Maintenance Details</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Technician</label>
                                <select
                                    name="technicianId"
                                    value={formData.technicianId}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Technician</option>
                                    {technicians.map(tech => (
                                        <option key={tech.id} value={tech.id}>
                                            {tech.firstName} {tech.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Maintenance Date</label>
                                <input
                                    type="datetime-local"
                                    name="maintenanceDate"
                                    value={formData.maintenanceDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Maintenance Type</label>
                                <input
                                    type="text"
                                    name="maintenanceType"
                                    value={formData.maintenanceType}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., Oil Change, Repair, Inspection"
                                />
                            </div>

                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="SCHEDULED">Scheduled</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="4"
                                placeholder="Describe the maintenance being performed..."
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Parts & Materials Transaction</h3>
                        <p className="section-description">
                            Link this maintenance to a transaction by entering a batch number (optional)
                        </p>

                        <div className="batch-checker">
                            <div className="form-group">
                                <label>Batch Number (optional)</label>
                                <div className="batch-input-group">
                                    <input
                                        type="number"
                                        name="batchNumber"
                                        value={formData.batchNumber}
                                        onChange={handleInputChange}
                                        placeholder="Enter batch number (optional)"
                                    />
                                    <button
                                        type="button"
                                        className="verify-button"
                                        onClick={verifyBatchNumber}
                                        disabled={isVerifyingBatch || !formData.batchNumber}
                                    >
                                        {isVerifyingBatch ? "Checking..." : "Verify"}
                                    </button>
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
                        </div>

                        {/* Transaction creation form - shown only when no transaction is found */}
                        {showTransactionForm && formData.batchNumber && (
                            <div className="transaction-creation-section">
                                <h4>Create New Transaction</h4>
                                <p>This transaction will be created with purpose: MAINTENANCE</p>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Source Site</label>
                                        <select
                                            value={selectedSite}
                                            onChange={handleSiteChange}
                                            required
                                        >
                                            <option value="">Select Site</option>
                                            {sites.map(site => (
                                                <option key={site.id} value={site.id}>
                                                    {site.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Source Warehouse</label>
                                        <select
                                            value={transactionFormData.senderId}
                                            onChange={handleWarehouseChange}
                                            required
                                            disabled={!selectedSite}
                                        >
                                            <option value="">Select Warehouse</option>
                                            {warehouses.map(warehouse => (
                                                <option key={warehouse.id} value={warehouse.id}>
                                                    {warehouse.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <div className="section-header">
                                        <h4>Maintenance Items</h4>
                                        <button
                                            type="button"
                                            className="add-item-button"
                                            onClick={addItem}
                                            disabled={!transactionFormData.senderId}
                                        >
                                            Add Item
                                        </button>
                                    </div>

                                    {transactionFormData.items.map((item, index) => (
                                        <div className="item-row" key={index}>
                                            <div className="item-header">
                                                <span>Item {index + 1}</span>
                                                {transactionFormData.items.length > 1 && (
                                                    <button
                                                        type="button"
                                                        className="remove-item-button"
                                                        onClick={() => removeItem(index)}
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M18 6L6 18M6 6l12 12"/>
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>

                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Item Type</label>
                                                    <select
                                                        value={item.itemTypeId}
                                                        onChange={(e) => handleItemChange(index, 'itemTypeId', e.target.value)}
                                                        required
                                                        disabled={!transactionFormData.senderId}
                                                    >
                                                        <option value="">Select Item Type</option>
                                                        {getAvailableItemTypes(index).map(itemType => (
                                                            <option key={itemType.id} value={itemType.id}>
                                                                {itemType.name} {itemType.unit ? `(${itemType.unit})` : ""}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="form-group quantity-group">
                                                    <label>Quantity</label>
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value, 10) || 1)}
                                                        min="1"
                                                        required
                                                        disabled={!item.itemTypeId}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Adding...' : 'Add Maintenance Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MaintenanceAddModal;