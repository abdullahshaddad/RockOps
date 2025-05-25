import React, { useState, useEffect } from 'react';
import './AttendanceForm.scss';

const AttendanceForm = ({
                            type,
                            employees,
                            selectedEmployee,
                            selectedDate,
                            onClose,
                            onSubmit
                        }) => {
    const [formData, setFormData] = useState({
        employeeId: selectedEmployee ? selectedEmployee.id : '',
        date: selectedDate ? formatDate(selectedDate) : formatDate(new Date()),
        status: 'PRESENT',
        notes: '',
        locationName: '',
        latitude: '',
        longitude: '',
        deviceInfo: navigator.userAgent
    });

    const [error, setError] = useState('');

    // Initialize form with selected employee and date
    useEffect(() => {
        if (selectedEmployee) {
            setFormData(prev => ({
                ...prev,
                employeeId: selectedEmployee.id
            }));
        }

        if (selectedDate) {
            setFormData(prev => ({
                ...prev,
                date: formatDate(selectedDate)
            }));
        }
    }, [selectedEmployee, selectedDate]);

    // Try to get geolocation when form opens
    useEffect(() => {
        if (navigator.geolocation && (type === 'check-in' || type === 'check-out')) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    setFormData(prev => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }));

                    // Try to get location name from coordinates
                    fetchLocationName(position.coords.latitude, position.coords.longitude);
                },
                error => {
                    console.warn("Geolocation error:", error);
                }
            );
        }
    }, [type]);

    // Format date to YYYY-MM-DD for input
    function formatDate(date) {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    // Fetch location name from coordinates using reverse geocoding
    async function fetchLocationName(lat, lng) {
        try {
            // Note: In a production app, you would use a proper geocoding service
            // This is just a placeholder for demonstration
            const locationName = "Office Location"; // Placeholder

            setFormData(prev => ({
                ...prev,
                locationName
            }));
        } catch (err) {
            console.error("Error fetching location name:", err);
        }
    }

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate form
        if (!formData.employeeId) {
            setError('Please select an employee');
            return;
        }

        if (!formData.date) {
            setError('Please select a date');
            return;
        }

        if (type === 'manual' && !formData.status) {
            setError('Please select a status');
            return;
        }

        // Format data for submission
        let dataToSubmit = { ...formData };

        // For check-in and check-out, we don't need to send the status
        if (type !== 'manual') {
            delete dataToSubmit.status;
        }

        // Submit the data
        onSubmit(dataToSubmit);
    };

    // Get form title based on type
    const getFormTitle = () => {
        switch (type) {
            case 'check-in':
                return 'Record Check-In';
            case 'check-out':
                return 'Record Check-Out';
            case 'manual':
                return 'Manual Attendance Entry';
            default:
                return 'Attendance Form';
        }
    };

    return (
        <div className="attendance-form-overlay">
            <div className="attendance-form-container">
                <div className="form-header">
                    <h2>{getFormTitle()}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="employeeId">Employee</label>
                        <select
                            id="employeeId"
                            name="employeeId"
                            value={formData.employeeId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Employee</option>
                            {employees.map(employee => (
                                <option key={employee.id} value={employee.id}>
                                    {employee.firstName} {employee.lastName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="date">Date</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {type === 'manual' && (
                        <div className="form-group">
                            <label htmlFor="status">Status</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                            >
                                <option value="PRESENT">Present</option>
                                <option value="ABSENT">Absent</option>
                                <option value="LATE">Late</option>
                                <option value="HALF_DAY">Half Day</option>
                                <option value="ON_LEAVE">On Leave</option>
                                <option value="WEEKEND">Weekend</option>
                                <option value="HOLIDAY">Holiday</option>
                            </select>
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="notes">Notes</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Add any notes or comments..."
                        ></textarea>
                    </div>

                    {(type === 'check-in' || type === 'check-out') && (
                        <div className="location-info">
                            <h3>Location Information</h3>

                            {formData.latitude && formData.longitude ? (
                                <div className="coordinates">
                                    <p>
                                        <strong>Coordinates:</strong> {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                                    </p>
                                    {formData.locationName && (
                                        <p>
                                            <strong>Location:</strong> {formData.locationName}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="no-location">Location data not available</p>
                            )}
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn">
                            {type === 'check-in' ? 'Check In' :
                                type === 'check-out' ? 'Check Out' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AttendanceForm;