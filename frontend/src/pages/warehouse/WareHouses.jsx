import React, { Fragment } from "react";
import { Outlet } from "react-router";
import "./WareHouses.scss";

const WareHouses = () => {
  return (
    <Fragment>
      <div className="WarehousesMainContainer">
        <Outlet />
      </div>
    </Fragment>
  );
};

export default WareHouses;
