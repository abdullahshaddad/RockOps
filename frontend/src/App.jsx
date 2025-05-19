import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './App.css'
import {LanguageProvider} from "./contexts/LanguageContext.jsx";
import {ThemeProvider} from "./contexts/ThemeContext.jsx";
import {AuthProvider, useAuth} from "./contexts/AuthContext.jsx";

function App() {
  const [count, setCount] = useState(0)

  return (
      <Router>
          <LanguageProvider>
              <ThemeProvider>
                  <AuthProvider>
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/" element={<AuthRedirect />} />
                      {/* Your content here */}
                  </AuthProvider>
              </ThemeProvider>
          </LanguageProvider>
      </Router>
  )
}
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
export default App
