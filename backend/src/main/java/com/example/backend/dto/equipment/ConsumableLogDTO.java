package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsumableLogDTO {
    private UUID id;
    private String transactionDate; // Formatted transaction date when it happened
    private UUID equipmentId;
    private String equipmentName;
    private String equipmentType;
    private UUID warehouseId;
    private String warehouseName;
    private UUID itemTypeId;
    private String consumableType;
    private Integer quantity;
    private String status;
    private String category;
    private String direction; // TO_EQUIPMENT or FROM_EQUIPMENT
    private String addedBy; // Name of employee who added the transaction
    private String createdAt; // Formatted datetime when it was recorded
    private String documentPath;
}
