import {useState} from 'react'
import {BrowserRouter as Router, Navigate, Outlet, Route, Routes} from 'react-router-dom';
import './App.css'
import {LanguageProvider} from "./contexts/LanguageContext.jsx";
import {ThemeProvider} from "./contexts/ThemeContext.jsx";
import {AuthProvider, useAuth} from "./contexts/AuthContext.jsx";
import Login from "./pages/login/Login.jsx";
import Sidebar from "./components/common/Sidebar/Sidebar.jsx";
import AdminPage from "./pages/admin/AdminPage.jsx";
import Navbar from "./components/common/Navbar/Navbar.jsx";
import DashboardPage from "./pages/dashboards/DashboardPage.jsx";
import VacancyList from "./pages/HR/Vacancy/VacancyList.jsx";
import PositionsList from "./pages/HR/JobPosition/PositionsList.jsx";
import EmployeesList from "./pages/HR/Employee/EmployeesList.jsx";
import HRLayout from "./pages/HR/HRLayout.jsx";
import EmployeeDetails from "./pages/HR/Employee/EmployeeDetails.jsx";
import AttendancePage from "./pages/HR/Attendance/AttendancePage.jsx";
import VacancyDetails from "./pages/HR/Vacancy/VacancyDetails.jsx";
import DepartmentsList from "./pages/HR/Departments/DepartmentsList.jsx";
import AllSites from "./pages/site/AllSites/AllSites.jsx";
import SiteEquipment from "./pages/site/SiteDetails/SiteEquipment/SiteEquipment.jsx";
import SiteEmployees from "./pages/site/SiteDetails/SiteEmployees/SiteEmployees.jsx";
import SiteLayout from "./pages/site/SiteDetails/SiteLayout.jsx";
import SiteWarehouses from "./pages/site/SiteDetails/SiteWarehouses/SiteWarehouses.jsx";
import SiteFixedAssets from "./pages/site/SiteDetails/SiteFixedAssets/SiteFixedAssets.jsx";
import SiteMerchants from "./pages/site/SiteDetails/SiteMerchants/SiteMerchants.jsx";
import SitePartners from "./pages/site/SiteDetails/SitePartners/SitePartners.jsx";
import {SiTesla} from "react-icons/si";
import SitesLayout from "./pages/site/SiteLayout.jsx";
import Partners from "./pages/partners/Partners.jsx";

// ===================== Authentication Handlers =====================
const AuthRedirect = () => {
    const {currentUser, isAuthenticated, loading} = useAuth();
    if (loading) return <LoadingSpinner/>;
    if (!isAuthenticated) return <Navigate to="/login" replace/>;
    return <Navigate to={currentUser?.role === 'ADMIN' ? '/admin' : '/dashboard'} replace/>;
};

const RoleRoute = ({allowedRoles, children, redirectPath = '/dashboard'}) => {
    const {currentUser, isAuthenticated, loading} = useAuth();
    if (loading) return <LoadingSpinner/>;
    if (!isAuthenticated) return <Navigate to="/login" replace/>;
    if (!allowedRoles.includes(currentUser?.role)) return <Navigate to={redirectPath} replace/>;
    return children;
};

const allRoles = [
    "ADMIN", "USER", "SITE_ADMIN", "PROCUREMENT", "WAREHOUSE_MANAGER", "SECRETARY",
    "EQUIPMENT_MANAGER", "HR_MANAGER", "HR_EMPLOYEE", "FINANCE_EMPLOYEE", "FINANCE_MANAGER"
];

const mostRoles = [
    "ADMIN", "USER", "SITE_ADMIN", "PROCUREMENT", "WAREHOUSE_MANAGER", "SECRETARY",
    "EQUIPMENT_MANAGER", "HR_MANAGER", "HR_EMPLOYEE"
];


// ===================== Layout Components =====================
const MainLayout = () => (<div className="app-container">
    <Navbar/>
    <div className="main-content-wrapper">
        <Sidebar/>
        <main className="main-content">
            <Outlet/>
        </main>
    </div>
</div>);

function App() {
    const [count, setCount] = useState(0)

    return (<Router>
        {/*<SnackbarProvider>*/}
        <LanguageProvider>
            <ThemeProvider>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/" element={<AuthRedirect/>}/>

                        <Route element={<MainLayout/>}>
                            <Route path="/admin"
                                   element={<RoleRoute allowedRoles={['ADMIN']}><AdminPage/></RoleRoute>}/>

                            <Route path="/dashboard" element={<RoleRoute
                                allowedRoles={allRoles}>
                                <DashboardPage/>
                            </RoleRoute>}/>

                            <Route path="/partners" element={<RoleRoute allowedRoles={["ADMIN", "SITE_ADMIN"]}><Partners /></RoleRoute>} />

                            {/* Site Management Routes */}
                            <Route path="/sites" element={<RoleRoute allowedRoles={allRoles}><SitesLayout /></RoleRoute>}>
                                <Route index element={<RoleRoute allowedRoles={allRoles}><AllSites /></RoleRoute>} />
                                <Route path="sitedetails/:siteId" element={<RoleRoute allowedRoles={allRoles}><SiteLayout /></RoleRoute>} />
                                <Route path="sitedetails/equipment/:siteId" element={<RoleRoute allowedRoles={allRoles}><SiteEquipment /></RoleRoute>} />
                                <Route path="sitedetails/employees/:siteId" element={<RoleRoute allowedRoles={allRoles}><SiteEmployees /></RoleRoute>} />
                                <Route path="sitedetails/warehouses/:siteId" element={<RoleRoute allowedRoles={allRoles}><SiteWarehouses /></RoleRoute>} />
                                <Route path="sitedetails/fixedassets/:siteId" element={<RoleRoute allowedRoles={allRoles}><SiteFixedAssets /></RoleRoute>} />
                                <Route path="sitedetails/sitemerchants/:siteId" element={<RoleRoute allowedRoles={allRoles}><SiteMerchants /></RoleRoute>} />
                                <Route path="sitedetails/sitepartners/:siteId" element={<RoleRoute allowedRoles={allRoles}><SitePartners /></RoleRoute>} />
                                <Route path="employee-details/:id" element={<RoleRoute allowedRoles={allRoles}><EmployeeDetails /></RoleRoute>} />
                            </Route>


                            {/* HR Management Routes */}
                            <Route path="/hr" element={<RoleRoute
                                allowedRoles={["HR_MANAGER", "HR_EMPLOYEE", "ADMIN"]}><HRLayout/></RoleRoute>}>
                                <Route path="vacancies" element={<VacancyList/>}/>
                                <Route path="positions" element={<PositionsList/>}/>
                                <Route path="employees" element={<EmployeesList/>}/>
                                <Route path="employee-details/:id" element={<EmployeeDetails/>}/>
                                <Route path="attendance" element={<AttendancePage/>}/>
                                <Route path="vacancies/:id" element={<VacancyDetails/>}/>
                                <Route path="departments" element={<DepartmentsList/>}/>
                            </Route>
                        </Route>


                        <Route path="*" element={<Navigate to="/" replace/>}/>
                        {/* Your other routes here */}
                    </Routes>
                </AuthProvider>
            </ThemeProvider>
        </LanguageProvider>
        {/*</SnackbarProvider>*/}
    </Router>)
}

function LoadingSpinner() {
    return <div>Loading...</div>;
}

export default App