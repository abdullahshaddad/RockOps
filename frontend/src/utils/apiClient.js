// src/utils/apiClient.js
import axios from 'axios';
import { API_BASE_URL } from '../config/api.config';

const apiClient = axios.create({
    baseURL: API_BASE_URL
});

// Request interceptor for adding token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle common errors like 401, 403, etc.
        if (error.response) {
            if (error.response.status === 401) {
                // Redirect to login page or refresh token
                console.error('Authentication error: Please log in again');
                // localStorage.removeItem('token');
                // window.location = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;