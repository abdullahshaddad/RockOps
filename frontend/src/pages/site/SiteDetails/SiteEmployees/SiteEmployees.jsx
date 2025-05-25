import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import DataTable from "../../../../components/common/DataTable/DataTable";
import "./SiteEmployees.scss";
import SiteSidebar from "./../SiteSidebar"; // Add sidebar
import { useTranslation } from 'react-i18next';
import {useAuth} from "../../../../Contexts/AuthContext";

const SiteEmployees = () => {
    const { t } = useTranslation();
    const { siteId } = useParams();
    const [employeeData, setEmployeeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [availableEmployee, setAvailableEmployee] = useState([]);
    const { currentUser } = useAuth();

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
                        department:item.jobPosition?.department || "Unknown",
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

        fetchEmployees();
    }, [siteId]);

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
            console.log("Unassigned Employee:", unassignedEmployee);
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
            window.location.reload();
        } catch (err) {
            console.error("Error assigning employee:", err);
        }
    };

    if (loading) return <div className="loading-container">{t('site.loadingEmployees')}</div>;

    return (
        <div className="siteEmployeeContainer">
            {/* Left Sidebar Section */}
            <div className="siteSidebar">
                <SiteSidebar siteId={siteId} />
            </div>

            {/* Right Content Section */}
            <div className="siteEmployeeContent">
                <div className="dataCount">
                    <h1>{t('site.siteEmployeesReport')}</h1>
                    <div className="SiteEmployeeCardsContainer">
                        {Object.entries(positionCounts).map(([position, count]) => (
                            <div className="SiteEmployeeCard" key={position}>
                                <span>{position}</span>
                                <span>{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="assignEmployee">
                    {isSiteAdmin && (
                        <button className="assignEmployeeButton" onClick={handleOpenModal}>{t('site.assignEmployee')}</button>
                    )}
                </div>

                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h2>{t('site.assignEmployee')}</h2>
                            <button className="close-modal" onClick={handleCloseModal}>X</button>
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
                                                    <button className="assign-btn" onClick={() => handleAssignEmployee(ep.id)}>
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

                {/* Show error only if it exists */}
                {error ? (
                    <div className="error-container">{error}</div>
                ) : (
                    <div className="siteEmployeeTable">
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
        </div>
    );
};

export default SiteEmployees;
