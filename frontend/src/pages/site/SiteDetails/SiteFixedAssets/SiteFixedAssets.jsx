import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import DataTable from "../../../../components/common/DataTable/DataTable";
import "./SiteFixedAssets.scss";
import SiteSidebar from "../SiteSidebar";
import { useTranslation } from 'react-i18next';
import {useAuth} from "../../../../Contexts/AuthContext";

const SiteFixedAssets = () => {
    const { t } = useTranslation();
    const { siteId } = useParams();
    const [assetsData, setAssetsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [availableFixedAsset, setAvailableFixedAsset] = useState([]);
    const { currentUser } = useAuth();

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
        const fetchFixedAssets = async () => {
            try {
                const token = localStorage.getItem("token"); // Ensure token is stored after login
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
                    // Transform API data to match the expected structure
                    const transformedData = data.map((asset, index) => ({
                        assetID: `Asset-${String(index + 1).padStart(3, "0")}`,
                        assetName: asset.name,
                        creationDate: asset.creationDate.split("T")[0], // Format as YYYY-MM-DD
                        areaQuantity: `${asset.area} m²`,
                    }));

                    setAssetsData(transformedData);
                } else {
                    setAssetsData([]); // No assets, but valid response
                }

                setLoading(false);
            } catch (err) {
                setError(err.message);
                setAssetsData([]); // Ensure empty state instead of breaking the page
                setLoading(false);
            }
        };

        fetchFixedAssets();
    }, [siteId]);

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
            console.log("Unassigned Fixed Asset:", unassignedFixedAsset);
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
            window.location.reload();
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
        <div className="siteAssetsContainer">
            {/* Left Sidebar Section */}
            <div className="siteSidebar">
                <SiteSidebar siteId={siteId} />
            </div>

            {/* Right Content Section */}
            <div className="siteAssetsContent">
                <div className="dataCount">
                    <h1>{t('site.siteFixedAssetsReport')}</h1>
                    <div className="SiteAssetsCardsContainer">
                        {Object.entries(assetCounts).map(([assetName, count]) => (
                            <div className="SiteAssetsCard" key={assetName}>
                                <span>{assetName}</span>
                                <span>{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="assignFixedAssets">
                    {isSiteAdmin && (
                        <button className="assignFixedAssetsButton" onClick={handleOpenModal}>{t('site.assignFixedAsset')}</button>
                    )}
                </div>

                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h2>{t('site.assignFixedAsset')}</h2>
                            <button className="close-modal" onClick={handleCloseModal}>X</button>
                            <div className="fixedAssets-list">
                                {availableFixedAsset.length === 0 ? (
                                    <p>{t('site.noFixedAssetsAvailable')}</p>
                                ) : (
                                    <table className="fixedAssets-table">
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
                                                <td>{ep.creationDate}</td>
                                                <td>{ep.area}</td>
                                                <td>
                                                    <button className="assign-btn" onClick={() => handleAssignFixedAsset(ep.id)}>
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

                {/* Error Message */}
                {error ? (
                    <div className="error-container">{error}</div>
                ) : (
                    <div className="siteAssetsTable">
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
        </div>
    );
};

export default SiteFixedAssets;
