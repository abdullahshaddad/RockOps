import React, { useState, useEffect } from "react";
import DataTable from "../../../components/common/DataTable/DataTable.jsx";
import { FaEdit, FaTrash } from 'react-icons/fa';
import "./WarehouseViewItemCategories.scss";

const ParentCategoriesTable = ({
                                   onEdit,
                                   onDelete
                               }) => {
    const [parentCategories, setParentCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch parent categories directly from the API
    useEffect(() => {
        const fetchParentCategories = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem("token");
                
                if (!token) {
                    throw new Error("No authentication token found");
                }
                
                const response = await fetch(`http://localhost:8080/api/v1/itemCategories/parents`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                // If the response is not ok, get the error message
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Error response:", errorText);
                    throw new Error(`Failed to fetch parent categories: ${response.status} ${errorText}`);
                }

                const data = await response.json();
                setParentCategories(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching parent categories:", error);
                setError(error.message);
                setParentCategories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchParentCategories();
    }, []);

    // Define table columns for DataTable
    const columns = [
        {
            header: 'CATEGORY',
            accessor: 'name',
            sortable: true
        },
        {
            header: 'DESCRIPTION',
            accessor: 'description',
            sortable: true,
            render: (row) => row.description || 'No description'
        }
    ];

    // Action configuration for DataTable
    const actions = [
        {
            label: 'Edit category',
            icon: <FaEdit />,
            onClick: (row) => onEdit(row),
            className: 'primary'
        },
        {
            label: 'Delete category',
            icon: <FaTrash />,
            onClick: (row) => onDelete(row.id),
            className: 'danger'
        }
    ];

    if (error) {
        return (
            <div className="category-table-container">
                <div className="table-header-container">
                    <div className="left-section2">
                        <h2 className="table-section-title">Parent Categories</h2>
                        <div className="item-count2">0 categories</div>
                    </div>
                    <div className="section-description">
                        (A high-level classification used to group related item categories together)
                    </div>
                </div>
                <div className="error-container">
                    <p>Error: {error}</p>
                    <p>Please try again later or contact support.</p>
                </div>
            </div>
        );
    }

    // Add safety check for DataTable component
    try {
        // Simple test to see if DataTable is the issue
        const useSimpleTable = false; // Set to true to test without DataTable
        
        if (useSimpleTable) {
            return (
                <div className="category-table-container">
                    <div className="table-header-container">
                        <div className="left-section2">
                            <h2 className="table-section-title">Parent Categories (Simple)</h2>
                            <div className="item-count2">{parentCategories.length} categories</div>
                        </div>
                        <div className="section-description">
                            (A high-level classification used to group related item categories together)
                        </div>
                    </div>
                    <div style={{ padding: '20px' }}>
                        {loading && <p>Loading parent categories...</p>}
                        {parentCategories.length === 0 && !loading && <p>No parent categories found.</p>}
                        {parentCategories.map((category, index) => (
                            <div key={category.id || index} style={{ padding: '10px', border: '1px solid #ccc', margin: '5px 0' }}>
                                <strong>{category.name}</strong>: {category.description}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div className="category-table-container">
                <div className="table-header-container">
                    <div className="left-section2">
                        <h2 className="table-section-title">Parent Categories</h2>
                        <div className="item-count2">{parentCategories.length} categories</div>
                    </div>
                    <div className="section-description">
                        (A high-level classification used to group related item categories together)
                    </div>
                </div>

                <DataTable
                    data={parentCategories}
                    columns={columns}
                    loading={loading}
                    showSearch={true}
                    showFilters={true}
                    filterableColumns={columns}
                    itemsPerPageOptions={[10, 25, 50]}
                    defaultItemsPerPage={10}
                    actions={actions}
                    className="parent-categories-table"
                />
            </div>
        );
    } catch (renderError) {
        console.error("Error rendering ParentCategoriesTable:", renderError);
        return (
            <div className="category-table-container">
                <div className="table-header-container">
                    <div className="left-section2">
                        <h2 className="table-section-title">Parent Categories</h2>
                        <div className="item-count2">0 categories</div>
                    </div>
                    <div className="section-description">
                        (A high-level classification used to group related item categories together)
                    </div>
                </div>
                <div className="error-container">
                    <p>Error rendering table: {renderError.message}</p>
                    <p>Please refresh the page or contact support.</p>
                </div>
            </div>
        );
    }
};

export default ParentCategoriesTable;