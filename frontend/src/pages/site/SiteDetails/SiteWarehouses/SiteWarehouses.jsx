import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import DataTable from "../../../../components/common/DataTable/DataTable";
import "./SiteWarehouses.scss";
import { useNavigate } from "react-router";
import SiteSidebar from "../SiteSidebar";
import { useTranslation } from 'react-i18next';
import {useAuth} from "../../../../Contexts/AuthContext";

const SiteWarehouse = () => {
    const { t } = useTranslation();
    const { siteId } = useParams();
    const [warehouseData, setWarehouseData] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for Add Warehouse modal
    const [showAddModal, setShowAddModal] = useState(false);

    // State for warehouse form data
    const [managers, setManagers] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [selectedManager, setSelectedManager] = useState(null);
    const [selectedWorkers, setSelectedWorkers] = useState([]);
    const [selectedWorkerIds, setSelectedWorkerIds] = useState([]);
    const [isWorkersDropdownOpen, setIsWorkersDropdownOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);

    // Ref for handling clicks outside the dropdown
    const workersDropdownRef = useRef(null);
    const { currentUser } = useAuth();

    const isSiteAdmin = currentUser?.role === "SITE_ADMIN";

    // Define columns for DataTable
    const columns = [
        {
            header: 'Warehouse ID',
            accessor: 'warehouseID',
            sortable: true
        },
        {
            header: 'Capacity',
            accessor: 'capacity',
            sortable: true
        },
        {
            header: 'Manager',
            accessor: 'manager',
            sortable: true
        }
    ];

    // Helper function to find and format manager name consistently
    const findManagerName = (warehouse) => {
        // First use the managerName property that comes from the backend's getWarehouseManagerName()
        if (warehouse.managerName) {
            return warehouse.managerName;
        }

        // Fallback method if managerName is not available
        if (warehouse.employees && Array.isArray(warehouse.employees) && warehouse.employees.length > 0) {
            // Try to find a warehouse manager by looking at job position
            const manager = warehouse.employees.find(emp =>
                (emp.jobPosition && emp.jobPosition.positionName &&
                    emp.jobPosition.positionName.toLowerCase() === "warehouse manager") ||
                (emp.position && emp.position.toLowerCase() === "warehouse manager")
            );

            if (manager) {
                return `${manager.firstName} ${manager.lastName}`;
            }
        }

        return "No Manager";
    };

    useEffect(() => {
        fetchWarehouses();
    }, [siteId]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (workersDropdownRef.current && !workersDropdownRef.current.contains(event.target)) {
                setIsWorkersDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchWarehouses = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/api/v1/site/${siteId}/warehouses`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("No warehouses found for this site.");
            }

            const data = await response.json();
            console.log("Fetched warehouses:", data);

            if (Array.isArray(data)) {
                const transformedData = data.map((item) => {
                    console.log("Processing Warehouse:", item.id);
                    console.log("Employees:", item.employees);

                    return {
                        warehouseID: item.id,
                        capacity: `${item.capacity} m²`,
                        manager: findManagerName(item),
                    };
                });

                setWarehouseData(transformedData);
            } else {
                setWarehouseData([]);
            }

            setLoading(false);
        } catch (err) {
            setError(err.message);
            setWarehouseData([]);
            setLoading(false);
        }
    };

    // Function to fetch managers and workers when modal opens
    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem("token");

            // Fetch managers
            const managersResponse = await fetch("http://localhost:8080/api/v1/employees/warehouse-managers", {
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (!managersResponse.ok) throw new Error("Failed to fetch managers");
            const managersData = await managersResponse.json();
            setManagers(managersData);

            // Fetch workers
            const workersResponse = await fetch("http://localhost:8080/api/v1/employees/warehouse-workers", {
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (!workersResponse.ok) throw new Error("Failed to fetch workers");
            const workersData = await workersResponse.json();
            setWorkers(workersData);
        } catch (error) {
            console.error("Error fetching employees:", error);
            setFormError("Failed to load employee data. Please try again.");
        }
    };

    // Handle opening the Add Warehouse modal
    const handleOpenAddModal = () => {
        setShowAddModal(true);
        setSelectedManager(null);
        // Reset worker selection
        setSelectedWorkers([]);
        setSelectedWorkerIds([]);
        setIsWorkersDropdownOpen(false);
        setPreviewImage(null);
        setFormError(null);
        fetchEmployees();
    };

    // Handle closing the Add Warehouse modal
    const handleCloseAddModal = () => {
        setShowAddModal(false);
    };

    // Handle file change for warehouse image
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    // Handle manager selection
    const handleSelectManager = (managerId) => {
        if (!managerId) {
            setSelectedManager(null);
            return;
        }

        // Debug the managerId
        console.log("Selected manager ID:", managerId);
        console.log("Manager ID type:", typeof managerId);

        // The issue is likely here - parsing might be failing if format doesn't match
        // Let's be more careful with the conversion
        try {
            // First try to find with exact match (if it's already a number)
            let manager = managers.find(m => m.id === managerId);

            // If not found, try parsing as integer
            if (!manager) {
                const parsedId = parseInt(managerId, 10);
                console.log("Parsed manager ID:", parsedId);
                manager = managers.find(m => m.id === parsedId);
            }

            // If still not found, try as string comparison
            if (!manager) {
                manager = managers.find(m => String(m.id) === String(managerId));
            }

            console.log("Found manager:", manager);

            if (manager) {
                setSelectedManager(manager);
            } else {
                console.error("Could not find manager with ID:", managerId);
                setSelectedManager(null);
            }
        } catch (error) {
            console.error("Error selecting manager:", error);
            setSelectedManager(null);
        }
    };

    // Toggle workers dropdown
    const toggleWorkersDropdown = () => {
        setIsWorkersDropdownOpen(!isWorkersDropdownOpen);
    };

    // Handle worker selection - modified to support multiple selections
    const handleSelectWorker = (worker) => {
        // Check if worker is already selected
        if (!selectedWorkerIds.includes(worker.id)) {
            setSelectedWorkers([...selectedWorkers, worker]);
            setSelectedWorkerIds([...selectedWorkerIds, worker.id]);
        }
        // Keep dropdown open for selecting multiple workers
    };

    // Handle removing a worker from selection
    const handleRemoveWorker = (workerId) => {
        setSelectedWorkers(selectedWorkers.filter(worker => worker.id !== workerId));
        setSelectedWorkerIds(selectedWorkerIds.filter(id => id !== workerId));
    };

    // Handle form submission
    const handleAddWarehouse = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setFormError(null);

        const formElements = event.currentTarget.elements;
        const token = localStorage.getItem("token");
        const formData = new FormData();

        // Create warehouse data object
        const warehouseData = {
            name: formElements.name.value,
            capacity: parseInt(formElements.capacity.value, 10),
            // No need for site ID as it's coming from the URL
        };

        // Create employees array with all selected personnel
        const employees = [];

        // If manager is selected, add to employees array
        if (selectedManager) {
            employees.push({ id: selectedManager.id });
            console.log("manager: ",selectedManager);
        }

        // Add all selected workers to employees array
        if (selectedWorkers.length > 0) {
            selectedWorkers.forEach(worker => {
                employees.push({ id: worker.id });
            });
        }

        // Only add employees array if it's not empty
        if (employees.length > 0) {
            warehouseData.employees = employees;
        }

        formData.append("warehouseData", JSON.stringify(warehouseData));

        // Add photo if one was selected
        const fileInput = document.getElementById("imageUpload");
        if (fileInput && fileInput.files.length > 0) {
            formData.append("photo", fileInput.files[0]);
        }

        try {
            // Use the site admin endpoint to add warehouse to this specific site
            const response = await fetch(`http://localhost:8080/siteadmin/${siteId}/add-warehouse`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    // Don't set Content-Type header when using FormData
                },
                body: formData,
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            // Close modal and refresh warehouses list
            setShowAddModal(false);
            fetchWarehouses();
        } catch (err) {
            console.error("Failed to add warehouse:", err.message);
            setFormError(`Failed to add warehouse: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="loading-container">{t('site.loadingWarehouses')}</div>;

    return (
        <div className="siteWarehouseContainer">
            <div className="siteSidebar">
                <SiteSidebar siteId={siteId} />
            </div>
            <div className="siteWarehouseContent">
                <div className="headerSection">
                    <h1>{t('site.siteWarehousesReport')}</h1>
                    {isSiteAdmin && (
                        <button className="addWarehouseButton" onClick={handleOpenAddModal}>
                            Add Warehouse
                        </button>
                    )}
                </div>
                {error ? (
                    <div className="error-container">{error}</div>
                ) : (
                    <div className="siteWarehouseTable">
                        <DataTable
                            data={warehouseData}
                            columns={columns}
                            loading={loading}
                            showSearch={true}
                            showFilters={true}
                            filterableColumns={columns}
                            itemsPerPageOptions={[10, 25, 50, 100]}
                            defaultItemsPerPage={10}
                            tableTitle="Warehouses List"
                        />
                    </div>
                )}
            </div>

            {/* Add Warehouse Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="warehouse-modal">
                        <button className="close-modal" onClick={handleCloseAddModal}>×</button>
                        <h2>Add New Warehouse</h2>

                        {formError && <div className="form-error">{formError}</div>}

                        <div className="warehouse-form-container">
                            <div className="profile-section">
                                <label htmlFor="imageUpload" className="image-upload-label">
                                    {previewImage ? (
                                        <img src={previewImage} alt="Warehouse" className="warehouse-image" />
                                    ) : (
                                        <div className="image-placeholder"></div>
                                    )}
                                    <span className="upload-text">{t('common.uploadPhoto')}</span>
                                </label>
                                <input
                                    type="file"
                                    id="imageUpload"
                                    name="photo"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: "none" }}
                                />
                            </div>

                            <div className="add-warehouse-form">
                                <form onSubmit={handleAddWarehouse}>
                                    <div className="form-grid">
                                        <div>
                                            <label>Warehouse Name</label>
                                            <input type="text" name="name" required />
                                        </div>

                                        <div>
                                            <label>Warehouse Capacity (m²)</label>
                                            <input type="number" name="capacity" required min="1" />
                                        </div>

                                        <div>
                                            <label>Warehouse Manager</label>
                                            <select
                                                name="managerId"
                                                onChange={(e) => handleSelectManager(e.target.value)}
                                            >
                                                <option value="">Select Warehouse Manager</option>
                                                {managers.map(manager => (
                                                    <option key={manager.id} value={manager.id}>
                                                        {manager.firstName} {manager.lastName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label>Warehouse Workers</label>
                                            <div className="workers-dropdown" ref={workersDropdownRef}>
                                                <div className="dropdown-header" onClick={toggleWorkersDropdown}>
                                                    <span>Select Workers</span>
                                                    <span className={`dropdown-icon ${isWorkersDropdownOpen ? 'open' : ''}`}>▼</span>
                                                </div>

                                                {isWorkersDropdownOpen && (
                                                    <div className="dropdown-menu">
                                                        {workers
                                                            .filter(worker => !selectedWorkerIds.includes(worker.id))
                                                            .map(worker => (
                                                                <div
                                                                    key={worker.id}
                                                                    className="dropdown-item"
                                                                    onClick={() => handleSelectWorker(worker)}
                                                                >
                                                                    {worker.firstName} {worker.lastName}
                                                                </div>
                                                            ))}
                                                        {workers.filter(worker => !selectedWorkerIds.includes(worker.id)).length === 0 && (
                                                            <div className="dropdown-item">No workers available</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {selectedWorkers.length > 0 && (
                                                <div className="workers-list">
                                                    {selectedWorkers.map(worker => (
                                                        <div key={worker.id} className="worker-chip">
                                                            <span>{worker.firstName} {worker.lastName}</span>
                                                            <span
                                                                className="remove-worker"
                                                                onClick={() => handleRemoveWorker(worker.id)}
                                                            >
                                                                ×
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="button-group">
                                        <button
                                            type="button"
                                            className="cancel-button"
                                            onClick={handleCloseAddModal}
                                            disabled={isSubmitting}
                                        >
                                            {t('common.cancel')}
                                        </button>
                                        <button
                                            type="submit"
                                            className="add-button"
                                            disabled={isSubmitting}
                                        >
                                            Add
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SiteWarehouse;