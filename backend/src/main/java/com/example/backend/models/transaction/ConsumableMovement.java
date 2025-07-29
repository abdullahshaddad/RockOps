package com.example.backend.models.transaction;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Accurate tracking of consumable movements between warehouses and equipment.
 * This entity provides a reliable audit trail for all consumable flow,
 * solving the historical inaccuracy problems with the existing system.
 */
@Entity
@Table(name = "consumable_movements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsumableMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    /**
     * Reference to the transaction that caused this movement
     */
    @Column(name = "transaction_id", nullable = false)
    private UUID transactionId;

    /**
     * Reference to the specific transaction item
     */
    @Column(name = "transaction_item_id")
    private UUID transactionItemId;

    /**
     * Type of item being moved
     */
    @Column(name = "item_type_id", nullable = false)
    private UUID itemTypeId;

    /**
     * Source warehouse (if movement is from warehouse)
     */
    @Column(name = "source_warehouse_id")
    private UUID sourceWarehouseId;

    /**
     * Source equipment (if movement is from equipment)
     */
    @Column(name = "source_equipment_id")
    private UUID sourceEquipmentId;

    /**
     * Destination warehouse (if movement is to warehouse)
     */
    @Column(name = "destination_warehouse_id")
    private UUID destinationWarehouseId;

    /**
     * Destination equipment (if movement is to equipment)
     */
    @Column(name = "destination_equipment_id")
    private UUID destinationEquipmentId;

    /**
     * Actual quantity moved
     */
    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    /**
     * Expected/planned quantity (for comparison and discrepancy detection)
     */
    @Column(name = "expected_quantity")
    private Integer expectedQuantity;

    /**
     * Type of movement
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "movement_type", nullable = false)
    private MovementType movementType;

    /**
     * Current status of this movement
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private EquipmentTransactionStatus status;

    /**
     * Whether this movement represents a discrepancy (quantity != expected_quantity)
     */
    @Column(name = "is_discrepancy")
    @Builder.Default
    private Boolean isDiscrepancy = false;

    /**
     * When the movement was recorded
     */
    @Column(name = "movement_date", nullable = false)
    private LocalDateTime movementDate;

    /**
     * User who recorded this movement
     */
    @Column(name = "recorded_by")
    private String recordedBy;

    /**
     * Additional notes about the movement
     */
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    /**
     * Reference number for external tracking
     */
    @Column(name = "reference_number")
    private String referenceNumber;

    @PrePersist
    protected void onCreate() {
        if (movementDate == null) {
            movementDate = LocalDateTime.now();
        }
        
        // Check for discrepancy
        if (expectedQuantity != null && !quantity.equals(expectedQuantity)) {
            isDiscrepancy = true;
        }
    }

    /**
     * Types of consumable movements
     */
    public enum MovementType {
        /**
         * Movement from warehouse to equipment
         */
        WAREHOUSE_TO_EQUIPMENT,
        
        /**
         * Movement from equipment back to warehouse
         */
        EQUIPMENT_TO_WAREHOUSE,
        
        /**
         * Movement between equipment units
         */
        EQUIPMENT_TO_EQUIPMENT,
        
        /**
         * Consumption/usage of items (quantity decrease)
         */
        CONSUMPTION,
        
        /**
         * Lost or damaged items
         */
        LOSS,
        
        /**
         * Found or recovered items
         */
        FOUND,
        
        /**
         * Manual inventory adjustment
         */
        ADJUSTMENT,
        
        /**
         * Usage during maintenance activities
         */
        MAINTENANCE_USAGE
    }
} 