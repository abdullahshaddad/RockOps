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

    const isSiteAdmin = currentUser?.role === "SITE_ADMIN";

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

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{t('site.assignEquipment')}</h2>
                        <button className="close-modal" onClick={handleCloseModal}>×</button>
                        <div className="equipment-list">
                            {availableEquipment.length === 0 ? (
                                <p>{t('site.noEquipmentAvailable')}</p>
                            ) : (
                                <table className="equipment-table">
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
                                        return (
                                            <tr key={eqData.id || eq.id}>
                                                <td>{eqData.type}</td>
                                                <td>{eqData.modelNumber}</td>
                                                <td>{eqData.status}</td>
                                                <td>
                                                    <button
                                                        className="assign-btn"
                                                        onClick={() => handleAssignEquipment(eqData.id || eq.id)}
                                                    >
                                                        {t('site.assign')}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
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