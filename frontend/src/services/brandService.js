import apiClient from '../utils/apiClient';
import { BRAND_ENDPOINTS } from '../config/api.config';

export const brandService = {
    // Get all brands
    getAllBrands: () => {
        return apiClient.get(BRAND_ENDPOINTS.BASE);
    },

    // Get brand by ID
    getBrandById: (id) => {
        return apiClient.get(BRAND_ENDPOINTS.BY_ID(id));
    },

    // Create new brand
    createBrand: (brandData) => {
        return apiClient.post(BRAND_ENDPOINTS.BASE, brandData);
    },

    // Update brand
    updateBrand: (id, brandData) => {
        return apiClient.put(BRAND_ENDPOINTS.BY_ID(id), brandData);
    },

    // Delete brand
    deleteBrand: (id) => {
        return apiClient.delete(BRAND_ENDPOINTS.BY_ID(id));
    }
}; 