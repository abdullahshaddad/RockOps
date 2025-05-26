import React, { useState, useEffect } from "react";
import "./WarehouseViewTransactions.scss";

const UpdatePendingTransactionModal = ({ transaction, isOpen, onClose, onUpdate, warehouseId }) => {
    const [updatedTransaction, setUpdatedTransaction] = useState(transaction || {});
    const [transactionRole, setTransactionRole] = useState("");
    const [items, setItems] = useState([]);
    const [allSites, setAllSites] = useState([]);
    const [selectedSenderSite, setSelectedSenderSite] = useState("");
    const [selectedReceiverSite, setSelectedReceiverSite] = useState("");
    const [senderOptions, setSenderOptions] = useState([]);
    const [receiverOptions, setReceiverOptions] = useState([]);
    const [entityTypes, setEntityTypes] = useState(["WAREHOUSE", "EQUIPMENT", "MERCHANT", "SUPPLIER"]);
    const [warehouseData, setWarehouseData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showCreateNotification, setShowCreateNotification] = useState(false);

    // Initialize the form when the modal opens
    useEffect(() => {
        if (transaction && isOpen) {
            // Set up basic transaction data
            setUpdatedTransaction({
                ...transaction,
                senderType: transaction.senderType || "",
                senderId: transaction.senderId || "",
                receiverType: transaction.receiverType || "",
                receiverId: transaction.receiverId || "",
                items: transaction.items || [{ itemType: { id: "" }, quantity: 1 }],
                transactionDate: formatDateTimeForInput(transaction.transactionDate),
                batchNumber: transaction.batchNumber || ""
            });

            // Determine transaction role based on warehouseId
            if (transaction.senderId === warehouseId) {
                setTransactionRole("sender");
                if (transaction.receiverId) {
                    fetchEntitySite(transaction.receiverType, transaction.receiverId).then(siteId => {
                        if (siteId) {
                            setSelectedReceiverSite(siteId);
                        }
                    });
                }
            } else if (transaction.receiverId === warehouseId) {
                setTransactionRole("receiver");
                if (transaction.senderId) {
                    fetchEntitySite(transaction.senderType, transaction.senderId).then(siteId => {
                        if (siteId) {
                            setSelectedSenderSite(siteId);
                        }
                    });
                }
            }

            // Fetch dependent data
            fetchWarehouseData();
            fetchAvailableItems();
            fetchAllSites();
        }
    }, [transaction, isOpen, warehouseId]);

    // Fetch site options when transaction loads
    useEffect(() => {
        if (selectedSenderSite && transactionRole === "receiver") {
            fetchEntitiesBySiteAndType(selectedSenderSite, updatedTransaction.senderType)
                .then(entities => {
                    setSenderOptions(entities);
                });
        }
    }, [selectedSenderSite, updatedTransaction.senderType, transactionRole]);

    useEffect(() => {
        if (selectedReceiverSite && transactionRole === "sender") {
            fetchEntitiesBySiteAndType(selectedReceiverSite, updatedTransaction.receiverType)
                .then(entities => {
                    setReceiverOptions(entities);
                });
        }
    }, [selectedReceiverSite, updatedTransaction.receiverType, transactionRole]);

    // Format date-time for input fields
    const formatDateTimeForInput = (dateTimeString) => {
        if (!dateTimeString) return "";
        const date = new Date(dateTimeString);
        return date.toISOString().slice(0, 16);
    };

    // Fetch entity's site
    const fetchEntitySite = async (entityType, entityId) => {
        if (!entityType || !entityId) return null;
        try {
            const token = localStorage.getItem("token");
            let endpoint;

            if (entityType === "WAREHOUSE") {
                endpoint = `http://localhost:8080/api/v1/warehouses/${entityId}`;
            } else if (entityType === "EQUIPMENT") {
                endpoint = `http://localhost:8080/equipment/${entityId}`;
            } else {
                endpoint = `http://localhost:8080/api/v1/${entityType.toLowerCase()}s/${entityId}`;
            }

            const response = await fetch(endpoint, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.siteId || null;
            }
            return null;
        } catch (error) {
            console.error(`Failed to fetch entity site:`, error);
            return null;
        }
    };

    // Fetch warehouse data
    const fetchWarehouseData = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/api/v1/warehouses/${warehouseId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setWarehouseData(data);
            }
        } catch (error) {
            console.error("Failed to fetch warehouse data:", error);
        }
    };

    // Fetch available items in the warehouse
    const fetchAvailableItems = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/api/v1/items/warehouse/${warehouseId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setItems(data);
            }
        } catch (error) {
            console.error("Failed to fetch warehouse items:", error);
        }
    };

    // Fetch all sites
    const fetchAllSites = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/api/v1/site`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAllSites(data);
            }
        } catch (error) {
            console.error("Failed to fetch sites:", error);
        }
    };

    // Fetch entities by site and type
    const fetchEntitiesBySiteAndType = async (siteId, entityType) => {
        if (!siteId || !entityType) return [];

        try {
            const token = localStorage.getItem("token");
            let endpoint;

            if (entityType === "WAREHOUSE") {
                endpoint = `http://localhost:8080/api/v1/warehouses/site/${siteId}`;
            } else if (entityType === "EQUIPMENT") {
                endpoint = `http://localhost:8080/equipment/site/${siteId}`;
            } else {
                endpoint = `http://localhost:8080/api/v1/${entityType.toLowerCase()}s/site/${siteId}`;
            }

            const response = await fetch(endpoint, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                return await response.json();
            }
            return [];
        } catch (error) {
            console.error(`Failed to fetch ${entityType} entities:`, error);
            return [];
        }
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedTransaction(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle role change (sender/receiver)
    const handleRoleChange = (e) => {
        const role = e.target.value;
        setTransactionRole(role);

        // Reset dependent values
        if (role === "sender") {
            setSelectedReceiverSite("");
            setUpdatedTransaction(prev => ({
                ...prev,
                receiverType: "",
                receiverId: ""
            }));
        } else {
            setSelectedSenderSite("");
            setUpdatedTransaction(prev => ({
                ...prev,
                senderType: "",
                senderId: ""
            }));
        }
    };

    // Handle sender site change
    const handleSenderSiteChange = (e) => {
        const siteId = e.target.value;
        setSelectedSenderSite(siteId);
        setSenderOptions([]);
        setUpdatedTransaction(prev => ({
            ...prev,
            senderType: "",
            senderId: ""
        }));
    };

    // Handle receiver site change
    const handleReceiverSiteChange = (e) => {
        const siteId = e.target.value;
        setSelectedReceiverSite(siteId);
        setReceiverOptions([]);
        setUpdatedTransaction(prev => ({
            ...prev,
            receiverType: "",
            receiverId: ""
        }));
    };

    // Handle sender type change
    const handleSenderTypeChange = (e) => {
        const senderType = e.target.value;
        setUpdatedTransaction(prev => ({
            ...prev,
            senderType,
            senderId: ""
        }));

        if (selectedSenderSite) {
            fetchEntitiesBySiteAndType(selectedSenderSite, senderType)
                .then(entities => {
                    setSenderOptions(entities);
                });
        }
    };

    // Handle receiver type change
    const handleReceiverTypeChange = (e) => {
        const receiverType = e.target.value;
        setUpdatedTransaction(prev => ({
            ...prev,
            receiverType,
            receiverId: ""
        }));

        if (selectedReceiverSite) {
            fetchEntitiesBySiteAndType(selectedReceiverSite, receiverType)
                .then(entities => {
                    setReceiverOptions(entities);
                });
        }
    };

    // Handle item change
    const handleItemChange = (index, field, value) => {
        const newItems = [...updatedTransaction.items];

        if (field === 'itemTypeId') {
            // Find the item type from available items
            const itemType = items.find(item => item.itemType.id === value)?.itemType || { id: value };
            newItems[index] = {
                ...newItems[index],
                itemType
            };
        } else {
            newItems[index] = {
                ...newItems[index],
                [field]: value
            };
        }

        setUpdatedTransaction(prev => ({
            ...prev,
            items: newItems
        }));
    };

    // Add new item to transaction
    const addItem = () => {
        setUpdatedTransaction(prev => ({
            ...prev,
            items: [...prev.items, { itemType: { id: "" }, quantity: 1 }]
        }));
    };

    // Remove item from transaction
    const removeItem = (index) => {
        const newItems = [...updatedTransaction.items];
        newItems.splice(index, 1);
        setUpdatedTransaction(prev => ({
            ...prev,
            items: newItems
        }));
    };

    // Call the API to update the transaction
    const updateTransactionAPI = async (transactionData) => {
        try {
            const token = localStorage.getItem("token");
            const username = localStorage.getItem("username") || "system";

            // Format items for API
            const items = transactionData.items.map(item => ({
                itemTypeId: item.itemType.id,
                quantity: parseInt(item.quantity)
            }));

            // Prepare payload
            const payload = {
                senderType: transactionData.senderType,
                senderId: transactionData.senderId,
                receiverType: transactionData.receiverType,
                receiverId: transactionData.receiverId,
                items: items,
                transactionDate: transactionData.transactionDate,
                batchNumber: parseInt(transactionData.batchNumber),
                username: username
            };

            console.log("Sending update payload:", payload);

            const response = await fetch(`http://localhost:8080/api/v1/transactions/${transactionData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update transaction");
            }

            setShowCreateNotification(true);
            setTimeout(() => {
                setShowCreateNotification(false);
            }, 3000);

            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    };

    // Handle form submission
    // Handle form submission
    const handleUpdateTransaction = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");


        let username = "system";
        const userInfoString = localStorage.getItem('userInfo');

        if (userInfoString) {
            try {
                const userInfo = JSON.parse(userInfoString);
                if (userInfo.username) {
                    username = userInfo.username;
                }
            } catch (error) {
                console.error("Error parsing user info:", error);
            }
        }

        try {
            // Prepare data for API
            const transactionData = {
                ...updatedTransaction,
                id: transaction.id,
                status: updatedTransaction.status || transaction.status,
                // Set correct sender/receiver based on role
                senderId: transactionRole === "sender" ? warehouseId : updatedTransaction.senderId,
                senderType: transactionRole === "sender" ? "WAREHOUSE" : updatedTransaction.senderType,
                receiverId: transactionRole === "receiver" ? warehouseId : updatedTransaction.receiverId,
                receiverType: transactionRole === "receiver" ? "WAREHOUSE" : updatedTransaction.receiverType,
                username : username
            };

            // Call the API - renamed the variable to avoid conflict with state
            const updatedTransactionResponse = await updateTransactionAPI(transactionData);

            // Notify parent component of successful update
            if (onUpdate) {
                onUpdate(updatedTransactionResponse);
            }

            onClose();
        } catch (error) {
            setError(error.message || "Failed to update transaction");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop3">
            <div className="modal3">
                <div className="modal-header3">
                    <h2>Update Transaction</h2>
                    <button className="close-modal3" onClick={onClose}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12" y2="16"/>
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                <form className="form-transaction" onSubmit={handleUpdateTransaction}>
                    {/* Warehouse Role Selection - Full Width */}
                    <div className="form-group3 full-width">
                        <label>Warehouse Role</label>
                        <div className="radio-group">
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="warehouseRole"
                                    value="sender"
                                    checked={transactionRole === "sender"}
                                    onChange={handleRoleChange}
                                />
                                Sender
                            </label>
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="warehouseRole"
                                    value="receiver"
                                    checked={transactionRole === "receiver"}
                                    onChange={handleRoleChange}
                                />
                                Receiver
                            </label>
                        </div>
                    </div>

                    {/* Transaction Date - Full Width */}
                    <div className="form-group3 full-width">
                        <label htmlFor="transactionDate">Transaction Date</label>
                        <input
                            type="datetime-local"
                            id="transactionDate"
                            name="transactionDate"
                            value={updatedTransaction.transactionDate}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {/* Items Section - Full Width */}
                    <div className="form-group3 full-width">
                        <div className="items-section-header">
                            <label>Transaction Items</label>
                            <button
                                type="button"
                                className="add-item-button"
                                onClick={addItem}
                            >
                                Add Another Item
                            </button>
                        </div>

                        {updatedTransaction.items.map((item, index) => (
                            <div key={index} className="transaction-item-container">
                                <div className="transaction-item-header">
                                    <span>Item {index + 1}</span>
                                    {updatedTransaction.items.length > 1 && (
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
                                            value={item.itemType?.id || ""}
                                            onChange={(e) => handleItemChange(index, 'itemTypeId', e.target.value)}
                                            required
                                        >
                                            <option value="" disabled>Select Item Type</option>
                                            {console.log("items" + items)}
                                            {
                                                items
                                                .filter(warehouseItem => {
                                                    // If role is sender, show only items with status IN_WAREHOUSE
                                                    return transactionRole !== "sender" || warehouseItem.itemStatus === "IN_WAREHOUSE";
                                                })
                                                .map((warehouseItem) => (
                                                    <option key={warehouseItem.id} value={warehouseItem.itemType.id}>
                                                        {warehouseItem.itemType.name} {transactionRole === "sender" ? `(${warehouseItem.quantity} available)` : ""}
                                                    </option>
                                                ))}
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
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Batch Number - Full Width */}
                    <div className="form-group3 full-width">
                        <label htmlFor="batchNumber">Batch Number</label>
                        <input
                            type="number"
                            id="batchNumber"
                            name="batchNumber"
                            value={updatedTransaction.batchNumber}
                            onChange={handleInputChange}
                            min="1"
                            placeholder="Enter batch number"
                            required
                        />
                    </div>

                    {/* Conditional based on warehouse role */}
                    {transactionRole === "sender" ? (
                        <>
                            {/* When warehouse is sender */}
                            <div className="form-row3">
                                <div className="form-group3">
                                    <label>Source (Fixed)</label>
                                    <input
                                        type="text"
                                        value={warehouseData.name}
                                        disabled
                                        className="disabled-input"
                                    />
                                </div>

                                {/* Site Selection First */}
                                <div className="form-group3">
                                    <label htmlFor="receiverSite">Destination Site</label>
                                    <select
                                        id="receiverSite"
                                        value={selectedReceiverSite}
                                        onChange={handleReceiverSiteChange}
                                        required
                                    >
                                        <option value="" disabled>Select Site</option>
                                        {allSites.map((site) => (
                                            <option key={site.id} value={site.id}>
                                                {site.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Entity Type Selection (only shown after site is selected) */}
                            {selectedReceiverSite && (
                                <div className="form-group3 full-width">
                                    <label htmlFor="receiverType">Destination Type</label>
                                    <select
                                        id="receiverType"
                                        name="receiverType"
                                        value={updatedTransaction.receiverType}
                                        onChange={handleReceiverTypeChange}
                                        required
                                    >
                                        <option value="" disabled>Select Type</option>
                                        {entityTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Entity Selection (only shown after type is selected) */}
                            {selectedReceiverSite && updatedTransaction.receiverType && (
                                <div className="form-group3 full-width">
                                    <label htmlFor="receiverId">
                                        Select {updatedTransaction.receiverType.charAt(0).toUpperCase() + updatedTransaction.receiverType.slice(1).toLowerCase()}
                                    </label>
                                    <select
                                        id="receiverId"
                                        name="receiverId"
                                        value={updatedTransaction.receiverId}
                                        onChange={(e) => setUpdatedTransaction({
                                            ...updatedTransaction,
                                            receiverId: e.target.value
                                        })}
                                        required
                                    >
                                        <option value="" disabled>Select {updatedTransaction.receiverType.charAt(0).toUpperCase() + updatedTransaction.receiverType.slice(1).toLowerCase()}</option>
                                        {receiverOptions.length > 0 ? (
                                            receiverOptions.map((entity) => {
                                                // Handle different entity types appropriately
                                                let displayName, entityId;

                                                if (updatedTransaction.receiverType === "EQUIPMENT") {
                                                    // For equipment, access the nested equipment object
                                                    displayName = entity.equipment ? entity.equipment.fullModelName : "No model name available";
                                                    entityId = entity.equipment ? entity.equipment.id : entity.id;
                                                } else {
                                                    // For other types (WAREHOUSE, MERCHANT, etc.), use entity.name
                                                    displayName = entity.name;
                                                    entityId = entity.id;
                                                }

                                                return (
                                                    <option key={entityId} value={entityId}>
                                                        {displayName}
                                                    </option>
                                                );
                                            })
                                        ) : (
                                            <option value="" disabled>No {updatedTransaction.receiverType.toLowerCase()}s available at this site</option>
                                        )}
                                    </select>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* When warehouse is receiver */}
                            <div className="form-row3">
                                {/* Site Selection First */}
                                <div className="form-group3">
                                    <label htmlFor="senderSite">Source Site</label>
                                    <select
                                        id="senderSite"
                                        value={selectedSenderSite}
                                        onChange={handleSenderSiteChange}
                                        required
                                    >
                                        <option value="" disabled>Select Site</option>
                                        {allSites.map((site) => (
                                            <option key={site.id} value={site.id}>
                                                {site.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group3">
                                    <label>Destination (Fixed)</label>
                                    <input
                                        type="text"
                                        value={warehouseData.name}
                                        disabled
                                        className="disabled-input"
                                    />
                                </div>
                            </div>

                            {/* Entity Type Selection (only shown after site is selected) */}
                            {selectedSenderSite && (
                                <div className="form-group3 full-width">
                                    <label htmlFor="senderType">Source Type</label>
                                    <select
                                        id="senderType"
                                        name="senderType"
                                        value={updatedTransaction.senderType}
                                        onChange={handleSenderTypeChange}
                                        required
                                    >
                                        <option value="" disabled>Select Type</option>
                                        {entityTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Entity Selection (only shown after type is selected) */}
                            {selectedSenderSite && updatedTransaction.senderType && (
                                <div className="form-group3 full-width">
                                    <label htmlFor="senderId">
                                        Select {updatedTransaction.senderType.charAt(0).toUpperCase() + updatedTransaction.senderType.slice(1).toLowerCase()}
                                    </label>
                                    <select
                                        id="senderId"
                                        name="senderId"
                                        value={updatedTransaction.senderId}
                                        onChange={(e) => setUpdatedTransaction({
                                            ...updatedTransaction,
                                            senderId: e.target.value
                                        })}
                                        required
                                    >
                                        <option value="" disabled>Select {updatedTransaction.senderType.charAt(0).toUpperCase() + updatedTransaction.senderType.slice(1).toLowerCase()}</option>
                                        {senderOptions.length > 0 ? (
                                            senderOptions.map((entity) => {
                                                // Handle different entity types appropriately
                                                let displayName, entityId;

                                                if (updatedTransaction.senderType === "EQUIPMENT") {
                                                    // For equipment, access the nested equipment object
                                                    displayName = entity.equipment ? entity.equipment.fullModelName : "No model name available";
                                                    entityId = entity.equipment ? entity.equipment.id : entity.id;
                                                } else {
                                                    // For other types (WAREHOUSE, MERCHANT, etc.), use entity.name
                                                    displayName = entity.name;
                                                    entityId = entity.id;
                                                }

                                                return (
                                                    <option key={entityId} value={entityId}>
                                                        {displayName}
                                                    </option>
                                                );
                                            })
                                        ) : (
                                            <option value="" disabled>No {updatedTransaction.senderType.toLowerCase()}s available at this site</option>
                                        )}
                                    </select>
                                </div>
                            )}
                        </>
                    )}

                    <div className="modal-footer3">
                        <button type="button" className="cancel-button3" onClick={onClose}>Cancel</button>
                        <button
                            type="submit"
                            className="submit-button3"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-small"></span>
                                    Updating...
                                </>
                            ) : (
                                "Update Transaction"
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {showCreateNotification && (
                <div className="notification success-notification3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                        <path d="M22 4L12 14.01l-3-3"/>
                    </svg>
                    <span>Transaction Created Successfully</span>
                </div>
            )}
        </div>
    );
};

export default UpdatePendingTransactionModal;