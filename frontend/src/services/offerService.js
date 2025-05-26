// src/services/offerService.js
import apiClient from '../utils/apiClient';
import { OFFER_ENDPOINTS } from '../config/api.config';

export const offerService = {
    getAll: () => {
        return apiClient.get(OFFER_ENDPOINTS.BASE);
    },

    getById: (id) => {
        return apiClient.get(OFFER_ENDPOINTS.BY_ID(id));
    },

    create: (offerData) => {
        return apiClient.post(OFFER_ENDPOINTS.CREATE, offerData);
    },

    update: (id, offerData) => {
        return apiClient.put(OFFER_ENDPOINTS.UPDATE(id), offerData);
    },

    delete: (id) => {
        return apiClient.delete(OFFER_ENDPOINTS.DELETE(id));
    }
}; 