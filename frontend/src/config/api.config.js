// src/config/api.config.js
export const API_BASE_URL = 'http://localhost:8080';  // Removed /api

// Equipment module endpoints
export const EQUIPMENT_ENDPOINTS = {
    BASE: '/api/equipment',
    BY_ID: (id) => `/api/equipment/${id}`,
    TYPES: '/api/equipment-types',
    TYPE_BY_ID: (id) => `/api/equipment-types/${id}`,
    TYPE_BY_NAME: (name) => `/api/equipment-types/name/${name}`,
    STATUS: (id) => `/api/equipment/status/${id}`,
    STATUS_DTO: (id) => `/api/equipment/status/dto/${id}`,
    BY_TYPE: (typeId) => `/api/equipment/type/${typeId}`,
    CONSUMABLES: (equipmentId) => `/api/equipment/${equipmentId}/consumables`,
    CREATE_DTO: '/api/equipment/dto',
    UPDATE_DTO: (id) => `/api/equipment/dto/${id}`,
    ELIGIBLE_DRIVERS: (typeId) => `/api/equipment/type/${typeId}/eligible-drivers`,
    CHECK_DRIVER_COMPATIBILITY: (equipmentId, employeeId) =>
        `/api/equipment/${equipmentId}/check-driver-compatibility/${employeeId}`,
    BRANDS: '/api/equipment/brands',
    BRAND_BY_ID: (id) => `/api/equipment/brands/${id}`,
};

// Sarky module endpoints
export const SARKY_ENDPOINTS = {
    BY_EQUIPMENT: (equipmentId) => `/api/v1/equipment/${equipmentId}/sarky`,
    LATEST_DATE: (equipmentId) => `/api/v1/equipment/${equipmentId}/sarky/latest-date`,
    BY_ID: (id) => `/api/v1/sarky/${id}`,
    CREATE: (equipmentId) => `/api/v1/equipment/${equipmentId}/sarky`,
    UPDATE: (id) => `/api/v1/sarky/${id}`,
    DELETE: (id) => `/api/v1/sarky/${id}`,
    RANGE_BY_EQUIPMENT: (equipmentId) => `/api/v1/equipment/${equipmentId}/sarky/range`,
    RANGE_BY_ID: (id) => `/api/v1/sarky/range/${id}`,
    CREATE_RANGE: (equipmentId) => `/api/v1/equipment/${equipmentId}/sarky/range`,
    UPDATE_RANGE: (id) => `/api/v1/sarky/range/${id}`,
    DELETE_RANGE: (id) => `/api/v1/sarky/range/${id}`,
};

// Finance module endpoints
export const FINANCE_ENDPOINTS = {
    ACCOUNTS: {
        BASE: '/api/accounts',
        BY_ID: (id) => `/api/accounts/${id}`,
        TYPES: '/api/accounts/types',
        HIERARCHY: '/api/accounts/hierarchy',
        DEACTIVATE: (id) => `/api/accounts/${id}/deactivate`
    },
    INVOICES: {
        BASE: '/api/invoices',
        BY_ID: (id) => `/api/invoices/${id}`,
        STATUS: (id) => `/api/invoices/${id}/status`,
        SEARCH: '/api/invoices/search',
        OVERDUE: '/api/invoices/overdue',
        BY_MERCHANT: (merchantId) => `/api/invoices/merchant/${merchantId}`,
        BY_SITE: (siteId) => `/api/invoices/site/${siteId}`
    }
};

// Employee module endpoints
export const EMPLOYEE_ENDPOINTS = {
    BASE: '/api/v1/employees',
    BY_ID: (id) => `/api/v1/employees/${id}`,
    DRIVERS: '/api/v1/employees/drivers',
    WAREHOUSE_WORKERS: '/api/v1/employees/warehouse-workers',
    WAREHOUSE_MANAGERS: '/api/v1/employees/warehouse-managers',
    TECHNICIANS: '/api/v1/employees/technicians',
    ATTENDANCE: {
        BY_EMPLOYEE: (employeeId) => `/api/v1/attendance/employee/${employeeId}`,
        MONTHLY: (employeeId) => `/api/v1/attendance/employee/${employeeId}/monthly`,
        GENERATE_MONTHLY: '/api/v1/attendance/generate-monthly'
    }
};

// Site module endpoints
export const SITE_ENDPOINTS = {
    BASE: '/api/v1/site',
    BY_ID: (id) => `/api/site/${id}`
};

// Merchant module endpoints
export const MERCHANT_ENDPOINTS = {
    BASE: '/api/v1/merchants',
    BY_ID: (id) => `/api/merchants/${id}`
};

// Work Type module endpoints
export const WORK_TYPE_ENDPOINTS = {
    BASE: '/api/v1/worktypes',
    BY_ID: (id) => `/api/v1/worktypes/${id}`,
    CREATE: '/api/v1/worktypes',
    UPDATE: (id) => `/api/v1/worktypes/${id}`,
    DELETE: (id) => `/api/v1/worktypes/${id}`
};

// Job Position module endpoints
export const JOB_POSITION_ENDPOINTS = {
    BASE: '/api/v1/job-positions',
    CREATE_DTO: '/api/v1/job-positions/dto',
    BY_ID: (id) => `/api/v1/job-positions/dto/${id}`,
    UPDATE_DTO: (id) => `/api/v1/job-positions/dto/${id}`
};

// Document module endpoints
export const DOCUMENT_ENDPOINTS = {
    BY_ID: (id) => `/api/v1/documents/${id}`,
    BY_ENTITY: (entityType, entityId) => `/api/v1/${entityType}/${entityId}/documents`,
    CREATE: (entityType, entityId) => `/api/v1/${entityType}/${entityId}/documents`
};

// Partner module endpoints
export const PARTNER_ENDPOINTS = {
    BASE: '/api/v1/partner',
    GET_ALL: '/api/v1/partner/getallpartners',
    ADD: '/api/v1/partner/add'
};

// Authentication module endpoints
export const AUTH_ENDPOINTS = {
    BASE: '/api/v1/auth',
    REGISTER: '/api/v1/auth/register',
    LOGIN: '/api/v1/auth/login'
};

// Item Category module endpoints
export const ITEM_CATEGORY_ENDPOINTS = {
    BASE: '/api/v1/itemCategories',
    CREATE: '/api/v1/itemCategories',
    PARENTS: '/api/v1/itemCategories/parents',
    CHILDREN: '/api/v1/itemCategories/children'
};

// Request Order module endpoints
export const REQUEST_ORDER_ENDPOINTS = {
    BASE: '/api/v1/requestOrders',
    BY_ID: (id) => `/api/v1/requestOrders/${id}`,
    CREATE: '/api/v1/requestOrders'
};

// Offer module endpoints
export const OFFER_ENDPOINTS = {
    BASE: '/api/v1/offers',
    BY_ID: (id) => `/api/v1/offers/${id}`,
    CREATE: '/api/v1/offers',
    UPDATE: (id) => `/api/v1/offers/${id}`,
    DELETE: (id) => `/api/v1/offers/${id}`
};

// Candidate module endpoints
export const CANDIDATE_ENDPOINTS = {
    BASE: '/api/v1/candidates',
    BY_ID: (id) => `/api/v1/candidates/${id}`,
    BY_VACANCY: (vacancyId) => `/api/v1/candidates/vacancy/${vacancyId}`
};

// Vacancy module endpoints
export const VACANCY_ENDPOINTS = {
    BASE: '/api/v1/vacancies',
    BY_ID: (id) => `/api/v1/vacancies/${id}`,
    CREATE: '/api/v1/vacancies',
    UPDATE: (id) => `/api/v1/vacancies/${id}`,
    DELETE: (id) => `/api/v1/vacancies/${id}`
};