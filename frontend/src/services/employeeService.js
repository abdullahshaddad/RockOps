// src/services/employeeService.js
import apiClient from '../utils/apiClient';
import { EMPLOYEE_ENDPOINTS } from '../config/api.config';

export const employeeService = {
    // Basic employee operations
    getAll: () => {
        return apiClient.get(EMPLOYEE_ENDPOINTS.BASE);
    },

    getById: (id) => {
        return apiClient.get(EMPLOYEE_ENDPOINTS.BY_ID(id));
    },

    // Role-specific employee queries
    getDrivers: () => {
        return apiClient.get(EMPLOYEE_ENDPOINTS.DRIVERS);
    },

    getWarehouseWorkers: () => {
        return apiClient.get(EMPLOYEE_ENDPOINTS.WAREHOUSE_WORKERS);
    },

    getWarehouseManagers: () => {
        return apiClient.get(EMPLOYEE_ENDPOINTS.WAREHOUSE_MANAGERS);
    },

    getTechnicians: () => {
        return apiClient.get(EMPLOYEE_ENDPOINTS.TECHNICIANS);
    },

    // Attendance operations
    attendance: {
        getByEmployee: (employeeId) => {
            return apiClient.get(EMPLOYEE_ENDPOINTS.ATTENDANCE.BY_EMPLOYEE(employeeId));
        },

        getMonthly: (employeeId) => {
            return apiClient.get(EMPLOYEE_ENDPOINTS.ATTENDANCE.MONTHLY(employeeId));
        },

        generateMonthly: (employeeId, year, month) => {
            return apiClient.post(EMPLOYEE_ENDPOINTS.ATTENDANCE.GENERATE_MONTHLY, null, {
                params: { employeeId, year, month }
            });
        }
    }
}; 