import React, { useState, useEffect } from "react";
import DataTable from "../../../components/common/DataTable/DataTable.jsx";
import { FaEdit, FaTrash } from 'react-icons/fa';
import "./WarehouseViewItemCategories.scss";

const ChildCategoriesTable = ({
                                  onEdit,
                                  onDelete
                              }) => {
    const [childCategories, setChildCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch child categories directly from the API
    useEffect(() => {
        const fetchChildCategories = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem("token");
                
                if (!token) {
                    throw new Error("No authentication token found");
                }
                
                const response = await fetch(`http://localhost:8080/api/v1/itemCategories/children`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                // If the response is not ok, get the error message
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Error response:", errorText);
                    throw new Error(`Failed to fetch child categories: ${response.status} ${errorText}`);
                }

                const data = await response.json();
                setChildCategories(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching child categories:", error);
                setError(error.message);
                setChildCategories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchChildCategories();
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
        },
        {
            header: 'PARENT CATEGORY',
            accessor: 'parentCategory.name',
            sortable: true,
            render: (row) => row.parentCategory ? row.parentCategory.name : "None"
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
                        <h2 className="table-section-title">Child Categories</h2>
                        <div className="item-count2">0 categories</div>
                    </div>
                    <div className="section-description">
                        (A more specific category that falls under a parent category, used to better organize and manage items)
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
                            <h2 className="table-section-title">Child Categories (Simple)</h2>
                            <div className="item-count2">{childCategories.length} categories</div>
                        </div>
                        <div className="section-description">
                            (A more specific category that falls under a parent category, used to better organize and manage items)
                        </div>
                    </div>
                    <div style={{ padding: '20px' }}>
                        {loading && <p>Loading child categories...</p>}
                        {childCategories.length === 0 && !loading && <p>No child categories found.</p>}
                        {childCategories.map((category, index) => (
                            <div key={category.id || index} style={{ padding: '10px', border: '1px solid #ccc', margin: '5px 0' }}>
                                <strong>{category.name}</strong>: {category.description}
                                {category.parentCategory && <p>Parent: {category.parentCategory.name}</p>}
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
                        <h2 className="table-section-title">Child Categories</h2>
                        <div className="item-count2">{childCategories.length} categories</div>
                    </div>
                    <div className="section-description">
                        (A more specific category that falls under a parent category, used to better organize and manage items)
                    </div>
                </div>

                <DataTable
                    data={childCategories}
                    columns={columns}
                    loading={loading}
                    showSearch={true}
                    showFilters={true}
                    filterableColumns={columns}
                    itemsPerPageOptions={[10, 25, 50]}
                    defaultItemsPerPage={10}
                    actions={actions}
                    className="child-categories-table"
                />
            </div>
        );
    } catch (renderError) {
        console.error("Error rendering ChildCategoriesTable:", renderError);
        return (
            <div className="category-table-container">
                <div className="table-header-container">
                    <div className="left-section2">
                        <h2 className="table-section-title">Child Categories</h2>
                        <div className="item-count2">0 categories</div>
                    </div>
                    <div className="section-description">
                        (A more specific category that falls under a parent category, used to better organize and manage items)
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

export default ChildCategoriesTable;