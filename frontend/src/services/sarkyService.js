import apiClient from '../utils/apiClient';
import { SARKY_ENDPOINTS } from '../config/api.config';

export const sarkyService = {
    // Single sarky log operations
    getByEquipment: (equipmentId) => {
        return apiClient.get(SARKY_ENDPOINTS.BY_EQUIPMENT(equipmentId));
    },

    getLatestDate: (equipmentId) => {
        return apiClient.get(SARKY_ENDPOINTS.LATEST_DATE(equipmentId));
    },

    getById: (id) => {
        return apiClient.get(SARKY_ENDPOINTS.BY_ID(id));
    },

    create: (equipmentId, sarkyData) => {
        return apiClient.post(SARKY_ENDPOINTS.CREATE(equipmentId), sarkyData);
    },

    update: (id, sarkyData) => {
        return apiClient.put(SARKY_ENDPOINTS.UPDATE(id), sarkyData);
    },

    delete: (id) => {
        return apiClient.delete(SARKY_ENDPOINTS.DELETE(id));
    },

    // Range sarky log operations
    getRangeByEquipment: (equipmentId) => {
        return apiClient.get(SARKY_ENDPOINTS.RANGE_BY_EQUIPMENT(equipmentId));
    },

    getRangeById: (id) => {
        return apiClient.get(SARKY_ENDPOINTS.RANGE_BY_ID(id));
    },

    createRange: (equipmentId, rangeData) => {
        return apiClient.post(SARKY_ENDPOINTS.CREATE_RANGE(equipmentId), rangeData);
    },

    updateRange: (id, rangeData) => {
        return apiClient.put(SARKY_ENDPOINTS.UPDATE_RANGE(id), rangeData);
    },

    deleteRange: (id) => {
        return apiClient.delete(SARKY_ENDPOINTS.DELETE_RANGE(id));
    }
}; 