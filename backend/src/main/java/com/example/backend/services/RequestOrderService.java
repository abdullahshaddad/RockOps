package com.example.Rock4Mining.services;


import com.example.Rock4Mining.models.*;
import com.example.Rock4Mining.repositories.ItemTypeRepository;
import com.example.Rock4Mining.repositories.RequestOrderRepository;
import com.example.Rock4Mining.repositories.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class RequestOrderService {

    @Autowired
   private ItemTypeRepository itemTypeRepository;
    @Autowired
    private RequestOrderRepository requestOrderRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;


    public RequestOrder createRequest(Map<String, Object> requestData) {
        try {
            System.out.println("Creating request...");

            // Basic info
            String title = (String) requestData.get("title");
            String description = (String) requestData.get("description");
            String createdBy = (String) requestData.get("createdBy");
            String statusStr = (String) requestData.get("status");
            String partyTypeStr = (String) requestData.get("partyType");
            UUID requesterId = UUID.fromString((String) requestData.get("requesterId"));

            // New fields
            String employeeRequestedBy = (String) requestData.get("employeeRequestedBy");
            String deadlineStr = (String) requestData.get("deadline");
            LocalDateTime deadline = LocalDateTime.parse(deadlineStr);

            RequestStatus status = RequestStatus.valueOf(statusStr.toUpperCase());
            PartyType partyType = PartyType.valueOf(partyTypeStr.toUpperCase());

            // Determine requester name from partyType and requesterId
            String requesterName;
            if (partyType == PartyType.WAREHOUSE) {
                Warehouse warehouse = warehouseRepository.findById(requesterId)
                        .orElseThrow(() -> new RuntimeException("Warehouse not found: " + requesterId));
                requesterName = warehouse.getName();
//       } else if (partyType == PartyType.EQUIPMENT) {
//               EquipmentTeam equipmentTeam = equipmentTeamRepository.findById(requesterId)
//                        .orElseThrow(() -> new RuntimeException("Equipment team not found: " + requesterId));
//               requesterName = equipmentTeam.getName();
          } else {
                throw new RuntimeException("Unsupported party type: " + partyType);
            }

            RequestOrder requestOrder = RequestOrder.builder()
                    .title(title)
                    .description(description)
                    .createdAt(LocalDateTime.now())
                    .createdBy(createdBy)
                    .status(String.valueOf(status))
                    .partyType(String.valueOf(partyType))
                    .requesterId(requesterId)
                    .requesterName(requesterName)
                    .employeeRequestedBy(employeeRequestedBy)  // Add new field
                    .deadline(deadline)  // Add new field
                    .build();

            // Items
            List<Map<String, Object>> itemsData = (List<Map<String, Object>>) requestData.get("items");
            List<RequestOrderItem> items = new ArrayList<>();

            for (Map<String, Object> itemData : itemsData) {
                UUID itemTypeId = UUID.fromString((String) itemData.get("itemTypeId"));
                double quantity = Double.parseDouble(itemData.get("quantity").toString());
                String comment = (String) itemData.get("comment");

                ItemType itemType = itemTypeRepository.findById(itemTypeId)
                        .orElseThrow(() -> new RuntimeException("ItemType not found: " + itemTypeId));

                RequestOrderItem item = RequestOrderItem.builder()
                        .itemType(itemType)
                        .quantity(quantity)
                        .comment(comment)
                        .requestOrder(requestOrder)
                        .build();

                items.add(item);
            }

            requestOrder.setRequestItems(items);
            return requestOrderRepository.save(requestOrder);

        } catch (Exception e) {
            System.err.println("Error creating request: " + e.getMessage());
            throw new RuntimeException("Failed to create request order", e);
        }
    }

    public List<RequestOrder> getAllRequestOrders() {
        try {
            System.out.println("Fetching all request orders...");

            // Retrieve all request orders from the repository
            List<RequestOrder> requestOrders = requestOrderRepository.findAll();

            // Optional: You can filter, sort, or perform any other operations on the requestOrders list

            return requestOrders;

        } catch (Exception e) {
            System.err.println("Error fetching request orders: " + e.getMessage());
            throw new RuntimeException("Failed to fetch request orders", e);
        }
    }

    public Optional<RequestOrder> findById(UUID id) {
        // This uses a custom repository method that performs the necessary JOIN FETCHes
        return requestOrderRepository.findByIdWithItems(id);
    }

    public RequestOrder updateRequest(UUID requestOrderId, Map<String, Object> requestData) {
        try {
            System.out.println("Updating request order with ID: " + requestOrderId);

            // Find existing request order
            RequestOrder existingOrder = requestOrderRepository.findById(requestOrderId)
                    .orElseThrow(() -> new RuntimeException("Request order not found with ID: " + requestOrderId));

            // Basic info updates
            String title = (String) requestData.get("title");
            String description = (String) requestData.get("description");
            String updatedBy = (String) requestData.get("updatedBy");
            String statusStr = (String) requestData.get("status");
            String partyTypeStr = (String) requestData.get("partyType");
            UUID requesterId = UUID.fromString((String) requestData.get("requesterId"));

            // Other fields
            String employeeRequestedBy = (String) requestData.get("employeeRequestedBy");
            String deadlineStr = (String) requestData.get("deadline");
            LocalDateTime deadline = LocalDateTime.parse(deadlineStr);

            RequestStatus status = RequestStatus.valueOf(statusStr.toUpperCase());
            PartyType partyType = PartyType.valueOf(partyTypeStr.toUpperCase());

            // Update requester name if requesterId changed
            String requesterName = existingOrder.getRequesterName();
            if (!requesterId.equals(existingOrder.getRequesterId()) ||
                    !partyType.toString().equals(existingOrder.getPartyType())) {

                if (partyType == PartyType.WAREHOUSE) {
                    Warehouse warehouse = warehouseRepository.findById(requesterId)
                            .orElseThrow(() -> new RuntimeException("Warehouse not found: " + requesterId));
                    requesterName = warehouse.getName();
//            } else if (partyType == PartyType.EQUIPMENT) {
//                EquipmentTeam equipmentTeam = equipmentTeamRepository.findById(requesterId)
//                        .orElseThrow(() -> new RuntimeException("Equipment team not found: " + requesterId));
//                requesterName = equipmentTeam.getName();
                } else {
                    throw new RuntimeException("Unsupported party type: " + partyType);
                }
            }

            // Update the order properties
            existingOrder.setTitle(title);
            existingOrder.setDescription(description);
            existingOrder.setStatus(String.valueOf(status));
            existingOrder.setPartyType(String.valueOf(partyType));
            existingOrder.setRequesterId(requesterId);
            existingOrder.setRequesterName(requesterName);
            existingOrder.setEmployeeRequestedBy(employeeRequestedBy);
            existingOrder.setDeadline(deadline);
            existingOrder.setUpdatedAt(LocalDateTime.now());
            existingOrder.setUpdatedBy(updatedBy);

            // Handle items update - IMPORTANT: Fix for orphan deletion issue
            List<Map<String, Object>> itemsData = (List<Map<String, Object>>) requestData.get("items");

            // Get existing items
            List<RequestOrderItem> existingItems = existingOrder.getRequestItems();
            if (existingItems == null) {
                existingItems = new ArrayList<>();
                existingOrder.setRequestItems(existingItems);
            }

            // Create a map of incoming items by ID for easier processing
            Map<UUID, Map<String, Object>> incomingItemsMap = new HashMap<>();
            for (Map<String, Object> itemData : itemsData) {
                String itemIdStr = (String) itemData.get("id");
                if (itemIdStr != null && !itemIdStr.isEmpty()) {
                    incomingItemsMap.put(UUID.fromString(itemIdStr), itemData);
                }
            }

            // Step 1: Keep and update existing items that are still in the incoming data
            Iterator<RequestOrderItem> iterator = existingItems.iterator();
            while (iterator.hasNext()) {
                RequestOrderItem existingItem = iterator.next();

                if (existingItem.getId() != null && incomingItemsMap.containsKey(existingItem.getId())) {
                    // Update the existing item
                    Map<String, Object> updatedData = incomingItemsMap.get(existingItem.getId());

                    UUID itemTypeId = UUID.fromString((String) updatedData.get("itemTypeId"));
                    double quantity = Double.parseDouble(updatedData.get("quantity").toString());
                    String comment = (String) updatedData.get("comment");

                    ItemType itemType = itemTypeRepository.findById(itemTypeId)
                            .orElseThrow(() -> new RuntimeException("ItemType not found: " + itemTypeId));

                    existingItem.setItemType(itemType);
                    existingItem.setQuantity(quantity);
                    existingItem.setComment(comment);

                    // Remove this item from incomingItemsMap as it's been handled
                    incomingItemsMap.remove(existingItem.getId());
                } else {
                    // Remove items that are no longer in the incoming data
                    iterator.remove();
                }
            }

            // Step 2: Add new items from the incoming data
            for (Map<String, Object> itemData : itemsData) {
                String itemIdStr = (String) itemData.get("id");

                // Skip items that we've already processed above
                if (itemIdStr != null && !itemIdStr.isEmpty() &&
                        !incomingItemsMap.containsKey(UUID.fromString(itemIdStr))) {
                    continue;
                }

                // This is a new item to add
                UUID itemTypeId = UUID.fromString((String) itemData.get("itemTypeId"));
                double quantity = Double.parseDouble(itemData.get("quantity").toString());
                String comment = (String) itemData.get("comment");

                ItemType itemType = itemTypeRepository.findById(itemTypeId)
                        .orElseThrow(() -> new RuntimeException("ItemType not found: " + itemTypeId));

                RequestOrderItem newItem = RequestOrderItem.builder()
                        .itemType(itemType)
                        .quantity(quantity)
                        .comment(comment)
                        .requestOrder(existingOrder)
                        .build();

                existingItems.add(newItem);
            }

            // Save and return the updated order
            return requestOrderRepository.save(existingOrder);

        } catch (Exception e) {
            System.err.println("Error updating request order: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update request order", e);
        }
    }
    // Add this method to your RequestOrderService class

    public RequestOrder updateStatus(UUID requestOrderId, String newStatus) {
        try {
            System.out.println("Updating request order status: " + requestOrderId + " -> " + newStatus);

            RequestOrder requestOrder = requestOrderRepository.findById(requestOrderId)
                    .orElseThrow(() -> new RuntimeException("Request order not found with ID: " + requestOrderId));

            requestOrder.setStatus(newStatus);
            requestOrder.setUpdatedAt(LocalDateTime.now());

            // Get username if available from SecurityContext, otherwise use system
            String username = "system";
            try {
                org.springframework.security.core.Authentication authentication =
                        org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.isAuthenticated()) {
                    username = authentication.getName();
                }
            } catch (Exception e) {
                System.err.println("Error getting authenticated user: " + e.getMessage());
            }

            requestOrder.setApprovedBy(username);
            requestOrder.setApprovedAt(LocalDateTime.now());

            return requestOrderRepository.save(requestOrder);
        } catch (Exception e) {
            System.err.println("Error updating request order status: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update request order status", e);
        }
    }
}
