package com.example.backend.controllers;

import com.example.backend.models.*;
import com.example.backend.repositories.ItemTypeRepository;
import com.example.backend.services.EmployeeService;
import com.example.backend.services.InSiteMaintenanceService;
import com.example.backend.services.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/equipment/{equipmentId}/maintenance")
public class InSiteMaintenanceController {

    @Autowired
    private InSiteMaintenanceService maintenanceService;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private ItemTypeRepository itemTypeRepository;

    // Get all maintenance records for equipment
    @GetMapping
    public ResponseEntity<List<InSiteMaintenance>> getAllMaintenanceRecords(@PathVariable UUID equipmentId) {
        return ResponseEntity.ok(maintenanceService.getMaintenanceByEquipmentId(equipmentId));
    }

    // Get all employees that can be technicians
    @GetMapping("/technicians")
    public ResponseEntity<List<Employee>> getAllTechnicians() {
        return ResponseEntity.ok(employeeService.getTechnicians());
    }

    // Create a new maintenance record with transaction validation
    @PostMapping
    public ResponseEntity<?> createMaintenance(
            @PathVariable UUID equipmentId,
            @RequestBody Map<String, Object> maintenanceData,
            @AuthenticationPrincipal UserDetails userDetails) {

        UUID technicianId = UUID.fromString((String) maintenanceData.get("technicianId"));
        LocalDateTime maintenanceDate = LocalDateTime.parse((String) maintenanceData.get("maintenanceDate"));
        String maintenanceType = (String) maintenanceData.get("maintenanceType");
        String description = (String) maintenanceData.get("description");
        String status = (String) maintenanceData.get("status");

        Object batchNumberObj = maintenanceData.get("batchNumber");
        Integer batchNumber = (batchNumberObj != null && !batchNumberObj.toString().isBlank()) ?
                Integer.parseInt(batchNumberObj.toString()) : null;
        Map<String, Object> response = new HashMap<>();

        try {
            // First create the maintenance record
            InSiteMaintenance maintenance = maintenanceService.createMaintenance(
                    equipmentId, technicianId, maintenanceDate, maintenanceType, description, status);

            // If batch number is provided, check if transaction exists
            if (batchNumber != null) {
                Optional<Transaction> existingTransaction = maintenanceService.findTransactionByBatchNumber(batchNumber);

                if (existingTransaction.isPresent()) {
                    // Transaction exists, link it to maintenance
                    Transaction transaction = existingTransaction.get();

                    // Update purpose to MAINTENANCE if needed
                    if (transaction.getPurpose() != TransactionPurpose.MAINTENANCE) {
                        transaction.setPurpose(TransactionPurpose.MAINTENANCE);
                        transactionService.updateEquipmentTransaction(
                                transaction.getId(),
                                transaction.getSenderType(),
                                transaction.getSenderId(),
                                transaction.getReceiverType(),
                                transaction.getReceiverId(),
                                transaction.getItems(),
                                transaction.getTransactionDate(),
                                userDetails.getUsername(),
                                transaction.getBatchNumber(),
                                TransactionPurpose.MAINTENANCE
                        );
                    }

                    maintenance = maintenanceService.linkTransactionToMaintenance(
                            maintenance.getId(), transaction.getId());

                    response.put("maintenance", maintenance);
                    response.put("transaction", transaction);
                    response.put("status", "linked");

                    return ResponseEntity.ok(response);
                } else {
                    // Transaction doesn't exist, return maintenance with status
                    response.put("maintenance", maintenance);
                    response.put("status", "transaction_not_found");
                    response.put("message", "Maintenance record created, but no transaction found with batch number " + batchNumber);

                    return ResponseEntity.ok(response);
                }
            } else {
                // No batch number provided, just return the maintenance record
                response.put("maintenance", maintenance);
                response.put("status", "created");

                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Update a maintenance record
    @PutMapping("/{maintenanceId}")
    public ResponseEntity<InSiteMaintenance> updateMaintenance(
            @PathVariable UUID equipmentId,
            @PathVariable UUID maintenanceId,
            @RequestBody Map<String, Object> maintenanceData) {

        UUID technicianId = UUID.fromString((String) maintenanceData.get("technicianId"));
        LocalDateTime maintenanceDate = LocalDateTime.parse((String) maintenanceData.get("maintenanceDate"));
        String maintenanceType = (String) maintenanceData.get("maintenanceType");
        String description = (String) maintenanceData.get("description");
        String status = (String) maintenanceData.get("status");

        InSiteMaintenance maintenance = maintenanceService.updateMaintenance(
                maintenanceId, technicianId, maintenanceDate, maintenanceType, description, status);

        return ResponseEntity.ok(maintenance);
    }

    // Link transaction to maintenance
    @PostMapping("/{maintenanceId}/link-transaction/{transactionId}")
    public ResponseEntity<InSiteMaintenance> linkTransactionToMaintenance(
            @PathVariable UUID equipmentId,
            @PathVariable UUID maintenanceId,
            @PathVariable UUID transactionId) {

        InSiteMaintenance maintenance = maintenanceService.linkTransactionToMaintenance(maintenanceId, transactionId);
        return ResponseEntity.ok(maintenance);
    }

    // Delete a maintenance record
    @DeleteMapping("/{maintenanceId}")
    public ResponseEntity<Void> deleteMaintenance(
            @PathVariable UUID equipmentId,
            @PathVariable UUID maintenanceId) {

        maintenanceService.deleteMaintenance(maintenanceId);
        return ResponseEntity.noContent().build();
    }

    // Create a new maintenance transaction
    @PostMapping("/{maintenanceId}/transactions")
    public ResponseEntity<?> createMaintenanceTransaction(
            @PathVariable UUID equipmentId,
            @PathVariable UUID maintenanceId,
            @RequestParam UUID senderId,
            @RequestParam PartyType senderType,
            @RequestParam int batchNumber,
            @RequestBody List<Map<String, Object>> items,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            // Validate maintenance record exists
            InSiteMaintenance maintenance = maintenanceService.getMaintenanceByEquipmentId(equipmentId)
                    .stream()
                    .filter(m -> m.getId().equals(maintenanceId))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Maintenance record not found"));

            // Convert items to TransactionItem objects
            List<TransactionItem> transactionItems = items.stream()
                    .map(itemMap -> {
                        UUID itemTypeId = UUID.fromString(itemMap.get("itemTypeId").toString());
                        int quantity = Integer.parseInt(itemMap.get("quantity").toString());

                        ItemType itemType = itemTypeRepository.findById(itemTypeId)
                                .orElseThrow(() -> new IllegalArgumentException("Item type not found: " + itemTypeId));

                        return TransactionItem.builder()
                                .itemType(itemType) // Assuming you have a constructor that takes ID
                                .quantity(quantity)
                                .status(TransactionStatus.PENDING)
                                .build();
                    })
                    .toList();

            // Create transaction with MAINTENANCE purpose
            Transaction transaction = transactionService.createEquipmentTransaction(
                    senderType, senderId,
                    PartyType.EQUIPMENT, equipmentId,
                    transactionItems,
                    LocalDateTime.now(),
                    userDetails.getUsername(),
                    batchNumber,
                    equipmentId, // Equipment is the receiver
                    TransactionPurpose.MAINTENANCE // Specify maintenance purpose
            );

            // Link transaction to maintenance
            maintenance = maintenanceService.linkTransactionToMaintenance(maintenanceId, transaction.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("maintenance", maintenance);
            response.put("transaction", transaction);
            response.put("status", "created");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Add this endpoint to InSiteMaintenanceController.java
    @GetMapping("/transaction-by-batch/{batchNumber}")
    public ResponseEntity<?> findTransactionByBatchNumber(
            @PathVariable UUID equipmentId,
            @PathVariable int batchNumber) {

        try {
            Optional<Transaction> transaction = maintenanceService.findTransactionByBatchNumber(batchNumber);

            if (transaction.isPresent()) {
                return ResponseEntity.ok(transaction.get());
            } else {
                return ResponseEntity.status(404).body("No transaction found with batch number: " + batchNumber);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}