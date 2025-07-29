import apiClient from '../../utils/apiClient.js';

/**
 * Enhanced Equipment Transaction Service
 * 
 * This service integrates with the new enhanced warehouse ↔ equipment transaction endpoints.
 * It provides comprehensive functionality for the enhanced transaction system while maintaining
 * complete separation from warehouse-warehouse transaction services.
 * 
 * Base URL: /api/v1/equipment-transactions
 * (Different from warehouse-warehouse: /api/v1/transactions)
 */
class EnhancedEquipmentTransactionService {

    // ========================================
    // TRANSACTION CREATION
    // ========================================

    /**
     * Create warehouse-to-equipment transaction with enhanced tracking
     */
    async createWarehouseToEquipmentTransaction(transactionData) {
        try {
            const response = await apiClient.post('/api/v1/equipment-transactions/warehouse-to-equipment', transactionData.items, {
                params: {
                    warehouseId: transactionData.warehouseId,
                    equipmentId: transactionData.equipmentId,
                    transactionDate: transactionData.transactionDate,
                    purpose: transactionData.purpose || 'CONSUMABLE',
                    description: transactionData.description
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error creating warehouse-to-equipment transaction:', error);
            throw error;
        }
    }

    /**
     * Create equipment-to-warehouse transaction with enhanced tracking
     */
    async createEquipmentToWarehouseTransaction(transactionData) {
        try {
            const response = await apiClient.post('/api/v1/equipment-transactions/equipment-to-warehouse', transactionData.items, {
                params: {
                    equipmentId: transactionData.equipmentId,
                    warehouseId: transactionData.warehouseId,
                    transactionDate: transactionData.transactionDate,
                    purpose: transactionData.purpose || 'CONSUMABLE',
                    description: transactionData.description
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error creating equipment-to-warehouse transaction:', error);
            throw error;
        }
    }

    // ========================================
    // ENHANCED TRANSACTION PROCESSING
    // ========================================

    /**
     * Accept equipment transaction with enhanced status handling (partial acceptance support)
     */
    async acceptEquipmentTransaction(transactionId, acceptanceData) {
        try {
            const response = await apiClient.post(`/api/v1/equipment-transactions/${transactionId}/accept`, {
                receivedQuantities: acceptanceData.receivedQuantities || {},
                itemsNotReceived: acceptanceData.itemsNotReceived || {},
                comment: acceptanceData.comment
            });
            return response.data;
        } catch (error) {
            console.error('Error accepting equipment transaction:', error);
            throw error;
        }
    }

    /**
     * Reject specific transaction items with detailed reasons
     */
    async rejectTransactionItems(transactionId, rejectionData) {
        try {
            const response = await apiClient.post(`/api/v1/equipment-transactions/${transactionId}/reject-items`, {
                rejectedItems: rejectionData.rejectedItems,
                generalReason: rejectionData.generalReason
            });
            return response.data;
        } catch (error) {
            console.error('Error rejecting transaction items:', error);
            throw error;
        }
    }

    /**
     * Resolve previously rejected items
     */
    async resolveRejectedItems(transactionId, resolutionData) {
        try {
            const response = await apiClient.post(`/api/v1/equipment-transactions/${transactionId}/resolve-items`, {
                resolutionDetails: resolutionData.resolutionDetails,
                resolutionComment: resolutionData.resolutionComment
            });
            return response.data;
        } catch (error) {
            console.error('Error resolving rejected items:', error);
            throw error;
        }
    }

    // ========================================
    // BULK OPERATIONS
    // ========================================

    /**
     * Bulk confirm multiple equipment transactions
     */
    async bulkConfirmTransactions(transactionIds, comment) {
        try {
            const response = await apiClient.post('/api/v1/equipment-transactions/bulk-confirm', {
                transactionIds: transactionIds,
                comment: comment
            });
            return response.data;
        } catch (error) {
            console.error('Error bulk confirming transactions:', error);
            throw error;
        }
    }

    // ========================================
    // HISTORY AND AUDIT TRAIL
    // ========================================

    /**
     * Get transaction history for equipment
     */
    async getEquipmentTransactionHistory(equipmentId) {
        try {
            const response = await apiClient.get(`/api/v1/equipment-transactions/equipment/${equipmentId}/history`);
            return response.data;
        } catch (error) {
            console.error('Error fetching equipment transaction history:', error);
            throw error;
        }
    }

    /**
     * Get consumable movements for equipment
     */
    async getEquipmentConsumableMovements(equipmentId) {
        try {
            const response = await apiClient.get(`/api/v1/equipment-transactions/equipment/${equipmentId}/movements`);
            return response.data;
        } catch (error) {
            console.error('Error fetching equipment consumable movements:', error);
            throw error;
        }
    }

    /**
     * Get accurate consumable history for specific item type
     */
    async getConsumableHistory(equipmentId, itemTypeId) {
        try {
            const response = await apiClient.get(`/api/v1/equipment-transactions/equipment/${equipmentId}/consumables/${itemTypeId}/history`);
            return response.data;
        } catch (error) {
            console.error('Error fetching consumable history:', error);
            throw error;
        }
    }

    /**
     * Get current consumable stock (accurately calculated)
     */
    async getCurrentConsumableStock(equipmentId, itemTypeId) {
        try {
            const response = await apiClient.get(`/api/v1/equipment-transactions/equipment/${equipmentId}/consumables/${itemTypeId}/current-stock`);
            return response.data;
        } catch (error) {
            console.error('Error fetching current consumable stock:', error);
            throw error;
        }
    }

    // ========================================
    // DASHBOARD AND ANALYTICS
    // ========================================

    /**
     * Get equipment transaction dashboard data
     */
    async getEquipmentTransactionDashboard(equipmentId) {
        try {
            const response = await apiClient.get(`/api/v1/equipment-transactions/equipment/${equipmentId}/dashboard`);
            return response.data;
        } catch (error) {
            console.error('Error fetching equipment transaction dashboard:', error);
            throw error;
        }
    }

    /**
     * Validate consumable history integrity
     */
    async validateConsumableHistory(equipmentId) {
        try {
            const response = await apiClient.get(`/api/v1/equipment-transactions/equipment/${equipmentId}/validate-history`);
            return response.data;
        } catch (error) {
            console.error('Error validating consumable history:', error);
            throw error;
        }
    }

    // ========================================
    // UTILITY METHODS
    // ========================================

    /**
     * Format transaction data for display
     */
    formatTransactionForDisplay(transaction) {
        return {
            id: transaction.id,
            status: transaction.status,
            senderName: transaction.senderName,
            receiverName: transaction.receiverName,
            purpose: transaction.purpose,
            createdAt: new Date(transaction.createdAt).toLocaleDateString(),
            itemCount: transaction.items?.length || 0,
            description: transaction.description
        };
    }

    /**
     * Format movement data for display
     */
    formatMovementForDisplay(movement) {
        return {
            id: movement.id,
            itemTypeName: movement.itemType?.name,
            quantity: movement.quantity,
            expectedQuantity: movement.expectedQuantity,
            movementType: movement.movementType,
            status: movement.status,
            movementDate: new Date(movement.movementDate).toLocaleDateString(),
            isDiscrepancy: movement.isDiscrepancy,
            resolvedAt: movement.resolvedAt ? new Date(movement.resolvedAt).toLocaleDateString() : null
        };
    }

    /**
     * Calculate transaction completion percentage
     */
    calculateCompletionPercentage(transaction) {
        if (!transaction.items || transaction.items.length === 0) return 0;
        
        const completedItems = transaction.items.filter(item => 
            item.status === 'ACCEPTED' || item.status === 'RESOLVED'
        ).length;
        
        return Math.round((completedItems / transaction.items.length) * 100);
    }

    /**
     * Get status color for UI display
     */
    getStatusColor(status) {
        const colors = {
            'ACCEPTED': 'success',
            'PENDING': 'warning',
            'REJECTED': 'danger',
            'RESOLVED': 'info',
            'PARTIALLY_ACCEPTED': 'warning',
            'PARTIALLY_REJECTED': 'danger',
            'DELIVERING': 'primary'
        };
        return colors[status] || 'secondary';
    }

    /**
     * Get status icon for UI display
     */
    getStatusIcon(status) {
        const icons = {
            'ACCEPTED': 'check-circle',
            'PENDING': 'clock',
            'REJECTED': 'x-circle',
            'RESOLVED': 'check-circle-fill',
            'PARTIALLY_ACCEPTED': 'exclamation-triangle',
            'PARTIALLY_REJECTED': 'exclamation-triangle-fill',
            'DELIVERING': 'truck'
        };
        return icons[status] || 'question-circle';
    }
}

// Export singleton instance
export const enhancedEquipmentTransactionService = new EnhancedEquipmentTransactionService();
export default enhancedEquipmentTransactionService; 