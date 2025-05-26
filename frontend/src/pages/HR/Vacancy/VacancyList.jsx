import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './VacancyList.scss';
import AddVacancyModal from './AddVacancyModal';
import EditVacancyModal from './EditVacancyModal';
import {FaEdit, FaTrashAlt} from "react-icons/fa";
import { useSnackbar } from '../../../contexts/SnackbarContext';
import { vacancyService } from '../../../services/vacancyService';
import { jobPositionService } from '../../../services/jobPositionService';

const VacancyList = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useSnackbar();
    const [vacancies, setVacancies] = useState([]);
    const [filteredVacancies, setFilteredVacancies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedVacancy, setSelectedVacancy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [jobPositions, setJobPositions] = useState([]);

    // Fetch vacancies data from the API
    const fetchVacancies = async () => {
        try {
            setLoading(true);
            const response = await vacancyService.getAll();
            const data = response.data;
            setVacancies(data);
            setFilteredVacancies(data);
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

    // Filter vacancies based on search term and filters
    useEffect(() => {
        let result = vacancies;

        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            result = result.filter(
                vacancy =>
                    (vacancy.title && vacancy.title.toLowerCase().includes(lowerSearchTerm)) ||
                    (vacancy.description && vacancy.description.toLowerCase().includes(lowerSearchTerm)) ||
                    (vacancy.jobPosition && vacancy.jobPosition.positionName &&
                        vacancy.jobPosition.positionName.toLowerCase().includes(lowerSearchTerm))
            );
        }

        if (statusFilter) {
            result = result.filter(vacancy => vacancy.status === statusFilter);
        }

        if (priorityFilter) {
            result = result.filter(vacancy => vacancy.priority === priorityFilter);
        }

        setFilteredVacancies(result);
    }, [searchTerm, statusFilter, priorityFilter, vacancies]);

    // Handle adding a new vacancy
    const handleAddVacancy = async (newVacancy) => {
        try {
            setLoading(true);
            const response = await vacancyService.create(newVacancy);

            // Refresh the vacancy list
            await fetchVacancies();
            setShowAddModal(false);
            showSuccess('Vacancy created successfully!');

        } catch (error) {
            console.error('Error adding vacancy:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create vacancy';
            setError(errorMessage);
            showError('Failed to create vacancy. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle editing a vacancy
    const handleEditVacancy = async (updatedVacancy) => {
        try {
            setLoading(true);
            const response = await vacancyService.update(selectedVacancy.id, updatedVacancy);

            // Refresh the vacancy list
            await fetchVacancies();
            setShowEditModal(false);
            setSelectedVacancy(null);
            showSuccess('Vacancy updated successfully!');

        } catch (error) {
            console.error('Error updating vacancy:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update vacancy';
            setError(errorMessage);
            showError('Failed to update vacancy. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Delete a vacancy
    const handleDeleteVacancy = async (vacancyId, e) => {
        e.stopPropagation();

        if (!window.confirm('Are you sure you want to delete this vacancy?')) {
            return;
        }

        try {
            setLoading(true);
            await vacancyService.delete(vacancyId);

            // Refresh the vacancy list
            await fetchVacancies();
            showSuccess('Vacancy deleted successfully!');

        } catch (error) {
            console.error('Error deleting vacancy:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete vacancy';
            setError(errorMessage);
            showError('Failed to delete vacancy. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Open edit modal with vacancy data
    const handleEditClick = (vacancy, e) => {
        e.stopPropagation();
        setSelectedVacancy(vacancy);
        setShowEditModal(true);
    };

    // Format date for display (YYYY-MM-DD to DD/MM/YYYY)
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Get status badge class based on status
    const getStatusBadgeClass = (status) => {
        switch (status) {
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
        switch (priority) {
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

    // Navigate to vacancy details page
    const handleRowClick = (vacancyId) => {
        navigate(`/hr/vacancies/${vacancyId}`);
    };

    return (
        <div className="vacancy-container">
            <div className="departments-header">
                <h1>Job Vacancies</h1>
                <button
                    className="primary-button"
                    onClick={() => setShowAddModal(true)}
                >
                    Post New Vacancy
                </button>
            </div>

            <div className="filters-container">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search vacancies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-selects">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="OPEN">Open</option>
                        <option value="CLOSED">Closed</option>
                        <option value="FILLED">Filled</option>
                    </select>

                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                    >
                        <option value="">All Priorities</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="loader"></div>
                    <p>Loading vacancies...</p>
                </div>
            ) : error ? (
                <div className="error-container">
                    <p>Error: {error}</p>
                    <button onClick={fetchVacancies}>Try Again</button>
                </div>
            ) : (
                <>
                    {filteredVacancies.length > 0 ? (
                        <div className="table-container">
                            <table className="vacancies-table">
                                <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Position</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                    <th>Priority</th>
                                    <th>Posted</th>
                                    <th>Closing</th>
                                    <th>Positions</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredVacancies.map(vacancy => (
                                    <tr
                                        key={vacancy.id}
                                        onClick={() => handleRowClick(vacancy.id)}
                                        className="clickable-row"
                                    >
                                        <td className="title-cell">{vacancy.title}</td>
                                        <td>{vacancy.jobPosition ? vacancy.jobPosition.positionName : 'N/A'}</td>
                                        <td>{vacancy.jobPosition ? vacancy.jobPosition.department : 'N/A'}</td>
                                        <td>
                                                <span className={`status-badge ${getStatusBadgeClass(vacancy.status)}`}>
                                                    {vacancy.status}
                                                </span>
                                        </td>
                                        <td>
                                                <span className={`priority-badge ${getPriorityBadgeClass(vacancy.priority)}`}>
                                                    {vacancy.priority || 'MEDIUM'}
                                                </span>
                                        </td>
                                        <td>{formatDate(vacancy.postingDate)}</td>
                                        <td>{formatDate(vacancy.closingDate)}</td>
                                        <td className="center-text">{vacancy.numberOfPositions || 1}</td>
                                        <td className="action-buttons">

                                            <button
                                                className="table-action-button table-edit-button"
                                                title="Edit vacancy"
                                                onClick={(e) => handleEditClick(vacancy, e)}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="table-action-button positions-delete-button"
                                                title="Delete vacancy"
                                                onClick={(e) => handleDeleteVacancy(vacancy.id, e)}
                                            >
                                                <FaTrashAlt />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="no-results">
                            <p>No vacancies found matching your search criteria.</p>
                        </div>
                    )}
                </>
            )}

            {showAddModal && (
                <AddVacancyModal
                    onClose={() => setShowAddModal(false)}
                    onSave={handleAddVacancy}
                    jobPositions={jobPositions}
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
                />
            )}
        </div>
    );
};

export default VacancyList;