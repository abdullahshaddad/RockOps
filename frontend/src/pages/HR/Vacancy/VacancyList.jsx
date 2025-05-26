import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaEye, FaPlus } from "react-icons/fa";
import './VacancyList.scss';
import DataTable from '../../../components/common/DataTable/DataTable';
import AddVacancyModal from './AddVacancyModal';
import EditVacancyModal from './EditVacancyModal';

const VacancyList = () => {
    const navigate = useNavigate();
    const [vacancies, setVacancies] = useState([]);
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
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/v1/vacancies', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Get the raw response text first for debugging
            const responseText = await response.text();
            console.log('Raw response length:', responseText.length);

            // Check if response looks like valid JSON
            if (!responseText.trim().startsWith('[') && !responseText.trim().startsWith('{')) {
                throw new Error('Response is not valid JSON format');
            }

            try {
                const data = JSON.parse(responseText);
                console.log('Successfully parsed vacancies:', data?.length || 0, 'items');

                // Ensure data is an array
                const vacanciesArray = Array.isArray(data) ? data : [];
                setVacancies(vacanciesArray);
                setLoading(false);
            } catch (jsonError) {
                console.error('JSON Parse Error:', jsonError);
                console.error('Problematic response excerpt:', responseText.substring(0, 1000));

                // Try to use empty array as fallback
                setVacancies([]);
                setError(`Data format error: ${jsonError.message}. Please check the server response.`);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching vacancies:', error);
            setError(error.message);
            setVacancies([]); // Set empty array on error
            setLoading(false);
        }
    };

    // Fetch job positions for the dropdown
    const fetchJobPositions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/v1/job-positions', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setJobPositions(data);
        } catch (error) {
            console.error('Error fetching job positions:', error);
        }
    };

    // Load all necessary data when component mounts
    useEffect(() => {
        fetchVacancies();
        fetchJobPositions();
    }, []);

    // Format date for display (YYYY-MM-DD to DD/MM/YYYY)
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Get status badge class based on status
    const getStatusBadge = (status) => {
        const statusColors = {
            'OPEN': 'success',
            'CLOSED': 'danger',
            'FILLED': 'info'
        };

        const colorClass = statusColors[status] || 'warning';

        return (
            <span className={`status-badge status-badge--${colorClass}`}>
                {status}
            </span>
        );
    };

    // Get priority badge class based on priority
    const getPriorityBadge = (priority) => {
        const priorityColors = {
            'HIGH': 'danger',
            'MEDIUM': 'warning',
            'LOW': 'success'
        };

        const colorClass = priorityColors[priority] || 'warning';

        return (
            <span className={`priority-badge priority-badge--${colorClass}`}>
                {priority || 'MEDIUM'}
            </span>
        );
    };

    // Handle adding a new vacancy
    const handleAddVacancy = async (newVacancy) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:8080/api/v1/vacancies', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newVacancy)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Refresh the vacancy list
            await fetchVacancies();
            setShowAddModal(false);

        } catch (error) {
            console.error('Error adding vacancy:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle editing a vacancy
    const handleEditVacancy = async (updatedVacancy) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:8080/api/v1/vacancies/${selectedVacancy.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedVacancy)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Refresh the vacancy list
            await fetchVacancies();
            setShowEditModal(false);
            setSelectedVacancy(null);

        } catch (error) {
            console.error('Error updating vacancy:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Delete a vacancy
    const handleDeleteVacancy = async (vacancyId) => {
        if (!window.confirm('Are you sure you want to delete this vacancy?')) {
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:8080/api/v1/vacancies/${vacancyId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Refresh the vacancy list
            await fetchVacancies();

        } catch (error) {
            console.error('Error deleting vacancy:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Open edit modal with vacancy data
    const handleEditClick = (vacancy) => {
        setSelectedVacancy(vacancy);
        setShowEditModal(true);
    };

    // Navigate to vacancy details page
    const handleRowClick = (vacancy) => {
        navigate(`/hr/vacancies/${vacancy.id}`);
    };

    // Navigate to vacancy details page
    const handleViewClick = (vacancy) => {
        navigate(`/hr/vacancies/${vacancy.id}`);
    };

    // Define columns for DataTable
    const columns = [
        {
            header: 'Title',
            accessor: 'title',
            width: '250px',
            render: (vacancy) => (
                <div className="vacancy-title">
                    <div className="vacancy-title__primary">
                        {vacancy.title}
                    </div>
                    <div className="vacancy-title__secondary">
                        {vacancy.description && vacancy.description.length > 50
                            ? `${vacancy.description.substring(0, 50)}...`
                            : vacancy.description || 'No description'}
                    </div>
                </div>
            )
        },
        {
            header: 'Position',
            accessor: 'jobPosition.positionName',
            render: (vacancy) => (
                <div className="vacancy-position">
                    <div className="vacancy-position__title">
                        {vacancy.jobPosition ? vacancy.jobPosition.positionName : 'N/A'}
                    </div>
                    <div className="vacancy-position__department">
                        {vacancy.jobPosition ? vacancy.jobPosition.department : 'N/A'}
                    </div>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            width: '120px',
            render: (vacancy) => getStatusBadge(vacancy.status)
        },
        {
            header: 'Priority',
            accessor: 'priority',
            width: '120px',
            render: (vacancy) => getPriorityBadge(vacancy.priority)
        },
        {
            header: 'Positions Available',
            accessor: 'remainingPositions',
            width: '150px',
            render: (vacancy) => {
                const total = vacancy.numberOfPositions || 1;
                const hired = vacancy.hiredCount || 0;
                const remaining = Math.max(0, total - hired);
                const percentage = total > 0 ? (hired / total) * 100 : 0;

                return (
                    <div className="position-info">
                        <div className="position-info__numbers">
                            <span className="remaining">{remaining}</span>
                            <span className="separator">/</span>
                            <span className="total">{total}</span>
                        </div>
                        <div className="position-info__bar">
                            <div
                                className="position-progress"
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                        <div className="position-info__status">
                            {remaining === 0 ? 'Full' : `${remaining} left`}
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Posted Date',
            accessor: 'postingDate',
            width: '120px',
            render: (vacancy) => formatDate(vacancy.postingDate)
        },
        {
            header: 'Closing Date',
            accessor: 'closingDate',
            width: '120px',
            render: (vacancy) => formatDate(vacancy.closingDate)
        }
    ];

    // Define filterable columns
    const filterableColumns = [
        { header: 'Title', accessor: 'title' },
        { header: 'Description', accessor: 'description' },
        { header: 'Position', accessor: 'jobPosition.positionName' }
    ];

    // Get unique values for filters
    const uniqueStatuses = [...new Set(vacancies.map(v => v.status).filter(Boolean))];
    const uniquePriorities = [...new Set(vacancies.map(v => v.priority).filter(Boolean))];
    const uniqueDepartments = [...new Set(vacancies
        .map(v => v.jobPosition?.department)
        .filter(Boolean))];

    // Define custom filters
    const customFilters = [
        {
            label: 'Status',
            component: (
                <select className="filter-select">
                    <option value="">All Statuses</option>
                    {uniqueStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            )
        },
        {
            label: 'Priority',
            component: (
                <select className="filter-select">
                    <option value="">All Priorities</option>
                    {uniquePriorities.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                    ))}
                </select>
            )
        },
        {
            label: 'Department',
            component: (
                <select className="filter-select">
                    <option value="">All Departments</option>
                    {uniqueDepartments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                    ))}
                </select>
            )
        }
    ];

    // Define actions for each row
    const actions = [
        {
            label: 'View Details',
            icon: <FaEye />,
            className: 'primary',
            onClick: (vacancy) => handleViewClick(vacancy)
        },
        {
            label: 'Edit',
            icon: <FaEdit />,
            className: 'warning',
            onClick: (vacancy) => handleEditClick(vacancy)
        },
        {
            label: 'Delete',
            icon: <FaTrashAlt />,
            className: 'danger',
            onClick: (vacancy) => handleDeleteVacancy(vacancy.id)
        }
    ];

    // If there's an error fetching data and not loading
    if (error && !loading) {
        return (
            <div className="error-container">
                <p>Error: {error}</p>
                <button onClick={fetchVacancies}>Try Again</button>
            </div>
        );
    }

    return (
        <div className="vacancy-container">
            <div className="departments-header">
                <div className="vacancy-header__content">
                    <h1 className="vacancy-header__title">Job Vacancies</h1>
                    <p className="vacancy-header__subtitle">
                        Manage job postings and recruitment opportunities
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowAddModal(true)}
                >
                    <FaPlus />
                    <span>Post New Vacancy</span>
                </button>
            </div>

            {/* DataTable Component */}
            <DataTable
                data={vacancies}
                columns={columns}
                loading={loading}
                tableTitle=""
                showSearch={true}
                showFilters={true}
                filterableColumns={filterableColumns}
                customFilters={customFilters}
                onRowClick={handleRowClick}
                actions={actions}
                itemsPerPageOptions={[10, 25, 50, 100]}
                defaultItemsPerPage={25}
                defaultSortField="title"
                defaultSortDirection="asc"
                className="vacancies-datatable"
            />

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