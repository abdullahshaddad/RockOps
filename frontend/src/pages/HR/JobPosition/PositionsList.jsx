import React, { useEffect, useState } from 'react';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import AddPositionForm from './components/AddPositionForm.jsx';
import EditPositionForm from './components/EditPositionForm.jsx';
import DataTable from '../../../components/common/DataTable/DataTable';
import './PositionsList.scss';

const PositionsList = () => {
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState(null);

    useEffect(() => {
        fetchPositions();
    }, []);

    const fetchPositions = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8080/api/v1/job-positions', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch positions`);
            }

            const data = await response.json();
            setPositions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching positions:', err);
            setError(err.message || 'Failed to load positions');
            setPositions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPosition = async (formData) => {
        try {
            setError(null);
            const response = await fetch('http://localhost:8080/api/v1/job-positions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: Failed to add position`);
            }

            await fetchPositions();
            setShowAddForm(false);
        } catch (err) {
            console.error('Error adding position:', err);
            setError(err.message || 'Failed to add position');
            throw err; // Re-throw to let form handle it
        }
    };

    const handleEditPosition = async (formData) => {
        try {
            setError(null);
            const response = await fetch(`http://localhost:8080/api/v1/job-positions/${selectedPosition.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: Failed to update position`);
            }

            await fetchPositions();
            setShowEditForm(false);
            setSelectedPosition(null);
        } catch (err) {
            console.error('Error updating position:', err);
            setError(err.message || 'Failed to update position');
            throw err; // Re-throw to let form handle it
        }
    };

    const handleDeletePosition = async (id) => {
        if (!window.confirm('Are you sure you want to delete this position?')) {
            return;
        }

        try {
            setError(null);
            // Note: Check if the endpoint should be /job-positions or /positions
            const response = await fetch(`http://localhost:8080/api/v1/job-positions/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: Failed to delete position`);
            }

            await fetchPositions();
        } catch (err) {
            console.error('Error deleting position:', err);
            setError(err.message || 'Failed to delete position');
        }
    };

    const columns = [
        {
            header: 'Position Name',
            accessor: 'positionName',
            sortable: true
        },
        {
            header: 'Department',
            accessor: 'department',
            sortable: true
        },
        {
            header: 'Type',
            accessor: 'type',
            sortable: true,
            render: (row) => row.type?.replace('_', ' ') || 'N/A'
        },
        {
            header: 'Experience Level',
            accessor: 'experienceLevel',
            sortable: true
        },
        {
            header: 'Base Salary (Monthly)',
            accessor: 'baseSalary',
            sortable: true,
            render: (row) => row.baseSalary ? `${Number(row.baseSalary).toLocaleString()}/month` : 'N/A'
        },
        {
            header: 'Reporting To',
            accessor: 'head',
            sortable: true
        },
        {
            header: 'Working Days',
            accessor: 'workingDays',
            sortable: true,
            render: (row) => row.workingDays ? `${row.workingDays}/week` : 'N/A'
        },
        {
            header: 'Working Hours',
            accessor: 'workingHours',
            sortable: true,
            render: (row) => row.workingHours ? `${row.workingHours}h/day` : 'N/A'
        }
    ];

    const actions = [
        {
            label: 'Edit',
            icon: <FiEdit />,
            onClick: (row) => {
                setSelectedPosition(row);
                setShowEditForm(true);
            },
            className: 'primary',
        },
        {
            label: 'Delete',
            icon: <FiTrash2 />,
            className: 'danger',
            onClick: (row) => handleDeletePosition(row.id)
        }
    ];

    return (
        <div className="positions-container">
            <div className="departments-header">
                <h1>Job Positions</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowAddForm(true)}
                >
                    <FiPlus /> Add Position
                </button>
            </div>

            {error && (
                <div className="positions-error">
                    <strong>Error:</strong> {error}
                    <button
                        onClick={() => setError(null)}
                        style={{
                            marginLeft: '10px',
                            background: 'none',
                            border: 'none',
                            color: 'inherit',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        ×
                    </button>
                </div>
            )}

            <DataTable
                data={positions}
                columns={columns}
                actions={actions}
                loading={loading}
                tableTitle="Job Positions"
                showSearch={true}
                showFilters={true}
                filterableColumns={['department', 'type', 'experienceLevel']}
                defaultSortField="positionName"
                defaultSortDirection="asc"
                emptyMessage="No job positions found. Click 'Add Position' to create one."
            />

            {showAddForm && (
                <AddPositionForm
                    isOpen={showAddForm}
                    onClose={() => {
                        setShowAddForm(false);
                        setError(null);
                    }}
                    onSubmit={handleAddPosition}
                />
            )}

            {showEditForm && selectedPosition && (
                <EditPositionForm
                    isOpen={showEditForm}
                    onClose={() => {
                        setShowEditForm(false);
                        setSelectedPosition(null);
                        setError(null);
                    }}
                    onSubmit={handleEditPosition}
                    position={selectedPosition}
                />
            )}
        </div>
    );
};

export default PositionsList;