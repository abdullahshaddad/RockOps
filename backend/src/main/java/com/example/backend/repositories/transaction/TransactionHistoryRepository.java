package com.example.backend.repositories.transaction;

import com.example.backend.models.transaction.TransactionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository for TransactionHistory entity - provides access to comprehensive audit trail data.
 */
@Repository
public interface TransactionHistoryRepository extends JpaRepository<TransactionHistory, UUID> {

    /**
     * Find all history entries for a specific transaction, ordered by timestamp (newest first)
     */
    List<TransactionHistory> findByTransactionIdOrderByChangedAtDesc(UUID transactionId);

    /**
     * Find all history entries for a specific transaction item
     */
    List<TransactionHistory> findByTransactionItemIdOrderByChangedAtDesc(UUID transactionItemId);

    /**
     * Find history entries by change type
     */
    List<TransactionHistory> findByChangeTypeOrderByChangedAtDesc(String changeType);

    /**
     * Find history entries by user
     */
    List<TransactionHistory> findByChangedByOrderByChangedAtDesc(String changedBy);

    /**
     * Find history entries within a date range
     */
    List<TransactionHistory> findByChangedAtBetweenOrderByChangedAtDesc(
            LocalDateTime startDate, 
            LocalDateTime endDate);

    /**
     * Find history for transactions involving specific equipment
     */
    @Query("""
        SELECT th FROM TransactionHistory th 
        WHERE th.transactionId IN (
            SELECT t.id FROM Transaction t 
            WHERE (t.senderType = 'EQUIPMENT' AND t.senderId = :equipmentId)
               OR (t.receiverType = 'EQUIPMENT' AND t.receiverId = :equipmentId)
        )
        ORDER BY th.changedAt DESC
    """)
    List<TransactionHistory> findByEquipmentIdOrderByChangedAtDesc(@Param("equipmentId") UUID equipmentId);

    /**
     * Find history for transactions involving specific warehouse
     */
    @Query("""
        SELECT th FROM TransactionHistory th 
        WHERE th.transactionId IN (
            SELECT t.id FROM Transaction t 
            WHERE (t.senderType = 'WAREHOUSE' AND t.senderId = :warehouseId)
               OR (t.receiverType = 'WAREHOUSE' AND t.receiverId = :warehouseId)
        )
        ORDER BY th.changedAt DESC
    """)
    List<TransactionHistory> findByWarehouseIdOrderByChangedAtDesc(@Param("warehouseId") UUID warehouseId);

    /**
     * Find recent activity (last N records)
     */
    List<TransactionHistory> findTop10ByOrderByChangedAtDesc();

    /**
     * Find history entries by equipment status
     */
    List<TransactionHistory> findByEquipmentStatusOrderByChangedAtDesc(String equipmentStatus);

    /**
     * Count history entries by change type
     */
    @Query("SELECT COUNT(th) FROM TransactionHistory th WHERE th.changeType = :changeType")
    Long countByChangeType(@Param("changeType") String changeType);

    /**
     * Find system-generated vs manual changes
     */
    List<TransactionHistory> findByIsSystemGeneratedOrderByChangedAtDesc(Boolean isSystemGenerated);

    /**
     * Get audit trail summary for a transaction
     */
    @Query("""
        SELECT th.changeType, COUNT(th), MAX(th.changedAt)
        FROM TransactionHistory th 
        WHERE th.transactionId = :transactionId
        GROUP BY th.changeType
        ORDER BY MAX(th.changedAt) DESC
    """)
    List<Object[]> findAuditSummaryByTransactionId(@Param("transactionId") UUID transactionId);

    /**
     * Find discrepancies (where previous and new quantities differ significantly)
     */
    @Query("""
        SELECT th FROM TransactionHistory th 
        WHERE th.previousQuantity IS NOT NULL 
          AND th.newQuantity IS NOT NULL 
          AND ABS(th.newQuantity - th.previousQuantity) > :threshold
        ORDER BY th.changedAt DESC
    """)
    List<TransactionHistory> findQuantityDiscrepancies(@Param("threshold") Integer threshold);
} 