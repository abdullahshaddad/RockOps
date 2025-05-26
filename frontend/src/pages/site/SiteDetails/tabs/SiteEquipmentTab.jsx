import React, {useEffect, useState} from "react";
import DataTable from "../../../../components/common/DataTable/DataTable.jsx";
import {useTranslation} from 'react-i18next';
import {useAuth} from "../../../../contexts/AuthContext.jsx";

const SiteEquipmentTab = ({siteId}) => {
    const {t} = useTranslation();
    const [equipmentData, setEquipmentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [availableEquipment, setAvailableEquipment] = useState([]);
    const {currentUser} = useAuth();

    const isSiteAdmin = currentUser?.role === "SITE_ADMIN" || currentUser?.role === "ADMIN";

    // Define columns for DataTable
    const columns = [
        {
            header: 'Equipment ID',
            accessor: 'equipmentID',
            sortable: true
        },
        {
            header: 'Equipment Type',
            accessor: 'equipmentType',
            sortable: true
        },
        {
            header: 'Model Number',
            accessor: 'modelNumber',
            sortable: true
        },
        {
            header: 'Status',
            accessor: 'status',
            sortable: true
        },
        {
            header: 'Driver Name',
            accessor: 'driverName',
            sortable: true
        },
        {
            header: 'Manufacture Date',
            accessor: 'manufactureDate',
            sortable: true
        },
        {
            header: 'Purchase Date',
            accessor: 'purchaseDate',
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
                            handleUnassignEquipment(row.equipmentID);
                        }}
                    >
                        Unassign
                    </button>
                )
            )
        }
    ];

    useEffect(() => {
        fetchEquipment();
    }, [siteId]);

    const fetchEquipment = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/api/v1/site/${siteId}/equipment`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const text = await response.text();
                try {
                    const json = JSON.parse(text);
                    throw new Error(json.message || `HTTP error! Status: ${response.status}`);
                } catch (err) {
                    throw new Error(`No equipment found for this site.`);
                }
            }

            const data = await response.json();

            if (Array.isArray(data)) {
                const transformedData = data.map((item) => ({
                    equipmentID: item.id,
                    equipmentType: typeof item.type === 'object' ? item.type.name : item.type,
                    modelNumber: item.modelNumber,
                    status: item.status,
                    driverName: item.mainDriver ? `${item.mainDriver.firstName} ${item.mainDriver.lastName}` : "No Driver",
                    manufactureDate: item.manufactureYear,
                    purchaseDate: item.purchasedDate,
                }));

                setEquipmentData(transformedData);
            } else {
                setEquipmentData([]);
            }

            setLoading(false);
        } catch (err) {
            setError(err.message);
            setEquipmentData([]);
            setLoading(false);
        }
    };

    // Count equipment types
    const Equipcounts = equipmentData.reduce((acc, item) => {
        acc[item.equipmentType] = (acc[item.equipmentType] || 0) + 1;
        return acc;
    }, {});

    const handleOpenModal = () => {
        setShowModal(true);
        fetchAvailableEquipment();
    };

    const handleCloseModal = () => setShowModal(false);

    const fetchAvailableEquipment = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8080/equipment", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Failed to fetch equipment.");

            const data = await response.json();
            const unassignedEquipment = data.filter(eq => !eq.site);
            setAvailableEquipment(unassignedEquipment);
        } catch (err) {
            console.error("Error fetching available equipment:", err);
            setAvailableEquipment([]);
        }
    };

    const handleAssignEquipment = async (equipmentId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/siteadmin/${siteId}/assign-equipment/${equipmentId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Failed to assign equipment.");
            setShowModal(false);
            fetchEquipment(); // Refresh the equipment list
        } catch (err) {
            console.error("Error assigning equipment:", err);
        }
    };

    const handleUnassignEquipment = async (equipmentId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/siteadmin/${siteId}/remove-equipment/${equipmentId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Failed to unassign equipment.");
            await fetchEquipment(); // Refresh the equipment list
        } catch (err) {
            console.error("Error unassigning equipment:", err);
            alert("Failed to unassign equipment. Please try again.");
        }
    };

    if (loading) return <div className="loading-container">{t('site.loadingEquipment')}</div>;

    return (
        <div className="site-equipment-tab">
            <div className="tab-header">
                <h3>{t('site.siteEquipmentReport')}</h3>
                {isSiteAdmin && (
                    <div className="btn-primary-container">
                        <button className="btn btn-primary" onClick={handleOpenModal}>
                            {t('site.assignEquipment')}
                        </button>
                    </div>

                )}
            </div>

            <div className="equipment-stats">
                {Object.entries(Equipcounts).map(([type, count]) => (
                    <div className="stat-card" key={type}>
                        <div className="stat-title">{type}</div>
                        <div className="stat-value">{count}</div>
                    </div>
                ))}
            </div>
            {/* Updated Assign Equipment Modal JSX - Replace the existing modal section in your component */}
            {showModal && (
                <div className="assign-equipment-modal-overlay">
                    <div className="assign-equipment-modal-content">
                        <div className="assign-equipment-modal-header">
                            <h2>{t('site.assignEquipment')}</h2>
                            <button
                                className="assign-equipment-modal-close-button"
                                onClick={handleCloseModal}
                            >
                                ×
                            </button>
                        </div>

                        <div className="assign-equipment-modal-body">
                            {availableEquipment.length === 0 ? (
                                <div className="assign-equipment-no-equipment">
                                    <p>{t('site.noEquipmentAvailable')}</p>
                                </div>
                            ) : (
                                <div className="assign-equipment-table-container">
                                    <table className="assign-equipment-table">
                                        <thead>
                                        <tr>
                                            <th>{t('common.type')}</th>
                                            <th>{t('common.model')}</th>
                                            <th>{t('common.status')}</th>
                                            <th>{t('common.action')}</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {availableEquipment.map((eq) => {
                                            const eqData = eq.equipment || {};
                                            const equipmentId = eqData.id || eq.id;
                                            const equipmentType = eqData.type || eq.type;
                                            const modelNumber = eqData.modelNumber || eq.modelNumber;
                                            const status = eqData.status || eq.status;

                                            return (
                                                <tr key={equipmentId}>
                                                    <td
                                                        className="assign-equipment-type"
                                                        data-label={t('common.type')}
                                                    >
                                                        {equipmentType}
                                                    </td>
                                                    <td
                                                        className="assign-equipment-model"
                                                        data-label={t('common.model')}
                                                    >
                                                        {modelNumber}
                                                    </td>
                                                    <td data-label={t('common.status')}>
                                                <span
                                                    className={`assign-equipment-status status-${status?.toLowerCase().replace(/\s+/g, '-')}`}
                                                >
                                                    {status}
                                                </span>
                                                    </td>
                                                    <td data-label={t('common.action')}>
                                                        <button
                                                            className="assign-equipment-btn"
                                                            onClick={() => handleAssignEquipment(equipmentId)}
                                                        >
                                                            {t('site.assign')}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        </tbody>
                                    </table>
                                </div>
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
                        data={equipmentData}
                        columns={columns}
                        loading={loading}
                        showSearch={true}
                        showFilters={true}
                        filterableColumns={columns}
                        itemsPerPageOptions={[10, 25, 50, 100]}
                        defaultItemsPerPage={10}
                        tableTitle="Equipment List"
                    />
                </div>
            )}
        </div>
    );
};

export default SiteEquipmentTab;