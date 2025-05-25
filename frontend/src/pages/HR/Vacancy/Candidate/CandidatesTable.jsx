import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CandidatesTable.scss';
import AddCandidateModal from './AddCandidateModal';

const CandidatesTable = ({ vacancyId }) => {
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
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

        if (vacancyId) {
            fetchCandidates();
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

    // Handle adding a new candidate
    const handleAddCandidate = async (formData) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:8080/api/v1/candidates', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // No Content-Type for FormData
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Refresh the candidates list
            const updatedResponse = await fetch(`http://localhost:8080/api/v1/candidates/vacancy/${vacancyId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!updatedResponse.ok) {
                throw new Error(`HTTP error! Status: ${updatedResponse.status}`);
            }

            const updatedData = await updatedResponse.json();
            setCandidates(updatedData);
            setShowAddModal(false);
            setLoading(false);
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

            // Update the candidates list
            setCandidates(candidates.filter(candidate => candidate.id !== candidateId));
            setLoading(false);
        } catch (error) {
            console.error('Error deleting candidate:', error);
            setError(error.message);
            setLoading(false);
        }
    };

    // Handle hiring a candidate
    const handleHireCandidate = async (candidateId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/v1/candidates/${candidateId}/to-employee`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const employeeData = await response.json();

            // Store employee data in session storage for pre-filling the employee form
            sessionStorage.setItem('prepopulatedEmployeeData', JSON.stringify(employeeData));

            // Navigate to add employee page
            navigate('/employees/add');
        } catch (error) {
            console.error('Error preparing to hire candidate:', error);
            setError(error.message);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <div className="candidates-section">
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
                        <div className="table-container">
                            <table className="candidates-table">
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Current Position</th>
                                    <th>Current Company</th>
                                    <th>Applied On</th>
                                    <th>Resume</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredCandidates.map(candidate => (
                                    <tr key={candidate.id}>
                                        <td className="candidate-name">
                                            {candidate.firstName} {candidate.lastName}
                                        </td>
                                        <td>{candidate.email}</td>
                                        <td>{candidate.phoneNumber || 'N/A'}</td>
                                        <td>{candidate.currentPosition || 'N/A'}</td>
                                        <td>{candidate.currentCompany || 'N/A'}</td>
                                        <td>{formatDate(candidate.applicationDate)}</td>
                                        <td>
                                            {candidate.resumeUrl ? (
                                                <a
                                                    href={candidate.resumeUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="resume-link"
                                                >
                                                    <i className="fas fa-file-pdf"></i> View
                                                </a>
                                            ) : (
                                                'No resume'
                                            )}
                                        </td>
                                        <td className="actions-cell">
                                            <button
                                                className="action-btn view-btn"
                                                title="View details"
                                                onClick={() => alert('View details functionality would go here')}
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            <button
                                                className="action-btn hire-btn"
                                                title="Hire candidate"
                                                onClick={() => handleHireCandidate(candidate.id)}
                                            >
                                                <i className="fas fa-user-check"></i>
                                            </button>
                                            <button
                                                className="action-btn delete-btn"
                                                title="Delete candidate"
                                                onClick={() => handleDeleteCandidate(candidate.id)}
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
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