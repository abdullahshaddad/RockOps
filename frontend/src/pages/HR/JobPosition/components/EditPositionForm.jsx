import React, { useState, useEffect } from 'react';
import './AddPositionForm.scss';

const EditPositionForm = ({ isOpen, onClose, onSubmit, position }) => {
    const [formData, setFormData] = useState({
        positionName: '',
        department: '',
        head: '',
        baseSalary: '',
        probationPeriod: '',
        type: '',
        workingDays: '',
        experienceLevel: '',
        shifts: '',
        workingHours: '',
        vacations: '',
        customVacationDays: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [loadingDepartments, setLoadingDepartments] = useState(false);

    // Fetch departments for the dropdown
    useEffect(() => {
        if (isOpen) {
            fetchDepartments();
        }
    }, [isOpen]);

    // Update form data when position prop changes
    useEffect(() => {
        if (position) {
            let vacationValue = position.vacations;
            let customVacationDays = '';

            if (position.vacations.startsWith('Custom:')) {
                vacationValue = 'Custom';
                customVacationDays = position.vacations.split(':')[1].trim();
            }

            setFormData({
                positionName: position.positionName || '',
                department: position.department || '',
                head: position.head || '',
                baseSalary: position.baseSalary || '',
                probationPeriod: position.probationPeriod || '',
                type: position.type || '',
                workingDays: position.workingDays || '',
                experienceLevel: position.experienceLevel || '',
                shifts: position.shifts || '',
                workingHours: position.workingHours || '',
                vacations: vacationValue,
                customVacationDays: customVacationDays
            });
        }
    }, [position]);

    const fetchDepartments = async () => {
        setLoadingDepartments(true);
        try {
            const response = await fetch('http://localhost:8080/api/v1/departments', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch departments');
            }

            const data = await response.json();
            setDepartments(data);
        } catch (err) {
            console.error('Error fetching departments:', err);
            setError(err.message || 'Failed to load departments');
        } finally {
            setLoadingDepartments(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Prepare vacation data
        let vacationValue = formData.vacations;
        if (formData.vacations === 'Custom' && formData.customVacationDays) {
            vacationValue = `Custom: ${formData.customVacationDays}`;
        }

        // Create a clean copy of the formData to submit
        const submitData = {
            ...formData,
            vacations: vacationValue
        };

        // Remove customVacationDays as it's not part of the API model
        delete submitData.customVacationDays;

        onSubmit(submitData);
    };

    if (!isOpen) return null;

    const typeOptions = [
        'FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY', 'HOURLY', 'DAILY'
    ];

    const experienceLevelOptions = [
        '0-2 years', '3-5 years', '6-10 years', '10+ years'
    ];

    return (
        <div className="position-modal">
            <div className="position-modal-content">
                <div className="position-modal-header">
                    <h2>Edit Position</h2>
                    <button className="position-modal-close" onClick={onClose}>×</button>
                </div>
                {loadingDepartments ? (
                    <div className="position-loading">Loading departments...</div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="position-form-row">
                            <div className="position-form-group">
                                <label htmlFor="positionName">Position Name</label>
                                <input
                                    type="text"
                                    id="positionName"
                                    name="positionName"
                                    value={formData.positionName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="position-form-group">
                                <label htmlFor="department">Department</label>
                                <div className="position-select-wrapper">
                                    <select
                                        id="department"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="" disabled>Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.name}>
                                                {dept.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="position-form-row">
                            <div className="position-form-group">
                                <label htmlFor="head">Reporting To</label>
                                <input
                                    type="text"
                                    id="head"
                                    name="head"
                                    value={formData.head}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="position-form-group">
                                <label htmlFor="baseSalary">Base Salary</label>
                                <input
                                    type="number"
                                    id="baseSalary"
                                    name="baseSalary"
                                    value={formData.baseSalary}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <div className="position-form-row">
                            <div className="position-form-group">
                                <label htmlFor="probationPeriod">Probation Period (months)</label>
                                <input
                                    type="number"
                                    id="probationPeriod"
                                    name="probationPeriod"
                                    value={formData.probationPeriod}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                />
                            </div>

                            <div className="position-form-group">
                                <label htmlFor="type">Employment Type</label>
                                <div className="position-select-wrapper">
                                    <select
                                        id="type"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="" disabled>Select Type</option>
                                        {typeOptions.map(option => (
                                            <option key={option} value={option}>
                                                {option.replace('_', ' ')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="position-form-row">
                            <div className="position-form-group">
                                <label htmlFor="workingDays">Working Days per Week</label>
                                <input
                                    type="number"
                                    id="workingDays"
                                    name="workingDays"
                                    value={formData.workingDays}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    max="7"
                                />
                            </div>

                            <div className="position-form-group">
                                <label htmlFor="experienceLevel">Experience Level</label>
                                <div className="position-select-wrapper">
                                    <select
                                        id="experienceLevel"
                                        name="experienceLevel"
                                        value={formData.experienceLevel}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="" disabled>Select Level</option>
                                        {experienceLevelOptions.map(option => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="position-form-row">
                            <div className="position-form-group">
                                <label htmlFor="shifts">Shifts</label>
                                <input
                                    type="text"
                                    id="shifts"
                                    name="shifts"
                                    value={formData.shifts}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="position-form-group">
                                <label htmlFor="workingHours">Working Hours per Day</label>
                                <input
                                    type="number"
                                    id="workingHours"
                                    name="workingHours"
                                    value={formData.workingHours}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    max="24"
                                />
                            </div>
                        </div>

                        <div className="position-form-row">
                            <div className="position-form-group">
                                <label htmlFor="vacations">Vacations</label>
                                <div className="position-select-wrapper">
                                    <select
                                        id="vacations"
                                        name="vacations"
                                        value={formData.vacations}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="" disabled>Select Vacation Policy</option>
                                        <option value="Standard">Standard (21 days)</option>
                                        <option value="Extended">Extended (30 days)</option>
                                        <option value="Custom">Custom</option>
                                    </select>
                                </div>
                            </div>

                            {formData.vacations === 'Custom' && (
                                <div className="position-form-group">
                                    <label htmlFor="customVacationDays">Custom Vacation Days</label>
                                    <input
                                        type="number"
                                        id="customVacationDays"
                                        name="customVacationDays"
                                        value={formData.customVacationDays}
                                        onChange={handleChange}
                                        required
                                        min="1"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="position-form-actions">
                            <button type="submit" className="position-submit-button">
                                Update Position
                            </button>
                            <button
                                type="button"
                                className="position-cancel-button"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditPositionForm;