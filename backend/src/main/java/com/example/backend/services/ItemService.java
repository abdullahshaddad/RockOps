package com.example.backend.services;

import com.example.backend.models.Item;
import com.example.backend.models.ItemStatus;
import com.example.backend.models.ItemType;
import com.example.backend.models.Warehouse;
import com.example.backend.repositories.ItemRepository;
import com.example.backend.repositories.ItemTypeRepository;
import com.example.backend.repositories.TransactionRepository;
import com.example.backend.repositories.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;
    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private ItemTypeRepository itemTypeRepository;


//    public Item processTransaction(Map<String, Object> transactionData) {
//        // Extract values from the Map
//        UUID itemTypeId = UUID.fromString((String) transactionData.get("itemType"));
//        UUID warehouseId = UUID.fromString((String) transactionData.get("warehouse"));
//        int quantity = (Integer) transactionData.get("quantity");
//
//        // Extract PartyType values from the Map as strings
//        String senderPartyTypeStr = (String) transactionData.get("senderPartyType");
//        String receiverPartyTypeStr = (String) transactionData.get("receiverPartyType");
//
//        // Convert the string to PartyType enum
//        PartyType senderPartyType = PartyType.valueOf(senderPartyTypeStr); // Convert string to enum
//        PartyType receiverPartyType = PartyType.valueOf(receiverPartyTypeStr); // Convert string to enum
//
//        // Validate that both sender and receiver are of PartyType WAREHOUSE
//        if (senderPartyType != PartyType.WAREHOUSE || receiverPartyType != PartyType.WAREHOUSE) {
//            throw new IllegalArgumentException("Both sender and receiver must be warehouses.");
//        }
//
//        // Fetch the ItemType from DB
//        ItemType itemType = itemTypeRepository.findById(itemTypeId)
//                .orElseThrow(() -> new IllegalArgumentException("ItemType not found"));
//
//        // Fetch sender and receiver warehouse information from the database
//        Warehouse senderWarehouse = warehouseRepository.findById(UUID.fromString((String) transactionData.get("sender")))
//                .orElseThrow(() -> new IllegalArgumentException("Sender Warehouse not found"));
//        Warehouse receiverWarehouse = warehouseRepository.findById(UUID.fromString((String) transactionData.get("receiver")))
//                .orElseThrow(() -> new IllegalArgumentException("Receiver Warehouse not found"));
//
//        // Check if the warehouseId matches sender or receiver
//        if (warehouseId.equals(senderWarehouse.getId())) {
//            // Process the sender warehouse (decrease quantity)
//            Item senderItem = itemRepository.findByItemTypeAndWarehouse(itemType, senderWarehouse);
//            if (senderItem == null || senderItem.getQuantity() < quantity) {
//                throw new IllegalArgumentException("Sender warehouse does not have enough quantity of the item.");
//            }
//
//            // Subtract the quantity from the sender warehouse
//            senderItem.setQuantity(senderItem.getQuantity() - quantity);
//
//            // Optional: Check if minimum quantity threshold is crossed
//            if (senderItem.getQuantity() < itemType.getMinQuantity()) {
//                // Log warning or trigger notification (implement as needed)
//                System.out.println("WARNING: Quantity below minimum threshold for " + itemType.getName());
//            }
//
//            // Save the updated sender item in the database
//            itemRepository.save(senderItem);
//
//            // Return the updated sender item
//            return senderItem;
//
//        } else if (warehouseId.equals(receiverWarehouse.getId())) {
//            // Process the receiver warehouse (increase quantity)
//            Item receiverItem = itemRepository.findByItemTypeAndWarehouse(itemType, receiverWarehouse);
//
//            if (receiverItem == null) {
//                // If the item doesn't exist in the receiver warehouse, create it
//                receiverItem = new Item();
//                receiverItem.setItemType(itemType);
//                receiverItem.setWarehouse(receiverWarehouse);
//                receiverItem.setQuantity(quantity); // Set the quantity as the transaction amount
//            } else {
//                // If the item exists in the receiver warehouse, adjust the quantity
//                receiverItem.setQuantity(receiverItem.getQuantity() + quantity);
//            }
//
//            // Save the updated receiver item in the database
//            itemRepository.save(receiverItem);
//
//            // Return the updated receiver item
//            return receiverItem;
//
//        } else {
//            throw new IllegalArgumentException("Invalid warehouse ID.");
//        }
//    }








    public List<Item> getItemsByWarehouse(UUID warehouseId) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found"));
        return itemRepository.findByWarehouse(warehouse);
    }
//
public Item createItem(UUID itemTypeId, UUID warehouseId, int initialQuantity) {
    // Fetch the ItemType and Warehouse from DB
    ItemType itemType = itemTypeRepository.findById(itemTypeId)
            .orElseThrow(() -> new IllegalArgumentException("ItemType not found"));

    Warehouse warehouse = warehouseRepository.findById(warehouseId)
            .orElseThrow(() -> new IllegalArgumentException("Warehouse not found"));

    // Check if an item with the same ItemType and Warehouse already exists
    Optional<Item> existingItemOpt = itemRepository.findByItemTypeAndWarehouse(itemType, warehouse);

    if (existingItemOpt.isPresent()) {
        // If item exists, you can either update its quantity or throw an exception
        Item existingItem = existingItemOpt.get();
        existingItem.setQuantity(existingItem.getQuantity() + initialQuantity);
        existingItem.setItemStatus(ItemStatus.IN_WAREHOUSE); // Set status to IN_WAREHOUSE
        return itemRepository.save(existingItem);
    }

    // Create a new item
    Item newItem = new Item();
    newItem.setItemType(itemType);
    newItem.setWarehouse(warehouse);
    newItem.setQuantity(initialQuantity);  // Set the initial quantity
    newItem.setItemStatus(ItemStatus.IN_WAREHOUSE); // Set status to IN_WAREHOUSE

    // Save the new item to the database
    return itemRepository.save(newItem);
}



}
