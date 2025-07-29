package com.example.backend.repositories.transaction;

import com.example.backend.models.transaction.ConsumableMovement;
import com.example.backend.models.transaction.EquipmentTransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository for ConsumableMovement entity - tracks accurate consumable flow
 * between warehouses and equipment.
 */
@Repository
public interface ConsumableMovementRepository extends JpaRepository<ConsumableMovement, UUID> {

    /**
     * Find all movements for a specific equipment
     */
    List<ConsumableMovement> findBySourceEquipmentIdOrDestinationEquipmentIdOrderByMovementDateDesc(
            UUID sourceEquipmentId, UUID destinationEquipmentId);

    /**
     * Find all movements for a specific warehouse
     */
    List<ConsumableMovement> findBySourceWarehouseIdOrDestinationWarehouseIdOrderByMovementDateDesc(
            UUID sourceWarehouseId, UUID destinationWarehouseId);

    /**
     * Find movements for a specific item type
     */
    List<ConsumableMovement> findByItemTypeIdOrderByMovementDateDesc(UUID itemTypeId);

    /**
     * Find movements for a specific transaction
     */
    List<ConsumableMovement> findByTransactionIdOrderByMovementDateDesc(UUID transactionId);

    /**
     * Find movements by status
     */
    List<ConsumableMovement> findByStatusOrderByMovementDateDesc(EquipmentTransactionStatus status);

    /**
     * Find movements by movement type
     */
    List<ConsumableMovement> findByMovementTypeOrderByMovementDateDesc(ConsumableMovement.MovementType movementType);

    /**
     * Find movements involving specific equipment and item type
     */
    @Query("""
        SELECT cm FROM ConsumableMovement cm 
        WHERE cm.itemTypeId = :itemTypeId 
          AND (cm.sourceEquipmentId = :equipmentId OR cm.destinationEquipmentId = :equipmentId)
        ORDER BY cm.movementDate DESC
    """)
    List<ConsumableMovement> findByEquipmentIdAndItemTypeIdOrderByMovementDateDesc(
            @Param("equipmentId") UUID equipmentId, 
            @Param("itemTypeId") UUID itemTypeId);

    /**
     * Find movements within a date range
     */
    List<ConsumableMovement> findByMovementDateBetweenOrderByMovementDateDesc(
            LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find discrepancies (where actual != expected quantity)
     */
    List<ConsumableMovement> findByIsDiscrepancyTrueOrderByMovementDateDesc();

    /**
     * Calculate current stock for equipment and item type
     */
    @Query("""
        SELECT COALESCE(SUM(
            CASE 
                WHEN cm.destinationEquipmentId = :equipmentId THEN cm.quantity
                WHEN cm.sourceEquipmentId = :equipmentId THEN -cm.quantity
                ELSE 0
            END
        ), 0)
        FROM ConsumableMovement cm 
        WHERE cm.itemTypeId = :itemTypeId 
          AND (cm.sourceEquipmentId = :equipmentId OR cm.destinationEquipmentId = :equipmentId)
          AND cm.status IN ('ACCEPTED', 'RESOLVED')
    """)
    Integer calculateCurrentStock(
            @Param("equipmentId") UUID equipmentId, 
            @Param("itemTypeId") UUID itemTypeId);

    /**
     * Get movement summary for equipment
     */
    @Query("""
        SELECT cm.itemTypeId, 
               SUM(CASE WHEN cm.destinationEquipmentId = :equipmentId THEN cm.quantity ELSE 0 END) as received,
               SUM(CASE WHEN cm.sourceEquipmentId = :equipmentId THEN cm.quantity ELSE 0 END) as sent,
               COUNT(cm) as totalMovements
        FROM ConsumableMovement cm 
        WHERE cm.sourceEquipmentId = :equipmentId OR cm.destinationEquipmentId = :equipmentId
        GROUP BY cm.itemTypeId
    """)
    List<Object[]> getMovementSummaryForEquipment(@Param("equipmentId") UUID equipmentId);

    /**
     * Find recent movements for dashboard
     */
    List<ConsumableMovement> findTop20ByOrderByMovementDateDesc();

    /**
     * Validate movement balance for an item type across the system
     */
    @Query("""
        SELECT 
            SUM(CASE WHEN cm.movementType = 'WAREHOUSE_TO_EQUIPMENT' THEN cm.quantity ELSE 0 END) as warehouseToEquipment,
            SUM(CASE WHEN cm.movementType = 'EQUIPMENT_TO_WAREHOUSE' THEN cm.quantity ELSE 0 END) as equipmentToWarehouse,
            SUM(CASE WHEN cm.movementType = 'CONSUMPTION' THEN cm.quantity ELSE 0 END) as consumed,
            SUM(CASE WHEN cm.movementType = 'LOSS' THEN cm.quantity ELSE 0 END) as lost,
            SUM(CASE WHEN cm.movementType = 'ADJUSTMENT' THEN cm.quantity ELSE 0 END) as adjusted
        FROM ConsumableMovement cm 
        WHERE cm.itemTypeId = :itemTypeId
    """)
    Object[] validateMovementBalance(@Param("itemTypeId") UUID itemTypeId);

    /**
     * Find equipment with specific item type
     */
    @Query("""
        SELECT DISTINCT cm.destinationEquipmentId
        FROM ConsumableMovement cm 
        WHERE cm.itemTypeId = :itemTypeId 
          AND cm.destinationEquipmentId IS NOT NULL
          AND cm.quantity > 0
    """)
    List<UUID> findEquipmentWithItemType(@Param("itemTypeId") UUID itemTypeId);

    /**
     * Get consumption analysis for an equipment
     */
    @Query("""
        SELECT cm.itemTypeId,
               SUM(CASE WHEN cm.movementType = 'CONSUMPTION' THEN cm.quantity ELSE 0 END) as totalConsumed,
               AVG(CASE WHEN cm.movementType = 'CONSUMPTION' THEN cm.quantity ELSE NULL END) as avgConsumption,
               COUNT(CASE WHEN cm.movementType = 'CONSUMPTION' THEN 1 ELSE NULL END) as consumptionEvents
        FROM ConsumableMovement cm 
        WHERE (cm.sourceEquipmentId = :equipmentId OR cm.destinationEquipmentId = :equipmentId)
          AND cm.movementDate BETWEEN :startDate AND :endDate
        GROUP BY cm.itemTypeId
    """)
    List<Object[]> getConsumptionAnalysis(
            @Param("equipmentId") UUID equipmentId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
} 