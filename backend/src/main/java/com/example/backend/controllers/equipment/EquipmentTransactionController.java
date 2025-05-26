package com.example.backend.controllers.equipment;

import com.example.backend.models.*;
import com.example.backend.models.equipment.Equipment;
import com.example.backend.models.transaction.Transaction;
import com.example.backend.models.transaction.TransactionItem;
import com.example.backend.models.transaction.TransactionPurpose;
import com.example.backend.models.transaction.TransactionStatus;
import com.example.backend.models.warehouse.ItemType;
import com.example.backend.repositories.equipment.EquipmentRepository;
import com.example.backend.repositories.warehouse.ItemTypeRepository;
import com.example.backend.services.transaction.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentTransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private ItemTypeRepository itemTypeRepository;

    /**
     * Get all transactions for a specific equipment
     */
    @GetMapping("/{equipmentId}/transactions")
    public ResponseEntity<List<Transaction>> getEquipmentTransactions(
            @PathVariable UUID equipmentId) {
        return ResponseEntity.ok(transactionService.getTransactionsForEquipment(equipmentId));
    }

    /**
     * Get all transactions by purpose (consumable or maintenance) for a specific equipment
     */
    @GetMapping("/{equipmentId}/transactions/purpose/{purpose}")
    public ResponseEntity<List<Transaction>> getEquipmentTransactionsByPurpose(
            @PathVariable UUID equipmentId,
            @PathVariable TransactionPurpose purpose) {
        return ResponseEntity.ok(transactionService.getTransactionsForEquipmentByPurpose(equipmentId, purpose));
    }

    /**
     * Get consumable transactions for a specific equipment
     */
    @GetMapping("/{equipmentId}/transactions/consumables")
    public ResponseEntity<List<Transaction>> getConsumableTransactions(
            @PathVariable UUID equipmentId) {
        return ResponseEntity.ok(transactionService.getConsumableTransactionsForEquipment(equipmentId));
    }

    /**
     * Get maintenance transactions for a specific equipment
     */
    @GetMapping("/{equipmentId}/transactions/maintenance")
    public ResponseEntity<List<Transaction>> getMaintenanceTransactions(
            @PathVariable UUID equipmentId) {
        return ResponseEntity.ok(transactionService.getMaintenanceTransactionsForEquipment(equipmentId));
    }

    /**
     * Get incoming transactions for equipment (transactions where equipment is receiver but didn't initiate)
     */
    @GetMapping("/{equipmentId}/transactions/incoming")
    public ResponseEntity<List<Transaction>> getIncomingTransactions(
            @PathVariable UUID equipmentId) {
        return ResponseEntity.ok(transactionService.getIncomingTransactionsForEquipment(equipmentId));
    }

    /**
     * Get outgoing transactions for equipment (transactions where equipment is sender but didn't initiate)
     */
    @GetMapping("/{equipmentId}/transactions/outgoing")
    public ResponseEntity<List<Transaction>> getOutgoingTransactions(
            @PathVariable UUID equipmentId) {
        return ResponseEntity.ok(transactionService.getOutgoingTransactionsForEquipment(equipmentId));
    }

    /**
     * Get pending transactions initiated by this equipment
     */
    @GetMapping("/{equipmentId}/transactions/pending")
    public ResponseEntity<List<Transaction>> getPendingTransactions(
            @PathVariable UUID equipmentId) {
        return ResponseEntity.ok(transactionService.getPendingTransactionsInitiatedByEquipment(equipmentId));
    }

    /**
     * Create a new transaction with equipment as sender
     */
    @PostMapping("/{equipmentId}/send-transaction")
    public ResponseEntity<Transaction> createSenderTransaction(
            @PathVariable UUID equipmentId,
            @RequestParam UUID receiverId,
            @RequestParam PartyType receiverType,
            @RequestParam int batchNumber,
            @RequestParam(required = false) LocalDateTime transactionDate,
            @RequestParam(required = false, defaultValue = "GENERAL") TransactionPurpose purpose,
            @RequestBody List<Map<String, Object>> items,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Validate the equipment exists
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Equipment not found"));

        // Convert the items list to TransactionItem objects
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

        // Use the provided transaction date or default to current time
        LocalDateTime effectiveTransactionDate = transactionDate != null ? transactionDate : LocalDateTime.now();

        // Create the transaction
        Transaction transaction = transactionService.createEquipmentTransaction(
                PartyType.EQUIPMENT, equipmentId,
                receiverType, receiverId,
                transactionItems,
                effectiveTransactionDate,
                userDetails.getUsername(),
                batchNumber,
                equipmentId, // Equipment is the sender initiating the transaction
                purpose
        );

        return ResponseEntity.ok(transaction);
    }

    /**
     * Create a new transaction with equipment as receiver
     */
    @PostMapping("/{equipmentId}/receive-transaction")
    public ResponseEntity<Transaction> createReceiverTransaction(
            @PathVariable UUID equipmentId,
            @RequestParam UUID senderId,
            @RequestParam PartyType senderType,
            @RequestParam int batchNumber,
            @RequestParam(required = false) LocalDateTime transactionDate,
            @RequestParam(required = false, defaultValue = "GENERAL") TransactionPurpose purpose,
            @RequestBody List<Map<String, Object>> items,
            @AuthenticationPrincipal UserDetails userDetails) {

        System.out.println("Recieved Transaction" + equipmentId);

        // Validate the equipment exists
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Equipment not found"));

        // Convert the items list to TransactionItem objects
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

        // Use the provided transaction date or default to current time
        LocalDateTime effectiveTransactionDate = transactionDate != null ? transactionDate : LocalDateTime.now();

        // Create the transaction
        Transaction transaction = transactionService.createEquipmentTransaction(
                senderType, senderId,
                PartyType.EQUIPMENT, equipmentId,
                transactionItems,
                effectiveTransactionDate,
                userDetails.getUsername(),
                batchNumber,
                equipmentId, // Equipment is the receiver initiating the transaction
                purpose
        );

        return ResponseEntity.ok(transaction);
    }

    /**
     * Update a pending transaction
     */
    @PutMapping("/{equipmentId}/transactions/{transactionId}")
    public ResponseEntity<Transaction> updateTransaction(
            @PathVariable UUID equipmentId,
            @PathVariable UUID transactionId,
            @RequestParam UUID senderId,
            @RequestParam PartyType senderType,
            @RequestParam UUID receiverId,
            @RequestParam PartyType receiverType,
            @RequestParam int batchNumber,
            @RequestParam(required = false) LocalDateTime transactionDate,
            @RequestParam(required = false) TransactionPurpose purpose,
            @RequestBody List<Map<String, Object>> items,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Verify the transaction involves this equipment
        Transaction transaction = transactionService.getTransactionById(transactionId);
        boolean isInvolved = (transaction.getSenderType() == PartyType.EQUIPMENT &&
                transaction.getSenderId().equals(equipmentId)) ||
                (transaction.getReceiverType() == PartyType.EQUIPMENT &&
                        transaction.getReceiverId().equals(equipmentId));

        if (!isInvolved) {
            return ResponseEntity.badRequest().build();
        }

        // Convert the items list to TransactionItem objects
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

        // Use the provided transaction date or preserve the original transaction date
        LocalDateTime effectiveTransactionDate = transactionDate != null ?
                transactionDate : transaction.getTransactionDate();

        // Update the transaction
        Transaction updatedTransaction = transactionService.updateEquipmentTransaction(
                transactionId,
                senderType,
                senderId,
                receiverType,
                receiverId,
                transactionItems,
                effectiveTransactionDate,
                userDetails.getUsername(),
                batchNumber,
                purpose
        );

        return ResponseEntity.ok(updatedTransaction);
    }
    /**
     * Accept a transaction where equipment is a party and specify the purpose
     */
    @PostMapping("/{equipmentId}/transactions/{transactionId}/accept")
    public ResponseEntity<Transaction> acceptTransaction(
            @PathVariable UUID equipmentId,
            @PathVariable UUID transactionId,
            @RequestBody Map<String, Object> requestBody,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Verify the transaction involves this equipment
        Transaction transaction = transactionService.getTransactionById(transactionId);
        boolean isInvolved = (transaction.getSenderType() == PartyType.EQUIPMENT &&
                transaction.getSenderId().equals(equipmentId)) ||
                (transaction.getReceiverType() == PartyType.EQUIPMENT &&
                        transaction.getReceiverId().equals(equipmentId));

        if (!isInvolved) {
            return ResponseEntity.badRequest().build();
        }

        // Extract received quantities and other data
        @SuppressWarnings("unchecked")
        Map<String, Integer> receivedQuantitiesMap = (Map<String, Integer>) requestBody.get("receivedQuantities");
        String comment = (String) requestBody.get("comment");

        // Get transaction purpose if provided (defaults to current purpose if not specified)
        TransactionPurpose purpose = null;
        if (requestBody.containsKey("purpose")) {
            purpose = TransactionPurpose.valueOf(requestBody.get("purpose").toString());
        }

        // Convert String keys to UUID
        Map<UUID, Integer> receivedQuantities = new HashMap<>();
        receivedQuantitiesMap.forEach((key, value) -> {
            receivedQuantities.put(UUID.fromString(key), value);
        });

        // Accept the transaction
        Transaction updatedTransaction = transactionService.acceptEquipmentTransaction(
                transactionId,
                receivedQuantities,
                userDetails.getUsername(),
                comment,
                purpose
        );

        return ResponseEntity.ok(updatedTransaction);
    }

    /**
     * Reject a transaction
     */
    @PostMapping("/{equipmentId}/transactions/{transactionId}/reject")
    public ResponseEntity<Transaction> rejectTransaction(
            @PathVariable UUID equipmentId,
            @PathVariable UUID transactionId,
            @RequestBody Map<String, String> requestBody,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Verify the transaction involves this equipment
        Transaction transaction = transactionService.getTransactionById(transactionId);
        boolean isInvolved = (transaction.getSenderType() == PartyType.EQUIPMENT &&
                transaction.getSenderId().equals(equipmentId)) ||
                (transaction.getReceiverType() == PartyType.EQUIPMENT &&
                        transaction.getReceiverId().equals(equipmentId));

        if (!isInvolved) {
            return ResponseEntity.badRequest().build();
        }

        String rejectionReason = requestBody.get("rejectionReason");

        Transaction rejectedTransaction = transactionService.rejectEquipmentTransaction(
                transactionId,
                rejectionReason,
                userDetails.getUsername()
        );

        return ResponseEntity.ok(rejectedTransaction);
    }


}