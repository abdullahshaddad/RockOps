package com.example.backend.dto.item;

import com.example.backend.models.warehouse.ResolutionType;
import lombok.Data;

import java.util.UUID;

@Data
public class ItemResolutionDTO {
    private UUID itemId;
    private ResolutionType resolutionType;
    private String notes;
    private String transactionId;
    private String resolvedBy;
}