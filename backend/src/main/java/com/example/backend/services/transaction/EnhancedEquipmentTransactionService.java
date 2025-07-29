package com.example.backend.services.transaction;

import com.example.backend.models.PartyType;
import com.example.backend.models.equipment.Equipment;
import com.example.backend.models.transaction.*;
import com.example.backend.models.warehouse.ItemType;
import com.example.backend.models.warehouse.Warehouse;
import com.example.backend.repositories.equipment.EquipmentRepository;
import com.example.backend.repositories.transaction.ConsumableMovementRepository;
import com.example.backend.repositories.transaction.TransactionHistoryRepository;
import com.example.backend.repositories.transaction.TransactionRepository;
import com.example.backend.repositories.warehouse.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Enhanced service for warehouse ↔ equipment transactions ONLY.
 * 
 * CRITICAL: This service is COMPLETELY SEPARATE from warehouse-to-warehouse
 * transaction logic to ensure zero impact on existing warehouse-warehouse flows.
 * 
 * Features:
 * - Enhanced transaction statuses (ACCEPTED, PENDING, REJECTED, RESOLVED)
 * - Comprehensive audit trail via TransactionHistory
 * - Accurate consumable movement tracking via ConsumableMovement
 * - Complex scenario handling (partial acceptance/rejection)
 * - Robust validation and error handling
 */
@Service
public class EnhancedEquipmentTransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private TransactionHistoryRepository transactionHistoryRepository;

    @Autowired
    private ConsumableMovementRepository consumableMovementRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    // ========================================
    // TRANSACTION CREATION (WAREHOUSE ↔ EQUIPMENT ONLY)
    // ========================================

    /**
     * Create enhanced warehouse-to-equipment transaction with comprehensive tracking
     */
    @Transactional
    public Transaction createWarehouseToEquipmentTransaction(
            UUID warehouseId,
            UUID equipmentId,
            List<TransactionItem> items,
            LocalDateTime transactionDate,
            String username,
            String description,
            TransactionPurpose purpose) {
        
        // Validate entities exist
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found: " + warehouseId));
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Equipment not found: " + equipmentId));

        // Create transaction with enhanced tracking
        Transaction transaction = Transaction.builder()
                .senderType(PartyType.WAREHOUSE)
                .senderId(warehouseId)
                .receiverType(PartyType.EQUIPMENT)
                .receiverId(equipmentId)
                .transactionDate(transactionDate)
                .status(TransactionStatus.PENDING)
                .addedBy(username)
                .description(description)
                .purpose(purpose)
                .sentFirst(warehouseId) // Warehouse initiated
                .batchNumber(generateBatchNumber())
                .items(new ArrayList<>())
                .build();

        // Add items with enhanced status tracking
        for (TransactionItem item : items) {
            item.setTransaction(transaction);
            item.setStatus(TransactionStatus.PENDING);
            transaction.addItem(item);
        }

        // Save transaction
        Transaction savedTransaction = transactionRepository.save(transaction);

        // Create audit trail entry
        recordTransactionHistory(savedTransaction, null, null, TransactionStatus.PENDING,
                "TRANSACTION_CREATED", "Transaction created", username);

        // Create consumable movements for tracking
        createConsumableMovements(savedTransaction);

        return savedTransaction;
    }

    /**
     * Create enhanced equipment-to-warehouse transaction with comprehensive tracking
     */
    @Transactional
    public Transaction createEquipmentToWarehouseTransaction(
            UUID equipmentId,
            UUID warehouseId,
            List<TransactionItem> items,
            LocalDateTime transactionDate,
            String username,
            String description,
            TransactionPurpose purpose) {
        
        // Validate entities exist
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Equipment not found: " + equipmentId));
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found: " + warehouseId));

        // Create transaction with enhanced tracking
        Transaction transaction = Transaction.builder()
                .senderType(PartyType.EQUIPMENT)
                .senderId(equipmentId)
                .receiverType(PartyType.WAREHOUSE)
                .receiverId(warehouseId)
                .transactionDate(transactionDate)
                .status(TransactionStatus.PENDING)
                .addedBy(username)
                .description(description)
                .purpose(purpose)
                .sentFirst(equipmentId) // Equipment initiated
                .batchNumber(generateBatchNumber())
                .items(new ArrayList<>())
                .build();

        // Add items with enhanced status tracking
        for (TransactionItem item : items) {
            item.setTransaction(transaction);
            item.setStatus(TransactionStatus.PENDING);
            transaction.addItem(item);
        }

        // Save transaction
        Transaction savedTransaction = transactionRepository.save(transaction);

        // Create audit trail entry
        recordTransactionHistory(savedTransaction, null, null, TransactionStatus.PENDING,
                "TRANSACTION_CREATED", "Transaction created", username);

        // Create consumable movements for tracking
        createConsumableMovements(savedTransaction);

        return savedTransaction;
    }

    // ========================================
    // ENHANCED TRANSACTION PROCESSING
    // ========================================

    /**
     * Accept transaction with enhanced status handling
     */
    @Transactional
    public Transaction acceptEquipmentTransaction(
            UUID transactionId,
            Map<UUID, Integer> receivedQuantities,
            Map<UUID, Boolean> itemsNotReceived,
            String username,
            String comment) {
        
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));

        // Validate this is a warehouse-equipment transaction
        validateEquipmentTransaction(transaction);

        TransactionStatus previousStatus = transaction.getStatus();
        EquipmentTransactionStatus newEquipmentStatus = determineEquipmentStatus(receivedQuantities, itemsNotReceived, transaction);

        // Process each item with enhanced tracking
        for (TransactionItem item : transaction.getItems()) {
            UUID itemId = item.getId();
            Integer receivedQuantity = receivedQuantities.getOrDefault(itemId, item.getQuantity());
            Boolean notReceived = itemsNotReceived.getOrDefault(itemId, false);

            TransactionStatus newItemStatus = determineItemStatus(receivedQuantity, item.getQuantity(), notReceived);
            
            // Update item
            item.setReceivedQuantity(receivedQuantity);
            item.setStatus(newItemStatus);
            
            // Record item-level history
            recordTransactionHistory(transaction, item, item.getStatus(), newItemStatus,
                    "ITEM_ACCEPTANCE", buildAcceptanceReason(receivedQuantity, item.getQuantity(), notReceived), username);

            // Update consumable movements
            updateConsumableMovementStatus(transaction, item, newEquipmentStatus);
        }

        // Update transaction status
        transaction.setStatus(mapEquipmentStatusToTransactionStatus(newEquipmentStatus));
        transaction.setAcceptanceComment(comment);
        transaction.setHandledBy(username);
        transaction.setCompletedAt(LocalDateTime.now());

        Transaction savedTransaction = transactionRepository.save(transaction);

        // Record transaction-level history
        recordTransactionHistory(savedTransaction, null, previousStatus, savedTransaction.getStatus(),
                "TRANSACTION_ACCEPTED", comment, username);

        return savedTransaction;
    }

    /**
     * Reject transaction items with enhanced tracking
     */
    @Transactional
    public Transaction rejectEquipmentTransactionItems(
            UUID transactionId,
            Map<UUID, String> rejectedItems,
            String username,
            String generalReason) {
        
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));

        // Validate this is a warehouse-equipment transaction
        validateEquipmentTransaction(transaction);

        TransactionStatus previousStatus = transaction.getStatus();

        // Process rejections
        for (TransactionItem item : transaction.getItems()) {
            if (rejectedItems.containsKey(item.getId())) {
                String rejectionReason = rejectedItems.get(item.getId());
                
                TransactionStatus previousItemStatus = item.getStatus();
                item.setStatus(TransactionStatus.REJECTED);
                item.setRejectionReason(rejectionReason);

                // Record item-level history
                recordTransactionHistory(transaction, item, previousItemStatus, TransactionStatus.REJECTED,
                        "ITEM_REJECTION", rejectionReason, username);

                // Update consumable movement
                updateConsumableMovementStatus(transaction, item, EquipmentTransactionStatus.REJECTED);
            }
        }

        // Determine overall transaction status
        EquipmentTransactionStatus newEquipmentStatus = determineOverallEquipmentStatus(transaction);
        transaction.setStatus(mapEquipmentStatusToTransactionStatus(newEquipmentStatus));
        transaction.setRejectionReason(generalReason);
        transaction.setHandledBy(username);

        Transaction savedTransaction = transactionRepository.save(transaction);

        // Record transaction-level history
        recordTransactionHistory(savedTransaction, null, previousStatus, savedTransaction.getStatus(),
                "TRANSACTION_REJECTION", generalReason, username);

        return savedTransaction;
    }

    /**
     * Resolve rejected items with enhanced tracking
     */
    @Transactional
    public Transaction resolveRejectedItems(
            UUID transactionId,
            Map<UUID, String> resolutionDetails,
            String username,
            String resolutionComment) {
        
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));

        // Validate this is a warehouse-equipment transaction
        validateEquipmentTransaction(transaction);

        TransactionStatus previousStatus = transaction.getStatus();

        // Process resolutions
        for (TransactionItem item : transaction.getItems()) {
            if (resolutionDetails.containsKey(item.getId()) && item.getStatus() == TransactionStatus.REJECTED) {
                String resolutionDetail = resolutionDetails.get(item.getId());
                
                TransactionStatus previousItemStatus = item.getStatus();
                item.setStatus(TransactionStatus.RESOLVED);

                // Record item-level history
                recordTransactionHistory(transaction, item, previousItemStatus, TransactionStatus.RESOLVED,
                        "ITEM_RESOLUTION", resolutionDetail, username);

                // Update consumable movement
                updateConsumableMovementStatus(transaction, item, EquipmentTransactionStatus.RESOLVED);
            }
        }

        // Determine overall transaction status
        EquipmentTransactionStatus newEquipmentStatus = determineOverallEquipmentStatus(transaction);
        transaction.setStatus(mapEquipmentStatusToTransactionStatus(newEquipmentStatus));
        transaction.setAcceptanceComment(resolutionComment);
        transaction.setApprovedBy(username);

        Transaction savedTransaction = transactionRepository.save(transaction);

        // Record transaction-level history
        recordTransactionHistory(savedTransaction, null, previousStatus, savedTransaction.getStatus(),
                "TRANSACTION_RESOLUTION", resolutionComment, username);

        return savedTransaction;
    }

    // ========================================
    // HELPER METHODS
    // ========================================

    private void validateEquipmentTransaction(Transaction transaction) {
        boolean isEquipmentTransaction = 
            (transaction.getSenderType() == PartyType.EQUIPMENT || transaction.getReceiverType() == PartyType.EQUIPMENT);
        
        if (!isEquipmentTransaction) {
            throw new IllegalArgumentException("This service only handles warehouse ↔ equipment transactions");
        }
    }

    private void recordTransactionHistory(Transaction transaction, TransactionItem item, 
                                        TransactionStatus previousStatus, TransactionStatus newStatus,
                                        String changeType, String reason, String changedBy) {
        TransactionHistory history = TransactionHistory.builder()
                .transaction(transaction)
                .transactionItem(item)
                .previousStatus(previousStatus)
                .newStatus(newStatus)
                .changeType(changeType)
                .reason(reason)
                .changedBy(changedBy)
                .changedAt(LocalDateTime.now())
                .isSystemGenerated(false)
                .build();

        transactionHistoryRepository.save(history);
    }

    private void createConsumableMovements(Transaction transaction) {
        for (TransactionItem item : transaction.getItems()) {
            ConsumableMovement movement = ConsumableMovement.builder()
                    .transaction(transaction)
                    .transactionItem(item)
                    .itemType(item.getItemType())
                    .quantity(item.getQuantity())
                    .expectedQuantity(item.getQuantity())
                    .status(EquipmentTransactionStatus.PENDING)
                    .movementDate(transaction.getTransactionDate())
                    .recordedBy(transaction.getAddedBy())
                    .isDiscrepancy(false)
                    .build();

            // Set source and destination based on transaction direction
            if (transaction.getSenderType() == PartyType.WAREHOUSE) {
                movement.setSourceWarehouse(warehouseRepository.findById(transaction.getSenderId()).orElse(null));
                movement.setDestinationEquipment(equipmentRepository.findById(transaction.getReceiverId()).orElse(null));
                movement.setMovementType(ConsumableMovement.MovementType.WAREHOUSE_TO_EQUIPMENT);
            } else {
                movement.setSourceEquipment(equipmentRepository.findById(transaction.getSenderId()).orElse(null));
                movement.setDestinationWarehouse(warehouseRepository.findById(transaction.getReceiverId()).orElse(null));
                movement.setMovementType(ConsumableMovement.MovementType.EQUIPMENT_TO_WAREHOUSE);
            }

            consumableMovementRepository.save(movement);
        }
    }

    private void updateConsumableMovementStatus(Transaction transaction, TransactionItem item, 
                                               EquipmentTransactionStatus newStatus) {
        List<ConsumableMovement> movements = consumableMovementRepository.findByTransactionIdOrderByMovementDateDesc(transaction.getId());
        
        for (ConsumableMovement movement : movements) {
            if (movement.getTransactionItem().getId().equals(item.getId())) {
                movement.setStatus(newStatus);
                
                // Check for discrepancies
                if (item.getReceivedQuantity() != null && !item.getReceivedQuantity().equals(item.getQuantity())) {
                    movement.setIsDiscrepancy(true);
                    movement.setQuantity(item.getReceivedQuantity());
                }
                
                consumableMovementRepository.save(movement);
            }
        }
    }

    private EquipmentTransactionStatus determineEquipmentStatus(Map<UUID, Integer> receivedQuantities, 
                                                               Map<UUID, Boolean> itemsNotReceived, 
                                                               Transaction transaction) {
        int acceptedItems = 0;
        int rejectedItems = 0;
        int totalItems = transaction.getItems().size();

        for (TransactionItem item : transaction.getItems()) {
            Integer receivedQty = receivedQuantities.getOrDefault(item.getId(), item.getQuantity());
            Boolean notReceived = itemsNotReceived.getOrDefault(item.getId(), false);

            if (notReceived || receivedQty == 0) {
                rejectedItems++;
            } else if (receivedQty.equals(item.getQuantity())) {
                acceptedItems++;
            }
        }

        if (rejectedItems == 0) {
            return EquipmentTransactionStatus.ACCEPTED;
        } else if (acceptedItems == 0) {
            return EquipmentTransactionStatus.REJECTED;
        } else {
            return EquipmentTransactionStatus.PARTIALLY_ACCEPTED;
        }
    }

    private EquipmentTransactionStatus determineOverallEquipmentStatus(Transaction transaction) {
        long acceptedCount = transaction.getItems().stream()
                .mapToLong(item -> item.getStatus() == TransactionStatus.ACCEPTED ? 1 : 0).sum();
        long rejectedCount = transaction.getItems().stream()
                .mapToLong(item -> item.getStatus() == TransactionStatus.REJECTED ? 1 : 0).sum();
        long resolvedCount = transaction.getItems().stream()
                .mapToLong(item -> item.getStatus() == TransactionStatus.RESOLVED ? 1 : 0).sum();

        if (rejectedCount == 0 && resolvedCount == 0) {
            return EquipmentTransactionStatus.ACCEPTED;
        } else if (acceptedCount == 0 && resolvedCount == 0) {
            return EquipmentTransactionStatus.REJECTED;
        } else if (resolvedCount > 0) {
            return EquipmentTransactionStatus.RESOLVED;
        } else {
            return EquipmentTransactionStatus.PARTIALLY_ACCEPTED;
        }
    }

    private TransactionStatus determineItemStatus(Integer receivedQuantity, Integer expectedQuantity, Boolean notReceived) {
        if (notReceived || receivedQuantity == 0) {
            return TransactionStatus.REJECTED;
        } else {
            return TransactionStatus.ACCEPTED;
        }
    }

    private TransactionStatus mapEquipmentStatusToTransactionStatus(EquipmentTransactionStatus equipmentStatus) {
        return switch (equipmentStatus) {
            case ACCEPTED -> TransactionStatus.ACCEPTED;
            case PENDING -> TransactionStatus.PENDING;
            case REJECTED -> TransactionStatus.REJECTED;
            case RESOLVED -> TransactionStatus.RESOLVED;
            case PARTIALLY_ACCEPTED -> TransactionStatus.PARTIALLY_ACCEPTED;
            case PARTIALLY_REJECTED -> TransactionStatus.REJECTED;
            case DELIVERING -> TransactionStatus.DELIVERING;
        };
    }

    private String buildAcceptanceReason(Integer receivedQty, Integer expectedQty, Boolean notReceived) {
        if (notReceived) {
            return "Item marked as not received";
        } else if (receivedQty.equals(expectedQty)) {
            return "Full quantity received as expected";
        } else if (receivedQty < expectedQty) {
            return String.format("Partial quantity received: %d of %d expected", receivedQty, expectedQty);
        } else {
            return String.format("Over-received: %d received, %d expected", receivedQty, expectedQty);
        }
    }

    private Integer generateBatchNumber() {
        // Simple implementation - in production, this should be more sophisticated
        return (int) (System.currentTimeMillis() % 1000000);
    }

    // ========================================
    // QUERY METHODS
    // ========================================

    /**
     * Get transaction history for equipment
     */
    public List<TransactionHistory> getEquipmentTransactionHistory(UUID equipmentId) {
        return transactionHistoryRepository.findByEquipmentIdOrderByChangedAtDesc(equipmentId);
    }

    /**
     * Get consumable movements for equipment
     */
    public List<ConsumableMovement> getEquipmentConsumableMovements(UUID equipmentId) {
        return consumableMovementRepository.findByEquipmentIdOrderByMovementDateDesc(equipmentId);
    }

    /**
     * Get accurate consumable history for specific item type
     */
    public List<ConsumableMovement> getConsumableHistory(UUID equipmentId, UUID itemTypeId) {
        return consumableMovementRepository.findByEquipmentAndItemTypeOrderByMovementDateDesc(equipmentId, itemTypeId);
    }

    /**
     * Calculate current consumable stock accurately
     */
    public Integer getCurrentConsumableStock(UUID equipmentId, UUID itemTypeId) {
        Integer stock = consumableMovementRepository.calculateCurrentStock(equipmentId, itemTypeId);
        return stock != null ? stock : 0;
    }

    /**
     * Validate consumable history accuracy
     */
    public boolean validateConsumableHistoryAccuracy(UUID equipmentId, UUID itemTypeId) {
        Integer calculatedStock = getCurrentConsumableStock(equipmentId, itemTypeId);
        Integer movementBalance = consumableMovementRepository.validateMovementBalance(equipmentId, itemTypeId);
        return Objects.equals(calculatedStock, movementBalance);
    }
} 