//package com.example.Rock4Mining.services;
//
//import com.example.Rock4Mining.models.*;
//import com.example.Rock4Mining.repositories.*;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.time.LocalDateTime;
//import java.time.format.DateTimeFormatter;
//import java.util.*;
//
//@Service
//public class WarehouseTransactionService {
//
//
//    @Autowired
//    private TransactionRepository transactionRepository;
//    @Autowired
//    private WarehouseRepository warehouseRepository;
//    @Autowired
//    private ItemTypeRepository itemTypeRepository;
//    @Autowired
//    private ItemRepository itemRepository;
//    @Autowired
//    private TransactionPairRepository transactionPairRepository;
//    @Autowired
//    private WarehouseTransactionRepository warehouseTransactionRepository;
//
//
//
//    public List<WarehouseTransaction> getAllTransactions() {
//        return warehouseTransactionRepository.findAll();
//    }
//
//    public List<WarehouseTransaction> getTransactionsByWarehouseId(UUID warehouseId) {
//        return warehouseTransactionRepository.findByWarehouseId(warehouseId);
//    }
//
//
////    public WarehouseTransaction addTransaction(UUID warehouseId, Map<String, Object> requestBody) {
////
////        WarehouseTransaction transaction = new WarehouseTransaction();
////
////        // 1. Quantity
////        if (requestBody.containsKey("quantity")) {
////            transaction.setQuantity((int) requestBody.get("quantity"));
////        } else {
////            throw new RuntimeException("Quantity is required");
////        }
////
////        // 2. Transaction Date
////        if (requestBody.containsKey("transactionDate")) {
////            String dateString = (String) requestBody.get("transactionDate");
////            DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
////            transaction.setTransactionDate(LocalDateTime.parse(dateString, formatter));
////        } else {
////            throw new RuntimeException("Transaction date is required");
////        }
////
////        // 3. Status
////        if (requestBody.containsKey("status")) {
////            transaction.setStatus((String) requestBody.get("status"));
////        } else {
////            throw new RuntimeException("Status is required");
////        }
////
////        // 4. Sender Type and UUID
////        PartyType senderType = PartyType.valueOf(((String) requestBody.get("senderType")).toUpperCase());
////        UUID senderId = UUID.fromString((String) requestBody.get("senderId"));
////
////        PartyType receiverType = PartyType.valueOf(((String) requestBody.get("receiverType")).toUpperCase());
////        UUID receiverId = UUID.fromString((String) requestBody.get("receiverId"));
////
////        // 5. Validate: warehouse must be either sender or receiver
////        boolean isSender = senderType == PartyType.WAREHOUSE && senderId.equals(warehouseId);
////        boolean isReceiver = receiverType == PartyType.WAREHOUSE && receiverId.equals(warehouseId);
////
////        if (!isSender && !isReceiver) {
////            throw new RuntimeException("The warehouse must be either the sender or the receiver.");
////        }
////
////        transaction.setSenderType(senderType);
////        transaction.setSenderId(senderId);
////        transaction.setReceiverType(receiverType);
////        transaction.setReceiverId(receiverId);
////
////        // 6. Set Warehouse
////        Warehouse warehouse = warehouseRepository.findById(warehouseId)
////                .orElseThrow(() -> new RuntimeException("Warehouse not found"));
////        transaction.setWarehouse(warehouse);
////
////        // 7. ItemType
////        if (requestBody.containsKey("itemType")) {
////            Map<String, Object> itemTypeData = (Map<String, Object>) requestBody.get("itemType");
////            UUID itemTypeId = UUID.fromString((String) itemTypeData.get("id"));
////            ItemType itemType = itemTypeRepository.findById(itemTypeId)
////                    .orElseThrow(() -> new RuntimeException("ItemType not found"));
////            transaction.setItemType(itemType);
////        } else {
////            throw new RuntimeException("ItemType is required");
////        }
////
////        // 8. Added By (placeholder, change later to actual user)
////        transaction.setAddedBy("Logged in user");
////
////        // 9. Save transaction
////        return warehouseTransactionRepository.save(transaction);
////    }
//
//    public WarehouseTransaction sendTransactionFromWarehouse(
//            UUID warehouseId,
//            PartyType receiverType,
//            UUID receiverId,
//            UUID itemTypeId,
//            int quantity,
//            LocalDateTime transactionDate,
//            String username) {
//
//        // Validate receiver entity
//        validateEntityExists(receiverType, receiverId);
//
//        // Validate item type
//        ItemType itemType = itemTypeRepository.findById(itemTypeId)
//                .orElseThrow(() -> new IllegalArgumentException("Item type not found"));
//
//        // Fetch the sending warehouse
//        Warehouse warehouse = warehouseRepository.findById(warehouseId)
//                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found"));
//
//        System.out.println("itemtypee" + itemType.getName());
//        // Reduce inventory
//        Item item = itemRepository.findByItemTypeAndWarehouse(itemType, warehouse)
//                .orElseThrow(() -> new IllegalArgumentException("Item not found in warehouse"));
//
//        if (item.getQuantity() < quantity) {
//            System.out.println("quanitititit" + item.getQuantity());
//            throw new IllegalArgumentException("Not enough quantity in warehouse");
//        }
//
//        item.setQuantity(item.getQuantity() - quantity);
//        itemRepository.save(item);
//
//        // Try to find existing transaction pair (receiver has already received)
//        Optional<TransactionPair> optionalPair = transactionPairRepository.findPendingPairBySenderReceiverAndItem(
//                PartyType.WAREHOUSE, warehouseId, receiverType, receiverId, itemTypeId);
//
//        TransactionPair pair = optionalPair.orElseGet(() -> {
//            TransactionPair newPair = TransactionPair.builder()
//                    .status("PENDING")
//                    .build();
//            return transactionPairRepository.save(newPair);
//        });
//
//        // Ensure transactions list is never null
//        if (pair.getTransactions() == null) {
//            pair.setTransactions(new ArrayList<>());
//        }
//
//        // Create sending transaction
//        WarehouseTransaction sendingTransaction = WarehouseTransaction.builder()
//                .itemType(itemType)
//                .quantity(quantity)
//                .transactionDate(transactionDate)
//                .type(TransactionType.SENDING)
//                .status(TransactionStatus.PENDING)
//                .senderType(PartyType.WAREHOUSE)
//                .senderId(warehouseId)
//                .receiverType(receiverType)
//                .receiverId(receiverId)
//                .warehouse(warehouse)
//                .addedBy(username)
//                .transactionPair(pair)
//                .build();
//
//        warehouseTransactionRepository.save(sendingTransaction);
//
//        // Check if there's already a receiving transaction
//        Optional<WarehouseTransaction> receivingTransactionOpt = pair.getTransactions().stream()
//                .filter(t -> t.getType() == TransactionType.RECEIVING)
//                .findFirst();
//
//        if (receivingTransactionOpt.isPresent()) {
//            WarehouseTransaction receivingTransaction = receivingTransactionOpt.get();
//
//            if (sendingTransaction.getQuantity() == receivingTransaction.getQuantity()) {
//                pair.setStatus("MATCHED");
//                sendingTransaction.setStatus(TransactionStatus.ACCEPTED);
//                receivingTransaction.setStatus(TransactionStatus.ACCEPTED);
//            } else {
//                pair.setStatus("UNMATCHED");
//                sendingTransaction.setStatus(TransactionStatus.REJECTED);
//                receivingTransaction.setStatus(TransactionStatus.REJECTED);
//            }
//
//            warehouseTransactionRepository.save(receivingTransaction);
//        }
//
//        transactionPairRepository.save(pair);
//        return sendingTransaction;
//    }
//
//    public WarehouseTransaction receiveTransactionToWarehouse(
//            PartyType senderType,
//            UUID senderId,
//            UUID warehouseId,
//            UUID itemTypeId,
//            int quantity,
//            LocalDateTime transactionDate,
//            String username) {
//
//        // Validate sender
//        validateEntityExists(senderType, senderId);
//
//        // Validate item type
//        ItemType itemType = itemTypeRepository.findById(itemTypeId)
//                .orElseThrow(() -> new IllegalArgumentException("Item type not found"));
//
//        // Validate receiving warehouse
//        Warehouse warehouse = warehouseRepository.findById(warehouseId)
//                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found"));
//
//        // Try to find existing transaction pair (sender has already sent)
//        Optional<TransactionPair> optionalPair = transactionPairRepository.findPendingPairBySenderReceiverAndItem(
//                senderType, senderId, PartyType.WAREHOUSE, warehouseId, itemTypeId);
//
//        TransactionPair pair = optionalPair.orElseGet(() -> {
//            TransactionPair newPair = TransactionPair.builder()
//                    .status("PENDING")
//                    .build();
//            return transactionPairRepository.save(newPair);
//        });
//
//        // Ensure transactions list is never null
//        if (pair.getTransactions() == null) {
//            pair.setTransactions(new ArrayList<>());
//        }
//
//        // Update or create item in the warehouse inventory
//        Optional<Item> optionalItem = itemRepository.findByItemTypeAndWarehouse(itemType, warehouse);
//
//        Item item;
//        if (optionalItem.isPresent()) {
//            item = optionalItem.get();
//            item.setQuantity(item.getQuantity() + quantity);
//        } else {
//            item = new Item(itemType, warehouse, quantity);
//        }
//        itemRepository.save(item);
//
//        // Create receiving transaction
//        WarehouseTransaction receivingTransaction = WarehouseTransaction.builder()
//                .itemType(itemType)
//                .quantity(quantity)
//                .transactionDate(transactionDate)
//                .type(TransactionType.RECEIVING)
//                .status(TransactionStatus.PENDING)
//                .senderType(senderType)
//                .senderId(senderId)
//                .receiverType(PartyType.WAREHOUSE)
//                .receiverId(warehouseId)
//                .warehouse(warehouse)
//                .addedBy(username)
//                .transactionPair(pair)
//                .build();
//
//        warehouseTransactionRepository.save(receivingTransaction);
//
//        // Check if there's already a sending transaction
//        Optional<WarehouseTransaction> sendingTransactionOpt = pair.getTransactions().stream()
//                .filter(t -> t.getType() == TransactionType.SENDING)
//                .findFirst();
//
//        if (sendingTransactionOpt.isPresent()) {
//            WarehouseTransaction sendingTransaction = sendingTransactionOpt.get();
//
//            if (sendingTransaction.getQuantity() == receivingTransaction.getQuantity()) {
//                pair.setStatus("MATCHED");
//                sendingTransaction.setStatus(TransactionStatus.ACCEPTED);
//                receivingTransaction.setStatus(TransactionStatus.ACCEPTED);
//            } else {
//                pair.setStatus("UNMATCHED");
//                sendingTransaction.setStatus(TransactionStatus.REJECTED);
//                receivingTransaction.setStatus(TransactionStatus.REJECTED);
//            }
//
//            warehouseTransactionRepository.save(sendingTransaction);
//        }
//
//        transactionPairRepository.save(pair);
//        return receivingTransaction;
//    }
//
//
//
//
//    public void deleteTransaction(UUID transactionId) {
//        WarehouseTransaction transaction = warehouseTransactionRepository.findById(transactionId)
//                .orElseThrow(() -> new RuntimeException("Transaction not found with ID: " + transactionId));
//
//        warehouseTransactionRepository.delete(transaction);
//    }
//
//
//    private void validateEntityExists(PartyType type, UUID id) {
//        switch (type) {
//            case WAREHOUSE:
//                warehouseRepository.findById(id)
//                        .orElseThrow(() -> new IllegalArgumentException("Warehouse not found"));
//                break;
////            case EQUIPMENT:
////                equipmentRepository.findById(id)
////                        .orElseThrow(() -> new ResourceNotFoundException("Equipment not found"));
////            break;
////            case SITE:
////                siteRepository.findById(id)
////                        .orElseThrow(() -> new ResourceNotFoundException("Site not found"));
////                break;
//
//
//            default:
//                throw new IllegalArgumentException("Unsupported entity type: " + type);
//        }
//
//
//    }
//
//
//
//}
