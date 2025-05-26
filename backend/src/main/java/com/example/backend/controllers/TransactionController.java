package com.example.backend.controllers;

import com.example.backend.models.*;
import com.example.backend.repositories.ItemTypeRepository;
import com.example.backend.repositories.TransactionRepository;
import com.example.backend.services.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/transactions") // Base URL for all transaction-related operations
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private ItemTypeRepository itemTypeRepository;

    @Autowired
    private TransactionRepository transactionRepository;

//    @PostMapping()
//    public ResponseEntity<Transaction> addTransaction(@RequestBody Map<String, Object> requestBody) {
//        Transaction transaction = transactionService.addTransaction(requestBody);
//        return ResponseEntity.ok(transaction);
//
//    }

    @PostMapping("/create")
    public ResponseEntity<Transaction> createTransaction(@RequestBody Map<String, Object> request) {
        // Extract the basic transaction information
        PartyType senderType = PartyType.valueOf((String) request.get("senderType"));
        UUID senderId = UUID.fromString((String) request.get("senderId"));
        PartyType receiverType = PartyType.valueOf((String) request.get("receiverType"));
        UUID receiverId = UUID.fromString((String) request.get("receiverId"));
        String username = (String) request.get("username");
        int batchNumber = (int) request.get("batchNumber");
        UUID sentFirst = UUID.fromString((String) request.get("sentFirst"));
        LocalDateTime transactionDate = LocalDateTime.parse((String) request.get("transactionDate"));

        // Extract the items array
        List<Map<String, Object>> itemsData = (List<Map<String, Object>>) request.get("items");
        List<TransactionItem> items = new ArrayList<>();

        // Create TransactionItem objects from the request data
        for (Map<String, Object> itemData : itemsData) {
            UUID itemTypeId = UUID.fromString((String) itemData.get("itemTypeId"));
            int quantity = (int) itemData.get("quantity");

            // Fetch the ItemType from the repository
            ItemType itemType = itemTypeRepository.findById(itemTypeId)
                    .orElseThrow(() -> new IllegalArgumentException("Item type not found: " + itemTypeId));

            // Create a new TransactionItem (without transaction reference yet)
            TransactionItem item = TransactionItem.builder()
                    .itemType(itemType)
                    .quantity(quantity)
                    .status(TransactionStatus.PENDING)
                    .build();

            items.add(item);
        }

        // Call the service to create the transaction with multiple items
        Transaction transaction = transactionService.createTransaction(
                senderType, senderId,
                receiverType, receiverId,
                items,
                transactionDate,
                username, batchNumber,
                sentFirst
        );

        return ResponseEntity.ok(transaction);
    }

    @PostMapping("/{transactionId}/accept")
    public ResponseEntity<Transaction> acceptTransaction(
            @PathVariable UUID transactionId,
            @RequestBody Map<String, Object> request
    ) {
        try {
            String username = (String) request.get("username");
            String acceptanceComment = (String) request.get("acceptanceComment");

            Object receivedItemsObj = request.get("receivedItems");
            if (!(receivedItemsObj instanceof List<?> receivedItemsList)) {
                throw new IllegalArgumentException("Invalid format for receivedItems");
            }

            Map<UUID, Integer> receivedQuantities = new HashMap<>();

            for (Object itemObj : receivedItemsList) {
                if (!(itemObj instanceof Map<?, ?> itemMap)) {
                    throw new IllegalArgumentException("Invalid item in receivedItems list");
                }

                Object idObj = itemMap.get("transactionItemId");
                Object quantityObj = itemMap.get("receivedQuantity");

                if (idObj == null || quantityObj == null) {
                    throw new IllegalArgumentException("Missing item data in receivedItems");
                }

                UUID itemId = UUID.fromString(idObj.toString());
                int receivedQuantity = Integer.parseInt(quantityObj.toString());

                receivedQuantities.put(itemId, receivedQuantity);
            }

            Transaction transaction = transactionService.acceptTransaction(
                    transactionId,
                    receivedQuantities,
                    username,
                    acceptanceComment
            );

            return ResponseEntity.ok(transaction);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }




    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<Transaction>> getTransactionsForWarehouse(@PathVariable UUID warehouseId) {
        List<Transaction> transactions = transactionService.getTransactionsForWarehouse(warehouseId);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<List<Transaction>> getTransactionsForEquipment(@PathVariable UUID equipmentId) {
        List<Transaction> transactions = transactionService.getTransactionsForEquipment(equipmentId);
        return ResponseEntity.ok(transactions);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTransaction(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> payload) {

        try {
            PartyType senderType = PartyType.valueOf(payload.get("senderType").toString());
            UUID senderId = UUID.fromString(payload.get("senderId").toString());

            PartyType receiverType = PartyType.valueOf(payload.get("receiverType").toString());
            UUID receiverId = UUID.fromString(payload.get("receiverId").toString());

            String username = payload.get("username").toString();
            int batchNumber = (int) payload.get("batchNumber");

            LocalDateTime transactionDate = LocalDateTime.parse(payload.get("transactionDate").toString());

            List<Map<String, Object>> itemsData = (List<Map<String, Object>>) payload.get("items");
            List<TransactionItem> items = new ArrayList<>();

            for (Map<String, Object> itemData : itemsData) {
                UUID itemTypeId = UUID.fromString(itemData.get("itemTypeId").toString());
                int quantity = (int) itemData.get("quantity");

                TransactionItem item = new TransactionItem();
                item.setItemType(ItemType.builder().id(itemTypeId).build());
                item.setQuantity(quantity);
                item.setStatus(TransactionStatus.PENDING);

                items.add(item);
            }

            Transaction updatedTransaction = transactionService.updateTransaction(
                    id, senderType, senderId, receiverType, receiverId,
                    items, transactionDate, username, batchNumber
            );

            return ResponseEntity.ok(updatedTransaction);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating transaction");
        }
    }

    @GetMapping("/batch/{batchNumber}")
    public ResponseEntity<Transaction> findByBatchNumber(@PathVariable int batchNumber) {
        Optional<Transaction> transaction = transactionRepository.findByBatchNumber(batchNumber);
        return transaction.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }


}
