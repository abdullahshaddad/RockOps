import React, {useEffect, useState} from "react";
import DataTable from "../../../../components/common/DataTable/DataTable.jsx";
import {useTranslation} from 'react-i18next';
import {useAuth} from "../../../../contexts/AuthContext.jsx";
import { FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const SitePartnersTab = ({siteId}) => {
    const {t} = useTranslation();
    const [partnersData, setPartnersData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [availablePartners, setAvailablePartners] = useState([]);
    const [partnerPercentages, setPartnerPercentages] = useState({});
    const {currentUser} = useAuth();
    const [editingPartner, setEditingPartner] = useState(null);
    const [editPercentage, setEditPercentage] = useState("");

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
            sortable: true,
            render: (row) => (
                editingPartner === row.partnerID ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                            type="number"
                            className="assign-partner-percentage-input"
                            value={editPercentage}
                            onChange={(e) => setEditPercentage(e.target.value)}
                            placeholder="0"
                            min="0"
                            max="100"
                            step="0.01"
                            style={{ width: '80px' }}
                        />
                        <button
                            className="icon-button success"
                            onClick={() => handleUpdatePartner(row.partnerID, editPercentage)}
                            disabled={!editPercentage || parseFloat(editPercentage) < 0 || parseFloat(editPercentage) > 100}
                            title="Save"
                        >
                            <FaSave />
                        </button>
                        <button
                            className="icon-button cancel"
                            onClick={() => {
                                setEditingPartner(null);
                                setEditPercentage("");
                            }}
                            title="Cancel"
                        >
                            <FaTimes />
                        </button>
                    </div>
                ) : (
                    row.partnerPercentage
                )
            )
        },
        {
            header: 'Actions',
            accessor: 'actions',
            sortable: false,
            render: (row) => (
                isSiteAdmin && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            className="icon-button primary"
                            onClick={() => {
                                setEditingPartner(row.partnerID);
                                setEditPercentage(row.partnerPercentage.replace('%', ''));
                            }}
                            title="Edit Percentage"
                        >
                            <FaEdit />
                        </button>
                        <button
                            className="icon-button danger"
                            onClick={() => handleRemovePartner(row.partnerID)}
                            title="Remove Partner"
                        >
                            <FaTrash />
                        </button>
                    </div>
                )
            )
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
                    partnerPercentage: `${parseFloat(item.percentage).toFixed(2)}%`,
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

    const handleUpdatePartner = async (partnerId, newPercentage) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/siteadmin/${siteId}/update-partner-percentage/${partnerId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ percentage: parseFloat(newPercentage) }),
            });

            if (!response.ok) throw new Error("Failed to update partner percentage.");
            await fetchPartners(); // Refresh the partners list
            setEditingPartner(null);
            setEditPercentage("");
        } catch (err) {
            console.error("Error updating partner percentage:", err);
            alert("Failed to update partner percentage. Please try again.");
        }
    };

    const handleRemovePartner = async (partnerId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/siteadmin/${siteId}/remove-partner/${partnerId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Failed to remove partner.");
            await fetchPartners(); // Refresh the partners list
        } catch (err) {
            console.error("Error removing partner:", err);
            alert("Failed to remove partner. Please try again.");
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

            {/* Updated Assign Partner Modal JSX - Replace the existing modal section in your component */}
            {showModal && (
                <div className="assign-partner-modal-overlay">
                    <div className="assign-partner-modal-content">
                        <div className="assign-partner-modal-header">
                            <h2>Assign Partner</h2>
                            <button
                                className="assign-partner-modal-close-button"
                                onClick={handleCloseModal}
                            >
                                ×
                            </button>
                        </div>

                        <div className="assign-partner-modal-body">
                            {availablePartners.length === 0 ? (
                                <div className="assign-partner-no-partners">
                                    <p>No Partners Available</p>
                                </div>
                            ) : (
                                <div className="assign-partner-table-container">
                                    <table className="assign-partner-table">
                                        <thead>
                                        <tr>
                                            <th>First Name</th>
                                            <th>Last Name</th>
                                            <th>Percentage (%)</th>
                                            <th>{t('common.action')}</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {availablePartners.map((partner) => {
                                            const currentPercentage = partnerPercentages[partner.id] || "";
                                            const isValidPercentage = currentPercentage &&
                                                parseFloat(currentPercentage) >= 0 &&
                                                parseFloat(currentPercentage) <= 100;

                                            return (
                                                <tr key={partner.id}>
                                                    <td
                                                        className="assign-partner-first-name"
                                                        data-label="First Name"
                                                    >
                                                        {partner.firstName}
                                                    </td>
                                                    <td
                                                        className="assign-partner-last-name"
                                                        data-label="Last Name"
                                                    >
                                                        {partner.lastName}
                                                    </td>
                                                    <td data-label="Percentage">
                                                        <div className="assign-partner-percentage-label">
                                                            <input
                                                                type="number"
                                                                className="assign-partner-percentage-input"
                                                                value={currentPercentage}
                                                                onChange={(e) => handlePercentageChange(partner.id, e.target.value)}
                                                                placeholder="0"
                                                                min="0"
                                                                max="100"
                                                                step="0.01"
                                                            />
                                                        </div>
                                                        <div
                                                            className={`assign-partner-validation-message ${
                                                                currentPercentage && !isValidPercentage ? 'show' : ''
                                                            }`}
                                                        >
                                                            Please enter a value between 0 and 100
                                                        </div>
                                                    </td>
                                                    <td data-label="Action">
                                                        <button
                                                            className="assign-partner-btn"
                                                            onClick={() => handleAssignPartner(partner.id)}
                                                            disabled={!isValidPercentage}
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