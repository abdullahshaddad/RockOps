import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import DataTable from "../../../../components/common/DataTable/DataTable";
import "./SiteEquipment.scss";
import SiteSidebar from "./../SiteSidebar";
import { useTranslation } from 'react-i18next';
import {useAuth} from "../../../../Contexts/AuthContext";

const SiteEquipment = () => {
    const { t } = useTranslation();
    const { siteId } = useParams();
    const [equipmentData, setEquipmentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [availableEquipment, setAvailableEquipment] = useState([]);
    const { currentUser } = useAuth();

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
        const fetchEquipment = async () => {
            try {
                const token = localStorage.getItem("token"); // Ensure token is stored after login
                const response = await fetch(`http://localhost:8080/api/v1/site/${siteId}/equipment`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    // Read response as text and check if it's valid JSON
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
                    // Transform API data to use the required field names
                    const transformedData = data.map((item) => ({
                        equipmentID: item.id,
                        equipmentType: item.type,
                        modelNumber: item.modelNumber,
                        status: item.status,
                        driverName: item.mainDriver ? `${item.mainDriver.firstName} ${item.mainDriver.lastName}` : "No Driver",
                        manufactureDate: item.manufactureYear,
                        purchaseDate: item.purchasedDate,
                    }));

                    setEquipmentData(transformedData);
                } else {
                    setEquipmentData([]); // No equipment, but valid JSON response
                }

                setLoading(false);
            } catch (err) {
                setError(err.message);
                setEquipmentData([]); // Ensure empty state instead of breaking the page
                setLoading(false);
            }
        };

        fetchEquipment();
    }, [siteId]);

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
            console.log("🚀 Raw equipment data from API:", data); // Log full response

            const unassignedEquipment = data.filter(eq => !eq.site);
            console.log("✅ Unassigned Equipment:", unassignedEquipment); // Log filtered data

            if (unassignedEquipment.length > 0) {
                console.log("👀 Sample equipment object structure:", unassignedEquipment[0]);
            }

            setAvailableEquipment(unassignedEquipment);
        } catch (err) {
            console.error("❌ Error fetching available equipment:", err);
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
            window.location.reload();
        } catch (err) {
            console.error("Error assigning equipment:", err);
        }
    };

    if (loading) return <div className="loading-container">{t('site.loadingEquipment')}</div>;

    return (
        <div className="siteEquipContainer">
            {/* Left Sidebar Section */}
            <div className="siteSidebar">
                <SiteSidebar siteId={siteId} />
            </div>

            {/* Right Content Section */}
            <div className="siteEquipContent">
                <div className="dataCount">
                    <h1>{t('site.siteEquipmentReport')}</h1>
                    <div className="SiteEquipCardsContainer">
                        {Object.entries(Equipcounts).map(([Equip, count]) => (
                            <div className="SiteEquipCard" key={Equip}>
                                <span>{Equip}</span>
                                <span>{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="assignEquipment">
                    {isSiteAdmin && (
                        <button className="assignEquipmentButton" onClick={handleOpenModal}>{t('site.assignEquipment')}</button>
                    )}
                </div>
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h2>{t('site.assignEquipment')}</h2>
                            <button className="close-modal" onClick={handleCloseModal}>X</button>
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
                                            const eqData = eq.equipment || {}; // in case it's missing
                                            return (
                                                <tr key={eqData.id || eq.id}>
                                                    <td>{eqData.type}</td>
                                                    <td>{eqData.modelNumber}</td>
                                                    <td>{eqData.status}</td>
                                                    <td>
                                                        <button className="assign-btn" onClick={() => handleAssignEquipment(eqData.id || eq.id)}>
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

                {/* Show error only if it exists */}
                {error ? (
                    <div className="error-container">{error}</div>
                ) : (
                    <div className="siteEquipTable">
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
        </div>
    );
};

export default SiteEquipment;
