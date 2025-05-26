// src/services/siteService.js
import apiClient from '../utils/apiClient';
import { SITE_ENDPOINTS } from '../config/api.config';

export const siteService = {
    getAll: () => {
        return apiClient.get(SITE_ENDPOINTS.BASE);
    },

    getById: (id) => {
        return apiClient.get(SITE_ENDPOINTS.BY_ID(id));
    }
}; 