// src/services/equipmentService.js
import apiClient from '../utils/apiClient';
import { EQUIPMENT_ENDPOINTS, SITE_ENDPOINTS, MERCHANT_ENDPOINTS, EMPLOYEE_ENDPOINTS } from '../config/api.config';



export const equipmentService = {
    // Get all equipment
    getAllEquipment: () => {
        return apiClient.get(EQUIPMENT_ENDPOINTS.BASE);
    },

    // Get equipment by ID
    getEquipmentById: (id) => {
        return apiClient.get(EQUIPMENT_ENDPOINTS.BY_ID(id));
    },

    // Get equipment main photo
    getEquipmentMainPhoto: (equipmentId) => {
        return apiClient.get(`/minio/equipment/${equipmentId}/main-photo`);
    },

    // Add new equipment
    addEquipment: (formData) => {
        return apiClient.post(EQUIPMENT_ENDPOINTS.BASE, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    // Add new equipment using DTO
    addEquipmentWithDTO: (formData) => {
        return apiClient.post(EQUIPMENT_ENDPOINTS.CREATE_DTO, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    // Update existing equipment
    updateEquipment: (id, formData) => {
        return apiClient.put(EQUIPMENT_ENDPOINTS.BY_ID(id), formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    // Update existing equipment using DTO
    updateEquipmentWithDTO: (id, formData) => {
        return apiClient.put(EQUIPMENT_ENDPOINTS.STATUS_DTO(id), formData);
    },

    // Update equipment status
    updateEquipmentStatus: (id, status) => {
        return apiClient.patch(EQUIPMENT_ENDPOINTS.STATUS(id), { status });
    },

    // Update equipment status using DTO
    updateEquipmentStatusWithDTO: (id, statusDTO) => {
        return apiClient.patch(EQUIPMENT_ENDPOINTS.STATUS_DTO(id), statusDTO);
    },

    // Delete equipment
    deleteEquipment: (id) => {
        return apiClient.delete(EQUIPMENT_ENDPOINTS.BY_ID(id));
    },

    // Equipment Type Management
    getAllEquipmentTypes: () => {
        return apiClient.get(EQUIPMENT_ENDPOINTS.TYPES);
    },

    getEquipmentTypeById: (id) => {
        return apiClient.get(EQUIPMENT_ENDPOINTS.TYPE_BY_ID(id));
    },

    createEquipmentType: (typeData) => {
        return apiClient.post(EQUIPMENT_ENDPOINTS.TYPES, typeData);
    },

    updateEquipmentType: (id, typeData) => {
        return apiClient.put(EQUIPMENT_ENDPOINTS.TYPE_BY_ID(id), typeData);
    },

    deleteEquipmentType: (id) => {
        return apiClient.delete(EQUIPMENT_ENDPOINTS.TYPE_BY_ID(id));
    },

    // Equipment Brand Management
    getAllEquipmentBrands: () => {
        return apiClient.get(EQUIPMENT_ENDPOINTS.BRANDS);
    },

    getEquipmentBrandById: (id) => {
        return apiClient.get(EQUIPMENT_ENDPOINTS.BRAND_BY_ID(id));
    },

    createEquipmentBrand: (brandData) => {
        return apiClient.post(EQUIPMENT_ENDPOINTS.BRANDS, brandData);
    },

    updateEquipmentBrand: (id, brandData) => {
        return apiClient.put(EQUIPMENT_ENDPOINTS.BRAND_BY_ID(id), brandData);
    },

    deleteEquipmentBrand: (id) => {
        return apiClient.delete(EQUIPMENT_ENDPOINTS.BRAND_BY_ID(id));
    },

    // Get equipment by type
    getEquipmentByType: (typeId) => {
        return apiClient.get(EQUIPMENT_ENDPOINTS.BY_TYPE(typeId));
    },

    // Get equipment consumables
    getEquipmentConsumables: (equipmentId) => {
        return apiClient.get(EQUIPMENT_ENDPOINTS.CONSUMABLES(equipmentId));
    },

    // Site Management
    getAllSites: () => {
        return apiClient.get(SITE_ENDPOINTS.BASE);
    },

    getSiteById: (id) => {
        return apiClient.get(SITE_ENDPOINTS.BY_ID(id));
    },

    // Merchant Management
    getAllMerchants: () => {
        return apiClient.get(MERCHANT_ENDPOINTS.BASE);
    },

    getMerchantById: (id) => {
        return apiClient.get(MERCHANT_ENDPOINTS.BY_ID(id));
    },

    // Employee/Driver Management
    getAllEmployees: () => {
        return apiClient.get(EMPLOYEE_ENDPOINTS.BASE);
    },

    getEmployeeById: (id) => {
        return apiClient.get(EMPLOYEE_ENDPOINTS.BY_ID(id));
    },

    // NEW: Get eligible drivers for equipment type
    getEligibleDriversForEquipmentType: (typeId) => {
        return apiClient.get(EQUIPMENT_ENDPOINTS.ELIGIBLE_DRIVERS(typeId));
    },

    // NEW: Get drivers for Sarky logs (includes already assigned drivers)
    getDriversForSarkyByEquipmentType: (typeId) => {
        return apiClient.get(EQUIPMENT_ENDPOINTS.SARKY_DRIVERS(typeId));
    },

    // NEW: Check driver compatibility for equipment
    checkDriverCompatibility: (equipmentId, employeeId) => {
        return apiClient.get(EQUIPMENT_ENDPOINTS.CHECK_DRIVER_COMPATIBILITY(equipmentId, employeeId));
    },

    // Update createEquipment method
    createEquipment: (equipmentData) => {
        // Ensure brand is sent as an object with id
        if (equipmentData.brand && typeof equipmentData.brand === 'object') {
            equipmentData.brandId = equipmentData.brand.id;
        }
        return apiClient.post(EQUIPMENT_ENDPOINTS.CREATE_DTO, equipmentData);
    },

};