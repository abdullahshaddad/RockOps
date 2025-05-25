import React from 'react';

const EmploymentTab = ({ employee, formatDate, getPosition, getDepartment, getSiteName }) => {
    return (
        <div className="employment-info tab-panel">
            <h3>Employment Information</h3>

            <div className="info-grid">
                <div className="info-group">
                    <div className="info-item">
                        <label>Position</label>
                        <p>{getPosition()}</p>
                    </div>
                    <div className="info-item">
                        <label>Department</label>
                        <p>{getDepartment()}</p>
                    </div>
                    <div className="info-item">
                        <label>Contract Type</label>
                        <p>{employee.contractType || 'Not specified'}</p>
                    </div>
                    <div className="info-item">
                        <label>Status</label>
                        <p className={`employee-status ${employee.status?.toLowerCase() || 'active'}`}>
                            {employee.status || 'Active'}
                        </p>
                    </div>
                </div>

                <div className="info-group">
                    <div className="info-item">
                        <label>Site</label>
                        <p>{getSiteName()}</p>
                    </div>
                    <div className="info-item">
                        <label>Hire Date</label>
                        <p>{formatDate(employee.hireDate)}</p>
                    </div>
                    <div className="info-item">
                        <label>Manager</label>
                        <p>{employee.managerName || 'Not assigned'}</p>
                    </div>
                    <div className="info-item">
                        <label>Job Type</label>
                        <p>{employee.jobPosition?.type || 'Not specified'}</p>
                    </div>
                </div>

                <div className="info-group">
                    <div className="info-item">
                        <label>Experience Level</label>
                        <p>{employee.jobPosition?.experienceLevel || 'Not specified'}</p>
                    </div>
                    <div className="info-item">
                        <label>Working Hours</label>
                        <p>{employee.jobPosition?.workingHours ? `${employee.jobPosition.workingHours} hours` : 'Standard hours'}</p>
                    </div>
                    <div className="info-item">
                        <label>Employee ID</label>
                        <p>{employee.id || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmploymentTab;