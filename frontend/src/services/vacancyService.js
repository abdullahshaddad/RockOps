// src/services/vacancyService.js
import apiClient from '../utils/apiClient';
import { VACANCY_ENDPOINTS } from '../config/api.config';

export const vacancyService = {
    getAll: () => {
        return apiClient.get(VACANCY_ENDPOINTS.BASE);
    },

    getById: (id) => {
        return apiClient.get(VACANCY_ENDPOINTS.BY_ID(id));
    },

    create: (vacancyData) => {
        return apiClient.post(VACANCY_ENDPOINTS.CREATE, vacancyData);
    },

    update: (id, vacancyData) => {
        return apiClient.put(VACANCY_ENDPOINTS.UPDATE(id), vacancyData);
    },

    delete: (id) => {
        return apiClient.delete(VACANCY_ENDPOINTS.DELETE(id));
    }
}; 