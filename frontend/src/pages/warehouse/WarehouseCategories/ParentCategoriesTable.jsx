import React, { useState, useEffect } from "react";
import Table from "../../../../OurTable/Table.jsx"; // Adjust the import path as needed
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
                // Log the actual URL being used
                console.log("Fetching from URL:", `http://localhost:8080/api/v1/itemCategories/parents`);

                const response = await fetch(`http://localhost:8080/api/v1/itemCategories/parents`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                console.log("Response status:", response.status);

                // If the response is not ok, get the error message
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Error response:", errorText);
                    throw new Error(`Failed to fetch parent categories: ${response.status} ${errorText}`);
                }

                const data = await response.json();
                console.log("Parent categories data:", data);
                setParentCategories(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching parent categories:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchParentCategories();
    }, []);

    // Define table columns
    const columns = [
        {
            id: 'name',
            label: 'CATEGORY',
            width: '250px',
            minWidth: '200px',
            sortable: true,
            filterable: true,
            filterType: 'text'
        },
        {
            id: 'description',
            label: 'DESCRIPTION',
            flexWeight: 2,
            minWidth: '300px',
            sortable: true,
            filterable: true,
            filterType: 'text',
            render: (row) => row.description || 'No description'
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

            <Table
                columns={columns}
                data={parentCategories}
                isLoading={loading}
                emptyMessage="No parent categories found. Try adjusting your search or add a new category"
                actionConfig={actionConfig}
                className="parent-categories-table"
                itemsPerPage={10}
                enablePagination={true}
                enableSorting={true}
                enableFiltering={true}
            />
        </div>
    );
};

export default ParentCategoriesTable;