import React, { useState, useEffect } from "react";
import Table from "../../../../OurTable/Table.jsx"; // Adjust the import path as needed
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
                console.log("tokennn" + token);
                // Log the actual URL being used
                console.log("Fetching from URL:", `http://localhost:8080/api/v1/itemCategories/children`);

                const response = await fetch(`http://localhost:8080/api/v1/itemCategories/children`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                console.log("Response status:", response.status);

                // If the response is not ok, get the error message
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Error response:", errorText);
                    throw new Error(`Failed to fetch child categories: ${response.status} ${errorText}`);
                }

                const data = await response.json();
                console.log("Child categories data:", data);
                setChildCategories(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching child categories:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchChildCategories();
    }, []);

    // Define table columns
    const columns = [
        {
            id: 'name',
            label: 'CATEGORY',
            width: '200px',
            minWidth: '150px',
            sortable: true,
            filterable: true,
            filterType: 'text'
        },
        {
            id: 'description',
            label: 'DESCRIPTION',
            flexWeight: 2,
            minWidth: '200px',
            sortable: true,
            filterable: true,
            filterType: 'text',
            render: (row) => row.description || 'No description'
        },
        {
            id: 'parentCategory.name',
            label: 'PARENT CATEGORY',
            width: '180px',
            minWidth: '150px',
            sortable: true,
            filterable: true,
            filterType: 'select',
            render: (row) => row.parentCategory ? row.parentCategory.name : "None",
            sortFunction: (a, b) => {
                const aVal = a.parentCategory ? a.parentCategory.name : '';
                const bVal = b.parentCategory ? b.parentCategory.name : '';
                return aVal.localeCompare(bVal);
            }
        }
    ];

    // Action configuration
    const actionConfig = {
        label: 'ACTIONS',
        width: '120px',
        renderActions: (row) => (
            <div className="table-actions">
                <button
                    className="edit-button2"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(row);
                    }}
                    title="Edit category"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </button>
                <button
                    className="delete-button2"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(row.id);
                    }}
                    title="Delete category"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                </button>
            </div>
        )
    };

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

            <Table
                columns={columns}
                data={childCategories}
                isLoading={loading}
                emptyMessage="No child categories found. Try adjusting your search or add a new category"
                actionConfig={actionConfig}
                className="child-categories-table"
                itemsPerPage={10}
                enablePagination={true}
                enableSorting={true}
                enableFiltering={true}
            />
        </div>
    );
};

export default ChildCategoriesTable;