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
        contractType: 'MONTHLY',
        // Monthly fields
        status: 'PRESENT',
        // Daily fields
        dailyStatus: 'PRESENT',
        // Hourly fields
        checkInTime: '09:00',
        checkOutTime: '17:00',
        breakDurationMinutes: 60,
        // Common fields
        notes: '',
        locationName: '',
        latitude: '',
        longitude: '',
        isHoliday: false,
        isLeave: false
    });

    const [error, setError] = useState('');

    // Initialize form with selected employee and date
    useEffect(() => {
        if (selectedEmployee) {
            const contractType = selectedEmployee.jobPosition?.contractType || 'MONTHLY';
            setFormData(prev => ({
                ...prev,
                employeeId: selectedEmployee.id,
                contractType: contractType
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
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle employee selection change
    const handleEmployeeChange = (e) => {
        const employeeId = e.target.value;
        const employee = employees.find(emp => emp.id === employeeId);
        const contractType = employee?.jobPosition?.contractType || 'MONTHLY';

        setFormData(prev => ({
            ...prev,
            employeeId,
            contractType
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

        // Format data for submission based on contract type
        let dataToSubmit = {
            employeeId: formData.employeeId,
            date: formData.date,
            contractType: formData.contractType,
            notes: formData.notes,
            isHoliday: formData.isHoliday,
            isLeave: formData.isLeave
        };

        // Add location data if available
        if (formData.latitude && formData.longitude) {
            dataToSubmit.location = formData.locationName;
            dataToSubmit.latitude = parseFloat(formData.latitude);
            dataToSubmit.longitude = parseFloat(formData.longitude);
        }

        // Add contract-specific fields
        switch (formData.contractType) {
            case 'HOURLY':
                if (formData.checkInTime) {
                    dataToSubmit.checkInTime = formData.checkInTime + ':00';
                }
                if (formData.checkOutTime) {
                    dataToSubmit.checkOutTime = formData.checkOutTime + ':00';
                }
                if (formData.breakDurationMinutes) {
                    dataToSubmit.breakDurationMinutes = parseInt(formData.breakDurationMinutes);
                }
                break;
            case 'DAILY':
                dataToSubmit.dailyStatus = formData.dailyStatus;
                break;
            case 'MONTHLY':
                dataToSubmit.status = formData.status;
                break;
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
            case 'record':
                return 'Record Attendance';
            default:
                return 'Attendance Form';
        }
    };

    const selectedEmployeeObj = employees.find(emp => emp.id === formData.employeeId);
    const contractType = selectedEmployeeObj?.jobPosition?.contractType || formData.contractType;

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
                            onChange={handleEmployeeChange}
                            required
                        >
                            <option value="">Select Employee</option>
                            {employees.map(employee => (
                                <option key={employee.id} value={employee.id}>
                                    {employee.firstName} {employee.lastName}
                                    {employee.jobPosition?.contractType && ` (${employee.jobPosition.contractType})`}
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

                    {/* Contract Type Display */}
                    {selectedEmployeeObj && (
                        <div className="form-group">
                            <label>Contract Type</label>
                            <div className="contract-type-display">
                                <span className="contract-badge">
                                    {contractType}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Contract-specific fields */}
                    {contractType === 'HOURLY' && (
                        <>
                            <div className="form-group">
                                <label htmlFor="checkInTime">Check-In Time</label>
                                <input
                                    type="time"
                                    id="checkInTime"
                                    name="checkInTime"
                                    value={formData.checkInTime}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="checkOutTime">Check-Out Time</label>
                                <input
                                    type="time"
                                    id="checkOutTime"
                                    name="checkOutTime"
                                    value={formData.checkOutTime}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="breakDurationMinutes">Break Duration (minutes)</label>
                                <input
                                    type="number"
                                    id="breakDurationMinutes"
                                    name="breakDurationMinutes"
                                    value={formData.breakDurationMinutes}
                                    onChange={handleChange}
                                    min="0"
                                    max="480"
                                />
                            </div>
                        </>
                    )}

                    {contractType === 'DAILY' && (
                        <div className="form-group">
                            <label htmlFor="dailyStatus">Daily Status</label>
                            <select
                                id="dailyStatus"
                                name="dailyStatus"
                                value={formData.dailyStatus}
                                onChange={handleChange}
                                required
                            >
                                <option value="PRESENT">Present</option>
                                <option value="ABSENT">Absent</option>
                                <option value="HOLIDAY">Holiday</option>
                                <option value="LEAVE">Leave</option>
                            </select>
                        </div>
                    )}

                    {contractType === 'MONTHLY' && (
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
                            </select>
                        </div>
                    )}

                    {/* Holiday and Leave flags */}
                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="isHoliday"
                                checked={formData.isHoliday}
                                onChange={handleChange}
                            />
                            Holiday
                        </label>

                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="isLeave"
                                checked={formData.isLeave}
                                onChange={handleChange}
                            />
                            On Leave
                        </label>
                    </div>

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
                                        <strong>Coordinates:</strong> {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
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