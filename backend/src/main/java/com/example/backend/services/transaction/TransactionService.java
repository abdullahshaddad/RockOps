package com.example.backend.services.transaction;

import com.example.backend.models.*;
import com.example.backend.models.transaction.Transaction;
import com.example.backend.models.transaction.TransactionItem;
import com.example.backend.models.transaction.TransactionPurpose;
import com.example.backend.models.transaction.TransactionStatus;
import com.example.backend.models.warehouse.Item;
import com.example.backend.models.warehouse.ItemStatus;
import com.example.backend.models.warehouse.ItemType;
import com.example.backend.models.warehouse.Warehouse;
import com.example.backend.repositories.equipment.ConsumableRepository;
import com.example.backend.repositories.equipment.EquipmentRepository;
import com.example.backend.models.equipment.Consumable;
import com.example.backend.models.equipment.Equipment;
import com.example.backend.repositories.transaction.TransactionItemRepository;
import com.example.backend.repositories.transaction.TransactionRepository;
import com.example.backend.repositories.warehouse.ItemRepository;
import com.example.backend.repositories.warehouse.ItemTypeRepository;
import com.example.backend.repositories.warehouse.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;
    @Autowired
    private TransactionItemRepository transactionItemRepository;
    @Autowired
    private WarehouseRepository warehouseRepository;
    @Autowired
    private ItemTypeRepository itemTypeRepository;
    @Autowired
    private ItemRepository itemRepository;
    @Autowired
    private EquipmentRepository equipmentRepository;
    @Autowired
    private ConsumableRepository consumableRepository;

    // ========================================
    // CORE TRANSACTION CREATION METHODS
    // ========================================

    public Transaction createTransaction(
            PartyType senderType, UUID senderId,
            PartyType receiverType, UUID receiverId,
            List<TransactionItem> items,
            LocalDateTime transactionDate,
            String username, int batchNumber,
            UUID sentFirst) {
        return createTransactionWithPurpose(
                senderType, senderId, receiverType, receiverId,
                items, transactionDate, username, batchNumber, sentFirst, null);
    }

    public Transaction createEquipmentTransaction(
            PartyType senderType, UUID senderId,
            PartyType receiverType, UUID receiverId,
            List<TransactionItem> items,
            LocalDateTime transactionDate,
            String username, int batchNumber,
            UUID sentFirst, TransactionPurpose purpose) {
        return createTransactionWithPurpose(
                senderType, senderId, receiverType, receiverId,
                items, transactionDate, username, batchNumber, sentFirst, purpose);
    }

    private Transaction createTransactionWithPurpose(
            PartyType senderType, UUID senderId,
            PartyType receiverType, UUID receiverId,
            List<TransactionItem> items,
            LocalDateTime transactionDate,
            String username, int batchNumber,
            UUID sentFirst, TransactionPurpose purpose) {

        System.out.println("🚀 Starting createTransaction() - VALIDATION ONLY MODE");
        System.out.println("Sender Type: " + senderType + ", Sender ID: " + senderId);
        System.out.println("Receiver Type: " + receiverType + ", Receiver ID: " + receiverId);
        System.out.println("SentFirst (Initiator): " + sentFirst);

        validateEntityExists(senderType, senderId);
        validateEntityExists(receiverType, receiverId);

        // ONLY validate availability if sender initiated (they're claiming they have the items)
        if (sentFirst.equals(senderId)) {
            validateSenderHasAvailableInventory(senderType, senderId, items);
            System.out.println("✅ Validated sender has sufficient inventory (NO CHANGES MADE)");
        }

        Transaction transaction = buildTransaction(
                senderType, senderId, receiverType, receiverId,
                transactionDate, username, batchNumber, sentFirst, purpose);

        transaction.setItems(new ArrayList<>());
        for (TransactionItem item : items) {
            item.setTransaction(transaction);
            item.setStatus(TransactionStatus.PENDING);
            transaction.addItem(item);
        }

        Transaction saved = transactionRepository.save(transaction);
        System.out.println("✅ Transaction saved in PENDING state - NO inventory changes made");
        return saved;
    }

    // ========================================
    // TRANSACTION ACCEPTANCE - FIXED LOGIC
    // ========================================

    public Transaction acceptTransaction(UUID transactionId, Map<UUID, Integer> receivedQuantities,
                                         String username, String acceptanceComment) {
        return acceptTransactionWithPurpose(transactionId, receivedQuantities, username, acceptanceComment, null);
    }

    public Transaction acceptEquipmentTransaction(UUID transactionId, Map<UUID, Integer> receivedQuantities,
                                                  String username, String acceptanceComment, TransactionPurpose purpose) {
        return acceptTransactionWithPurpose(transactionId, receivedQuantities, username, acceptanceComment, purpose);
    }

    /**
     * 🚨 FIXED: Correctly interprets who claims what based on transaction flow
     */
    private Transaction acceptTransactionWithPurpose(UUID transactionId, Map<UUID, Integer> receivedQuantities,
                                                     String username, String acceptanceComment, TransactionPurpose purpose) {
        System.out.println("🌍 Processing REAL-WORLD inventory changes based on actual claims");

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        if (transaction.getStatus() != TransactionStatus.PENDING) {
            throw new IllegalArgumentException("Transaction is not in PENDING status");
        }

        transaction.setApprovedBy(username);
        transaction.setAcceptanceComment(acceptanceComment);
        transaction.setCompletedAt(LocalDateTime.now());

        if (purpose != null && purpose != transaction.getPurpose()) {
            transaction.setPurpose(purpose);
        }

        boolean allItemsMatch = true;

        // 🎯 CRITICAL FIX: Process each item with correct claim interpretation
        for (TransactionItem item : transaction.getItems()) {
            Integer receivedQuantity = receivedQuantities.get(item.getId());
            if (receivedQuantity == null) {
                throw new IllegalArgumentException("Received quantity not provided for item: " + item.getId());
            }

            item.setReceivedQuantity(receivedQuantity);

            // 🚨 FIXED: Determine what each party actually claims based on who initiated
            int senderClaimedQuantity;
            int receiverClaimedQuantity;

            if (transaction.getSentFirst().equals(transaction.getSenderId())) {
                // SENDER INITIATED: Sender set original quantity, receiver reports what they got
                senderClaimedQuantity = item.getQuantity(); // Original transaction quantity = sender's claim
                receiverClaimedQuantity = receivedQuantity;  // What receiver reports they got
                System.out.println(String.format("📤 SENDER-INITIATED: Sender claims %d, Receiver reports %d",
                        senderClaimedQuantity, receiverClaimedQuantity));
            } else {
                // RECEIVER INITIATED: Receiver set original quantity, sender reports what they sent
                receiverClaimedQuantity = item.getQuantity(); // Original transaction quantity = receiver's claim
                senderClaimedQuantity = receivedQuantity;     // What sender reports they sent
                System.out.println(String.format("📥 RECEIVER-INITIATED: Receiver claims %d, Sender reports %d",
                        receiverClaimedQuantity, senderClaimedQuantity));
            }

            // Check if quantities match
            if (senderClaimedQuantity != receiverClaimedQuantity) {
                allItemsMatch = false;
                String reason = String.format("Quantity mismatch: Sender claims %d, Receiver claims %d",
                        senderClaimedQuantity, receiverClaimedQuantity);
                item.setStatus(TransactionStatus.REJECTED);
                item.setRejectionReason(reason);
                System.out.println("⚠️ MISMATCH: " + reason);
            } else {
                item.setStatus(TransactionStatus.ACCEPTED);
                item.setRejectionReason(null);
            }

            // 🌍 Process real-world inventory changes with CORRECT claims
            processRealWorldInventoryChangesFixed(transaction, item, senderClaimedQuantity, receiverClaimedQuantity);
        }

        // Set overall transaction status
        if (allItemsMatch) {
            transaction.setStatus(TransactionStatus.ACCEPTED);
            transaction.setRejectionReason(null);
            System.out.println("✅ Transaction ACCEPTED - Inventory reflects reality");
        } else {
            transaction.setStatus(TransactionStatus.REJECTED);
            transaction.setRejectionReason("Quantity mismatches detected - inventory updated to reflect actual transfers");
            System.out.println("❌ Transaction REJECTED - But inventory updated to reflect reality");
        }

        return transactionRepository.save(transaction);
    }

    /**
     * 🚨 FIXED: Processes inventory changes with correct sender/receiver claims
     */
    private void processRealWorldInventoryChangesFixed(Transaction transaction, TransactionItem item,
                                                       int senderClaimedQuantity, int receiverClaimedQuantity) {
        System.out.println(String.format("🌍 Processing FIXED real-world changes: Sender claims %d, Receiver claims %d",
                senderClaimedQuantity, receiverClaimedQuantity));

        // Step 1: Deduct what sender CLAIMS they sent
        deductActualSentQuantityFromSender(transaction, item, senderClaimedQuantity);

        // Step 2: Add what receiver CLAIMS they received
        addActualReceivedQuantityToReceiver(transaction, item, receiverClaimedQuantity);

        // Step 3: Handle discrepancies with CORRECT logic
        handleQuantityDiscrepanciesFixed(transaction, item, senderClaimedQuantity, receiverClaimedQuantity);
    }

    /**
     * 🚨 FIXED: Handles discrepancies with correct STOLEN/OVERRECEIVED logic
     */
    private void handleQuantityDiscrepanciesFixed(Transaction transaction, TransactionItem item,
                                                  int senderClaimedQuantity, int receiverClaimedQuantity) {
        int discrepancy = senderClaimedQuantity - receiverClaimedQuantity;

        if (discrepancy > 0) {
            // Sender claims they sent MORE than receiver claims they got = STOLEN/LOST
            System.out.println("🚨 STOLEN/LOST: " + discrepancy + " units went missing in transit");
            createStolenItemEntry(transaction, item, discrepancy);

        } else if (discrepancy < 0) {
            // Receiver claims they got MORE than sender claims they sent = OVERRECEIVED
            int overReceivedAmount = Math.abs(discrepancy);
            System.out.println("📈 OVERRECEIVED: " + overReceivedAmount + " units more than sender claimed to send");
            createOverReceivedItemEntry(transaction, item, overReceivedAmount);
        } else {
            // Perfect match - no discrepancy handling needed
            System.out.println("✅ Perfect quantity match - no discrepancy");
        }
    }

    // ========================================
    // INVENTORY OPERATIONS (UNCHANGED)
    // ========================================

    private void deductActualSentQuantityFromSender(Transaction transaction, TransactionItem item, int sentQuantity) {
        if (sentQuantity <= 0) return;

        System.out.println("➖ Deducting " + sentQuantity + " from sender (what they claim they sent)");

        if (transaction.getSenderType() == PartyType.WAREHOUSE) {
            deductFromWarehouseInventory(transaction.getSenderId(), item.getItemType(), sentQuantity);
        } else if (transaction.getSenderType() == PartyType.EQUIPMENT) {
            deductFromEquipmentConsumables(transaction.getSenderId(), item.getItemType(), sentQuantity);
        }
    }

    private void addActualReceivedQuantityToReceiver(Transaction transaction, TransactionItem item, int receivedQuantity) {
        if (receivedQuantity <= 0) return;

        System.out.println("➕ Adding " + receivedQuantity + " to receiver (what they claim they received)");

        if (transaction.getReceiverType() == PartyType.WAREHOUSE) {
            addToWarehouseInventory(transaction, item, receivedQuantity);
        } else if (transaction.getReceiverType() == PartyType.EQUIPMENT) {
            addToEquipmentConsumables(transaction.getReceiverId(), item.getItemType(), receivedQuantity, transaction);
        }
    }

    private void createStolenItemEntry(Transaction transaction, TransactionItem item, int stolenQuantity) {
        // STOLEN items are tracked at the SENDER location (where they went missing from)
        if (transaction.getSenderType() == PartyType.WAREHOUSE) {
            Warehouse warehouse = warehouseRepository.findById(transaction.getSenderId())
                    .orElseThrow(() -> new IllegalArgumentException("Sender warehouse not found"));

            // ✅ Use explicit setters instead of constructor
            Item stolenItem = new Item();
            stolenItem.setItemType(item.getItemType());
            stolenItem.setWarehouse(warehouse);
            stolenItem.setQuantity(stolenQuantity);
            stolenItem.setItemStatus(ItemStatus.MISSING);
            stolenItem.setTransactionItem(item); // Don't forget this
            stolenItem.setResolved(false);

            itemRepository.save(stolenItem);

            System.out.println(String.format("🚨 Created STOLEN entry: %d %s at warehouse %s",
                    stolenQuantity, item.getItemType().getName(), warehouse.getName()));

        } else if (transaction.getSenderType() == PartyType.EQUIPMENT) {
            // Equipment logic remains the same
            Equipment equipment = equipmentRepository.findById(transaction.getSenderId())
                    .orElseThrow(() -> new IllegalArgumentException("Sender equipment not found"));

            Consumable stolenConsumable = new Consumable();
            stolenConsumable.setEquipment(equipment);
            stolenConsumable.setItemType(item.getItemType());
            stolenConsumable.setQuantity(stolenQuantity);
            stolenConsumable.setStatus(ItemStatus.MISSING);
            stolenConsumable.setTransaction(transaction);
            consumableRepository.save(stolenConsumable);

            System.out.println(String.format("🚨 Created STOLEN consumable entry: %d %s at equipment %s",
                    stolenQuantity, item.getItemType().getName(), equipment.getName()));
        }
    }

    private void createOverReceivedItemEntry(Transaction transaction, TransactionItem item, int overReceivedQuantity) {
        // OVERRECEIVED items are tracked at the RECEIVER location (where the excess appeared)
        if (transaction.getReceiverType() == PartyType.WAREHOUSE) {
            Warehouse warehouse = warehouseRepository.findById(transaction.getReceiverId())
                    .orElseThrow(() -> new IllegalArgumentException("Receiver warehouse not found"));

            // ✅ Use explicit setters instead of constructor
            Item overReceivedItem = new Item();
            overReceivedItem.setItemType(item.getItemType());
            overReceivedItem.setWarehouse(warehouse);
            overReceivedItem.setQuantity(overReceivedQuantity);
            overReceivedItem.setItemStatus(ItemStatus.OVERRECEIVED);
            overReceivedItem.setTransactionItem(item); // Don't forget this
            overReceivedItem.setResolved(false);

            itemRepository.save(overReceivedItem);

            System.out.println(String.format("📈 Created OVERRECEIVED entry: %d %s at warehouse %s",
                    overReceivedQuantity, item.getItemType().getName(), warehouse.getName()));

        } else if (transaction.getReceiverType() == PartyType.EQUIPMENT) {
            // Equipment logic remains the same
            Equipment equipment = equipmentRepository.findById(transaction.getReceiverId())
                    .orElseThrow(() -> new IllegalArgumentException("Receiver equipment not found"));

            Consumable overReceivedConsumable = new Consumable();
            overReceivedConsumable.setEquipment(equipment);
            overReceivedConsumable.setItemType(item.getItemType());
            overReceivedConsumable.setQuantity(overReceivedQuantity);
            overReceivedConsumable.setStatus(ItemStatus.OVERRECEIVED);
            overReceivedConsumable.setTransaction(transaction);
            consumableRepository.save(overReceivedConsumable);

            System.out.println(String.format("📈 Created OVERRECEIVED consumable entry: %d %s at equipment %s",
                    overReceivedQuantity, item.getItemType().getName(), equipment.getName()));
        }
    }

    // ========================================
    // WAREHOUSE INVENTORY OPERATIONS
    // ========================================

    private void deductFromWarehouseInventory(UUID warehouseId, ItemType itemType, int quantity) {
        List<Item> availableItems = itemRepository.findAllByItemTypeIdAndWarehouseIdAndItemStatus(
                itemType.getId(), warehouseId, ItemStatus.IN_WAREHOUSE);

        if (availableItems.isEmpty()) {
            throw new IllegalArgumentException("No available items in warehouse for: " + itemType.getName());
        }

        Item item = availableItems.get(0);
        if (item.getQuantity() < quantity) {
            throw new IllegalArgumentException("Not enough quantity in warehouse for: " + itemType.getName());
        }

        item.setQuantity(item.getQuantity() - quantity);
        itemRepository.save(item);
        System.out.println("✅ Deducted " + quantity + " from warehouse inventory");
    }

    private void addToWarehouseInventory(Transaction transaction, TransactionItem transactionItem, int actualQuantity) {
        System.out.println("📦 Adding " + actualQuantity + " units to warehouse inventory");

        // Get the receiving warehouse
        UUID receivingWarehouseId = transaction.getReceiverId();

        // Fetch the warehouse entity
        Warehouse warehouse = warehouseRepository.findById(receivingWarehouseId)
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found: " + receivingWarehouseId));

        // Create the new Item entity
        Item newItem = new Item();
        newItem.setItemType(transactionItem.getItemType());
        newItem.setQuantity(actualQuantity);
        newItem.setItemStatus(ItemStatus.IN_WAREHOUSE);
        newItem.setWarehouse(warehouse); // ✅ THIS IS THE CRITICAL FIX
        newItem.setTransactionItem(transactionItem);
        newItem.setResolved(false);

        // Save the item
        itemRepository.save(newItem);

        System.out.println("✅ Successfully added item to warehouse inventory");
    }

    // ========================================
    // EQUIPMENT INVENTORY OPERATIONS
    // ========================================

    private void deductFromEquipmentConsumables(UUID equipmentId, ItemType itemType, int quantity) {
        Consumable consumable = consumableRepository.findByEquipmentIdAndItemTypeId(equipmentId, itemType.getId());

        if (consumable == null || consumable.getQuantity() < quantity) {
            throw new IllegalArgumentException("Not enough consumables in equipment for: " + itemType.getName());
        }

        consumable.setQuantity(consumable.getQuantity() - quantity);
        if (consumable.getQuantity() <= 0) {
            consumableRepository.delete(consumable);
        } else {
            consumableRepository.save(consumable);
        }
        System.out.println("✅ Deducted " + quantity + " from equipment consumables");
    }

    private void addToEquipmentConsumables(UUID equipmentId, ItemType itemType, int quantity, Transaction transaction) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Equipment not found"));

        // Get the original quantity from the transaction item
        TransactionItem transactionItem = transaction.getItems().stream()
                .filter(item -> item.getItemType().getId().equals(itemType.getId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Transaction item not found"));

        // Add the original quantity as CONSUMED
        Consumable consumedConsumable = new Consumable();
        consumedConsumable.setEquipment(equipment);
        consumedConsumable.setItemType(itemType);
        if (transactionItem.getQuantity() < quantity) {
            consumedConsumable.setQuantity(quantity-(quantity-transactionItem.getQuantity()));
        }
        else {
            consumedConsumable.setQuantity(quantity);
        }
        // Use original quantity
        consumedConsumable.setStatus(ItemStatus.CONSUMED);
        consumedConsumable.setTransaction(transaction);
        consumableRepository.save(consumedConsumable);
    }

    // ========================================
    // VALIDATION AND UTILITY METHODS (UNCHANGED)
    // ========================================

    private void validateSenderHasAvailableInventory(PartyType senderType, UUID senderId, List<TransactionItem> items) {
        if (senderType == PartyType.WAREHOUSE) {
            validateWarehouseInventoryAvailability(senderId, items);
        } else if (senderType == PartyType.EQUIPMENT) {
            validateEquipmentInventoryAvailability(senderId, items);
        }
    }

    private void validateWarehouseInventoryAvailability(UUID warehouseId, List<TransactionItem> items) {
        System.out.println("🔍 Validating warehouse inventory availability (READ-ONLY)");

        for (TransactionItem item : items) {
            ItemType itemType = getItemType(item.getItemType().getId());

            List<Item> availableItems = itemRepository.findAllByItemTypeIdAndWarehouseIdAndItemStatus(
                    itemType.getId(), warehouseId, ItemStatus.IN_WAREHOUSE);

            int totalAvailable = availableItems.stream().mapToInt(Item::getQuantity).sum();

            if (totalAvailable < item.getQuantity()) {
                throw new IllegalArgumentException(
                        String.format("Insufficient inventory in warehouse for %s: Available=%d, Requested=%d",
                                itemType.getName(), totalAvailable, item.getQuantity()));
            }
        }
    }

    private void validateEquipmentInventoryAvailability(UUID equipmentId, List<TransactionItem> items) {
        System.out.println("🔍 Validating equipment inventory availability (READ-ONLY)");

        for (TransactionItem item : items) {
            ItemType itemType = getItemType(item.getItemType().getId());

            Consumable consumable = consumableRepository.findByEquipmentIdAndItemTypeId(equipmentId, itemType.getId());
            int availableQuantity = (consumable != null) ? consumable.getQuantity() : 0;

            if (availableQuantity < item.getQuantity()) {
                throw new IllegalArgumentException(
                        String.format("Insufficient consumables in equipment for %s: Available=%d, Requested=%d",
                                itemType.getName(), availableQuantity, item.getQuantity()));
            }
        }
    }

    public Transaction rejectEquipmentTransaction(UUID transactionId, String rejectionReason, String username) {
        System.out.println("❌ Rejecting transaction cleanly - no inventory to revert");

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        if (transaction.getStatus() != TransactionStatus.PENDING) {
            throw new IllegalArgumentException("Transaction is not in PENDING status");
        }

        transaction.setRejectionReason(rejectionReason);
        transaction.setStatus(TransactionStatus.REJECTED);
        transaction.setCompletedAt(LocalDateTime.now());
        transaction.setApprovedBy(username);

        for (TransactionItem item : transaction.getItems()) {
            item.setStatus(TransactionStatus.REJECTED);
        }

        System.out.println("✅ Transaction rejected cleanly - no inventory changes were made");
        return transactionRepository.save(transaction);
    }

    // ========================================
    // UPDATE METHODS (SIMPLIFIED)
    // ========================================

    public Transaction updateTransaction(
            UUID transactionId, PartyType senderType, UUID senderId,
            PartyType receiverType, UUID receiverId, List<TransactionItem> updatedItems,
            LocalDateTime transactionDate, String username, int batchNumber) {
        return updateTransactionWithPurpose(transactionId, senderType, senderId, receiverType,
                receiverId, updatedItems, transactionDate, username, batchNumber, null);
    }

    public Transaction updateEquipmentTransaction(
            UUID transactionId, PartyType senderType, UUID senderId,
            PartyType receiverType, UUID receiverId, List<TransactionItem> updatedItems,
            LocalDateTime transactionDate, String username, int batchNumber, TransactionPurpose purpose) {
        return updateTransactionWithPurpose(transactionId, senderType, senderId, receiverType,
                receiverId, updatedItems, transactionDate, username, batchNumber, purpose);
    }

    private Transaction updateTransactionWithPurpose(
            UUID transactionId, PartyType senderType, UUID senderId,
            PartyType receiverType, UUID receiverId, List<TransactionItem> updatedItems,
            LocalDateTime transactionDate, String username, int batchNumber, TransactionPurpose purpose) {

        System.out.println("🔄 Updating transaction - easy since no inventory was changed yet");

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        if (transaction.getStatus() != TransactionStatus.PENDING) {
            throw new IllegalArgumentException("Only pending transactions can be updated");
        }

        validateEntityExists(senderType, senderId);
        validateEntityExists(receiverType, receiverId);

        if (transaction.getSentFirst().equals(senderId)) {
            validateSenderHasAvailableInventory(senderType, senderId, updatedItems);
        }

        transaction.setSenderType(senderType);
        transaction.setSenderId(senderId);
        transaction.setReceiverType(receiverType);
        transaction.setReceiverId(receiverId);
        transaction.setTransactionDate(transactionDate);
        transaction.setBatchNumber(batchNumber);
        transaction.setAddedBy(username);

        if (purpose != null) {
            transaction.setPurpose(purpose);
        }

        transaction.getItems().clear();
        for (TransactionItem item : updatedItems) {
            item.setTransaction(transaction);
            item.setStatus(TransactionStatus.PENDING);
            transaction.getItems().add(item);
        }

        return transactionRepository.save(transaction);
    }

    // ========================================
    // QUERY METHODS (UNCHANGED)
    // ========================================

    public List<Transaction> getTransactionsByEntity(PartyType entityType, UUID entityId) {
        return transactionRepository.findBySenderTypeAndSenderIdOrReceiverTypeAndReceiverId(
                entityType, entityId, entityType, entityId);
    }

    public List<Transaction> getTransactionsForWarehouse(UUID warehouseId) {
        return transactionRepository.findTransactionsByPartyIdAndType(warehouseId, PartyType.WAREHOUSE);
    }

    public List<Transaction> getTransactionsForEquipment(UUID equipmentId) {
        return transactionRepository.findTransactionsByPartyIdAndType(equipmentId, PartyType.EQUIPMENT);
    }

    public Transaction getTransactionById(UUID transactionId) {
        return transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found with ID: " + transactionId));
    }

    public List<Transaction> getTransactionsForEquipmentByPurpose(UUID equipmentId, TransactionPurpose purpose) {
        return getTransactionsForEquipment(equipmentId).stream()
                .filter(t -> t.getPurpose() == purpose)
                .collect(java.util.stream.Collectors.toList());
    }

    public List<Transaction> getConsumableTransactionsForEquipment(UUID equipmentId) {
        return getTransactionsForEquipmentByPurpose(equipmentId, TransactionPurpose.CONSUMABLE);
    }

    public List<Transaction> getMaintenanceTransactionsForEquipment(UUID equipmentId) {
        return getTransactionsForEquipmentByPurpose(equipmentId, TransactionPurpose.MAINTENANCE);
    }

    public List<Transaction> getIncomingTransactionsForEquipment(UUID equipmentId) {
        return transactionRepository.findByReceiverTypeAndReceiverIdAndStatusAndSentFirstNot(
                PartyType.EQUIPMENT, equipmentId, TransactionStatus.PENDING, equipmentId);
    }

    public List<Transaction> getOutgoingTransactionsForEquipment(UUID equipmentId) {
        return transactionRepository.findBySenderTypeAndSenderIdAndStatusAndSentFirstNot(
                PartyType.EQUIPMENT, equipmentId, TransactionStatus.PENDING, equipmentId);
    }

    public List<Transaction> getPendingTransactionsInitiatedByEquipment(UUID equipmentId) {
        return transactionRepository.findByStatusAndSentFirst(TransactionStatus.PENDING, equipmentId);
    }

    // ========================================
    // UTILITY METHODS
    // ========================================

    private Transaction buildTransaction(PartyType senderType, UUID senderId, PartyType receiverType,
                                         UUID receiverId, LocalDateTime transactionDate, String username,
                                         int batchNumber, UUID sentFirst, TransactionPurpose purpose) {
        Transaction.TransactionBuilder builder = Transaction.builder()
                .createdAt(LocalDateTime.now())
                .transactionDate(transactionDate)
                .status(TransactionStatus.PENDING)
                .senderType(senderType)
                .senderId(senderId)
                .receiverType(receiverType)
                .receiverId(receiverId)
                .addedBy(username)
                .batchNumber(batchNumber)
                .sentFirst(sentFirst);

        if (purpose != null) {
            builder.purpose(purpose);
        }

        return builder.build();
    }

    private ItemType getItemType(UUID itemTypeId) {
        return itemTypeRepository.findById(itemTypeId)
                .orElseThrow(() -> new IllegalArgumentException("Item type not found: " + itemTypeId));
    }

    private void validateEntityExists(PartyType type, UUID id) {
        switch (type) {
            case WAREHOUSE:
                warehouseRepository.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("Warehouse not found"));
                break;
            case EQUIPMENT:
                equipmentRepository.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("Equipment not found"));
                break;
            default:
                throw new IllegalArgumentException("Unsupported entity type: " + type);
        }
    }
}