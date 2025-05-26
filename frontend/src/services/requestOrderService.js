// src/services/requestOrderService.js
import apiClient from '../utils/apiClient';
import { REQUEST_ORDER_ENDPOINTS } from '../config/api.config';

export const requestOrderService = {
    getAll: () => {
        return apiClient.get(REQUEST_ORDER_ENDPOINTS.BASE);
    },

    getById: (id) => {
        return apiClient.get(REQUEST_ORDER_ENDPOINTS.BY_ID(id));
    },

    create: (requestData) => {
        return apiClient.post(REQUEST_ORDER_ENDPOINTS.CREATE, requestData);
    }
}; 