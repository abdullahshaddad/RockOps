import React, {useEffect, useState} from "react";
import DataTable from "../../../../components/common/DataTable/DataTable.jsx";
import {useTranslation} from 'react-i18next';
import {useAuth} from "../../../../contexts/AuthContext.jsx";

const SiteEmployeesTab = ({siteId}) => {
    const {t} = useTranslation();
    const [employeeData, setEmployeeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [availableEmployee, setAvailableEmployee] = useState([]);
    const {currentUser} = useAuth();

    const isSiteAdmin = currentUser?.role === "SITE_ADMIN";

    // Define columns for DataTable
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
        }
    ];

    useEffect(() => {
        fetchEmployees();
    }, [siteId]);

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/api/v1/site/${siteId}/employees`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                const text = await response.text();
                try {
                    const json = JSON.parse(text);
                    throw new Error(json.message || `HTTP error! Status: ${response.status}`);
                } catch (err) {
                    throw new Error(`No employees found for this site.`);
                }
            }

            const data = await response.json();

            if (Array.isArray(data)) {
                const transformedData = data.map(item => ({
                    employeeID: item.id,
                    employeeName: `${item.firstName} ${item.lastName}`,
                    mobileNumber: item.phoneNumber,
                    position: item.jobPosition?.positionName || "Unknown",
                    department: item.jobPosition?.department || "Unknown",
                    contractType: item.jobPosition?.type || "N/A"
                }));

                setEmployeeData(transformedData);
            } else {
                setEmployeeData([]);
            }

            setLoading(false);
        } catch (err) {
            setError(err.message);
            setEmployeeData([]);
            setLoading(false);
        }
    };

    // Count employees by position
    const positionCounts = employeeData.reduce((acc, item) => {
        acc[item.position] = (acc[item.position] || 0) + 1;
        return acc;
    }, {});

    const handleOpenModal = () => {
        setShowModal(true);
        fetchAvailableEmployee();
    };

    const handleCloseModal = () => setShowModal(false);

    const fetchAvailableEmployee = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8080/api/v1/employees", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Failed to fetch employee.");

            const data = await response.json();
            const unassignedEmployee = data.filter(ep => ep.siteId === null || ep.siteId === undefined);
            setAvailableEmployee(unassignedEmployee);
        } catch (err) {
            console.error("Error fetching available employees:", err);
            setAvailableEmployee([]);
        }
    };

    const handleAssignEmployee = async (employeeId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/siteadmin/${siteId}/assign-employee/${employeeId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Failed to assign employee.");
            setShowModal(false);
            fetchEmployees(); // Refresh the employees list
        } catch (err) {
            console.error("Error assigning employee:", err);
        }
    };

    if (loading) return <div className="loading-container">{t('site.loadingEmployees')}</div>;

    return (
        <div className="site-employees-tab">
            <div className="tab-header">
                <h3>{t('site.siteEmployeesReport')}</h3>
                {isSiteAdmin && (
                    <div className="btn-primary-container">
                        <button className="assign-button" onClick={handleOpenModal}>
                            {t('site.assignEmployee')}
                        </button>
                    </div>
                )}
            </div>

            <div className="employees-stats">
                {Object.entries(positionCounts).map(([position, count]) => (
                    <div className="stat-card" key={position}>
                        <div className="stat-title">{position}</div>
                        <div className="stat-value">{count}</div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{t('site.assignEmployee')}</h2>
                        <button className="close-modal" onClick={handleCloseModal}>×</button>
                        <div className="employee-list">
                            {availableEmployee.length === 0 ? (
                                <p>{t('site.noEmployeesAvailable')}</p>
                            ) : (
                                <table className="employee-table">
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
                                    {availableEmployee.map((ep) => (
                                        <tr key={ep.id}>
                                            <td>{ep.firstName} {ep.lastName}</td>
                                            <td>{ep.jobPositionName}</td>
                                            <td>{ep.jobPositionDepartment}</td>
                                            <td>{ep.jobPositionType}</td>
                                            <td>
                                                <button
                                                    className="assign-btn"
                                                    onClick={() => handleAssignEmployee(ep.id)}
                                                >
                                                    {t('site.assign')}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {error ? (
                <div className="error-container">{error}</div>
            ) : (
                <div className="data-table-container">
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
                    />
                </div>
            )}
        </div>
    );
};

export default SiteEmployeesTab;