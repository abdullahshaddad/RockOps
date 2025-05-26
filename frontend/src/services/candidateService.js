// src/services/candidateService.js
import apiClient from '../utils/apiClient';
import { CANDIDATE_ENDPOINTS } from '../config/api.config';

export const candidateService = {
    getAll: () => {
        return apiClient.get(CANDIDATE_ENDPOINTS.BASE);
    },

    getById: (id) => {
        return apiClient.get(CANDIDATE_ENDPOINTS.BY_ID(id));
    },

    getByVacancy: (vacancyId) => {
        return apiClient.get(CANDIDATE_ENDPOINTS.BY_VACANCY(vacancyId));
    }
}; 