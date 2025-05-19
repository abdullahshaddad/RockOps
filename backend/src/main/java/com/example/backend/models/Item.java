package com.example.backend.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "item_type_id", nullable = false)
    private ItemType itemType;

    private int quantity;

    @ManyToOne
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @Enumerated(EnumType.STRING)
    private ItemStatus itemStatus;

    public Item(ItemType itemType, Warehouse warehouse, int quantity, ItemStatus itemStatus) {
        this.itemType = itemType;
        this.warehouse = warehouse;
        this.quantity = quantity;
        this.itemStatus = itemStatus;
    }
}