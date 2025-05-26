// src/services/attendanceService.js
import apiClient from '../utils/apiClient';
import { ATTENDANCE_ENDPOINTS } from '../config/api.config';

export const attendanceService = {
    // Get attendance by employee ID
    getByEmployee: (employeeId) => {
        return apiClient.get(ATTENDANCE_ENDPOINTS.BY_EMPLOYEE(employeeId));
    },

    // Get monthly attendance for employee
    getMonthly: (employeeId, year, month) => {
        return apiClient.get(ATTENDANCE_ENDPOINTS.MONTHLY(employeeId), {
            params: { year, month }
        });
    },

    // Generate monthly attendance
    generateMonthly: (employeeId, year, month) => {
        return apiClient.post(ATTENDANCE_ENDPOINTS.GENERATE_MONTHLY, null, {
            params: { employeeId, year, month }
        });
    },

    // Record hourly attendance
    recordHourly: (employeeId, date, startTime, endTime) => {
        return apiClient.post(ATTENDANCE_ENDPOINTS.HOURLY, null, {
            params: { employeeId, date, startTime, endTime }
        });
    },

    // Record daily attendance
    recordDaily: (employeeId, date) => {
        return apiClient.post(ATTENDANCE_ENDPOINTS.DAILY, null, {
            params: { employeeId, date }
        });
    },

    // Update attendance status
    updateStatus: (attendanceId, status) => {
        return apiClient.put(ATTENDANCE_ENDPOINTS.UPDATE_STATUS(attendanceId), null, {
            params: { status }
        });
    },

    // Mark employee as present
    markPresent: (employeeId, date) => {
        return apiClient.post(ATTENDANCE_ENDPOINTS.MARK_PRESENT, null, {
            params: { employeeId, date }
        });
    },

    // Get daily attendance summary
    getDailySummary: (date) => {
        return apiClient.get(ATTENDANCE_ENDPOINTS.DAILY_SUMMARY, {
            params: { date }
        });
    }
}; 