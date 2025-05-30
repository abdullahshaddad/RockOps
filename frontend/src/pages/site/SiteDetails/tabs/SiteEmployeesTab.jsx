import React, { useEffect, useState } from "react";
import DataTable from "../../../../components/common/DataTable/DataTable.jsx";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../../../../contexts/AuthContext.jsx";
import { siteService } from "../../../../services/siteService";
import { useNavigate } from "react-router-dom";
import "../SiteDetails.scss";

const SiteEmployeesTab = ({ siteId }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [employeeData, setEmployeeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [availableEmployees, setAvailableEmployees] = useState([]);
    const [assigningEmployee, setAssigningEmployee] = useState(null);
    const { currentUser } = useAuth();

    const isSiteAdmin = currentUser?.role === "SITE_ADMIN" || currentUser?.role === "ADMIN";

    const handleRowClick = (row) => {
        navigate(`/sites/employee-details/${row.employeeID}`);
    };

    const columns = [
        {
            header: 'Employee ID',
            accessor: 'employeeID',
            sortable: true
        },
        {
            header: 'Employee Name',
            accessor: 'employeeName',
            sortable: true
        },
        {
            header: 'Mobile Number',
            accessor: 'mobileNumber',
            sortable: true
        },
        {
            header: 'Position',
            accessor: 'position',
            sortable: true
        },
        {
            header: 'Department',
            accessor: 'department',
            sortable: true
        },
        {
            header: 'Contract Type',
            accessor: 'contractType',
            sortable: true
        },
        {
            header: 'Actions',
            accessor: 'actions',
            sortable: false,
            render: (row) => (
                isSiteAdmin && (
                    <button
                        className="btn-danger"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            handleUnassignEmployee(row.employeeID);
                        }}
                    >
                        Unassign
                    </button>
                )
            )
        }
    ];

    useEffect(() => {
        if (siteId) {
            fetchEmployees();
        }
    }, [siteId]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await siteService.getSiteEmployees(siteId);
            const data = response.data;

            if (Array.isArray(data)) {
                const transformedData = data.map(item => {
                    let departmentName = "Unknown";
                    if (item.jobPosition?.department?.name) {
                        departmentName = item.jobPosition.department.name;
                    } else if (item.jobPosition?.departmentName) {
                        departmentName = item.jobPosition.departmentName;
                    } else if (item.jobPositionDepartment) {
                        departmentName = item.jobPositionDepartment;
                    }

                    return {
                        employeeID: item.id,
                        employeeName: `${item.firstName || ''} ${item.lastName || ''}`.trim(),
                        mobileNumber: item.phoneNumber || 'N/A',
                        position: item.jobPosition?.positionName || item.jobPositionName || "Unknown",
                        department: departmentName,
                        contractType: item.jobPosition?.type || item.jobPositionType || "N/A"
                    };
                });

                setEmployeeData(transformedData);
            } else {
                setEmployeeData([]);
            }
        } catch (err) {
            console.error('Error in fetchEmployees:', err);
            setError(err.message || 'Failed to fetch employees');
            setEmployeeData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = async () => {
        try {
            const response = await siteService.getUnassignedEmployees();
            console.log('Unassigned employees response:', response); // Debug log
            
            // Ensure we have data and it's an array
            const data = response?.data || [];
            
            // Filter for unassigned employees and transform the data
            const unassignedEmployees = Array.isArray(data) ? data.map(emp => ({
                id: emp.id,
                firstName: emp.firstName || '',
                lastName: emp.lastName || '',
                jobPositionName: emp.jobPosition?.positionName || emp.jobPositionName || 'Not Specified',
                jobPositionDepartment: emp.jobPosition?.department?.name || emp.jobPositionDepartment || 'Not Specified',
                jobPositionType: emp.jobPosition?.type || emp.jobPositionType || 'Not Specified'
            })) : [];

            console.log('Transformed unassigned employees:', unassignedEmployees); // Debug log
            setAvailableEmployees(unassignedEmployees);
            setShowModal(true);
        } catch (err) {
            console.error("Error fetching available employees:", err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to load available employees";
            alert(`Error: ${errorMessage}. Please try again.`);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setAvailableEmployees([]);
        setAssigningEmployee(null);
    };

    const handleAssignEmployee = async (employeeId) => {
        try {
            setAssigningEmployee(employeeId);
            await siteService.assignEmployee(siteId, employeeId);
            await fetchEmployees();
            handleCloseModal();
        } catch (err) {
            console.error("Error assigning employee:", err);
            alert("Failed to assign employee. Please try again.");
        } finally {
            setAssigningEmployee(null);
        }
    };

    const handleUnassignEmployee = async (employeeId) => {
        try {
            await siteService.removeEmployee(siteId, employeeId);
            await fetchEmployees();
        } catch (err) {
            console.error("Error unassigning employee:", err);
            alert("Failed to unassign employee. Please try again.");
        }
    };

    if (loading) {
        return <div className="loading-container">{t('site.loadingEmployees')}</div>;
    }

    return (
        <div className="tab-content">
            <div className="tab-header">
                <div className="departments-header">
                    <h3>{t('site.siteEmployeesReport')}</h3>
                    {isSiteAdmin && (
                        <div className="btn-primary-container">
                            <button className="btn-primary" onClick={handleOpenModal}>
                                Add Employee
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {error ? (
                <div className="error-message">
                    <p>{error}</p>
                    <button className="btn-secondary" onClick={fetchEmployees}>Retry</button>
                </div>
            ) : (
                <div className="table-container">
                    <DataTable
                        data={employeeData}
                        columns={columns}
                        loading={loading}
                        showSearch={true}
                        showFilters={true}
                        filterableColumns={columns}
                        itemsPerPageOptions={[10, 25, 50, 100]}
                        defaultItemsPerPage={10}
                        tableTitle="Employees List"
                        onRowClick={handleRowClick}
                        rowClassName="clickable-row"
                    />
                </div>
            )}

            {showModal && (
                <div className="assign-employee-modal-overlay">
                    <div className="assign-employee-modal-content">
                        <div className="assign-employee-modal-header">
                            <h2>{t('site.assignEmployee')}</h2>
                            <button className="assign-employee-modal-close-button" onClick={handleCloseModal}>×</button>
                        </div>
                        
                        <div className="assign-employee-modal-body">
                            {availableEmployees.length === 0 ? (
                                <div className="assign-employee-no-employees">
                                    <p>{t('site.noEmployeesAvailable')}</p>
                                </div>
                            ) : (
                                <div className="assign-employee-table-container">
                                    <table className="assign-employee-table">
                                        <thead>
                                            <tr>
                                                <th>{t('common.name')}</th>
                                                <th>{t('hr.dashboard.position')}</th>
                                                <th>{t('hr.dashboard.department')}</th>
                                                <th>{t('hr.contractType')}</th>
                                                <th>{t('common.action')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {availableEmployees.map((employee) => (
                                                <tr key={employee.id}>
                                                    <td>{employee.firstName} {employee.lastName}</td>
                                                    <td>{employee.jobPositionName || 'Not Specified'}</td>
                                                    <td>{employee.jobPositionDepartment || 'Not Specified'}</td>
                                                    <td>
                                                        <span className={`status-badge ${employee.jobPositionType?.toLowerCase()}`}>
                                                            {employee.jobPositionType || 'Not Specified'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="assign-employee-btn"
                                                            onClick={() => handleAssignEmployee(employee.id)}
                                                            disabled={assigningEmployee === employee.id}
                                                        >
                                                            {assigningEmployee === employee.id ? 'Assigning...' : t('site.assign')}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SiteEmployeesTab;