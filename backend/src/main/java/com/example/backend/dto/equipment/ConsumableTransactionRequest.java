package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsumableTransactionRequest {
    private UUID equipmentId;
    private String entityType; // WAREHOUSE, MERCHANT, etc.
    private UUID entityId; // ID of the entity
    private boolean isSource; // true if entity is source, false if entity is target
    private UUID itemTypeId;

    // Transaction date - when the transaction actually happened
    private LocalDate transactionDate;

    private Integer quantity;
    private MultipartFile file;


}

