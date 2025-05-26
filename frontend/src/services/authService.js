// src/services/authService.js
import apiClient from '../utils/apiClient';
import { AUTH_ENDPOINTS } from '../config/api.config';

export const authService = {
    register: (registerData) => {
        return apiClient.post(AUTH_ENDPOINTS.REGISTER, registerData);
    },

    login: (loginData) => {
        return apiClient.post(AUTH_ENDPOINTS.LOGIN, loginData);
    }
}; 