import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import DataTable from "../../../../components/common/DataTable/DataTable";
import "./SitePartners.scss";
import SiteSidebar from "./../SiteSidebar";
import { useTranslation } from 'react-i18next';
import {useAuth} from "../../../../Contexts/AuthContext";

const SitePartners = () => {
    const { t } = useTranslation();
    const { siteId } = useParams();
    const [partnersData, setPartnersData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [availablePartners, setAvailablePartners] = useState([]);
    const [partnerPercentages, setPartnerPercentages] = useState({});
    const { currentUser } = useAuth();

    const isSiteAdmin = currentUser?.role === "SITE_ADMIN";

    // Define columns for DataTable
    const columns = [
        {
            header: 'Partner ID',
            accessor: 'partnerID',
            sortable: true
        },
        {
            header: 'First Name',
            accessor: 'partnerFirstName',
            sortable: true
        },
        {
            header: 'Last Name',
            accessor: 'partnerLastName',
            sortable: true
        },
        {
            header: 'Partner Name',
            accessor: 'partnerName',
            sortable: true
        },
        {
            header: 'Percentage',
            accessor: 'partnerPercentage',
            sortable: true
        }
    ];

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const token = localStorage.getItem("token"); // Ensure token is stored after login
                const response = await fetch(`http://localhost:8080/api/v1/site/${siteId}/partners`, {
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
                        throw new Error(`No Partners found for this site.`);
                    }
                }

                const data = await response.json();

                if (Array.isArray(data)) {
                    const transformedData = data.map((item) => ({
                        partnerID: item.id,
                        partnerFirstName: item.firstName,
                        partnerLastName: item.lastName,
                        partnerName: `${item.firstName} ${item.lastName}`,
                        partnerPercentage: `${parseFloat(item.percentage)}%`, // Correct line
                    }));

                    setPartnersData(transformedData);
                } else {
                    setPartnersData([]); // No equipment, but valid JSON response
                }

                setLoading(false);
            } catch (err) {
                setError(err.message);
                setPartnersData([]); // Ensure empty state instead of breaking the page
                setLoading(false);
            }
        };

        fetchPartners();
    }, [siteId]);

    const handleOpenModal = () => {
        setShowModal(true);
        fetchAvailablePartners();
    };

    const handlePercentageChange = (partnerId, value) => {
        setPartnerPercentages(prev => ({
            ...prev,
            [partnerId]: value
        }));
    };

    const handleCloseModal = () => setShowModal(false);

    const fetchAvailablePartners = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/api/v1/site/${siteId}/unassigned-partners`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Failed to fetch partners.");

            const data = await response.json();
            console.log("🚀 Raw partners data from API:", data); // Log full response

            const unassignedPartners = data.filter(eq => !eq.site);
            console.log("✅ Unassigned Partners:", unassignedPartners); // Log filtered data

            if (unassignedPartners.length > 0) {
                console.log("👀 Sample partners object structure:", unassignedPartners[0]);
            }

            setAvailablePartners(unassignedPartners);
        } catch (err) {
            console.error("❌ Error fetching available partners:", err);
            setAvailablePartners([]);
        }
    };

    const handleAssignPartner = async (partnerId) => {
        try {
            const token = localStorage.getItem("token");
            const percentageValue = partnerPercentages[partnerId]; // read from state

            console.log("Sending payload:", { percentage: parseFloat(percentageValue) });

            const response = await fetch(`http://localhost:8080/siteadmin/${siteId}/assign-partner/${partnerId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ percentage: parseFloat(percentageValue) }),
            });

            if (!response.ok) throw new Error("Failed to assign partner.");
            setShowModal(false);
            window.location.reload();
        } catch (err) {
            console.error("Error assigning partner:", err);
        }
    };

    if (loading) return <div className="loading-container">Loading Partners...</div>;

    return (
        <div className="sitePartnerContainer">
            {/* Left Sidebar Section */}
            <div className="siteSidebar">
                <SiteSidebar siteId={siteId} />
            </div>

            {/* Right Content Section */}
            <div className="sitePartnerContent">
                <div className="dataCount">
                    <h1>Site Partners Report</h1>
                </div>
                <div className="assignPartner">
                    {isSiteAdmin && (
                        <button className="assignPartnerButton" onClick={handleOpenModal}>Assign Partner</button>
                    )}
                </div>
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h2>Assign Partner</h2>
                            <button className="close-modal" onClick={handleCloseModal}>X</button>
                            <div className="partner-list">
                                {availablePartners.length === 0 ? (
                                    <p>No Partners Available</p>
                                ) : (
                                    <table className="partner-table">
                                        <thead>
                                        <tr>
                                            <th>First Name</th>
                                            <th>Last Name</th>
                                            <th>Percentage</th>
                                            <th>{t('common.action')}</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {availablePartners.map((eq) => (
                                            <tr key={eq.id}>
                                                <td>{eq.firstName}</td>
                                                <td>{eq.lastName}</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        value={partnerPercentages[eq.id] || ""}
                                                        onChange={(e) =>
                                                            setPartnerPercentages(prev => ({
                                                                ...prev,
                                                                [eq.id]: e.target.value
                                                            }))
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <button
                                                        className="assign-btn"
                                                        onClick={() => handleAssignPartner(eq.id)}
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

                {/* Show error only if it exists */}
                {error ? (
                    <div className="error-container">{error}</div>
                ) : (
                    <div className="sitePartnerTable">
                        <DataTable
                            data={partnersData}
                            columns={columns}
                            loading={loading}
                            showSearch={true}
                            showFilters={true}
                            filterableColumns={columns}
                            itemsPerPageOptions={[10, 25, 50, 100]}
                            defaultItemsPerPage={10}
                            tableTitle="Partners List"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SitePartners;
