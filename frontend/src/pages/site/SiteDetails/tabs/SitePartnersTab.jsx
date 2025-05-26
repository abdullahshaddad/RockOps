import React, {useEffect, useState} from "react";
import DataTable from "../../../../components/common/DataTable/DataTable.jsx";
import {useTranslation} from 'react-i18next';
import {useAuth} from "../../../../contexts/AuthContext.jsx";

const SitePartnersTab = ({siteId}) => {
    const {t} = useTranslation();
    const [partnersData, setPartnersData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [availablePartners, setAvailablePartners] = useState([]);
    const [partnerPercentages, setPartnerPercentages] = useState({});
    const {currentUser} = useAuth();

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
        fetchPartners();
    }, [siteId]);

    const fetchPartners = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/api/v1/site/${siteId}/partners`, {
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
                    partnerPercentage: `${parseFloat(item.percentage)}%`,
                }));

                setPartnersData(transformedData);
            } else {
                setPartnersData([]);
            }

            setLoading(false);
        } catch (err) {
            setError(err.message);
            setPartnersData([]);
            setLoading(false);
        }
    };

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
            const unassignedPartners = data.filter(eq => !eq.site);
            setAvailablePartners(unassignedPartners);
        } catch (err) {
            console.error("Error fetching available partners:", err);
            setAvailablePartners([]);
        }
    };

    const handleAssignPartner = async (partnerId) => {
        try {
            const token = localStorage.getItem("token");
            const percentageValue = partnerPercentages[partnerId];

            const response = await fetch(`http://localhost:8080/siteadmin/${siteId}/assign-partner/${partnerId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({percentage: parseFloat(percentageValue)}),
            });

            if (!response.ok) throw new Error("Failed to assign partner.");
            setShowModal(false);
            fetchPartners(); // Refresh the partners list
        } catch (err) {
            console.error("Error assigning partner:", err);
        }
    };

    if (loading) return <div className="loading-container">Loading Partners...</div>;

    return (
        <div className="site-partners-tab">
            <div className="tab-header">
                <h3>Site Partners Report</h3>
                {isSiteAdmin && (
                    <div className="btn-primary-container">
                        <button className="assign-button" onClick={handleOpenModal}>
                            Assign Partner
                        </button>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Assign Partner</h2>
                        <button className="close-modal" onClick={handleCloseModal}>×</button>
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

            {error ? (
                <div className="error-container">{error}</div>
            ) : (
                <div className="data-table-container">
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
    );
};

export default SitePartnersTab;