// src/services/jobPositionService.js
import apiClient from '../utils/apiClient';
import { JOB_POSITION_ENDPOINTS } from '../config/api.config';

export const jobPositionService = {
    getAll: () => {
        return apiClient.get(JOB_POSITION_ENDPOINTS.BASE);
    },

    getById: (id) => {
        return apiClient.get(JOB_POSITION_ENDPOINTS.BY_ID(id));
    },

    create: (positionData) => {
        return apiClient.post(JOB_POSITION_ENDPOINTS.CREATE_DTO, positionData);
    },

    update: (id, positionData) => {
        return apiClient.put(JOB_POSITION_ENDPOINTS.UPDATE_DTO(id), positionData);
    }
}; 