import React, {useEffect, useState} from "react";
import DataTable from "../../../../components/common/DataTable/DataTable";
import {useTranslation} from 'react-i18next';
import {useAuth} from "../../../../contexts/AuthContext";


const SiteFixedAssetsTab = ({siteId}) => {
    const {t} = useTranslation();
    const [assetsData, setAssetsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [availableFixedAsset, setAvailableFixedAsset] = useState([]);
    const {currentUser} = useAuth();

    const isSiteAdmin = currentUser?.role === "SITE_ADMIN";

    // Define columns for DataTable
    const columns = [
        {
            header: 'Asset ID',
            accessor: 'assetID',
            sortable: true
        },
        {
            header: 'Asset Name',
            accessor: 'assetName',
            sortable: true
        },
        {
            header: 'Creation Date',
            accessor: 'creationDate',
            sortable: true
        },
        {
            header: 'Area/Quantity',
            accessor: 'areaQuantity',
            sortable: true
        }
    ];

    useEffect(() => {
        fetchFixedAssets();
    }, [siteId]);

    const fetchFixedAssets = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/api/v1/site/${siteId}/fixedassets`, {
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
                    throw new Error(`No fixed assets found for this site.`);
                }
            }

            const data = await response.json();

            if (Array.isArray(data)) {
                const transformedData = data.map((asset, index) => ({
                    assetID: `Asset-${String(index + 1).padStart(3, "0")}`,
                    assetName: asset.name,
                    creationDate: asset.creationDate.split("T")[0],
                    areaQuantity: `${asset.area} m²`,
                }));

                setAssetsData(transformedData);
            } else {
                setAssetsData([]);
            }

            setLoading(false);
        } catch (err) {
            setError(err.message);
            setAssetsData([]);
            setLoading(false);
        }
    };

    // Count assets per name
    const assetCounts = assetsData.reduce((acc, item) => {
        acc[item.assetName] = (acc[item.assetName] || 0) + 1;
        return acc;
    }, {});

    const fetchAvailableFixedAsset = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8080/fixedAssets", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Failed to fetch fixed assets.");

            const data = await response.json();
            const unassignedFixedAsset = data.filter(ep => !ep.site);
            setAvailableFixedAsset(unassignedFixedAsset);
        } catch (err) {
            console.error("Error fetching available fixed asset:", err);
            setAvailableFixedAsset([]);
        }
    };

    const handleAssignFixedAsset = async (fixedAssetId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/siteadmin/${siteId}/assign-fixedAsset/${fixedAssetId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Failed to assign fixed asset.");
            setShowModal(false);
            fetchFixedAssets(); // Refresh the fixed assets list
        } catch (err) {
            console.error("Error assigning fixed asset:", err);
        }
    };

    const handleOpenModal = () => {
        setShowModal(true);
        fetchAvailableFixedAsset();
    };

    const handleCloseModal = () => setShowModal(false);

    if (loading) return <div className="loading-container">{t('site.loadingFixedAssets')}</div>;

    return (
        <div className="site-fixed-assets-tab">
            <div className="departments-header">
                <h3>{t('site.siteFixedAssetsReport')}</h3>
                {isSiteAdmin && (
                    <div className="btn-primary-container">
                        <button className="assign-button" onClick={handleOpenModal}>
                            {t('site.assignFixedAsset')}
                        </button>
                    </div>
                )}
            </div>

            <div className="assets-stats">
                {Object.entries(assetCounts).map(([assetName, count]) => (
                    <div className="stat-card" key={assetName}>
                        <div className="stat-title">{assetName}</div>
                        <div className="stat-value">{count}</div>
                    </div>
                ))}
            </div>

            {/* Updated Modal JSX - Replace the existing modal section in your component */}
            {showModal && (
                <div className="assign-fixed-asset-modal-overlay">
                    <div className="assign-fixed-asset-modal-content">
                        <div className="assign-fixed-asset-modal-header">
                            <h2>{t('site.assignFixedAsset')}</h2>
                            <button
                                className="assign-fixed-asset-modal-close-button"
                                onClick={handleCloseModal}
                            >
                                ×
                            </button>
                        </div>

                        <div className="assign-fixed-asset-modal-body">
                            {availableFixedAsset.length === 0 ? (
                                <div className="assign-fixed-asset-no-assets">
                                    <p>{t('site.noFixedAssetsAvailable')}</p>
                                </div>
                            ) : (
                                <div className="assign-fixed-asset-table-container">
                                    <table className="assign-fixed-asset-table">
                                        <thead>
                                        <tr>
                                            <th>{t('common.name')}</th>
                                            <th>{t('site.creationDate')}</th>
                                            <th>{t('fixedAssets.areaOrQuantity')}</th>
                                            <th>{t('common.action')}</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {availableFixedAsset.map((ep) => (
                                            <tr key={ep.id}>
                                                <td>{ep.name}</td>
                                                <td className="assign-fixed-asset-creation-date">
                                                    {ep.creationDate}
                                                </td>
                                                <td className="assign-fixed-asset-area">
                                                    {ep.area} m²
                                                </td>
                                                <td>
                                                    <button
                                                        className="assign-fixed-asset-btn"
                                                        onClick={() => handleAssignFixedAsset(ep.id)}
                                                    >
                                                        {t('site.assign')}
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

            {error ? (
                <div className="error-container">{error}</div>
            ) : (
                <div className="data-table-container">
                    <DataTable
                        data={assetsData}
                        columns={columns}
                        loading={loading}
                        showSearch={true}
                        showFilters={true}
                        filterableColumns={columns}
                        itemsPerPageOptions={[10, 25, 50, 100]}
                        defaultItemsPerPage={10}
                        tableTitle="Fixed Assets List"
                    />
                </div>
            )}
        </div>
    );
};

export default SiteFixedAssetsTab;