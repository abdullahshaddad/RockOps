import React, { createContext, useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Create the context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    // Function to check if token is expired
    const isTokenExpired = (token) => {
        if (!token) return true;

        try {
            // Get the payload part of the JWT
            const payload = token.split('.')[1];
            // Decode the base64
            const decodedPayload = JSON.parse(atob(payload));

            // Check if exp field exists
            if (!decodedPayload.exp) return false;

            // Compare expiration time with current time
            // exp is in seconds, Date.now() is in milliseconds
            return decodedPayload.exp * 1000 < Date.now();
        } catch (error) {
            console.error('Error checking token expiration:', error);
            return true; // If there's an error, consider the token expired
        }
    };

    // Function to handle login
    const login = async (username, password) => {
        try {
            const response = await fetch('http://localhost:8080/api/v1/auth/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || t('auth.loginFailed'));
            }

            const userData = await response.json();
            const { token: jwtToken, role, firstName, lastName, username: userName } = userData;

            // Save token to localStorage
            localStorage.setItem('token', jwtToken);

            // Save user info to localStorage for persistence
            const userInfo = { role, firstName, lastName, username: userName };
            localStorage.setItem('userInfo', JSON.stringify(userInfo));

            // Update state
            setToken(jwtToken);
            setCurrentUser(userInfo);
            setIsAuthenticated(true);
            setLoading(false);

            // Return the user data for further use
            return userData;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    // Function to handle logout
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        setToken(null);
        setCurrentUser(null);
        setIsAuthenticated(false);
    };

    // Initialize auth state from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUserInfo = localStorage.getItem('userInfo');

        if (storedToken) {
            if (isTokenExpired(storedToken)) {
                // Token expired, clear storage and state
                logout();
            } else {
                // Token valid, restore user state
                setToken(storedToken);

                if (storedUserInfo) {
                    try {
                        const userInfo = JSON.parse(storedUserInfo);
                        setCurrentUser(userInfo);
                    } catch (e) {
                        console.error('Error parsing stored user info:', e);
                    }
                }

                setIsAuthenticated(true);
            }
        }

        setLoading(false);
    }, []);

    // Set up interval to check token expiration
    useEffect(() => {
        if (token && isAuthenticated) {
            const checkInterval = setInterval(() => {
                if (isTokenExpired(token)) {
                    clearInterval(checkInterval);
                    logout();
                }
            }, 60000); // Check every minute

            return () => clearInterval(checkInterval);
        }
    }, [token, isAuthenticated]);

    // Context value
    const value = {
        currentUser,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        isTokenExpired
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};