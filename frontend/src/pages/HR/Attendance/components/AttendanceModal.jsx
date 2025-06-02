import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, User, MapPin } from 'lucide-react';

const AttendanceModal = ({
                             isOpen,
                             onClose,
                             onSubmit,
                             employees,
                             initialData,
                             selectedDate
                         }) => {
    const [formData, setFormData] = useState({
        employeeId: '',
        date: '',
        contractType: 'MONTHLY',
        // Hourly fields
        checkInTime: '',
        checkOutTime: '',
        breakDurationMinutes: 0,
        // Daily fields
        dailyStatus: 'PRESENT',
        // Monthly fields
        status: 'PRESENT',
        // Common fields
        notes: '',
        location: '',
        latitude: null,
        longitude: null,
        isLeave: false,
        isHoliday: false
    });

    const [errors, setErrors] = useState({});
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Editing existing record
                setFormData({
                    employeeId: initialData.employeeId || '',
                    date: initialData.date || selectedDate?.toISOString().split('T')[0] || '',
                    contractType: initialData.contractType || 'MONTHLY',
                    checkInTime: initialData.checkInTime || '',
                    checkOutTime: initialData.checkOutTime || '',
                    breakDurationMinutes: initialData.breakDurationMinutes || 0,
                    dailyStatus: initialData.dailyStatus || 'PRESENT',
                    status: initialData.status || 'PRESENT',
                    notes: initialData.notes || '',
                    location: initialData.location || '',
                    latitude: initialData.latitude || null,
                    longitude: initialData.longitude || null,
                    isLeave: initialData.isLeave || false,
                    isHoliday: initialData.isHoliday || false
                });

                const employee = employees.find(emp => emp.id === initialData.employeeId);
                setSelectedEmployee(employee);
            } else {
                // Creating new record
                setFormData(prev => ({
                    ...prev,
                    date: selectedDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
                }));
            }
        }
    }, [isOpen, initialData, selectedDate, employees]);

    useEffect(() => {
        if (formData.employeeId) {
            const employee = employees.find(emp => emp.id === formData.employeeId);
            setSelectedEmployee(employee);

            if (employee && employee.jobPosition) {
                setFormData(prev => ({
                    ...prev,
                    contractType: employee.jobPosition.contractType || 'MONTHLY'
                }));
            }
        }
    }, [formData.employeeId, employees]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.employeeId) {
            newErrors.employeeId = 'Employee is required';
        }

        if (!formData.date) {
            newErrors.date = 'Date is required';
        }

        // Contract type specific validation
        switch (formData.contractType) {
            case 'HOURLY':
                if (!formData.checkInTime) {
                    newErrors.checkInTime = 'Check-in time is required for hourly employees';
                }
                if (formData.checkOutTime && formData.checkInTime &&
                    formData.checkOutTime <= formData.checkInTime) {
                    newErrors.checkOutTime = 'Check-out time must be after check-in time';
                }
                break;

            case 'DAILY':
                if (!formData.dailyStatus) {
                    newErrors.dailyStatus = 'Daily status is required';
                }
                break;

            case 'MONTHLY':
                if (!formData.status) {
                    newErrors.status = 'Status is required';
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Prepare data based on contract type
        const submitData = {
            ...formData,
            breakDurationMinutes: parseInt(formData.breakDurationMinutes) || 0
        };

        onSubmit(submitData);
    };

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        location: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
                    }));
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content attendance-modal" onClick={e => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="modal-header">
                    <h2>
                        <Clock size={24} />
                        {initialData ? 'Edit Attendance' : 'Record Attendance'}
                    </h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="attendance-form">
                    {/* Basic Information */}
                    <div className="form-section">
                        <h3>Basic Information</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="employeeId">
                                    <User size={16} />
                                    Employee *
                                </label>
                                <select
                                    id="employeeId"
                                    name="employeeId"
                                    value={formData.employeeId}
                                    onChange={handleInputChange}
                                    className={errors.employeeId ? 'error' : ''}
                                    disabled={!!initialData}
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map(employee => (
                                        <option key={employee.id} value={employee.id}>
                                            {employee.fullName} - {employee.jobPositionName}
                                        </option>
                                    ))}
                                </select>
                                {errors.employeeId && <span className="error-text">{errors.employeeId}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="date">
                                    <Calendar size={16} />
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    className={errors.date ? 'error' : ''}
                                />
                                {errors.date && <span className="error-text">{errors.date}</span>}
                            </div>
                        </div>

                        {selectedEmployee && (
                            <div className="employee-info-card">
                                <img
                                    src={selectedEmployee.photoUrl || '/default-avatar.png'}
                                    alt={selectedEmployee.fullName}
                                    className="employee-avatar"
                                />
                                <div className="employee-details">
                                    <h4>{selectedEmployee.fullName}</h4>
                                    <p>{selectedEmployee.jobPositionName}</p>
                                    <span className="contract-badge">
                    {selectedEmployee.jobPosition?.contractType || 'MONTHLY'} Contract
                  </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Contract Type Specific Fields */}
                    {formData.contractType === 'HOURLY' && (
                        <div className="form-section">
                            <h3>Hourly Attendance</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="checkInTime">Check In Time *</label>
                                    <input
                                        type="time"
                                        id="checkInTime"
                                        name="checkInTime"
                                        value={formData.checkInTime}
                                        onChange={handleInputChange}
                                        className={errors.checkInTime ? 'error' : ''}
                                    />
                                    {errors.checkInTime && <span className="error-text">{errors.checkInTime}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="checkOutTime">Check Out Time</label>
                                    <input
                                        type="time"
                                        id="checkOutTime"
                                        name="checkOutTime"
                                        value={formData.checkOutTime}
                                        onChange={handleInputChange}
                                        className={errors.checkOutTime ? 'error' : ''}
                                    />
                                    {errors.checkOutTime && <span className="error-text">{errors.checkOutTime}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="breakDurationMinutes">Break Duration (minutes)</label>
                                    <input
                                        type="number"
                                        id="breakDurationMinutes"
                                        name="breakDurationMinutes"
                                        value={formData.breakDurationMinutes}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="480"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {formData.contractType === 'DAILY' && (
                        <div className="form-section">
                            <h3>Daily Attendance</h3>

                            <div className="form-group">
                                <label htmlFor="dailyStatus">Status *</label>
                                <select
                                    id="dailyStatus"
                                    name="dailyStatus"
                                    value={formData.dailyStatus}
                                    onChange={handleInputChange}
                                    className={errors.dailyStatus ? 'error' : ''}
                                >
                                    <option value="PRESENT">Present</option>
                                    <option value="ABSENT">Absent</option>
                                    <option value="HOLIDAY">Holiday</option>
                                    <option value="LEAVE">Leave</option>
                                </select>
                                {errors.dailyStatus && <span className="error-text">{errors.dailyStatus}</span>}
                            </div>
                        </div>
                    )}

                    {formData.contractType === 'MONTHLY' && (
                        <div className="form-section">
                            <h3>Monthly Attendance</h3>

                            <div className="form-group">
                                <label htmlFor="status">Status *</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className={errors.status ? 'error' : ''}
                                >
                                    <option value="PRESENT">Present</option>
                                    <option value="ABSENT">Absent</option>
                                    <option value="LATE">Late</option>
                                    <option value="HALF_DAY">Half Day</option>
                                    <option value="ON_LEAVE">On Leave</option>
                                </select>
                                {errors.status && <span className="error-text">{errors.status}</span>}
                            </div>
                        </div>
                    )}

                    {/* Additional Information */}
                    <div className="form-section">
                        <h3>Additional Information</h3>

                        <div className="form-row">
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="isLeave"
                                        checked={formData.isLeave}
                                        onChange={handleInputChange}
                                    />
                                    On Leave
                                </label>
                            </div>

                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="isHoliday"
                                        checked={formData.isHoliday}
                                        onChange={handleInputChange}
                                    />
                                    Holiday
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="location">
                                <MapPin size={16} />
                                Location
                            </label>
                            <div className="location-input">
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="Enter location or use GPS"
                                />
                                <button
                                    type="button"
                                    className="location-btn"
                                    onClick={handleGetLocation}
                                >
                                    Get GPS
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="notes">Notes</label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows="3"
                                placeholder="Additional notes..."
                            />
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                        >
                            {initialData ? 'Update Attendance' : 'Record Attendance'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AttendanceModal;