package com.example.backend.models.transaction;

/**
 * Enhanced transaction statuses specifically for warehouse ↔ equipment transactions.
 * These provide more granular status tracking compared to the basic TransactionStatus enum.
 * 
 * Workflow:
 * PENDING → DELIVERING → ACCEPTED/REJECTED/PARTIALLY_ACCEPTED/PARTIALLY_REJECTED → RESOLVED
 */
public enum EquipmentTransactionStatus {
    /**
     * Transaction has been created and is awaiting processing
     */
    PENDING,
    
    /**
     * Items are being delivered from warehouse to equipment or vice versa
     */
    DELIVERING,
    
    /**
     * All items have been accepted as expected
     */
    ACCEPTED,
    
    /**
     * Some items were accepted, others were not (partial acceptance scenario)
     */
    PARTIALLY_ACCEPTED,
    
    /**
     * Some items were rejected, others were accepted (partial rejection scenario)
     */
    PARTIALLY_REJECTED,
    
    /**
     * All items have been rejected
     */
    REJECTED,
    
    /**
     * Previously rejected or partially accepted items have been resolved
     */
    RESOLVED
} 