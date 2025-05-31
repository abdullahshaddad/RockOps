import React, { useState, useEffect } from "react";
import Table from "../../../components/common/OurTable/Table.jsx";
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

    // Define table columns for Table component
    const columns = [
        {
            id: 'name',
            label: 'CATEGORY',
            sortable: true,
            filterable: true,
            filterType: 'text'
        },
        {
            id: 'parentCategory',
            label: 'PARENT CATEGORY',
            sortable: true,
            filterable: true,
            filterType: 'text',
            render: (row) => row.parentCategory ? row.parentCategory.name : "None"
        },
        {
            id: 'description',
            label: 'DESCRIPTION',
            sortable: true,
            filterable: true,
            filterType: 'text',
            render: (row) => row.description || 'No description'
        }

    ];

    // Action configuration for Table component using existing CSS classes
    const actionConfig = {
        label: 'ACTIONS',
        width: '120px',
        renderActions: (row) => (
            <div>
                <button
                    className="custom-table-action-button edit"
                    onClick={() => onEdit(row)}
                    title="Edit category"
                >
                    <FaEdit />
                </button>
                <button
                    className="custom-table-action-button delete"
                    onClick={() => onDelete(row.id)}
                    title="Delete category"
                >
                    <FaTrash />
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
                data={childCategories}
                columns={columns}
                isLoading={loading}
                emptyMessage="No child categories found"
                actionConfig={actionConfig}
                className="child-categories-table"
                enablePagination={true}
                enableSorting={true}
                enableFiltering={true}
                itemsPerPage={10}
            />
        </div>
    );
};

export default ChildCategoriesTable;