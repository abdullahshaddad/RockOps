import React, { useState, useEffect } from "react";
import Table from "../../../components/common/OurTable/Table.jsx";
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
                data={parentCategories}
                columns={columns}
                isLoading={loading}
                emptyMessage="No parent categories found"
                actionConfig={actionConfig}
                className="parent-categories-table"
                enablePagination={true}
                enableSorting={true}
                enableFiltering={true}
                itemsPerPage={10}
            />
        </div>
    );
};

export default ParentCategoriesTable;