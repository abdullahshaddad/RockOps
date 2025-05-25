import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaEdit, FaTrash, FaEye, FaUser } from 'react-icons/fa';
import './EmployeesList.css';
import DataTable from '../../../components/common/DataTable/DataTable';
import AddEmployeeModal from './AddEmployeeModal';
import EditEmployeeModal from './EditEmployeeModal';

const EmployeesList = () => {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [positionFilter, setPositionFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch departments and positions for dropdowns
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [sites, setSites] = useState([]);
    const [jobPositions, setJobPositions] = useState([]);

    // Fetch employees data from the API
    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/v1/employees`, {
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
            setEmployees(data);
            setFilteredEmployees(data);
            setLoading(false);

            // Extract unique departments and positions for filters
            const depts = [...new Set(data.map(emp => emp.jobPositionDepartment).filter(Boolean))];
            const pos = [...new Set(data.map(emp => emp.position).filter(Boolean))];
            setDepartments(depts);
            setPositions(pos);

        } catch (error) {
            console.error('Error fetching employees:', error);
            setError(error.message);
            setLoading(false);
        }
    };

    // Fetch job positions for the dropdown
    const fetchJobPositions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/v1/job-positions`, {
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
            setJobPositions(data);
        } catch (error) {
            console.error('Error fetching job positions:', error);
        }
    };

    // Fetch sites for the dropdown
    const fetchSites = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/v1/site', {
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
            setSites(data);
        } catch (error) {
            console.error('Error fetching sites:', error);
        }
    };

    // Load all necessary data when component mounts
    useEffect(() => {
        fetchEmployees();
        fetchJobPositions();
        fetchSites();
    }, []);

    // Filter employees based on search term and filters
    useEffect(() => {
        let result = employees;

        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            result = result.filter(
                employee =>
                    (employee.firstName && employee.firstName.toLowerCase().includes(lowerSearchTerm)) ||
                    (employee.lastName && employee.lastName.toLowerCase().includes(lowerSearchTerm)) ||
                    (employee.email && employee.email.toLowerCase().includes(lowerSearchTerm)) ||
                    (employee.fullName && employee.fullName.toLowerCase().includes(lowerSearchTerm))
            );
        }

        if (departmentFilter) {
            result = result.filter(employee => employee.jobPositionDepartment === departmentFilter);
        }

        if (positionFilter) {
            result = result.filter(employee =>
                employee.position === positionFilter ||
                employee.jobPositionName === positionFilter
            );
        }

        if (statusFilter) {
            result = result.filter(employee => employee.status === statusFilter);
        }

        if (typeFilter) {
            result = result.filter(employee => employee.contractType === typeFilter);
        }

        setFilteredEmployees(result);
    }, [searchTerm, departmentFilter, positionFilter, statusFilter, typeFilter, employees]);

    // Handle adding a new employee
    const handleAddEmployee = async (employeeData, photoFile, idFrontFile, idBackFile) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            console.log("Employee data being sent:", employeeData);

            // Create FormData for multipart/form-data request
            const formData = new FormData();

            // Add employee data as a JSON string
            formData.append("employeeData", new Blob([JSON.stringify(employeeData)], {
                type: "application/json"
            }));

            // Add image files if provided
            if (photoFile) {
                formData.append('photo', photoFile);
                console.log('Added photo file:', photoFile.name);
            }

            if (idFrontFile) {
                formData.append('idFrontImage', idFrontFile);
                console.log('Added ID front file:', idFrontFile.name);
            }

            if (idBackFile) {
                formData.append('idBackImage', idBackFile);
                console.log('Added ID back file:', idBackFile.name);
            }

            // Debug FormData contents (can't directly console.log FormData)
            for (let pair of formData.entries()) {
                console.log(pair[0], pair[1] instanceof Blob ? `Blob: ${pair[1].type}, size: ${pair[1].size}` : pair[1]);
            }

            // Make API request
            const response = await fetch('http://localhost:8080/api/v1/hr/employee', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Don't manually set Content-Type for FormData
                },
                body: formData
            });

            console.log('Response status:', response.status);

            // Handle response
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Full error response:', errorText);
                throw new Error(errorText || response.statusText);
            }

            const result = await response.json();
            console.log('Employee added successfully:', result);

            // Refresh the employee list
            await fetchEmployees();
            setShowAddModal(false);

            // Show success message
            alert('Employee added successfully!');

        } catch (error) {
            console.error('Error adding employee:', error);
            setError(`Failed to add employee: ${error.message}`);
            alert(`Failed to add employee. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    // Handle editing an employee
    const handleEditEmployee = async (updatedEmployee, photoFile, idFrontFile, idBackFile) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Create FormData for multipart/form-data request
            const formData = new FormData();

            // Add employee JSON data
            formData.append('employeeData', JSON.stringify(updatedEmployee));

            // Add image files if provided
            if (photoFile) formData.append('photo', photoFile);
            if (idFrontFile) formData.append('idFrontImage', idFrontFile);
            if (idBackFile) formData.append('idBackImage', idBackFile);

            // Fixed the URL by removing the $ symbol
            const response = await fetch(`http://localhost:8080/api/v1/hr/employee/${selectedEmployee.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // No Content-Type header with FormData, browser sets it automatically with boundary
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Refresh the employee list
            await fetchEmployees();
            setShowEditModal(false);
            setSelectedEmployee(null);

        } catch (error) {
            console.error('Error updating employee:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Delete an employee
    const handleDeleteEmployee = async (employeeId) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) {
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:8080/api/v1/hr/employee/${employeeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Refresh the employee list
            await fetchEmployees();

        } catch (error) {
            console.error('Error deleting employee:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Navigate to employee details
    const handleRowClick = (employee) => {
        // Navigate to employee details page
        window.location.href = `/hr/employee-details/${employee.id}`;
    };

    // Open edit modal with employee data
    const handleEditClick = (employee) => {
        setSelectedEmployee(employee);
        setShowEditModal(true);
    };

    // Format currency for display
    const formatCurrency = (amount) => {
        if (!amount) return '-';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    // Get status badge styling
    const getStatusBadge = (status) => {
        const statusColors = {
            'ACTIVE': 'success',
            'INACTIVE': 'secondary',
            'INVITED': 'info',
            'ON_LEAVE': 'warning',
            'SUSPENDED': 'danger',
            'TERMINATED': 'danger'
        };

        return (
            <span className={`status-badge status-badge--${statusColors[status] || 'secondary'}`}>
                {status || 'N/A'}
            </span>
        );
    };

    // Define columns for DataTable
    const columns = [
        {
            header: 'Photo',
            accessor: 'photoUrl',
            sortable: false,
            width: '80px',
            render: (employee, photoUrl) => (
                <div className="employee-avatar">
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt={`${employee.firstName} ${employee.lastName}`}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : (
                        <div className="employee-avatar__placeholder">
                            <FaUser />
                        </div>
                    )}
                    <div className="employee-avatar__placeholder" style={{ display: 'none' }}>
                        <FaUser />
                    </div>
                </div>
            )
        },
        {
            header: 'Name',
            accessor: 'fullName',
            render: (employee) => (
                <div className="employee-name">
                    <div className="employee-name__primary">
                        {employee.fullName || `${employee.firstName} ${employee.lastName}`}
                    </div>
                    <div className="employee-name__secondary">
                        {employee.email}
                    </div>
                </div>
            )
        },
        {
            header: 'Position',
            accessor: 'position',
            render: (employee) => (
                <div className="employee-position">
                    <div className="employee-position__title">
                        {employee.position || employee.jobPositionName || 'N/A'}
                    </div>
                    <div className="employee-position__department">
                        {employee.jobPositionDepartment || 'N/A'}
                    </div>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (employee) => getStatusBadge(employee.status)
        },
        {
            header: 'Type',
            accessor: 'contractType',
            render: (employee) => (
                <span className="contract-type">
                    {employee.contractType ? employee.contractType.replace('_', ' ') : 'N/A'}
                </span>
            )
        },
        {
            header: 'Salary',
            accessor: 'monthlySalary',
            render: (employee) => (
                <div className="salary-info">
                    <div className="salary-info__monthly">
                        {formatCurrency(employee.monthlySalary)}
                    </div>
                    <div className="salary-info__period">per month</div>
                </div>
            )
        },
        {
            header: 'Site',
            accessor: 'siteName',
            render: (employee) => employee.siteName || 'N/A'
        },
        {
            header: 'Hire Date',
            accessor: 'hireDate',
            render: (employee) => formatDate(employee.hireDate)
        }
    ];

    // Define filterable columns
    const filterableColumns = [
        { header: 'Name', accessor: 'fullName' },
        { header: 'Email', accessor: 'email' },
        { header: 'Position', accessor: 'position' },
        { header: 'Department', accessor: 'jobPositionDepartment' }
    ];

    // Define custom filters
    const customFilters = [
        {
            label: 'Status',
            component: (
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="INVITED">Invited</option>
                    <option value="ON_LEAVE">On Leave</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="TERMINATED">Terminated</option>
                </select>
            )
        },
        {
            label: 'Contract Type',
            component: (
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Types</option>
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="TEMPORARY">Temporary</option>
                    <option value="INTERNSHIP">Internship</option>
                </select>
            )
        },
        {
            label: 'Department',
            component: (
                <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                    ))}
                </select>
            )
        }
    ];

    // Define actions for each row
    const actions = [
        {
            label: 'View',
            icon: <FaEye />,
            className: 'action-view',
            onClick: (employee) => handleRowClick(employee)
        },
        {
            label: 'Edit',
            icon: <FaEdit />,
            className: 'action-edit',
            onClick: (employee) => handleEditClick(employee)
        },
        {
            label: 'Delete',
            icon: <FaTrash />,
            className: 'action-delete',
            onClick: (employee) => handleDeleteEmployee(employee.id)
        }
    ];

    // If there's an error fetching data and not loading
    if (error && !loading) {
        return (
            <div className="error-container">
                <p>Error: {error}</p>
                <button onClick={fetchEmployees}>Try Again</button>
            </div>
        );
    }

    return (
        <div className="employees-container">
            <div className="employees-header">
                <div className="employees-header__content">
                    <h1 className="employees-header__title">Employees Directory</h1>
                    <p className="employees-header__subtitle">
                        Manage your workforce and employee information
                    </p>
                </div>
                <button
                    className="employees-header__add-btn"
                    onClick={() => setShowAddModal(true)}
                >
                    <FaUserPlus />
                    <span>Add Employee</span>
                </button>
            </div>

            {/* DataTable Component */}
            <DataTable
                data={filteredEmployees}
                columns={columns}
                loading={loading}
                tableTitle=""
                showSearch={true}
                showFilters={true}
                filterableColumns={filterableColumns}
                customFilters={customFilters}
                onRowClick={handleRowClick}
                actions={actions}
                itemsPerPageOptions={[10, 25, 50, 100]}
                defaultItemsPerPage={25}
                defaultSortField="fullName"
                defaultSortDirection="asc"
                className="employees-datatable"
            />

            {showAddModal && (
                <AddEmployeeModal
                    onClose={() => setShowAddModal(false)}
                    onSave={handleAddEmployee}
                    jobPositions={jobPositions}
                    sites={sites}
                />
            )}

            {showEditModal && selectedEmployee && (
                <EditEmployeeModal
                    employee={selectedEmployee}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedEmployee(null);
                    }}
                    onSave={handleEditEmployee}
                    jobPositions={jobPositions}
                    sites={sites}
                />
            )}
        </div>
    );
};

export default EmployeesList;