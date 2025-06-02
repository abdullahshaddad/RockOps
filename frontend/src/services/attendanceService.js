// src/services/attendanceService.js

const API_BASE_URL = 'http://localhost:8080/api/v1/attendance';

const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
});

export const attendanceService = {
    // Record attendance for any contract type
    recordAttendance: async (attendanceData) => {
        const response = await fetch(`${API_BASE_URL}/record`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(attendanceData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json();
    },

    // Check in for hourly employees
    checkIn: async (employeeId, checkInTime, location = null, latitude = null, longitude = null) => {
        const params = new URLSearchParams({
            employeeId,
            checkInTime,
            ...(location && { location }),
            ...(latitude && { latitude }),
            ...(longitude && { longitude }),
        });

        const response = await fetch(`${API_BASE_URL}/check-in?${params}`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json();
    },

    // Check out for hourly employees
    checkOut: async (employeeId, checkOutTime) => {
        const params = new URLSearchParams({
            employeeId,
            checkOutTime,
        });

        const response = await fetch(`${API_BASE_URL}/check-out?${params}`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json();
    },

    // Mark daily attendance for daily contract employees
    markDailyAttendance: async (employeeId, date, status, notes = null) => {
        const params = new URLSearchParams({
            employeeId,
            date,
            status,
            ...(notes && { notes }),
        });

        const response = await fetch(`${API_BASE_URL}/daily?${params}`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json();
    },

    // Generate monthly attendance for monthly contract employees
    generateMonthlyAttendance: async (employeeId, year, month) => {
        const params = new URLSearchParams({
            employeeId,
            year,
            month,
        });

        const response = await fetch(`${API_BASE_URL}/generate-monthly?${params}`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json();
    },

    // Get attendance by employee and date range
    getEmployeeAttendance: async (employeeId, startDate, endDate) => {
        const params = new URLSearchParams({
            startDate,
            endDate,
        });

        const response = await fetch(`${API_BASE_URL}/employee/${employeeId}?${params}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json();
    },

    // Get monthly attendance summary for an employee
    getMonthlyAttendanceSummary: async (employeeId, year, month) => {
        const params = new URLSearchParams({
            year,
            month,
        });

        const response = await fetch(`${API_BASE_URL}/employee/${employeeId}/monthly-summary?${params}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json();
    },

    // Get daily attendance summary for all employees
    getDailySummary: async (date) => {
        const params = new URLSearchParams({ date });

        const response = await fetch(`${API_BASE_URL}/daily-summary?${params}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json();
    },

    // Update attendance status (for monthly employees)
    updateAttendanceStatus: async (attendanceId, status) => {
        const params = new URLSearchParams({ status });

        const response = await fetch(`${API_BASE_URL}/${attendanceId}/status?${params}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json();
    },

    // Get attendance statistics for an employee
    getAttendanceStatistics: async (employeeId, startDate, endDate) => {
        const params = new URLSearchParams({
            startDate,
            endDate,
        });

        const response = await fetch(`${API_BASE_URL}/employee/${employeeId}/statistics?${params}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json();
    },

    // Legacy endpoint - Get monthly attendance
    getMonthlyAttendance: async (employeeId, year, month) => {
        const params = new URLSearchParams({
            year,
            month,
        });

        const response = await fetch(`${API_BASE_URL}/employee/${employeeId}/monthly?${params}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json();
    },

    // Legacy endpoint - Record hourly attendance
    recordHourlyAttendance: async (attendanceData) => {
        const response = await fetch(`${API_BASE_URL}/hourly`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(attendanceData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json();
    },

    // Legacy endpoint - Mark present
    markPresent: async (employeeId, date) => {
        const response = await fetch(`${API_BASE_URL}/mark-present`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ employeeId, date }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json();
    },
};