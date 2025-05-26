import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { equipmentService } from '../../../services/equipmentService';
import { useSnackbar } from '../../../contexts/SnackbarContext';
import DataTable from '../../../components/common/DataTable/DataTable';
import './EquipmentTypeManagement.scss';

const EquipmentTypeManagement = () => {
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [deletingType, setDeletingType] = useState(null);
    const confirmTimeoutRef = useRef(null);

    // Use the snackbar context
    const { showSuccess, showError, showInfo, showWarning, showSnackbar, hideSnackbar } = useSnackbar();

    // Fetch all equipment types
    const fetchTypes = async () => {
        try {
            setLoading(true);
            const response = await equipmentService.getAllEquipmentTypes();
            setTypes(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching equipment types:', err);
            setError('Failed to load equipment types');
            showError('Failed to load equipment types. Please try again later.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTypes();

        // Clear any lingering timeouts when component unmounts
        return () => {
            if (confirmTimeoutRef.current) {
                clearTimeout(confirmTimeoutRef.current);
            }
        };
    }, []);

    const handleOpenModal = (type = null) => {
        if (type) {
            setEditingType(type);
            setFormData({
                name: type.name,
                description: type.description || ''
            });
        } else {
            setEditingType(null);
            setFormData({
                name: '',
                description: ''
            });
        }
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingType) {
                await equipmentService.updateEquipmentType(editingType.id, formData);
                showSuccess(`Equipment type "${formData.name}" has been updated successfully`);
            } else {
                await equipmentService.createEquipmentType(formData);
                showSuccess(`Equipment type "${formData.name}" has been added successfully`);
            }

            setShowModal(false);
            fetchTypes(); // Refresh the list
        } catch (err) {
            console.error('Error saving equipment type:', err);
            showError(`Failed to ${editingType ? 'update' : 'add'} equipment type: ${err.response?.data?.message || err.message}`);
        }
    };

    const confirmDelete = (typeId, typeName) => {
        // Store the type to be deleted
        setDeletingType({ id: typeId, name: typeName });

        // Custom message with buttons
        const message = `Are you sure you want to delete "${typeName}"?`;

        // Show confirmation warning
        showWarning(message, 5000);

        // Create action buttons in the DOM
        setTimeout(() => {
            const snackbar = document.querySelector('.global-snackbar');
            if (snackbar) {
                // Create and append action buttons container
                const actionContainer = document.createElement('div');
                actionContainer.className = 'snackbar-actions';

                // Yes button
                const yesButton = document.createElement('button');
                yesButton.innerText = 'YES';
                yesButton.className = 'snackbar-action-button confirm';
                yesButton.onclick = () => {
                    performDelete(typeId, typeName);
                    hideSnackbar();
                };

                // No button
                const noButton = document.createElement('button');
                noButton.innerText = 'NO';
                noButton.className = 'snackbar-action-button cancel';
                noButton.onclick = () => {
                    setDeletingType(null);
                    hideSnackbar();
                };

                actionContainer.appendChild(yesButton);
                actionContainer.appendChild(noButton);
                snackbar.appendChild(actionContainer);
            }
        }, 100);

        // Set a timeout to clear the deletingType state after the snackbar duration
        confirmTimeoutRef.current = setTimeout(() => {
            setDeletingType(null);
        }, 5500);
    };

    const performDelete = async (typeId, typeName) => {
        try {
            await equipmentService.deleteEquipmentType(typeId);
            showSuccess(`Equipment type "${typeName}" has been deleted successfully`);
            fetchTypes(); // Refresh the list
        } catch (err) {
            console.error('Error deleting equipment type:', err);
            showError(`Failed to delete equipment type: ${err.response?.data?.message || err.message}`);
        } finally {
            setDeletingType(null);

            // Clear the timeout since we've handled the action
            if (confirmTimeoutRef.current) {
                clearTimeout(confirmTimeoutRef.current);
                confirmTimeoutRef.current = null;
            }
        }
    };

    const columns = [
        {
            header: 'Name',
            accessor: 'name',
            sortable: true
        },
        {
            header: 'Description',
            accessor: 'description',
            sortable: true
        }
    ];

    const actions = [
        {
            label: 'Edit',
            icon: <FaEdit />,
            onClick: (row) => handleOpenModal(row),
            className: 'primary'
        },
        {
            label: 'Delete',
            icon: <FaTrash />,
            onClick: (row) => confirmDelete(row.id, row.name),
            className: 'danger'
        }
    ];

    if (error) {
        return <div className="equipment-types-error">{error}</div>;
    }

    return (
        <div className="equipment-types-container">
            <div className="equipment-types-header">
                <h1>Equipment Types</h1>
                <button
                    className="equipment-types-add-button"
                    onClick={() => handleOpenModal()}
                >
                    <FaPlus /> Add Equipment Type
                </button>
            </div>

            <DataTable
                data={types}
                columns={columns}
                loading={loading}
                actions={actions}
                tableTitle="Equipment Types List"
                showSearch={true}
                showFilters={true}
                filterableColumns={columns}
            />

            {/* Modal for adding/editing equipment types */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingType ? 'Edit Equipment Type' : 'Add Equipment Type'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="save-button">
                                    {editingType ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EquipmentTypeManagement;