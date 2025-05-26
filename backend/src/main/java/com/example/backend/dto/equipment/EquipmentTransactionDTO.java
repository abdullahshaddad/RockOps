package com.example.backend.dto.equipment;

import com.example.backend.models.transaction.TransactionStatus;
import com.example.backend.models.transaction.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentTransactionDTO {
    private UUID id;
    private UUID equipmentId;
    private String equipmentName;

    // Source and target information
    private String sourceType;
    private UUID sourceId;
    private String sourceName;
    private String targetType;
    private UUID targetId;
    private String targetName;

    private UUID itemTypeId;
    private String itemTypeName;

    // Transaction date - when the transaction actually happened
    private LocalDate transactionDate;
    private String formattedTransactionDate;

    private Integer quantity;
    private TransactionStatus status;
    private TransactionType transactionType;
    private String itemCategory;

    // Created at - when the transaction was recorded in the system
    private LocalDateTime createdAt;
    private String formattedCreatedAt;

    private String documentPath;

    private UUID addedById;
    private String addedByName;
}