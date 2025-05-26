import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CandidatesTable.scss';
import AddCandidateModal from './AddCandidateModal';

const CandidatesTable = ({ vacancyId }) => {
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [vacancyStats, setVacancyStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch candidates for the vacancy
    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:8080/api/v1/candidates/vacancy/${vacancyId}`, {
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
                setCandidates(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching candidates:', error);
                setError(error.message);
                setLoading(false);
            }
        };

        const fetchVacancyStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:8080/api/v1/vacancies/${vacancyId}/statistics`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const stats = await response.json();
                    setVacancyStats(stats);
                }
            } catch (error) {
                console.error('Error fetching vacancy stats:', error);
            }
        };

        if (vacancyId) {
            fetchCandidates();
            fetchVacancyStats();
        }
    }, [vacancyId]);

    // Filter candidates based on search term
    const filteredCandidates = candidates.filter(candidate => {
        if (!searchTerm) return true;

        const lowerSearchTerm = searchTerm.toLowerCase();
        return (
            (candidate.firstName && candidate.firstName.toLowerCase().includes(lowerSearchTerm)) ||
            (candidate.lastName && candidate.lastName.toLowerCase().includes(lowerSearchTerm)) ||
            (candidate.email && candidate.email.toLowerCase().includes(lowerSearchTerm)) ||
            (candidate.currentPosition && candidate.currentPosition.toLowerCase().includes(lowerSearchTerm)) ||
            (candidate.currentCompany && candidate.currentCompany.toLowerCase().includes(lowerSearchTerm))
        );
    });

    // Get candidate status badge
    const getCandidateStatusBadge = (status) => {
        const statusColors = {
            'APPLIED': 'info',
            'UNDER_REVIEW': 'warning',
            'INTERVIEWED': 'primary',
            'HIRED': 'success',
            'REJECTED': 'danger',
            'POTENTIAL': 'secondary',
            'WITHDRAWN': 'secondary'
        };

        const colorClass = statusColors[status] || 'info';

        return (
            <span className={`candidate-status-badge candidate-status-badge--${colorClass}`}>
                {status?.replace('_', ' ') || 'APPLIED'}
            </span>
        );
    };

    // Handle adding a new candidate
    const handleAddCandidate = async (formData) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:8080/api/v1/candidates', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Refresh the candidates list and stats
            await refreshData();
            setShowAddModal(false);
        } catch (error) {
            console.error('Error adding candidate:', error);
            setError(error.message);
            setLoading(false);
        }
    };

    // Handle deleting a candidate
    const handleDeleteCandidate = async (candidateId) => {
        if (!window.confirm('Are you sure you want to delete this candidate?')) {
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:8080/api/v1/candidates/${candidateId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            await refreshData();
        } catch (error) {
            console.error('Error deleting candidate:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle hiring a candidate
    const handleHireCandidate = async (candidateId) => {
        if (!window.confirm('Are you sure you want to hire this candidate?')) {
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // First hire the candidate (this updates the vacancy position count)
            const hireResponse = await fetch(`http://localhost:8080/api/v1/vacancies/hire-candidate/${candidateId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!hireResponse.ok) {
                const errorData = await hireResponse.json();
                throw new Error(errorData.error || 'Failed to hire candidate');
            }

            // Then convert to employee
            const employeeResponse = await fetch(`http://localhost:8080/api/v1/candidates/${candidateId}/to-employee`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (employeeResponse.ok) {
                const employeeData = await employeeResponse.json();
                sessionStorage.setItem('prepopulatedEmployeeData', JSON.stringify(employeeData));
                navigate('/employees/add');
            } else {
                // Even if employee conversion fails, the hiring was successful
                await refreshData();
                alert('Candidate hired successfully!');
            }
        } catch (error) {
            console.error('Error hiring candidate:', error);
            setError(error.message);
            alert(`Failed to hire candidate: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Update candidate status
    const handleUpdateCandidateStatus = async (candidateId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/v1/candidates/${candidateId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            await refreshData();
        } catch (error) {
            console.error('Error updating candidate status:', error);
            setError(error.message);
        }
    };

    // Refresh both candidates and vacancy stats
    const refreshData = async () => {
        const token = localStorage.getItem('token');

        try {
            // Fetch candidates
            const candidatesResponse = await fetch(`http://localhost:8080/api/v1/candidates/vacancy/${vacancyId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (candidatesResponse.ok) {
                const candidatesData = await candidatesResponse.json();
                setCandidates(candidatesData);
            }

            // Fetch vacancy stats
            const statsResponse = await fetch(`http://localhost:8080/api/v1/vacancies/${vacancyId}/statistics`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setVacancyStats(statsData);
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Group candidates by status
    const candidatesByStatus = filteredCandidates.reduce((acc, candidate) => {
        const status = candidate.candidateStatus || 'APPLIED';
        if (!acc[status]) acc[status] = [];
        acc[status].push(candidate);
        return acc;
    }, {});

    return (
        <div className="candidates-section">
            {/* Vacancy Statistics */}
            {vacancyStats && (
                <div className="vacancy-stats">
                    <div className="stats-header">
                        <h3>Position Status</h3>
                    </div>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-number">{vacancyStats.remainingPositions}</div>
                            <div className="stat-label">Remaining Positions</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">{vacancyStats.hiredCount}</div>
                            <div className="stat-label">Hired</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">{vacancyStats.totalPositions}</div>
                            <div className="stat-label">Total Positions</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">{Math.round(vacancyStats.filledPercentage)}%</div>
                            <div className="stat-label">Filled</div>
                        </div>
                    </div>
                    {vacancyStats.isFull && (
                        <div className="vacancy-full-alert">
                            <i className="fas fa-exclamation-circle"></i>
                            This vacancy is full. New candidates will be moved to the potential list.
                        </div>
                    )}
                </div>
            )}

            <div className="candidates-header">
                <h2>Candidates</h2>
                <div className="header-actions">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search candidates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        className="add-candidate-btn"
                        onClick={() => setShowAddModal(true)}
                    >
                        Add Candidate
                    </button>
                </div>
            </div>

            {loading && !showAddModal ? (
                <div className="loading-container">
                    <div className="loader"></div>
                    <p>Loading candidates...</p>
                </div>
            ) : error ? (
                <div className="error-container">
                    <p>Error: {error}</p>
                    <button onClick={() => window.location.reload()}>Try Again</button>
                </div>
            ) : (
                <>
                    {filteredCandidates.length > 0 ? (
                        <div className="candidates-by-status">
                            {Object.entries(candidatesByStatus).map(([status, candidates]) => (
                                <div key={status} className="status-group">
                                    <div className="status-group-header">
                                        <h3>{status.replace('_', ' ')} ({candidates.length})</h3>
                                    </div>
                                    <div className="candidates-grid">
                                        {candidates.map(candidate => (
                                            <div key={candidate.id} className="candidate-card">
                                                <div className="candidate-header">
                                                    <div className="candidate-name">
                                                        {candidate.firstName} {candidate.lastName}
                                                    </div>
                                                    {getCandidateStatusBadge(candidate.candidateStatus)}
                                                </div>
                                                <div className="candidate-details">
                                                    <p><strong>Email:</strong> {candidate.email}</p>
                                                    <p><strong>Phone:</strong> {candidate.phoneNumber || 'N/A'}</p>
                                                    <p><strong>Current Position:</strong> {candidate.currentPosition || 'N/A'}</p>
                                                    <p><strong>Current Company:</strong> {candidate.currentCompany || 'N/A'}</p>
                                                    <p><strong>Applied:</strong> {formatDate(candidate.applicationDate)}</p>
                                                </div>
                                                <div className="candidate-actions">
                                                    {candidate.resumeUrl && (
                                                        <a
                                                            href={candidate.resumeUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="action-btn view-resume-btn"
                                                        >
                                                            <i className="fas fa-file-pdf"></i> Resume
                                                        </a>
                                                    )}

                                                    {candidate.candidateStatus !== 'HIRED' && (
                                                        <>
                                                            <select
                                                                value={candidate.candidateStatus || 'APPLIED'}
                                                                onChange={(e) => handleUpdateCandidateStatus(candidate.id, e.target.value)}
                                                                className="status-select"
                                                            >
                                                                <option value="APPLIED">Applied</option>
                                                                <option value="UNDER_REVIEW">Under Review</option>
                                                                <option value="INTERVIEWED">Interviewed</option>
                                                                <option value="REJECTED">Rejected</option>
                                                            </select>

                                                            <button
                                                                className="action-btn hire-btn"
                                                                onClick={() => handleHireCandidate(candidate.id)}
                                                                disabled={vacancyStats?.isFull && candidate.candidateStatus !== 'POTENTIAL'}
                                                                title={vacancyStats?.isFull ? 'No positions available' : 'Hire candidate'}
                                                            >
                                                                <i className="fas fa-user-check"></i>
                                                                {vacancyStats?.isFull ? 'Full' : 'Hire'}
                                                            </button>
                                                        </>
                                                    )}

                                                    <button
                                                        className="action-btn delete-btn"
                                                        onClick={() => handleDeleteCandidate(candidate.id)}
                                                        title="Delete candidate"
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-candidates">
                            <p>No candidates found for this vacancy yet.</p>
                            <button className="add-first-candidate" onClick={() => setShowAddModal(true)}>
                                Add First Candidate
                            </button>
                        </div>
                    )}
                </>
            )}

            {showAddModal && (
                <AddCandidateModal
                    onClose={() => setShowAddModal(false)}
                    onSave={handleAddCandidate}
                    vacancyId={vacancyId}
                />
            )}
        </div>
    );
};

export default CandidatesTable;