package com.example.backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "consumable_logs")
public class ConsumablesLog {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @ManyToOne
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @ManyToOne
    @JoinColumn(name = "item_type_id")
    private ItemType itemType;

    // Transaction date - when the transaction actually happened
    private LocalDate transactionDate;

    private Integer quantity;

    // Direction of transfer: TO_EQUIPMENT or FROM_EQUIPMENT
    @Enumerated(EnumType.STRING)
    private TransferDirection direction;

    @Enumerated(EnumType.STRING)
    private TransactionStatus status;

    // References to the two related transactions

    private String documentPath;

    // Created at - when the log was recorded in the system
    private LocalDateTime createdAt;

    // Add this field to ConsumablesLog.java
    @ManyToOne
    @JoinColumn(name = "consumable_range_id")
    private EquipmentConsumableRange consumableRange;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }


}