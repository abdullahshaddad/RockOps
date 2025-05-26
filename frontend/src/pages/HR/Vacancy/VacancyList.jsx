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

    // Enhanced fetch function with better error handling
    const fetchVacancies = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');

            console.log('Fetching vacancies from API...');
            const response = await fetch('http://localhost:8080/api/v1/vacancies', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Get the raw response as text first to inspect it
            const responseText = await response.text();
            console.log('Raw response length:', responseText.length);
            console.log('Response content type:', response.headers.get('content-type'));

            // Log first and last 200 characters for debugging
            if (responseText.length > 0) {
                console.log('Response start:', responseText.substring(0, 200));
                console.log('Response end:', responseText.substring(Math.max(0, responseText.length - 200)));
            }

            // Check if the response is empty
            if (!responseText.trim()) {
                console.warn('Empty response received');
                setVacancies([]);
                setLoading(false);
                return;
            }

            // Validate JSON structure before parsing
            if (!responseText.trim().startsWith('[') && !responseText.trim().startsWith('{')) {
                throw new Error('Response is not valid JSON format. Expected array or object.');
            }

            // Check for common JSON corruption patterns
            if (responseText.includes(']}}}]}}]}}]}')) {
                console.error('Detected corrupted JSON with excessive closing brackets');
                throw new Error('Server returned corrupted JSON data. Please contact administrator.');
            }

            let data;
            try {
                data = JSON.parse(responseText);
                console.log('Successfully parsed JSON. Type:', typeof data, 'Length:', Array.isArray(data) ? data.length : 'N/A');
            } catch (jsonError) {
                console.error('JSON Parse Error:', jsonError);
                console.error('Problematic JSON section around error:');

                // Try to find the problematic section
                const errorMatch = jsonError.message.match(/position (\d+)/);
                if (errorMatch) {
                    const position = parseInt(errorMatch[1]);
                    const start = Math.max(0, position - 50);
                    const end = Math.min(responseText.length, position + 50);
                    console.error('Context:', responseText.substring(start, end));
                }

                throw new Error(`Invalid JSON response from server: ${jsonError.message}`);
            }

            // Ensure data is an array
            if (!Array.isArray(data)) {
                console.warn('Response is not an array, converting...');
                data = data ? [data] : [];
            }

            // Validate each vacancy object
            const validVacancies = data.filter((vacancy, index) => {
                if (!vacancy || typeof vacancy !== 'object') {
                    console.warn(`Invalid vacancy at index ${index}:`, vacancy);
                    return false;
                }

                // Check for required fields
                if (!vacancy.id || !vacancy.title) {
                    console.warn(`Vacancy missing required fields at index ${index}:`, vacancy);
                    return false;
                }

                return true;
            });

            console.log(`Valid vacancies: ${validVacancies.length}/${data.length}`);
            setVacancies(validVacancies);
            setLoading(false);

        } catch (error) {
            console.error('Error fetching vacancies:', error);
            setError(`Failed to load vacancies: ${error.message}`);
            setVacancies([]);
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

            const responseText = await response.text();
            if (responseText.trim()) {
                const data = JSON.parse(responseText);
                setJobPositions(Array.isArray(data) ? data : []);
            } else {
                setJobPositions([]);
            }
        } catch (error) {
            console.error('Error fetching job positions:', error);
            setJobPositions([]);
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
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
        } catch (error) {
            return 'Invalid Date';
        }
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
                {status || 'UNKNOWN'}
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

    // Enhanced add vacancy with better error handling
    const handleAddVacancy = async (newVacancy) => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');

            console.log('Adding new vacancy:', newVacancy);

            const response = await fetch('http://localhost:8080/api/v1/vacancies', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newVacancy)
            });

            console.log('Add vacancy response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Add vacancy error response:', errorText);
                throw new Error(`Failed to create vacancy: ${response.status} ${response.statusText}`);
            }

            console.log('Vacancy added successfully, refreshing list...');

            // Refresh the vacancy list
            await fetchVacancies();
            setShowAddModal(false);

            // Show success message
            alert('Vacancy created successfully!');

        } catch (error) {
            console.error('Error adding vacancy:', error);
            setError(`Failed to create vacancy: ${error.message}`);
            alert(`Failed to create vacancy: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Handle editing a vacancy
    const handleEditVacancy = async (updatedVacancy) => {
        try {
            setLoading(true);
            setError(null);
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
                const errorText = await response.text();
                throw new Error(`Failed to update vacancy: ${response.status} ${response.statusText}`);
            }

            // Refresh the vacancy list
            await fetchVacancies();
            setShowEditModal(false);
            setSelectedVacancy(null);
            alert('Vacancy updated successfully!');

        } catch (error) {
            console.error('Error updating vacancy:', error);
            setError(`Failed to update vacancy: ${error.message}`);
            alert(`Failed to update vacancy: ${error.message}`);
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
            setError(null);
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:8080/api/v1/vacancies/${vacancyId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to delete vacancy: ${response.status}`);
            }

            // Refresh the vacancy list
            await fetchVacancies();
            alert('Vacancy deleted successfully!');

        } catch (error) {
            console.error('Error deleting vacancy:', error);
            setError(`Failed to delete vacancy: ${error.message}`);
            alert(`Failed to delete vacancy: ${error.message}`);
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

    // Safe accessor for nested properties
    const safeGet = (obj, path, defaultValue = 'N/A') => {
        try {
            return path.split('.').reduce((current, key) => current?.[key], obj) || defaultValue;
        } catch {
            return defaultValue;
        }
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
                        {vacancy.title || 'Untitled'}
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
                        {safeGet(vacancy, 'jobPosition.positionName')}
                    </div>
                    <div className="vacancy-position__department">
                        {safeGet(vacancy, 'jobPosition.department')}
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

    // Get unique values for filters (with null checks)
    const uniqueStatuses = [...new Set(vacancies.map(v => v.status).filter(Boolean))];
    const uniquePriorities = [...new Set(vacancies.map(v => v.priority).filter(Boolean))];
    const uniqueDepartments = [...new Set(vacancies
        .map(v => safeGet(v, 'jobPosition.department', null))
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

    // Enhanced error display
    if (error && !loading) {
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

                <div className="error-container" style={{
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    color: 'var(--color-danger)',
                    padding: '24px',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    margin: '24px 0'
                }}>
                    <h3>Unable to Load Vacancies</h3>
                    <p>{error}</p>
                    <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button
                            onClick={fetchVacancies}
                            style={{
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer'
                            }}
                        >
                            Retry
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                backgroundColor: 'var(--color-secondary)',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer'
                            }}
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
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