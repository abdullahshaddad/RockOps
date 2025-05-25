import React, { useState, useEffect } from 'react';
import './EmployeeModals.scss';

const EditEmployeeModal = ({ employee, onClose, onSave, jobPositions, sites }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        phoneNumber: '',
        mobilePhone: '',
        contractType: 'FULL_TIME',
        gender: '',
        birthDate: '',
        hireDate: '',
        address: '',
        city: '',
        country: '',
        region: '',
        jobPositionId: '',
        siteId: '',
        salaryMultiplier: 1.0,
        nationalIDNumber: '',
        maritalStatus: '',
        militaryStatus: '',
        education: '',
        emergencyContactName: '',
        emergencyContactPhone: ''
    });

    const [photoFile, setPhotoFile] = useState(null);
    const [idFrontFile, setIdFrontFile] = useState(null);
    const [idBackFile, setIdBackFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [errors, setErrors] = useState({});

    // Initialize form with employee data
    useEffect(() => {
        if (employee) {
            // Convert dates from ISO string to YYYY-MM-DD format for input fields
            const formatDate = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                return date.toISOString().split('T')[0];
            };

            setFormData({
                firstName: employee.firstName || '',
                lastName: employee.lastName || '',
                middleName: employee.middleName || '',
                email: employee.email || '',
                phoneNumber: employee.phoneNumber || '',
                mobilePhone: employee.mobilePhone || '',
                contractType: employee.contractType || 'FULL_TIME',
                gender: employee.gender || '',
                birthDate: formatDate(employee.birthDate),
                hireDate: formatDate(employee.hireDate),
                address: employee.address || '',
                city: employee.city || '',
                country: employee.country || '',
                region: employee.region || '',
                jobPositionId: employee.jobPositionId ? employee.jobPositionId.toString() : '',
                siteId: employee.siteId || '',
                salaryMultiplier: employee.salaryMultiplier || 1.0,
                nationalIDNumber: employee.nationalIDNumber || '',
                maritalStatus: employee.maritalStatus || '',
                militaryStatus: employee.militaryStatus || '',
                education: employee.education || '',
                emergencyContactName: employee.emergencyContactName || '',
                emergencyContactPhone: employee.emergencyContactPhone || ''
            });

            // Set photo preview if available
            if (employee.photoUrl) {
                setPhotoPreview(employee.photoUrl);
            }
        }
    }, [employee]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear error for this field
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };

    // Handle file input changes
    const handleFileChange = (e) => {
        const { name, files } = e.target;

        // Handle different file types
        if (name === 'photo') {
            if (files[0]) {
                setPhotoFile(files[0]);
                // Create preview URL for photo
                const previewUrl = URL.createObjectURL(files[0]);
                setPhotoPreview(previewUrl);
            }
        } else if (name === 'idFront') {
            if (files[0]) setIdFrontFile(files[0]);
        } else if (name === 'idBack') {
            if (files[0]) setIdBackFile(files[0]);
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // Required fields
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.siteId) newErrors.siteId = 'Site is required';

        // Email validation
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        // Phone validation
        if (formData.phoneNumber && !/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Phone number is invalid';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            // Convert jobPositionId to number if it's not empty
            const modifiedFormData = {
                ...formData,
                status: 'ACTIVE', // Always set status to ACTIVE
                jobPositionId: formData.jobPositionId ? parseInt(formData.jobPositionId) : null,
            };

            onSave(modifiedFormData, photoFile, idFrontFile, idBackFile);
        }
    };

    // Get selected job position details
    const getSelectedJobPosition = () => {
        if (!formData.jobPositionId) return null;
        return jobPositions.find(pos => pos.id === parseInt(formData.jobPositionId));
    };

    const selectedJobPosition = getSelectedJobPosition();

    return (
        <div className="r4m-modal-overlay">
            <div className="r4m-employee-modal">
                <div className="r4m-modal-header">
                    <h2>Edit Employee: {employee.fullName}</h2>
                    <button className="r4m-close-button" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="r4m-modal-body">
                        <div className="r4m-form-columns">
                            {/* Personal Information Column */}
                            <div className="r4m-form-column">
                                <h3>Personal Information</h3>

                                <div className="r4m-photo-section">
                                    <div className="r4m-photo-preview">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Employee preview" />
                                        ) : (
                                            <div className="r4m-photo-placeholder">
                                                <span>Photo</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="r4m-file-inputs">
                                        <div className="r4m-form-group">
                                            <label>Update Photo</label>
                                            <input
                                                type="file"
                                                name="photo"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                        <div className="r4m-form-group">
                                            <label>Update ID Front</label>
                                            <input
                                                type="file"
                                                name="idFront"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                        <div className="r4m-form-group">
                                            <label>Update ID Back</label>
                                            <input
                                                type="file"
                                                name="idBack"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="r4m-form-group">
                                    <label>First Name *</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className={errors.firstName ? 'error' : ''}
                                    />
                                    {errors.firstName && <span className="r4m-error-message">{errors.firstName}</span>}
                                </div>

                                <div className="r4m-form-group">
                                    <label>Middle Name</label>
                                    <input
                                        type="text"
                                        name="middleName"
                                        value={formData.middleName}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="r4m-form-group">
                                    <label>Last Name *</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className={errors.lastName ? 'error' : ''}
                                    />
                                    {errors.lastName && <span className="r4m-error-message">{errors.lastName}</span>}
                                </div>

                                <div className="r4m-form-group">
                                    <label>Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange}>
                                        <option value="">Select Gender</option>
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>

                                <div className="r4m-form-group">
                                    <label>Date of Birth</label>
                                    <input
                                        type="date"
                                        name="birthDate"
                                        value={formData.birthDate}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="r4m-form-group">
                                    <label>National ID Number</label>
                                    <input
                                        type="text"
                                        name="nationalIDNumber"
                                        value={formData.nationalIDNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Contact Information Column */}
                            <div className="r4m-form-column">
                                <h3>Contact Information</h3>

                                <div className="r4m-form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={errors.email ? 'error' : ''}
                                    />
                                    {errors.email && <span className="r4m-error-message">{errors.email}</span>}
                                </div>

                                <div className="r4m-form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className={errors.phoneNumber ? 'error' : ''}
                                    />
                                    {errors.phoneNumber && <span className="r4m-error-message">{errors.phoneNumber}</span>}
                                </div>

                                <div className="r4m-form-group">
                                    <label>Mobile Phone</label>
                                    <input
                                        type="tel"
                                        name="mobilePhone"
                                        value={formData.mobilePhone}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="r4m-form-group">
                                    <label>Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="r4m-form-group">
                                    <label>City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="r4m-form-group">
                                    <label>Region</label>
                                    <input
                                        type="text"
                                        name="region"
                                        value={formData.region}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="r4m-form-group">
                                    <label>Emergency Contact Name</label>
                                    <input
                                        type="text"
                                        name="emergencyContactName"
                                        value={formData.emergencyContactName}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="r4m-form-group">
                                    <label>Emergency Contact Phone</label>
                                    <input
                                        type="tel"
                                        name="emergencyContactPhone"
                                        value={formData.emergencyContactPhone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Employment Information Column */}
                            <div className="r4m-form-column">
                                <h3>Employment Information</h3>

                                <div className="r4m-form-group">
                                    <label>Site *</label>
                                    <select
                                        name="siteId"
                                        value={formData.siteId}
                                        onChange={handleChange}
                                        className={errors.siteId ? 'error' : ''}
                                    >
                                        <option value="">Select Site</option>
                                        {sites.map(site => (
                                            <option key={site.id} value={site.id}>{site.name}</option>
                                        ))}
                                    </select>
                                    {errors.siteId && <span className="r4m-error-message">{errors.siteId}</span>}
                                </div>

                                <div className="r4m-form-group">
                                    <label>Job Position</label>
                                    <select
                                        name="jobPositionId"
                                        value={formData.jobPositionId}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Job Position</option>
                                        {jobPositions.map(pos => (
                                            <option key={pos.id} value={pos.id}>
                                                {pos.positionName} - {pos.department}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="r4m-form-group">
                                    <label>Contract Type</label>
                                    <select name="contractType" value={formData.contractType} onChange={handleChange}>
                                        <option value="FULL_TIME">Full Time</option>
                                        <option value="PART_TIME">Part Time</option>
                                        <option value="CONTRACT">Contract</option>
                                        <option value="TEMPORARY">Temporary</option>
                                        <option value="INTERNSHIP">Internship</option>
                                    </select>
                                </div>

                                <div className="r4m-form-group">
                                    <label>Hire Date</label>
                                    <input
                                        type="date"
                                        name="hireDate"
                                        value={formData.hireDate}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="r4m-form-group">
                                    <label>Salary Multiplier</label>
                                    <input
                                        type="number"
                                        name="salaryMultiplier"
                                        min="0.1"
                                        step="0.1"
                                        value={formData.salaryMultiplier}
                                        onChange={handleChange}
                                    />
                                </div>

                                {selectedJobPosition && (
                                    <div className="r4m-salary-info">
                                        <p>
                                            <strong>Monthly Salary: </strong>
                                            ${((selectedJobPosition.baseSalary || 0) * formData.salaryMultiplier / 12).toFixed(2)}
                                        </p>
                                        <p>
                                            <strong>Annual Salary: </strong>
                                            ${((selectedJobPosition.baseSalary || 0) * formData.salaryMultiplier).toFixed(2)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="r4m-modal-footer">
                        <button type="button" className="r4m-cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="r4m-save-btn">Update Employee</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditEmployeeModal;