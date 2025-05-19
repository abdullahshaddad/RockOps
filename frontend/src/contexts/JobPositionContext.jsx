import React, { createContext, useState, useContext, useEffect } from 'react';

// API URL for job positions
const API_URL = '/api/v1/job-positions';

// Create the context
const JobPositionContext = createContext();

// Custom hook to use the context
export const useJobPositions = () => {
    return useContext(JobPositionContext);
};

// Provider component
export const JobPositionProvider = ({ children }) => {
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get auth token from local storage
    const getToken = () => localStorage.getItem('token');

    // Configure request headers with token
    const getAuthHeaders = () => ({
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
    });

    // Handle API responses
    const handleResponse = async (response) => {
        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Something went wrong');
        }
        return response.json();
    };

    // Build query string from params
    const buildQueryString = (params) => {
        if (!params || Object.keys(params).length === 0) return '';

        return '?' + Object.entries(params)
            .filter(([_, value]) => value !== undefined && value !== null && value !== '')
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
    };

    // Get all job positions with optional filters
    const getAllJobPositions = async (search, sortBy, urgent) => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (sortBy) params.sortBy = sortBy;
            if (urgent) params.urgent = urgent;

            const queryString = buildQueryString(params);
            const response = await fetch(`${API_URL}${queryString}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await handleResponse(response);
            setPositions(data);
            setError(null);
            return data;
        } catch (error) {
            console.error('Error fetching job positions:', error);
            setError('Failed to load positions. Please try again later.');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Get paginated job positions
    const getPagedJobPositions = async (page, size, search, urgent) => {
        setLoading(true);
        try {
            const params = { page, size };
            if (search) params.search = search;
            if (urgent) params.urgent = urgent;

            const queryString = buildQueryString(params);
            const response = await fetch(`${API_URL}/paged${queryString}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            return handleResponse(response);
        } catch (error) {
            console.error('Error fetching paged job positions:', error);
            setError('Failed to load positions. Please try again later.');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Get job position by ID
    const getJobPositionById = async (id) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            return handleResponse(response);
        } catch (error) {
            console.error(`Error fetching job position with ID ${id}:`, error);
            setError(`Failed to load position with ID ${id}.`);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Create new job position
    const createJobPosition = async (jobPositionData) => {
        setLoading(true);
        try {
            // Format the data for the API
            const payload = {
                ...jobPositionData,
                site: jobPositionData.siteId ? { id: jobPositionData.siteId } : null
            };

            // Remove the siteId field as it's not needed in the API payload
            if (payload.siteId) {
                delete payload.siteId;
            }

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            const newPosition = await handleResponse(response);
            setPositions(prevPositions => [...prevPositions, newPosition]);
            return newPosition;
        } catch (error) {
            console.error('Error creating job position:', error);
            setError('Failed to create position.');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Update job position
    const updateJobPosition = async (id, jobPositionData) => {
        setLoading(true);
        try {
            // Format the data for the API
            const payload = {
                ...jobPositionData,
                site: jobPositionData.siteId ? { id: jobPositionData.siteId } : null
            };

            // Remove the siteId field as it's not needed in the API payload
            if (payload.siteId) {
                delete payload.siteId;
            }

            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            const updatedPosition = await handleResponse(response);
            setPositions(prevPositions =>
                prevPositions.map(position =>
                    position.id === id ? updatedPosition : position
                )
            );
            return updatedPosition;
        } catch (error) {
            console.error(`Error updating job position with ID ${id}:`, error);
            setError(`Failed to update position with ID ${id}.`);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Set job position active status
    const setJobPositionActive = async (id, active) => {
        setLoading(true);
        try {
            // Make sure id is a valid UUID string
            if (typeof id === 'string' && id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                const response = await fetch(`${API_URL}/${id}/active`, {
                    method: 'PATCH',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ active })
                });

                const updatedPosition = await handleResponse(response);
                setPositions(prevPositions =>
                    prevPositions.map(position =>
                        position.id === id ? updatedPosition : position
                    )
                );
                return updatedPosition;
            } else {
                throw new Error('Invalid UUID format');
            }
        } catch (error) {
            console.error(`Error updating active status for job position with ID ${id}:`, error);
            setError(`Failed to update active status for position with ID ${id}.`);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Set job position urgent status
    const setJobPositionUrgent = async (id, urgent) => {
        setLoading(true);
        try {
            // Make sure id is a valid UUID string
            if (typeof id === 'string' && id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                const response = await fetch(`${API_URL}/${id}/urgent`, {
                    method: 'PATCH',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ urgent })
                });

                const updatedPosition = await handleResponse(response);
                setPositions(prevPositions =>
                    prevPositions.map(position =>
                        position.id === id ? updatedPosition : position
                    )
                );
                return updatedPosition;
            } else {
                throw new Error('Invalid UUID format');
            }
        } catch (error) {
            console.error(`Error updating urgent status for job position with ID ${id}:`, error);
            setError(`Failed to update urgent status for position with ID ${id}.`);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Delete job position
    const deleteJobPosition = async (id) => {
        setLoading(true);
        try {
            // Make sure id is a valid UUID string
            if (typeof id === 'string' && id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                const response = await fetch(`${API_URL}/${id}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                });

                // For DELETE operations, if successful, remove from state
                if (response.ok) {
                    setPositions(prevPositions =>
                        prevPositions.filter(position => position.id !== id)
                    );
                    return true;
                }

                await handleResponse(response);
                return true;
            } else {
                throw new Error('Invalid UUID format');
            }
        } catch (error) {
            console.error(`Error deleting job position with ID ${id}:`, error);
            setError(`Failed to delete position with ID ${id}.`);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Value to be provided to consumers
    const value = {
        positions,
        loading,
        error,
        getAllJobPositions,
        getPagedJobPositions,
        getJobPositionById,
        createJobPosition,
        updateJobPosition,
        setJobPositionActive,
        setJobPositionUrgent,
        deleteJobPosition
    };

    return (
        <JobPositionContext.Provider value={value}>
            {children}
        </JobPositionContext.Provider>
    );
};

export default JobPositionContext;