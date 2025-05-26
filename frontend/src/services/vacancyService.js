// src/services/vacancyService.js
import apiClient from '../utils/apiClient';
import { VACANCY_ENDPOINTS } from '../config/api.config';

export const vacancyService = {
    // Get all vacancies
    getAll: () => {
        return apiClient.get(VACANCY_ENDPOINTS.BASE);
    },

    // Get vacancy by ID
    getById: (id) => {
        return apiClient.get(VACANCY_ENDPOINTS.BY_ID(id));
    },

    // Create new vacancy
    create: (vacancyData) => {
        return apiClient.post(VACANCY_ENDPOINTS.CREATE, vacancyData);
    },

    // Update existing vacancy
    update: (id, vacancyData) => {
        return apiClient.put(VACANCY_ENDPOINTS.UPDATE(id), vacancyData);
    },

    // Delete vacancy
    delete: (id) => {
        return apiClient.delete(VACANCY_ENDPOINTS.DELETE(id));
    }
}; 