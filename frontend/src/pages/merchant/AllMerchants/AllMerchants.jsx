import React, { useState, useEffect } from "react";
import "./AllMerchants.scss";
import { useNavigate } from 'react-router-dom';

const AllMerchants = ({
                          onEdit,
                          onDelete
                      }) => {
    const [localSearchTerm, setLocalSearchTerm] = useState("");
    const [merchants, setMerchants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Fetch merchants directly from the API
    useEffect(() => {
        const fetchMerchants = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem("token");
                console.log("tokennn" + token);
                console.log("Fetching from URL:", `http://localhost:8080/api/v1/merchants`);

                const response = await fetch(`http://localhost:8080/api/v1/merchants`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                console.log("Response status:", response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Error response:", errorText);
                    throw new Error(`Failed to fetch merchants: ${response.status} ${errorText}`);
                }

                const data = await response.json();
                console.log("Merchants data:", data);
                setMerchants(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching merchants:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMerchants();
    }, []);

    // Filter data based on local search term
    const filteredMerchants = merchants.filter(merchant =>
        merchant.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
        (merchant.contactEmail && merchant.contactEmail.toLowerCase().includes(localSearchTerm.toLowerCase())) ||
        (merchant.contactPhone && merchant.contactPhone.toLowerCase().includes(localSearchTerm.toLowerCase())) ||
        (merchant.address && merchant.address.toLowerCase().includes(localSearchTerm.toLowerCase())) ||
        (merchant.merchantType && merchant.merchantType.toLowerCase().includes(localSearchTerm.toLowerCase())) ||
        (merchant.site && merchant.site.name.toLowerCase().includes(localSearchTerm.toLowerCase()))
    );



    return (
        <div className="merchant-table-container">
            <div className="merchant-header-container">
                <div className="merchant-left-section">
                    <h2 className="merchant-section-title">Merchants</h2>
                    <div className="merchant-count">{merchants.length} merchants</div>
                </div>

                <div className="merchant-right-section">
                    <div className="merchant-search-container">
                        <input
                            type="text"
                            placeholder="Search merchants..."
                            className="merchant-search-input"
                            value={localSearchTerm}
                            onChange={(e) => setLocalSearchTerm(e.target.value)}
                        />
                        <svg className="merchant-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="M21 21l-4.35-4.35"/>
                        </svg>
                    </div>
                </div>
            </div>
            <div className="merchant-section-description">(Vendors, suppliers, and business partners that provide products or services)</div>

            <div className="merchant-table-card" style={{ minHeight: filteredMerchants.length === 0 ? '300px' : 'auto' }}>
                {loading ? (
                    <div className="merchant-loading-container">
                        <div className="merchant-loading-spinner"></div>
                        <p>Loading merchants data...</p>
                    </div>
                ) : error ? (
                    <div className="merchant-error-container">
                        <p>Error: {error}</p>
                        <p>Please try again later or contact support.</p>
                    </div>
                ) : (
                    <div className="merchant-table-body">
                        <div className="merchant-header-row">
                            <div className="merchant-header-cell name-cell">MERCHANT</div>
                            <div className="merchant-header-cell type-cell">TYPE</div>
                            <div className="merchant-header-cell email-cell">EMAIL</div>
                            <div className="merchant-header-cell phone-cell">PHONE</div>
                            <div className="merchant-header-cell address-cell">ADDRESS</div>
                            <div className="merchant-header-cell site-cell">SITE</div>

                        </div>

                        {filteredMerchants.length > 0 ? (
                            filteredMerchants.map((merchant, index) => (
                                <div
                                    className="merchant-table-row"
                                    key={index}
                                    onClick={() => navigate(`/merchants/${merchant.id}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="merchant-table-cell name-cell">{merchant.name}</div>
                                    <div className="merchant-table-cell type-cell">{merchant.merchantType}</div>
                                    <div className="merchant-table-cell email-cell">
                                        {merchant.contactEmail || "-"}
                                    </div>
                                    <div className="merchant-table-cell phone-cell">
                                        {merchant.contactPhone || "-"}
                                    </div>
                                    <div className="merchant-table-cell address-cell">
                                        {merchant.address || "-"}
                                    </div>
                                    <div className="merchant-table-cell site-cell">
                                        {merchant.site ? merchant.site.name : "None"}
                                    </div>

                                </div>
                            ))
                        ) : (
                            <div className="merchant-empty-state">
                                <div className="merchant-empty-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M20 6L9 17l-5-5"/>
                                    </svg>
                                </div>
                                <h3>No merchants found</h3>
                                <p>Try adjusting your search or add a new merchant</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllMerchants;