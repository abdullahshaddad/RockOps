package com.example.backend.dto.equipment;

import com.example.backend.models.transaction.TransferDirection;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class ConsumableEntryDto {
    private UUID warehouseId;
    private UUID itemTypeId;
    private int quantity;
    private LocalDate date;
    private TransferDirection direction;
    private String addedBy;
}