package com.example.backend.dto.equipment;

import com.example.backend.models.equipment.Consumable;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ConsumableDetailDTO {
    private UUID id;
    private String itemTypeName;
    private String itemTypeCategory;
    private String unit;
    private int quantity;
    private LocalDateTime lastUpdated;
    private LocalDateTime transactionDate; // Add this field
    private UUID transactionId;
    private Integer batchNumber; // Add batch number field
    private String status; // Add this field


    public static ConsumableDetailDTO fromConsumable(Consumable consumable) {
        ConsumableDetailDTO dto = new ConsumableDetailDTO();
        dto.setId(consumable.getId());

        if(consumable.getItemType() != null) {
            dto.setItemTypeName(consumable.getItemType().getName());
            if(consumable.getItemType().getItemCategory() != null) {
                dto.setItemTypeCategory(consumable.getItemType().getItemCategory().getName());
            }
            dto.setUnit(consumable.getItemType().getMeasuringUnit());
        }

        dto.setQuantity(consumable.getQuantity());

        if(consumable.getTransaction() != null) {
            dto.setTransactionId(consumable.getTransaction().getId());
            dto.setLastUpdated(consumable.getTransaction().getCompletedAt());
            dto.setTransactionDate(consumable.getTransaction().getTransactionDate()); // Get date from transaction
            dto.setBatchNumber(consumable.getTransaction().getBatchNumber()); // Set batch number from transaction
        }

        if (consumable.getStatus() != null) {
            dto.setStatus(consumable.getStatus().name());
        }

        return dto;
    }
}