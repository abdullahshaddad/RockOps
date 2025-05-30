import React from 'react';

const CompensationTab = ({ employee, formatCurrency }) => {
    return (
        <div className="compensation-info tab-panel">
            <h3>Compensation Details</h3>

            <div className="salary-overview">
                <div className="salary-card">
                    <div className="salary-title">Base Monthly Salary</div>
                    <div className="salary-amount">
                        {formatCurrency(employee.baseSalary || (employee.jobPosition?.baseSalary ? employee.jobPosition.baseSalary  : 0))}
                    </div>
                </div>
                <div className="salary-card">
                    <div className="salary-title">Annual Salary</div>
                    <div className="salary-amount">
                        {formatCurrency((employee.baseSalary || employee.jobPosition?.baseSalary )*12 || 0)}
                    </div>
                </div>
                <div className="salary-card">
                    <div className="salary-title">Base Position Salary</div>
                    <div className="salary-amount">
                        {formatCurrency(employee.jobPosition?.baseSalary || 0)}
                    </div>
                </div>
            </div>

            <div className="info-grid">
                <div className="info-group">
                    <div className="info-item">
                        <label>Base Salary Override</label>
                        <p>{employee.baseSalaryOverride ? formatCurrency(employee.baseSalaryOverride) : 'Not applied'}</p>
                    </div>
                    <div className="info-item">
                        <label>Contract Type</label>
                        <p>{employee.contractType || 'Not specified'}</p>
                    </div>
                </div>

                <div className="info-group">
                    <div className="info-item">
                        <label>Probation Period</label>
                        <p>{employee.jobPosition?.probationPeriod ? `${employee.jobPosition.probationPeriod} days` : 'Not specified'}</p>
                    </div>
                    <div className="info-item">
                        <label>Working Days</label>
                        <p>{employee.jobPosition?.workingDays ? `${employee.jobPosition.workingDays} days/week` : 'Standard'}</p>
                    </div>
                </div>

                <div className="info-group">
                    <div className="info-item">
                        <label>Shifts</label>
                        <p>{employee.jobPosition?.shifts || 'Standard'}</p>
                    </div>
                    <div className="info-item">
                        <label>Vacations</label>
                        <p>{employee.jobPosition?.vacations || 'Per company policy'}</p>
                    </div>
                </div>
            </div>

            <div className="salary-history">
                <h4>Salary Information</h4>
                <p className="info-text">
                    This employee's compensation is based on the {employee.jobPosition?.positionName || 'current'} position,
                    {employee.baseSalaryOverride ? ' with a custom salary override applied.' : ' using the standard position salary.'}
                </p>
            </div>
        </div>
    );
};

export default CompensationTab;