import React, { Fragment, useEffect, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import warehouseimg1 from "../../../Resources/Images/warehouse1.jpg";
import WarehouseViewItemsTable from "../../../Components/AdvancedTables/WarehousesView/WarehouseDetailsAdvancedTable/WarehouseItems/WarehouseViewItemsTable";
import WarehouseViewItemTypesTable from "../../../Components/AdvancedTables/WarehousesView/WarehouseDetailsAdvancedTable/WarehouseItemTypes/WarehouseViewItemTypesTable";
import WarehouseViewItemsCategoriesTable from "../../../Components/AdvancedTables/WarehousesView/WarehouseDetailsAdvancedTable/WarehouseCategories/WarehouseViewItemsCategoriesTable";
import WarehouseViewTransactionsTable from "../../../Components/AdvancedTables/WarehousesView/WarehouseDetailsAdvancedTable/WarehouseViewTransactions/WarehouseViewTransactionsTable";
// Add import for the new Request Orders table component
 import WarehouseRequestOrders from "../../../Components/AdvancedTables/WarehousesView/WarehouseDetailsAdvancedTable/WarehouseRequestOrders/WarehouseRequestOrders";
import "./WarehouseDetails.scss";

const WarehouseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [warehouseData, setWarehouseData] = useState(null);
  const [activeTab, setActiveTab] = useState("items");
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const fetchWarehouseDetails = async () => {
      try {
        const token = localStorage.getItem('token');

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo && userInfo.role) {
          setUserRole(userInfo.role);
        }

        const response = await fetch(`http://localhost:8080/api/v1/warehouses/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setWarehouseData(data);
      } catch (error) {
        console.error("Error fetching warehouse details:", error);
      }
    };

    fetchWarehouseDetails();
  }, [id]);

  if (!warehouseData) {
    return <div>Loading...</div>;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "items":
        return <WarehouseViewItemsTable warehouseId={id} />;
      case "categories":
        return <WarehouseViewItemsCategoriesTable warehouseId={id} />;
      case "types":
        return <WarehouseViewItemTypesTable warehouseId={id} />;
      case "transactions":
        return <WarehouseViewTransactionsTable warehouseId={id} />;
      case "requestOrders":
        return <WarehouseRequestOrders warehouseId={id} />;
      default:
        return <WarehouseViewItemsTable warehouseId={id} />;
    }
  };

  return (
      <Fragment>
        <div className="WarehouseDetailsContainer">
          <h1 className="SectionHeaderLabel">Warehouse Details</h1>

          <div className="warehouse-card">
            <div className="left-side">
              <img src={warehouseimg1} alt="Warehouse" className="warehouse-image" />
            </div>
            <div className="center-content">
              <div className="label">WAREHOUSE NAME</div>
              <div className="value">{warehouseData.name}</div>
            </div>
            <div className="right-side">
              <button className="info-button" onClick={() => navigate(`/warehouses/warehouse-details/${id}`)}>
                <FaInfoCircle />
              </button>
            </div>
          </div>

          {/* Updated tabs to include Request Orders */}
          <div className="new-tabs-container">
            <div className="new-tabs-header">
              <button
                  className={`new-tab-button ${activeTab === "items" ? "active" : ""}`}
                  onClick={() => setActiveTab("items")}
              >
                Inventory
              </button>
              <button
                  className={`new-tab-button ${activeTab === "categories" ? "active" : ""}`}
                  onClick={() => setActiveTab("categories")}
              >
                Categories
              </button>
              <button
                  className={`new-tab-button ${activeTab === "types" ? "active" : ""}`}
                  onClick={() => setActiveTab("types")}
              >
                Item Types
              </button>

              <button
                  className={`new-tab-button ${activeTab === "requestOrders" ? "active" : ""}`}
                  onClick={() => setActiveTab("requestOrders")}
              >
                Request Orders
              </button>


              {userRole === 'WAREHOUSEMANAGER' && (
                  <button
                      className={`new-tab-button ${activeTab === "transactions" ? "active" : ""}`}
                      onClick={() => setActiveTab("transactions")}
                  >
                    Transactions
                  </button>
              )}
            </div>

            <div className="tab-content">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </Fragment>
  );
};

export default WarehouseDetails;