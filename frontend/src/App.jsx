import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './App.css'
import { LanguageProvider } from "./contexts/LanguageContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import Login from "./pages/login/Login.jsx";

// ===================== Authentication Handlers =====================
const AuthRedirect = () => {
    const { currentUser, isAuthenticated, loading } = useAuth();
    if (loading) return <LoadingSpinner />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <Navigate to={currentUser?.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
};

const RoleRoute = ({ allowedRoles, children, redirectPath = '/dashboard' }) => {
    const { currentUser, isAuthenticated, loading } = useAuth();
    if (loading) return <LoadingSpinner />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(currentUser?.role)) return <Navigate to={redirectPath} replace />;
    return children;
};

function App() {
    const [count, setCount] = useState(0)

    return (
        <Router>
            <LanguageProvider>
                <ThemeProvider>
                    <AuthProvider>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/" element={<AuthRedirect />} />
                            {/* Your other routes here */}
                        </Routes>
                    </AuthProvider>
                </ThemeProvider>
            </LanguageProvider>
        </Router>
    )
}

function LoadingSpinner() {
    return <div>Loading...</div>;
}

export default App