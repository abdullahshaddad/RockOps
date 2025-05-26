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
        try {
            const response = await fetch('http://localhost:8080/api/v1/job-positions', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch positions');
            }

            const data = await response.json();
            setPositions(data);
        } catch (err) {
            console.error('Error fetching positions:', err);
            setError(err.message || 'Failed to load positions');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPosition = async (formData) => {
        try {
            const response = await fetch('http://localhost:8080/api/v1/job-positions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to add position');
            }

            await fetchPositions();
            setShowAddForm(false);
        } catch (err) {
            console.error('Error adding position:', err);
            setError(err.message || 'Failed to add position');
        }
    };

    const handleEditPosition = async (formData) => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/job-positions/${selectedPosition.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to update position');
            }

            await fetchPositions();
            setShowEditForm(false);
            setSelectedPosition(null);
        } catch (err) {
            console.error('Error updating position:', err);
            setError(err.message || 'Failed to update position');
        }
    };

    const handleDeletePosition = async (id) => {
        if (!window.confirm('Are you sure you want to delete this position?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/v1/positions/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete position');
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
            render: (row) => row.type.replace('_', ' ')
        },
        {
            header: 'Experience Level',
            accessor: 'experienceLevel',
            sortable: true
        },
        {
            header: 'Base Salary',
            accessor: 'baseSalary',
            sortable: true,
            render: (row) => `$${row.baseSalary}`
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

    if (error) {
        return <div className="positions-error">Error: {error}</div>;
    }

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
            />

            {showAddForm && (
                <AddPositionForm
                    isOpen={showAddForm}
                    onClose={() => setShowAddForm(false)}
                    onSubmit={handleAddPosition}
                />
            )}

            {showEditForm && selectedPosition && (
                <EditPositionForm
                    isOpen={showEditForm}
                    onClose={() => {
                        setShowEditForm(false);
                        setSelectedPosition(null);
                    }}
                    onSubmit={handleEditPosition}
                    position={selectedPosition}
                />
            )}
        </div>
    );
};

export default PositionsList;