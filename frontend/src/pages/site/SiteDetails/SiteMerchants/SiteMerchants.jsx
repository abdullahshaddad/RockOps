import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import DataTable from "../../../../components/common/DataTable/DataTable";
import "./SiteMerchants.scss";
import SiteSidebar from "../SiteSidebar";
import { useTranslation } from 'react-i18next';

const SiteMerchants = () => {
    const { t } = useTranslation();
    const { siteId } = useParams();
    const [merchantData, setMerchantData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Define columns for DataTable
    const columns = [
        {
            header: 'ID',
            accessor: 'id',
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
            header: 'Category',
            accessor: 'category',
            sortable: true
        },
        {
            header: 'Total Sales',
            accessor: 'totalSales',
            sortable: true
        }
    ];

    useEffect(() => {
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
                    const transformedData = data.map((item) => ({
                        id: item.id,
                        merchantName: item.name,
                        merchantType: item.merchantType,
                        category: item.category,
                        totalSales: item.totalSales,
                        // topTags: item.topTags ? item.topTags.join(", ") : "None",
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

        fetchMerchants();
    }, [siteId]);

    const merchantTypeCounts = merchantData.reduce((counts, merchant) => {
        counts[merchant.merchantType] = (counts[merchant.merchantType] || 0) + 1;
        return counts;
    }, {});

    if (loading) return <div className="loading-container">{t('site.loadingMerchants')}</div>;

    return (
        <div className="siteMerchantsContainer">
            <div className="siteSidebar">
                <SiteSidebar siteId={siteId} />
            </div>

            <div className="siteMerchantsContent">
                <div className="dataCount">
                    <h1>{t('site.siteMerchantsReport')}</h1>
                    <div className="SiteMerchantsCardsContainer">
                        {Object.entries(merchantTypeCounts).map(([type, count]) => (
                            <div className="SiteMerchantsCard" key={type}>
                                <span>{type}</span>
                                <span>{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {error ? (
                    <div className="error-container">{error}</div>
                ) : (
                    <div className="siteMerchantsTable">
                        <DataTable
                            data={merchantData}
                            columns={columns}
                            loading={loading}
                            showSearch={true}
                            showFilters={true}
                            filterableColumns={columns}
                            itemsPerPageOptions={[10, 25, 50, 100]}
                            defaultItemsPerPage={10}
                            tableTitle="Merchants List"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SiteMerchants;
