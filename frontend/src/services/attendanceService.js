import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Create axios instance with base configuration
const attendanceAxios = axios.create({
    baseURL: `${API_BASE_URL}/api/v1/attendance`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
attendanceAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
attendanceAxios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const attendanceService = {
    /**
     * Record attendance for any contract type
     * @param {Object} attendanceData - The attendance data to record
     * @returns {Promise} API response
     */
    recordAttendance: async (attendanceData) => {
        return await attendanceAxios.post('/record', attendanceData);
    },

    /**
     * Quick check-in for hourly employees
     * @param {string} employeeId - Employee ID
     * @param {string} checkInTime - Check-in time (HH:MM format)
     * @param {string} location - Optional location
     * @param {number} latitude - Optional latitude
     * @param {number} longitude - Optional longitude
     * @returns {Promise} API response
     */
    checkIn: async (employeeId, checkInTime, location = null, latitude = null, longitude = null) => {
        const params = new URLSearchParams({
            employeeId,
            checkInTime
        });

        if (location) params.append('location', location);
        if (latitude) params.append('latitude', latitude.toString());
        if (longitude) params.append('longitude', longitude.toString());

        return await attendanceAxios.post(`/check-in?${params.toString()}`);
    },

    /**
     * Quick check-out for hourly employees
     * @param {string} employeeId - Employee ID
     * @param {string} checkOutTime - Check-out time (HH:MM format)
     * @returns {Promise} API response
     */
    checkOut: async (employeeId, checkOutTime) => {
        const params = new URLSearchParams({
            employeeId,
            checkOutTime
        });

        return await attendanceAxios.post(`/check-out?${params.toString()}`);
    },

    /**
     * Mark daily attendance for daily contract employees
     * @param {string} employeeId - Employee ID
     * @param {string} date - Date (YYYY-MM-DD format)
     * @param {string} status - Daily attendance status
     * @param {string} notes - Optional notes
     * @returns {Promise} API response
     */
    markDailyAttendance: async (employeeId, date, status, notes = null) => {
        const params = new URLSearchParams({
            employeeId,
            date,
            status
        });

        if (notes) params.append('notes', notes);

        return await attendanceAxios.post(`/daily?${params.toString()}`);
    },

    /**
     * Generate monthly attendance for monthly contract employees
     * @param {string} employeeId - Employee ID
     * @param {number} year - Year
     * @param {number} month - Month (1-12)
     * @returns {Promise} API response
     */
    generateMonthlyAttendance: async (employeeId, year, month) => {
        const params = new URLSearchParams({
            employeeId,
            year: year.toString(),
            month: month.toString()
        });

        const response = await attendanceAxios.post(`/generate-monthly?${params.toString()}`);
        return response;
    },

    /**
     * Get attendance records for an employee within a date range
     * @param {string} employeeId - Employee ID
     * @param {string} startDate - Start date (YYYY-MM-DD format)
     * @param {string} endDate - End date (YYYY-MM-DD format)
     * @returns {Promise} API response
     */
    getEmployeeAttendance: async (employeeId, startDate, endDate) => {
        const params = new URLSearchParams({
            startDate,
            endDate
        });

        const response = await attendanceAxios.get(`/employee/${employeeId}?${params.toString()}`);
        return response;
    },

    /**
     * Get monthly attendance summary for an employee
     * @param {string} employeeId - Employee ID
     * @param {number} year - Year
     * @param {number} month - Month (1-12)
     * @returns {Promise} API response
     */
    getMonthlyAttendanceSummary: async (employeeId, year, month) => {
        const params = new URLSearchParams({
            year: year.toString(),
            month: month.toString()
        });

        const response = await attendanceAxios.get(`/employee/${employeeId}/monthly-summary?${params.toString()}`);
        return response;
    },

    /**
     * Get daily attendance summary for all employees
     * @param {string} date - Date (YYYY-MM-DD format)
     * @returns {Promise} API response
     */
    getDailyAttendanceSummary: async (date) => {
        const params = new URLSearchParams({ date });

        const response = await attendanceAxios.get(`/daily-summary?${params.toString()}`);
        return response;
    },

    /**
     * Update attendance status (for monthly employees)
     * @param {string} attendanceId - Attendance record ID
     * @param {string} status - New status
     * @returns {Promise} API response
     */
    updateAttendanceStatus: async (attendanceId, status) => {
        const params = new URLSearchParams({ status });

        const response = await attendanceAxios.put(`/${attendanceId}/status?${params.toString()}`);
        return response;
    },

    /**
     * Get attendance statistics for an employee
     * @param {string} employeeId - Employee ID
     * @param {string} startDate - Start date (YYYY-MM-DD format)
     * @param {string} endDate - End date (YYYY-MM-DD format)
     * @returns {Promise} API response
     */
    getAttendanceStatistics: async (employeeId, startDate, endDate) => {
        const params = new URLSearchParams({
            startDate,
            endDate
        });

        const response = await attendanceAxios.get(`/employee/${employeeId}/statistics?${params.toString()}`);
        return response;
    },

    /**
     * Get monthly attendance for an employee (legacy endpoint)
     * @param {string} employeeId - Employee ID
     * @param {number} year - Year
     * @param {number} month - Month (1-12)
     * @returns {Promise} API response
     */
    getMonthlyAttendance: async (employeeId, year, month) => {
        const params = new URLSearchParams({
            year: year.toString(),
            month: month.toString()
        });

        const response = await attendanceAxios.get(`/employee/${employeeId}/monthly?${params.toString()}`);
        return response;
    },

    /**
     * Record hourly attendance (legacy endpoint)
     * @param {Object} attendanceData - Hourly attendance data
     * @returns {Promise} API response
     */
    recordHourlyAttendance: async (attendanceData) => {
        const response = await attendanceAxios.post('/hourly', attendanceData);
        return response;
    },

    /**
     * Mark employee as present (legacy endpoint)
     * @param {Object} attendanceData - Attendance data
     * @returns {Promise} API response
     */
    markPresent: async (attendanceData) => {
        const response = await attendanceAxios.post('/mark-present', attendanceData);
        return response;
    },

    /**
     * Bulk operations for attendance
     */
    bulk: {
        /**
         * Record attendance for multiple employees
         * @param {Array} attendanceRecords - Array of attendance records
         * @returns {Promise} API response
         */
        recordMultiple: async (attendanceRecords) => {
            const promises = attendanceRecords.map(record =>
                attendanceService.recordAttendance(record)
            );
            return Promise.allSettled(promises);
        },

        /**
         * Check in multiple hourly employees
         * @param {Array} checkInData - Array of {employeeId, checkInTime, location?}
         * @returns {Promise} API response
         */
        checkInMultiple: async (checkInData) => {
            const promises = checkInData.map(data =>
                attendanceService.checkIn(data.employeeId, data.checkInTime, data.location)
            );
            return Promise.allSettled(promises);
        },

        /**
         * Generate monthly attendance for multiple employees
         * @param {Array} employeeIds - Array of employee IDs
         * @param {number} year - Year
         * @param {number} month - Month
         * @returns {Promise} API response
         */
        generateMonthlyMultiple: async (employeeIds, year, month) => {
            const promises = employeeIds.map(employeeId =>
                attendanceService.generateMonthlyAttendance(employeeId, year, month)
            );
            return Promise.allSettled(promises);
        }
    },

    /**
     * Utility functions
     */
    utils: {
        /**
         * Format time for API consumption
         * @param {Date|string} time - Time to format
         * @returns {string} Formatted time (HH:MM)
         */
        formatTime: (time) => {
            if (time instanceof Date) {
                return time.toTimeString().slice(0, 5);
            }
            return time;
        },

        /**
         * Format date for API consumption
         * @param {Date|string} date - Date to format
         * @returns {string} Formatted date (YYYY-MM-DD)
         */
        formatDate: (date) => {
            if (date instanceof Date) {
                return date.toISOString().split('T')[0];
            }
            return date;
        },

        /**
         * Validate attendance data based on contract type
         * @param {Object} attendanceData - Attendance data to validate
         * @returns {Object} Validation result {isValid, errors}
         */
        validateAttendanceData: (attendanceData) => {
            const errors = [];

            if (!attendanceData.employeeId) {
                errors.push('Employee ID is required');
            }

            if (!attendanceData.date) {
                errors.push('Date is required');
            }

            switch (attendanceData.contractType) {
                case 'HOURLY':
                    if (!attendanceData.checkInTime) {
                        errors.push('Check-in time is required for hourly employees');
                    }
                    if (attendanceData.checkOutTime &&
                        attendanceData.checkInTime &&
                        attendanceData.checkOutTime <= attendanceData.checkInTime) {
                        errors.push('Check-out time must be after check-in time');
                    }
                    break;

                case 'DAILY':
                    if (!attendanceData.dailyStatus) {
                        errors.push('Daily status is required for daily employees');
                    }
                    break;

                case 'MONTHLY':
                    if (!attendanceData.status) {
                        errors.push('Status is required for monthly employees');
                    }
                    break;

                default:
                    errors.push('Invalid contract type');
            }

            return {
                isValid: errors.length === 0,
                errors
            };
        }
    }
};

export default attendanceService;