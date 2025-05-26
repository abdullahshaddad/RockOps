import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './VacancyList.scss';
import AddVacancyModal from './AddVacancyModal';
import EditVacancyModal from './EditVacancyModal';
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { useSnackbar } from '../../../contexts/SnackbarContext';
import { vacancyService } from '../../../services/vacancyService';
import { jobPositionService } from '../../../services/jobPositionService';
import DataTable from '../../../components/common/DataTable/DataTable';

const VacancyList = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useSnackbar();
    const [vacancies, setVacancies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [jobPositions, setJobPositions] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedVacancy, setSelectedVacancy] = useState(null);

    // Fetch vacancies data from the API
    const fetchVacancies = async () => {
        try {
            setLoading(true);
            const response = await vacancyService.getAll();
            const data = Array.isArray(response.data) ? response.data : [];
            setVacancies(data);
            
            // Fetch statistics for each vacancy
            const statsPromises = data.map(vacancy => 
                vacancyService.getStatistics(vacancy.id)
                    .then(res => ({ id: vacancy.id, stats: res.data }))
                    .catch(() => ({ id: vacancy.id, stats: null }))
            );
            
            const statsResults = await Promise.all(statsPromises);
            const statsMap = statsResults.reduce((acc, { id, stats }) => {
                acc[id] = stats;
                return acc;
            }, {});
            
            setStatistics(statsMap);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching vacancies:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to load vacancies';
            setError(errorMessage);
            showError('Failed to load vacancies. Please try again.');
            setLoading(false);
        }
    };

    // Fetch job positions for the dropdown
    const fetchJobPositions = async () => {
        try {
            const response = await jobPositionService.getAll();
            setJobPositions(response.data);
        } catch (error) {
            console.error('Error fetching job positions:', error);
            showError('Failed to load job positions');
        }
    };

    // Load all necessary data when component mounts
    useEffect(() => {
        fetchVacancies();
        fetchJobPositions();
    }, []);

    // Handle adding a new vacancy
    const handleAddVacancy = async (newVacancy) => {
        try {
            setActionLoading(true);
            await vacancyService.create(newVacancy);
            await fetchVacancies();
            setShowAddModal(false);
            showSuccess('Vacancy created successfully!');
        } catch (error) {
            console.error('Error adding vacancy:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create vacancy';
            showError(errorMessage);
        } finally {
            setActionLoading(false);
        }
    };

    // Handle editing a vacancy
    const handleEditVacancy = async (updatedVacancy) => {
        try {
            setActionLoading(true);
            await vacancyService.update(selectedVacancy.id, updatedVacancy);
            await fetchVacancies();
            setShowEditModal(false);
            setSelectedVacancy(null);
            showSuccess('Vacancy updated successfully!');
        } catch (error) {
            console.error('Error updating vacancy:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update vacancy';
            showError(errorMessage);
        } finally {
            setActionLoading(false);
        }
    };

    // Delete a vacancy
    const handleDeleteVacancy = async (vacancy) => {
        if (!window.confirm('Are you sure you want to delete this vacancy?')) {
            return;
        }

        try {
            setActionLoading(true);
            await vacancyService.delete(vacancy.id);
            await fetchVacancies();
            showSuccess('Vacancy deleted successfully!');
        } catch (error) {
            console.error('Error deleting vacancy:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete vacancy';
            showError(errorMessage);
        } finally {
            setActionLoading(false);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get status badge class based on status
    const getStatusBadgeClass = (status) => {
        switch (status?.toUpperCase()) {
            case 'OPEN':
                return 'status-badge-success';
            case 'CLOSED':
                return 'status-badge-danger';
            case 'FILLED':
                return 'status-badge-info';
            default:
                return 'status-badge-warning';
        }
    };

    // Get priority badge class based on priority
    const getPriorityBadgeClass = (priority) => {
        switch (priority?.toUpperCase()) {
            case 'HIGH':
                return 'priority-badge-high';
            case 'MEDIUM':
                return 'priority-badge-medium';
            case 'LOW':
                return 'priority-badge-low';
            default:
                return 'priority-badge-medium';
        }
    };

    // Get vacancy statistics
    const getVacancyStats = (vacancyId) => {
        const stats = statistics[vacancyId];
        if (!stats) return null;
        
        return {
            filled: stats.filledPercentage || 0,
            remaining: stats.remainingPositions || 0,
            total: stats.totalPositions || 0
        };
    };

    // Table columns configuration
    const columns = [
        {
            header: 'Title',
            accessor: 'title',
            sortable: true,
            cellStyle: (row) => ({ fontWeight: 500, color: '#2196F3' })
        },
        {
            header: 'Position',
            accessor: 'jobPosition.positionName',
            sortable: true
        },
        {
            header: 'Department',
            accessor: 'jobPosition.department',
            sortable: true
        },
        {
            header: 'Status',
            accessor: 'status',
            sortable: true,
            render: (row) => (
                <span className={`status-badge ${getStatusBadgeClass(row.status)}`}>
                    {row.status}
                </span>
            )
        },
        {
            header: 'Priority',
            accessor: 'priority',
            sortable: true,
            render: (row) => (
                <span className={`priority-badge ${getPriorityBadgeClass(row.priority)}`}>
                    {row.priority || 'MEDIUM'}
                </span>
            )
        },
        {
            header: 'Posted',
            accessor: 'postingDate',
            sortable: true,
            render: (row) => formatDate(row.postingDate)
        },
        {
            header: 'Closing',
            accessor: 'closingDate',
            sortable: true,
            render: (row) => formatDate(row.closingDate)
        },
        {
            header: 'Positions',
            accessor: 'numberOfPositions',
            sortable: true,
            render: (row) => row.numberOfPositions || 1
        },
        {
            header: 'Progress',
            accessor: 'id',
            sortable: false,
            render: (row) => {
                const stats = getVacancyStats(row.id);
                if (!stats) return null;
                
                return (
                    <div className="progress-container">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{ width: `${stats.filled}%` }}
                            />
                        </div>
                        <span className="progress-text">
                            {stats.remaining}/{stats.total}
                        </span>
                    </div>
                );
            }
        }
    ];

    // Table actions configuration
    const actions = [
        {
            label: 'Edit',
            icon: <FaEdit />,
            onClick: (row) => {
                setSelectedVacancy(row);
                setShowEditModal(true);
            },
            className: 'table-edit-button'
        },
        {
            label: 'Delete',
            icon: <FaTrashAlt />,
            onClick: handleDeleteVacancy,
            className: 'positions-delete-button'
        }
    ];

    return (
        <div className="vacancy-container">
            <div className="departments-header">
                <h1>Job Vacancies</h1>
                <button
                    className="primary-button"
                    onClick={() => setShowAddModal(true)}
                    disabled={actionLoading}
                >
                    {actionLoading ? 'Posting...' : 'Post New Vacancy'}
                </button>
            </div>

            <DataTable
                data={vacancies}
                columns={columns}
                actions={actions}
                loading={loading}
                tableTitle="Vacancies"
                showSearch={true}
                showFilters={true}
                filterableColumns={columns.filter(col => col.sortable)}
                onRowClick={(row) => navigate(`/hr/vacancies/${row.id}`)}
                defaultSortField="postingDate"
                defaultSortDirection="desc"
            />

            {showAddModal && (
                <AddVacancyModal
                    onClose={() => setShowAddModal(false)}
                    onSave={handleAddVacancy}
                    jobPositions={jobPositions}
                    loading={actionLoading}
                />
            )}

            {showEditModal && selectedVacancy && (
                <EditVacancyModal
                    vacancy={selectedVacancy}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedVacancy(null);
                    }}
                    onSave={handleEditVacancy}
                    jobPositions={jobPositions}
                    loading={actionLoading}
                />
            )}
        </div>
    );
};

export default VacancyList;