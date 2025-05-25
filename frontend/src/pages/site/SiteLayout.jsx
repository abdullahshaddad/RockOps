import React, {useEffect, useState} from 'react';
import {Outlet} from 'react-router-dom';

const SitesLayout = () => {

    return (
        <div>

            <Outlet/>

        </div>
    );
};

export default SitesLayout;