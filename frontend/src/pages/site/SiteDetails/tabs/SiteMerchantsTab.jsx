import React, { useEffect, useState } from "react";
import DataTable from "../../../../components/common/DataTable/DataTable";
import { useTranslation } from 'react-i18next';
import {useNavigate} from "react-router-dom";

const SiteMerchantsTab = ({ siteId }) => {
    const { t } = useTranslation();
    const [merchantData, setMerchantData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleRowClick = (row) => {
        navigate(`/merchants/${row.id}`);
    };

    // Define columns for DataTable
    const columns = [
        {
            header: 'ID',
            accessor: 'conventionalId',
            sortable: true
        },
        {
            header: 'Merchant Name',
            accessor: 'merchantName',
            sortable: true
        },
        {
            header: 'Merchant Type',
            accessor: 'merchantType',
            sortable: true
        },
        {
            header: 'Address',
            accessor: 'address',
            sortable: true
        },
        {
            header: 'Contact Number',
            accessor: 'contactPhone',
            sortable: true
        }
    ];

    useEffect(() => {
        fetchMerchants();
    }, [siteId]);

    const fetchMerchants = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/api/v1/site/${siteId}/merchants`, {
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
                    throw new Error(`No merchants found for this site.`);
                }
            }

            const data = await response.json();

            if (Array.isArray(data)) {
                const transformedData = data.map((item, index) => ({
                    conventionalId: `ME-${String(index + 1).padStart(3, '0')}`,
                    id: item.id,
                    merchantName: item.name,
                    merchantType: item.merchantType,
                    address: item.address,
                    contactPhone: item.contactPhone,
                }));

                setMerchantData(transformedData);
            } else {
                setMerchantData([]);
            }

            setLoading(false);
        } catch (err) {
            setError(err.message);
            setMerchantData([]);
            setLoading(false);
        }
    };

    const merchantTypeCounts = merchantData.reduce((counts, merchant) => {
        counts[merchant.merchantType] = (counts[merchant.merchantType] || 0) + 1;
        return counts;
    }, {});

    if (loading) return <div className="loading-container">{t('site.loadingMerchants')}</div>;

    return (
        <div className="site-merchants-tab">
            <div className="tab-header">
                <h3>{t('site.siteMerchantsReport')}</h3>
            </div>

            {/*<div className="merchants-stats">*/}
            {/*    {Object.entries(merchantTypeCounts).map(([type, count]) => (*/}
            {/*        <div className="stat-card" key={type}>*/}
            {/*            <div className="stat-title">{type}</div>*/}
            {/*            <div className="stat-value">{count}</div>*/}
            {/*        </div>*/}
            {/*    ))}*/}
            {/*</div>*/}

            {error ? (
                <div className="error-container">{error}</div>
            ) : (
                <div className="data-table-container">
                    <DataTable
                        data={merchantData}
                        columns={columns}
                        loading={loading}
                        showSearch={true}
                        showFilters={true}
                        filterableColumns={columns}
                        itemsPerPageOptions={[10, 25, 50, 100]}
                        defaultItemsPerPage={10}
                        onRowClick={handleRowClick}
                        tableTitle="Merchants List"
                    />
                </div>
            )}
        </div>
    );
};

export default SiteMerchantsTab;