package com.example.backend.services.procurement;



import com.example.backend.models.PartyType;
import com.example.backend.models.RequestStatus;
import com.example.backend.models.procurement.RequestOrder;
import com.example.backend.models.procurement.RequestOrderItem;
import com.example.backend.models.warehouse.ItemType;
import com.example.backend.models.warehouse.Warehouse;
import com.example.backend.repositories.procurement.RequestOrderRepository;
import com.example.backend.repositories.warehouse.ItemTypeRepository;
import com.example.backend.repositories.warehouse.WarehouseRepository;
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
            existingOrder.setDeadline(deadline);
            existingOrder.setUpdatedAt(LocalDateTime.now());
            existingOrder.setUpdatedBy(updatedBy);

            // *** FIXED ITEMS UPDATE LOGIC ***
            List<Map<String, Object>> itemsData = (List<Map<String, Object>>) requestData.get("items");

            // Clear existing items completely
            existingOrder.getRequestItems().clear();

            // Add new items from the request data
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
                        .requestOrder(existingOrder)
                        .build();

                existingOrder.getRequestItems().add(item);
            }

            // Save and return the updated order
            return requestOrderRepository.save(existingOrder);

        } catch (Exception e) {
            System.err.println("Error updating request order: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update request order", e);
        }
    }


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

    public List<RequestOrder> getRequestsByWarehouseAndStatus(UUID warehouseId, String statusStr) {
        try {
            System.out.println("Fetching requests for warehouse: " + warehouseId + " with status: " + statusStr);

            RequestStatus status = RequestStatus.valueOf(statusStr.toUpperCase());

            // Find all request orders by warehouse and status
            return requestOrderRepository.findByRequesterIdAndStatusAndPartyType(
                    warehouseId, status.name(), PartyType.WAREHOUSE.name()
            );

        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status value: " + statusStr, e);
        } catch (Exception e) {
            System.err.println("Error fetching requests by warehouse and status: " + e.getMessage());
            throw new RuntimeException("Failed to fetch request orders", e);
        }
    }

    }


