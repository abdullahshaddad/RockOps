import React, { useState, useEffect, useRef } from "react";
import DataTable from "../../../components/common/DataTable/DataTable.jsx";
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import Snackbar from "../../../components/common/Snackbar2/Snackbar2.jsx";
import "./WarehouseViewItemTypesTable.scss";

const WarehouseViewItemTypesTable = ({ warehouseId }) => {
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const modalRef = useRef(null);
    const [newItemType, setNewItemType] = useState({
        name: "",
        itemCategory: "",
        minQuantity: 0,
        measuringUnit: "",
        serialNumber: "",
        status: "AVAILABLE",
        comment: ""
    });
    const [categories, setCategories] = useState([]);

    // Snackbar notification states
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('success');

    const [userRole, setUserRole] = useState("");

    // Fetch item types
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            console.log("Fetching item types...");

            try {
                const token = localStorage.getItem("token");
                const response = await fetch("http://localhost:8080/api/v1/itemTypes", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                console.log("Response Status:", response.status);

                if (!response.ok)
                    throw new Error("Failed to fetch data");

                const data = await response.json();
                console.log("Data fetched:", data);
                setTableData(data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    // Get user role
    useEffect(() => {
        try {
            const userInfoString = localStorage.getItem("userInfo");
            if (userInfoString) {
                const userInfo = JSON.parse(userInfoString);
                console.log("userrrrifnooo" + userInfo);
                setUserRole(userInfo.role);
                console.log("roleee" + userInfo.role);
            }
        } catch (error) {
            console.error("Error parsing user info:", error);
        }
    }, []);

    // Fetch categories for dropdown
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch("http://localhost:8080/api/v1/itemCategories/children", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (!response.ok) throw new Error("Failed to fetch categories");
                const data = await response.json();
                console.log("Categories fetched:", data);
                setCategories(data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setIsModalOpen(false);
            }
        };

        if (isModalOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isModalOpen]);

    // Helper function to show notifications
    const showSnackbar = (message, type = 'success') => {
        setNotificationMessage(message);
        setNotificationType(type);
        setShowNotification(true);
    };

    // Define table columns for DataTable
    const columns = [
        {
            header: 'ITEM CATEGORY',
            accessor: 'itemCategory.name',
            sortable: true,
            render: (row) => (
                <span className="category-tag">
                    {row.itemCategory ? row.itemCategory.name : "No Category"}
                </span>
            )
        },
        {
            header: 'ITEM TYPE',
            accessor: 'name',
            sortable: true
        },
        {
            header: 'MIN QUANTITY',
            accessor: 'minQuantity',
            sortable: true
        },
        {
            header: 'UNIT',
            accessor: 'measuringUnit',
            sortable: true
        },
        {
            header: 'SERIAL NUMBER',
            accessor: 'serialNumber',
            sortable: true
        }
    ];

    // Action configuration for DataTable
    const getActions = (row) => {
        if (userRole !== "WAREHOUSE_MANAGER") {
            return [];
        }
        
        return [
            {
                label: 'Edit item type',
                icon: <FaEdit />,
                onClick: (row) => openItemModal(row),
                className: 'primary'
            },
            {
                label: 'Delete item type',
                icon: <FaTrash />,
                onClick: (row) => deleteItemType(row.id),
                className: 'danger'
            }
        ];
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "minQuantity") {
            setNewItemType(prev => ({
                ...prev,
                [name]: parseInt(value, 10) || 0
            }));
        } else {
            setNewItemType(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !newItemType.name ||
            !newItemType.itemCategory ||
            !newItemType.measuringUnit
        ) {
            showSnackbar("Please fill in all required fields.", 'error');
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const requestBody = {
                name: newItemType.name,
                itemCategoryId: newItemType.itemCategory,
                minQuantity: newItemType.minQuantity,
                measuringUnit: newItemType.measuringUnit,
                serialNumber: newItemType.serialNumber,
                status: newItemType.status,
                comment: newItemType.comment
            };

            console.log("Sending request body:", JSON.stringify(requestBody, null, 2));

            let response;
            if (selectedItem) {
                response = await updateItemType(selectedItem.id, requestBody);
            } else {
                response = await fetch("http://localhost:8080/api/v1/itemTypes", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify(requestBody),
                });
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server response:", errorText);
                throw new Error(`Request failed with status: ${response.status}`);
            }

            const updatedItemType = await response.json();

            if (selectedItem) {
                setTableData(prevData =>
                    prevData.map(item => item.id === updatedItemType.id ? updatedItemType : item)
                );
                showSnackbar("Item type updated successfully!");
            } else {
                setTableData(prevData => [...prevData, updatedItemType]);
                showSnackbar("Item type created successfully!");
            }

            setIsModalOpen(false);
            setNewItemType({
                name: "",
                itemCategory: "",
                minQuantity: 0,
                measuringUnit: "",
                serialNumber: "",
                status: "AVAILABLE",
                comment: ""
            });
            setSelectedItem(null);

        } catch (error) {
            console.error("Error saving item type:", error);
            showSnackbar("Failed to save item type. Error: " + error.message, 'error');
        }
    };

    const openItemModal = (item = null) => {
        if (item) {
            setSelectedItem(item);
            setNewItemType({
                name: item.name,
                itemCategory: item.itemCategory ? item.itemCategory.id : "",
                minQuantity: item.minQuantity,
                measuringUnit: item.measuringUnit,
                serialNumber: item.serialNumber,
                status: item.status,
                comment: item.comment || ""
            });
        } else {
            setSelectedItem(null);
            setNewItemType({
                name: "",
                itemCategory: "",
                minQuantity: 0,
                measuringUnit: "",
                serialNumber: "",
                status: "AVAILABLE",
                comment: ""
            });
        }
        setIsModalOpen(true);
    };

    const deleteItemType = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/api/v1/itemTypes/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to delete item type: ${response.status}`);
            }

            setTableData(prevData => prevData.filter(item => item.id !== id));
            showSnackbar("Item type deleted successfully!");

        } catch (error) {
            console.error("Error deleting item type:", error);
            showSnackbar("Failed to delete item type. Error: " + error.message, 'error');
        }
    };

    const updateItemType = async (id, updatedItem) => {
        const token = localStorage.getItem("token");
        return await fetch(`http://localhost:8080/api/v1/itemTypes/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(updatedItem),
        });
    };

    return (
        <div className="warehouse-view">
            {/* Header with count */}
            <div className="header-container">
                <div className="left-section">
                    <h1 className="page-title">Item Types</h1>
                    <div className="item-count">{tableData.length} items</div>
                </div>
            </div>

            {/* DataTable with integrated search and filters */}
            <DataTable
                data={tableData}
                columns={columns}
                loading={loading}
                showSearch={true}
                showFilters={true}
                filterableColumns={columns.filter(col => col.sortable)}
                itemsPerPageOptions={[10, 25, 50, 100]}
                defaultItemsPerPage={15}
                actions={getActions}
                className="item-types-table"
            />

            {/* Add button */}
            {userRole === "WAREHOUSE_MANAGER" && (
                <button className="add-button" onClick={() => openItemModal()}>
                    <FaPlus className="plus-icon" />
                </button>
            )}

            {/* Modal for adding/editing item types */}
            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal" ref={modalRef}>
                        <div className="modal-header">
                            <h2>{selectedItem ? 'Edit Item Type' : 'Add Item Type'}</h2>
                            <button className="close-modal" onClick={() => setIsModalOpen(false)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>

                        <div className="modal-content">
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="name">Item Type Name *</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={newItemType.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="itemCategory">Item Category *</label>
                                        <select
                                            id="itemCategory"
                                            name="itemCategory"
                                            value={newItemType.itemCategory}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="minQuantity">Minimum Quantity</label>
                                        <input
                                            type="number"
                                            id="minQuantity"
                                            name="minQuantity"
                                            value={newItemType.minQuantity}
                                            onChange={handleInputChange}
                                            min="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="measuringUnit">Measuring Unit *</label>
                                        <input
                                            type="text"
                                            id="measuringUnit"
                                            name="measuringUnit"
                                            value={newItemType.measuringUnit}
                                            onChange={handleInputChange}
                                            placeholder="e.g., kg, pieces, liters"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="serialNumber">Serial Number</label>
                                        <input
                                            type="text"
                                            id="serialNumber"
                                            name="serialNumber"
                                            value={newItemType.serialNumber}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="status">Status</label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={newItemType.status}
                                            onChange={handleInputChange}
                                        >
                                            <option value="AVAILABLE">Available</option>
                                            <option value="UNAVAILABLE">Unavailable</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group full-width">
                                        <label htmlFor="comment">Comment</label>
                                        <textarea
                                            id="comment"
                                            name="comment"
                                            value={newItemType.comment}
                                            onChange={handleInputChange}
                                            rows="3"
                                            placeholder="Additional notes about this item type..."
                                        />
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button type="submit" className="submit-button">
                                        {selectedItem ? 'Update Item Type' : 'Add Item Type'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Snackbar for notifications */}
            <Snackbar
                message={notificationMessage}
                type={notificationType}
                isVisible={showNotification}
                onClose={() => setShowNotification(false)}
            />
        </div>
    );
};

export default WarehouseViewItemTypesTable;