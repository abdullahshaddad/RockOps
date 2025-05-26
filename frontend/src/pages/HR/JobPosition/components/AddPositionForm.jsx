import React, { useState, useEffect } from 'react';
import './AddPositionForm.scss';

const AddPositionForm = ({ isOpen, onClose, onSubmit }) => {
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
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [loadingDepartments, setLoadingDepartments] = useState(false);

    // Fetch employees and departments when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchEmployees();
            fetchDepartments();
        }
    }, [isOpen]);

    // Reset form data when modal is opened
    useEffect(() => {
        if (isOpen) {
            setFormData({
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
            setError(null);
        }
    }, [isOpen]);

    const fetchEmployees = async () => {
        setLoadingEmployees(true);
        try {
            const response = await fetch('http://localhost:8080/api/v1/employees', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch employees');
            }

            const data = await response.json();
            setEmployees(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching employees:', err);
            setError(prev => prev || 'Failed to load employees');
        } finally {
            setLoadingEmployees(false);
        }
    };

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
            setDepartments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching departments:', err);
            setError(prev => prev || 'Failed to load departments');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validate required fields
            const requiredFields = ['positionName', 'department', 'baseSalary', 'type', 'workingDays', 'experienceLevel', 'shifts', 'workingHours', 'vacations'];
            const missingFields = requiredFields.filter(field => !formData[field]);

            if (missingFields.length > 0) {
                throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
            }

            // Prepare vacation data
            let vacationValue = formData.vacations;
            if (formData.vacations === 'Custom' && formData.customVacationDays) {
                vacationValue = `Custom: ${formData.customVacationDays}`;
            } else if (formData.vacations === 'Custom' && !formData.customVacationDays) {
                throw new Error('Please specify custom vacation days');
            }

            // Create a clean copy of the formData to submit
            const submitData = {
                ...formData,
                vacations: vacationValue,
                baseSalary: parseFloat(formData.baseSalary),
                probationPeriod: formData.probationPeriod ? parseInt(formData.probationPeriod) : null,
                workingDays: parseInt(formData.workingDays),
                workingHours: parseInt(formData.workingHours)
            };

            // Remove customVacationDays as it's not part of the API model
            delete submitData.customVacationDays;

            await onSubmit(submitData);

        } catch (err) {
            console.error('Error submitting form:', err);
            setError(err.message || 'Failed to add position');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Experience level options
    const experienceLevelOptions = [
        '0-2 years', '3-5 years', '6-10 years', '10+ years'
    ];

    // Employment type options
    const typeOptions = [
        'FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY', 'DAILY', 'HOURLY'
    ];

    return (
        <div className="position-modal">
            <div className="position-modal-content">
                <div className="position-modal-header">
                    <h2>Add New Position</h2>
                    <button className="position-modal-close" onClick={onClose}>×</button>
                </div>

                {error && (
                    <div className="position-error">
                        {error}
                    </div>
                )}

                {(loadingDepartments || loadingEmployees) ? (
                    <div className="position-loading">Loading form data...</div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="position-form-row">
                            <div className="position-form-group">
                                <label htmlFor="positionName">Position Name </label>
                                <input
                                    type="text"
                                    id="positionName"
                                    name="positionName"
                                    value={formData.positionName}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Software Engineer"
                                />
                            </div>

                            <div className="position-form-group">
                                <label htmlFor="department">Department </label>
                                <div className="position-select-wrapper">
                                    <select
                                        id="department"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="" disabled>Select Department</option>
                                        {departments.map(department => (
                                            <option key={department.id} value={department.name}>
                                                {department.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="position-form-row">
                            <div className="position-form-group">
                                <label htmlFor="head">Reporting To</label>
                                <div className="position-select-wrapper">
                                    <select
                                        id="head"
                                        name="head"
                                        value={formData.head}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Manager (Optional)</option>
                                        {employees.map(employee => (
                                            <option
                                                key={employee.id}
                                                value={employee.fullName || `${employee.firstName} ${employee.lastName}`}
                                            >
                                                {employee.fullName || `${employee.firstName} ${employee.lastName}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="position-form-group">
                                <label htmlFor="baseSalary">Base Salary </label>
                                <input
                                    type="number"
                                    id="baseSalary"
                                    name="baseSalary"
                                    value={formData.baseSalary}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    placeholder="Annual salary in USD"
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
                                    min="0"
                                    placeholder="Number of months"
                                />
                            </div>

                            <div className="position-form-group">
                                <label htmlFor="type">Employment Type </label>
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
                                <label htmlFor="workingDays">Working Days per Week </label>
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
                                <label htmlFor="experienceLevel">Experience Level </label>
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
                                <label htmlFor="shifts">Shifts </label>
                                <div className="position-select-wrapper">
                                    <select
                                        id="shifts"
                                        name="shifts"
                                        value={formData.shifts}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="" disabled>Select Shift</option>
                                        <option value="Morning">Morning</option>
                                        <option value="Evening">Evening</option>
                                        <option value="Night">Night</option>
                                        <option value="Rotating">Rotating</option>
                                        <option value="Flexible">Flexible</option>
                                    </select>
                                </div>
                            </div>

                            <div className="position-form-group">
                                <label htmlFor="workingHours">Working Hours per Day </label>
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
                                <label htmlFor="vacations">Vacation Policy </label>
                                <div className="position-select-wrapper">
                                    <select
                                        id="vacations"
                                        name="vacations"
                                        value={formData.vacations}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="" disabled>Select Vacation Policy</option>
                                        <option value="10 days">10 days</option>
                                        <option value="15 days">15 days</option>
                                        <option value="21 days">21 days</option>
                                        <option value="28 days">28 days</option>
                                        <option value="Custom">Custom</option>
                                    </select>
                                </div>
                            </div>

                            {formData.vacations === 'Custom' && (
                                <div className="position-form-group">
                                    <label htmlFor="customVacationDays">Custom Vacation Days </label>
                                    <input
                                        type="number"
                                        id="customVacationDays"
                                        name="customVacationDays"
                                        value={formData.customVacationDays}
                                        onChange={handleChange}
                                        required
                                        min="1"
                                        placeholder="Number of days"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="position-form-actions">
                            <button
                                type="button"
                                className="position-cancel-button"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="position-submit-button"
                                disabled={loading}
                            >
                                {loading ? 'Adding...' : 'Add Position'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AddPositionForm;