package com.example.backend.services.transaction;

import com.example.backend.models.transaction.Transaction;
import com.example.backend.models.transaction.TransactionItem;
import com.example.backend.models.transaction.TransactionPurpose;
import com.example.backend.models.PartyType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Enhanced Equipment Transaction Service
 * Provides additional functionality for equipment-specific transaction operations
 */
@Service
public class EnhancedEquipmentTransactionService {

    @Autowired
    private TransactionService transactionService;

    /**
     * Create equipment transaction with enhanced features
     */
    public Transaction createEnhancedEquipmentTransaction(
            PartyType senderType, UUID senderId,
            PartyType receiverType, UUID receiverId,
            List<TransactionItem> items,
            LocalDateTime transactionDate,
            String username, int batchNumber,
            UUID sentFirst, TransactionPurpose purpose) {

        return transactionService.createEquipmentTransaction(
                senderType, senderId, receiverType, receiverId,
                items, transactionDate, username, batchNumber, sentFirst, purpose);
    }

    /**
     * Accept equipment transaction with enhanced features
     */
    public Transaction acceptEnhancedEquipmentTransaction(
            UUID transactionId,
            Map<UUID, Integer> receivedQuantities,
            Map<UUID, Boolean> itemsNotReceived,
            String username,
            String acceptanceComment,
            TransactionPurpose purpose) {

        return transactionService.acceptEquipmentTransaction(
                transactionId, receivedQuantities, itemsNotReceived,
                username, acceptanceComment, purpose);
    }



    /**
     * Get initiated transactions for equipment
     */
    public List<Transaction> getInitiatedTransactions(UUID equipmentId) {
        return transactionService.getPendingTransactionsInitiatedByEquipment(equipmentId);
    }

    /**
     * Update equipment transaction with enhanced features
     */
    public Transaction updateEnhancedEquipmentTransaction(
            UUID transactionId,
            PartyType senderType, UUID senderId,
            PartyType receiverType, UUID receiverId,
            List<TransactionItem> updatedItems,
            LocalDateTime transactionDate,
            String username,
            int batchNumber,
            TransactionPurpose purpose) {

        return transactionService.updateEquipmentTransaction(
                transactionId, senderType, senderId, receiverType, receiverId,
                updatedItems, transactionDate, username, batchNumber, purpose);
    }



    /**
     * Reject equipment transaction
     */
    public Transaction rejectEquipmentTransaction(UUID transactionId, String rejectionReason, String username) {
        return transactionService.rejectEquipmentTransaction(transactionId, rejectionReason, username);
    }
}