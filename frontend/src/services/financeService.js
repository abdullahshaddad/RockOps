// src/services/financeService.js
import apiClient from '../utils/apiClient';
import { FINANCE_ENDPOINTS } from '../config/api.config';

export const financeService = {
    // Chart of Accounts operations
    accounts: {
        getAll: (activeOnly = false) => {
            return apiClient.get(FINANCE_ENDPOINTS.ACCOUNTS.BASE, {
                params: { activeOnly }
            });
        },

        getById: (id) => {
            return apiClient.get(FINANCE_ENDPOINTS.ACCOUNTS.BY_ID(id));
        },

        getTypes: () => {
            return apiClient.get(FINANCE_ENDPOINTS.ACCOUNTS.TYPES);
        },

        getHierarchy: () => {
            return apiClient.get(FINANCE_ENDPOINTS.ACCOUNTS.HIERARCHY);
        },

        create: (accountData) => {
            return apiClient.post(FINANCE_ENDPOINTS.ACCOUNTS.BASE, accountData);
        },

        update: (id, accountData) => {
            return apiClient.put(FINANCE_ENDPOINTS.ACCOUNTS.BY_ID(id), accountData);
        },

        deactivate: (id) => {
            return apiClient.post(FINANCE_ENDPOINTS.ACCOUNTS.DEACTIVATE(id));
        }
    },

    // Invoice operations
    invoices: {
        getAll: () => {
            return apiClient.get(FINANCE_ENDPOINTS.INVOICES.BASE);
        },

        getById: (id) => {
            return apiClient.get(FINANCE_ENDPOINTS.INVOICES.BY_ID(id));
        },

        getStatus: (id) => {
            return apiClient.get(FINANCE_ENDPOINTS.INVOICES.STATUS(id));
        },

        create: (invoiceData, file) => {
            const formData = new FormData();
            formData.append('invoice', new Blob([JSON.stringify(invoiceData)], { type: 'application/json' }));
            if (file) formData.append('file', file);

            return apiClient.post(FINANCE_ENDPOINTS.INVOICES.BASE, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },

        update: (id, invoiceData, file) => {
            const formData = new FormData();
            formData.append('invoice', new Blob([JSON.stringify(invoiceData)], { type: 'application/json' }));
            if (file) formData.append('file', file);

            return apiClient.put(FINANCE_ENDPOINTS.INVOICES.BY_ID(id), formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },

        updateStatus: (id, status) => {
            return apiClient.put(FINANCE_ENDPOINTS.INVOICES.STATUS(id), { status });
        },

        search: (searchParams) => {
            return apiClient.get(FINANCE_ENDPOINTS.INVOICES.SEARCH, {
                params: searchParams
            });
        },

        getOverdue: () => {
            return apiClient.get(FINANCE_ENDPOINTS.INVOICES.OVERDUE);
        },

        getByMerchant: (merchantId) => {
            return apiClient.get(FINANCE_ENDPOINTS.INVOICES.BY_MERCHANT(merchantId));
        },

        getBySite: (siteId) => {
            return apiClient.get(FINANCE_ENDPOINTS.INVOICES.BY_SITE(siteId));
        }
    }
};

// Export individual services for backward compatibility
export const accountService = financeService.accounts;
export const invoiceService = financeService.invoices;

// Export other finance services (invoices, assets, etc.) as needed