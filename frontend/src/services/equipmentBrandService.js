import apiClient from '../utils/apiClient';
import { EQUIPMENT_ENDPOINTS } from '../config/api.config';

export const equipmentBrandService = {
    // Get all equipment brands
    getAllEquipmentBrands: () => {
        return apiClient.get(EQUIPMENT_ENDPOINTS.BRANDS);
    },

    // Get equipment brand by ID
    getEquipmentBrandById: (id) => {
        return apiClient.get(EQUIPMENT_ENDPOINTS.BRAND_BY_ID(id));
    },

    // Create new equipment brand
    createEquipmentBrand: (brandData) => {
        return apiClient.post(EQUIPMENT_ENDPOINTS.BRANDS, brandData);
    },

    // Update equipment brand
    updateEquipmentBrand: (id, brandData) => {
        return apiClient.put(EQUIPMENT_ENDPOINTS.BRAND_BY_ID(id), brandData);
    },

    // Delete equipment brand
    deleteEquipmentBrand: (id) => {
        return apiClient.delete(EQUIPMENT_ENDPOINTS.BRAND_BY_ID(id));
    }
}; 