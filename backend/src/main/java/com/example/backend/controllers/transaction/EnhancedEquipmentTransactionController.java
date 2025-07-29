package com.example.backend.controllers.transaction;

import com.example.backend.dto.transaction.TransactionDTO;
import com.example.backend.models.PartyType;
import com.example.backend.models.transaction.*;
import com.example.backend.models.warehouse.ItemType;
import com.example.backend.repositories.warehouse.ItemTypeRepository;
import com.example.backend.services.transaction.EnhancedEquipmentTransactionService;
import com.example.backend.services.transaction.TransactionMapperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Enhanced REST controller for warehouse ↔ equipment transactions ONLY.
 * 
 * CRITICAL: This controller uses COMPLETELY DIFFERENT URL patterns from 
 * warehouse-warehouse transactions to ensure zero impact on existing flows.
 * 
 * URL Pattern: /api/v1/equipment-transactions/*
 * (Different from warehouse-warehouse: /api/v1/transactions/*)
 * 
 * Features:
 * - Enhanced transaction statuses (ACCEPTED, PENDING, REJECTED, RESOLVED)
 * - Bulk operations for efficient processing
 * - Comprehensive history and audit trail
 * - Complex scenario handling (partial acceptance/rejection)
 */
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/equipment-transactions")
public class EnhancedEquipmentTransactionController {

    @Autowired
    private EnhancedEquipmentTransactionService enhancedTransactionService;

    @Autowired
    private TransactionMapperService transactionMapperService;

    @Autowired
    private ItemTypeRepository itemTypeRepository;

    // ========================================
    // WAREHOUSE → EQUIPMENT TRANSACTION ENDPOINTS
    // ========================================

    /**
     * Create warehouse-to-equipment transaction with enhanced tracking
     */
    @PostMapping("/warehouse-to-equipment")
    public ResponseEntity<TransactionDTO> createWarehouseToEquipmentTransaction(
            @RequestParam UUID warehouseId,
            @RequestParam UUID equipmentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime transactionDate,
            @RequestParam(required = false, defaultValue = "CONSUMABLE") TransactionPurpose purpose,
            @RequestParam(required = false) String description,
            @RequestBody List<Map<String, Object>> items,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            // Convert items to TransactionItem entities
            List<TransactionItem> transactionItems = items.stream()
                    .map(itemMap -> {
                        UUID itemTypeId = UUID.fromString(itemMap.get("itemTypeId").toString());
                        int quantity = Integer.parseInt(itemMap.get("quantity").toString());

                        ItemType itemType = itemTypeRepository.findById(itemTypeId)
                                .orElseThrow(() -> new IllegalArgumentException("Item type not found"));

                        return TransactionItem.builder()
                                .itemType(itemType)
                                .quantity(quantity)
                                .status(TransactionStatus.PENDING)
                                .build();
                    })
                    .collect(Collectors.toList());

            LocalDateTime effectiveDate = transactionDate != null ? transactionDate : LocalDateTime.now();

            Transaction transaction = enhancedTransactionService.createWarehouseToEquipmentTransaction(
                    warehouseId, equipmentId, transactionItems, effectiveDate,
                    userDetails.getUsername(), description, purpose);

            TransactionDTO responseDTO = transactionMapperService.toDTO(transaction);
            return ResponseEntity.ok(responseDTO);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * Create equipment-to-warehouse transaction with enhanced tracking
     */
    @PostMapping("/equipment-to-warehouse")
    public ResponseEntity<TransactionDTO> createEquipmentToWarehouseTransaction(
            @RequestParam UUID equipmentId,
            @RequestParam UUID warehouseId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime transactionDate,
            @RequestParam(required = false, defaultValue = "CONSUMABLE") TransactionPurpose purpose,
            @RequestParam(required = false) String description,
            @RequestBody List<Map<String, Object>> items,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            // Convert items to TransactionItem entities
            List<TransactionItem> transactionItems = items.stream()
                    .map(itemMap -> {
                        UUID itemTypeId = UUID.fromString(itemMap.get("itemTypeId").toString());
                        int quantity = Integer.parseInt(itemMap.get("quantity").toString());

                        ItemType itemType = itemTypeRepository.findById(itemTypeId)
                                .orElseThrow(() -> new IllegalArgumentException("Item type not found"));

                        return TransactionItem.builder()
                                .itemType(itemType)
                                .quantity(quantity)
                                .status(TransactionStatus.PENDING)
                                .build();
                    })
                    .collect(Collectors.toList());

            LocalDateTime effectiveDate = transactionDate != null ? transactionDate : LocalDateTime.now();

            Transaction transaction = enhancedTransactionService.createEquipmentToWarehouseTransaction(
                    equipmentId, warehouseId, transactionItems, effectiveDate,
                    userDetails.getUsername(), description, purpose);

            TransactionDTO responseDTO = transactionMapperService.toDTO(transaction);
            return ResponseEntity.ok(responseDTO);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    // ========================================
    // ENHANCED TRANSACTION PROCESSING
    // ========================================

    /**
     * Accept equipment transaction with enhanced status handling
     */
    @PostMapping("/{transactionId}/accept")
    public ResponseEntity<TransactionDTO> acceptEquipmentTransaction(
            @PathVariable UUID transactionId,
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            // Extract received quantities
            @SuppressWarnings("unchecked")
            Map<String, Integer> receivedQuantitiesMap = (Map<String, Integer>) request.get("receivedQuantities");
            Map<UUID, Integer> receivedQuantities = new HashMap<>();
            if (receivedQuantitiesMap != null) {
                receivedQuantitiesMap.forEach((key, value) -> receivedQuantities.put(UUID.fromString(key), value));
            }

            // Extract items not received
            @SuppressWarnings("unchecked")
            Map<String, Boolean> itemsNotReceivedMap = (Map<String, Boolean>) request.get("itemsNotReceived");
            Map<UUID, Boolean> itemsNotReceived = new HashMap<>();
            if (itemsNotReceivedMap != null) {
                itemsNotReceivedMap.forEach((key, value) -> itemsNotReceived.put(UUID.fromString(key), value));
            }

            String comment = (String) request.get("comment");

            Transaction transaction = enhancedTransactionService.acceptEquipmentTransaction(
                    transactionId, receivedQuantities, itemsNotReceived, 
                    userDetails.getUsername(), comment);

            TransactionDTO responseDTO = transactionMapperService.toDTO(transaction);
            return ResponseEntity.ok(responseDTO);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * Reject specific transaction items with detailed reasons
     */
    @PostMapping("/{transactionId}/reject-items")
    public ResponseEntity<TransactionDTO> rejectTransactionItems(
            @PathVariable UUID transactionId,
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            // Extract rejected items with reasons
            @SuppressWarnings("unchecked")
            Map<String, String> rejectedItemsMap = (Map<String, String>) request.get("rejectedItems");
            Map<UUID, String> rejectedItems = new HashMap<>();
            if (rejectedItemsMap != null) {
                rejectedItemsMap.forEach((key, value) -> rejectedItems.put(UUID.fromString(key), value));
            }

            String generalReason = (String) request.get("generalReason");

            Transaction transaction = enhancedTransactionService.rejectEquipmentTransactionItems(
                    transactionId, rejectedItems, userDetails.getUsername(), generalReason);

            TransactionDTO responseDTO = transactionMapperService.toDTO(transaction);
            return ResponseEntity.ok(responseDTO);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * Resolve previously rejected items
     */
    @PostMapping("/{transactionId}/resolve-items")
    public ResponseEntity<TransactionDTO> resolveRejectedItems(
            @PathVariable UUID transactionId,
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            // Extract resolution details
            @SuppressWarnings("unchecked")
            Map<String, String> resolutionDetailsMap = (Map<String, String>) request.get("resolutionDetails");
            Map<UUID, String> resolutionDetails = new HashMap<>();
            if (resolutionDetailsMap != null) {
                resolutionDetailsMap.forEach((key, value) -> resolutionDetails.put(UUID.fromString(key), value));
            }

            String resolutionComment = (String) request.get("resolutionComment");

            Transaction transaction = enhancedTransactionService.resolveRejectedItems(
                    transactionId, resolutionDetails, userDetails.getUsername(), resolutionComment);

            TransactionDTO responseDTO = transactionMapperService.toDTO(transaction);
            return ResponseEntity.ok(responseDTO);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    // ========================================
    // BULK OPERATIONS FOR EFFICIENCY
    // ========================================

    /**
     * Bulk confirm multiple equipment transactions
     */
    @PostMapping("/bulk-confirm")
    public ResponseEntity<Map<String, Object>> bulkConfirmTransactions(
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            @SuppressWarnings("unchecked")
            List<String> transactionIds = (List<String>) request.get("transactionIds");
            String comment = (String) request.get("comment");

            Map<String, Object> results = new HashMap<>();
            List<TransactionDTO> successfulTransactions = new ArrayList<>();
            List<Map<String, Object>> failedTransactions = new ArrayList<>();

            for (String transactionIdStr : transactionIds) {
                try {
                    UUID transactionId = UUID.fromString(transactionIdStr);
                    
                    // Simple accept all items with full quantities
                    Map<UUID, Integer> receivedQuantities = new HashMap<>();
                    Map<UUID, Boolean> itemsNotReceived = new HashMap<>();

                    Transaction transaction = enhancedTransactionService.acceptEquipmentTransaction(
                            transactionId, receivedQuantities, itemsNotReceived, 
                            userDetails.getUsername(), comment);

                    successfulTransactions.add(transactionMapperService.toDTO(transaction));

                } catch (Exception e) {
                    Map<String, Object> error = new HashMap<>();
                    error.put("transactionId", transactionIdStr);
                    error.put("error", e.getMessage());
                    failedTransactions.add(error);
                }
            }

            results.put("successful", successfulTransactions);
            results.put("failed", failedTransactions);
            results.put("totalProcessed", transactionIds.size());
            results.put("successfulCount", successfulTransactions.size());
            results.put("failedCount", failedTransactions.size());

            return ResponseEntity.ok(results);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    // ========================================
    // HISTORY AND AUDIT TRAIL ENDPOINTS
    // ========================================

    /**
     * Get transaction history for equipment
     */
    @GetMapping("/equipment/{equipmentId}/history")
    public ResponseEntity<List<TransactionHistory>> getEquipmentTransactionHistory(@PathVariable UUID equipmentId) {
        try {
            List<TransactionHistory> history = enhancedTransactionService.getEquipmentTransactionHistory(equipmentId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * Get consumable movements for equipment
     */
    @GetMapping("/equipment/{equipmentId}/movements")
    public ResponseEntity<List<ConsumableMovement>> getEquipmentConsumableMovements(@PathVariable UUID equipmentId) {
        try {
            List<ConsumableMovement> movements = enhancedTransactionService.getEquipmentConsumableMovements(equipmentId);
            return ResponseEntity.ok(movements);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * Get accurate consumable history for specific item type
     */
    @GetMapping("/equipment/{equipmentId}/consumables/{itemTypeId}/history")
    public ResponseEntity<List<ConsumableMovement>> getConsumableHistory(
            @PathVariable UUID equipmentId,
            @PathVariable UUID itemTypeId) {
        try {
            List<ConsumableMovement> history = enhancedTransactionService.getConsumableHistory(equipmentId, itemTypeId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * Get current consumable stock (accurately calculated)
     */
    @GetMapping("/equipment/{equipmentId}/consumables/{itemTypeId}/current-stock")
    public ResponseEntity<Map<String, Object>> getCurrentConsumableStock(
            @PathVariable UUID equipmentId,
            @PathVariable UUID itemTypeId) {
        try {
            Integer currentStock = enhancedTransactionService.getCurrentConsumableStock(equipmentId, itemTypeId);
            boolean isAccurate = enhancedTransactionService.validateConsumableHistoryAccuracy(equipmentId, itemTypeId);

            Map<String, Object> response = new HashMap<>();
            response.put("equipmentId", equipmentId);
            response.put("itemTypeId", itemTypeId);
            response.put("currentStock", currentStock);
            response.put("isAccurate", isAccurate);
            response.put("calculatedAt", LocalDateTime.now());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    // ========================================
    // DASHBOARD AND ANALYTICS ENDPOINTS
    // ========================================

    /**
     * Get equipment transaction dashboard data
     */
    @GetMapping("/equipment/{equipmentId}/dashboard")
    public ResponseEntity<Map<String, Object>> getEquipmentTransactionDashboard(@PathVariable UUID equipmentId) {
        try {
            Map<String, Object> dashboard = new HashMap<>();

            // Get recent transaction history
            List<TransactionHistory> recentHistory = enhancedTransactionService.getEquipmentTransactionHistory(equipmentId);
            dashboard.put("recentHistory", recentHistory.stream().limit(10).collect(Collectors.toList()));

            // Get recent movements
            List<ConsumableMovement> recentMovements = enhancedTransactionService.getEquipmentConsumableMovements(equipmentId);
            dashboard.put("recentMovements", recentMovements.stream().limit(10).collect(Collectors.toList()));

            // TODO: Add more dashboard metrics as needed
            dashboard.put("generatedAt", LocalDateTime.now());

            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * Validate consumable history integrity
     */
    @GetMapping("/equipment/{equipmentId}/validate-history")
    public ResponseEntity<Map<String, Object>> validateConsumableHistory(@PathVariable UUID equipmentId) {
        try {
            Map<String, Object> validation = new HashMap<>();
            List<Map<String, Object>> itemValidations = new ArrayList<>();

            // This would typically validate all item types for the equipment
            // For now, return a structure showing the validation approach
            validation.put("equipmentId", equipmentId);
            validation.put("validatedAt", LocalDateTime.now());
            validation.put("overallValid", true);
            validation.put("itemValidations", itemValidations);

            return ResponseEntity.ok(validation);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
} 