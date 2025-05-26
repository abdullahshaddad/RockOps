package com.example.backend.repositories.equipment;

import com.example.backend.models.equipment.SarkyLogRange;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface SarkyLogRangeRepository extends JpaRepository<SarkyLogRange, UUID> {

    // Find all sarky log ranges for a specific equipment
    List<SarkyLogRange> findByEquipmentIdOrderByStartDateDesc(UUID equipmentId);

    // Find all sarky log ranges that overlap with a given date range
    @Query("SELECT slr FROM SarkyLogRange slr WHERE slr.equipment.id = :equipmentId " +
            "AND ((slr.startDate <= :endDate AND slr.endDate >= :startDate) OR " +
            "(slr.startDate >= :startDate AND slr.startDate <= :endDate) OR " +
            "(slr.endDate >= :startDate AND slr.endDate <= :endDate))")
    List<SarkyLogRange> findOverlappingRanges(
            @Param("equipmentId") UUID equipmentId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // Find overlapping ranges excluding current range
    @Query("SELECT slr FROM SarkyLogRange slr WHERE slr.equipment.id = :equipmentId " +
            "AND slr.id != :rangeId " +
            "AND ((slr.startDate <= :endDate AND slr.endDate >= :startDate) OR " +
            "(slr.startDate >= :startDate AND slr.startDate <= :endDate) OR " +
            "(slr.endDate >= :startDate AND slr.endDate <= :endDate))")
    List<SarkyLogRange> findOverlappingRangesExcludingCurrent(
            @Param("equipmentId") UUID equipmentId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("rangeId") UUID rangeId);

    // Find the sarky log range with the latest end date for a specific equipment
    @Query("SELECT slr FROM SarkyLogRange slr WHERE slr.equipment.id = :equipmentId " +
            "ORDER BY slr.endDate DESC")
    List<SarkyLogRange> findLatestByEquipmentId(@Param("equipmentId") UUID equipmentId);

    // Add these methods to SarkyLogRangeRepository
    List<SarkyLogRange> findByEquipmentIdOrderByStartDateAsc(UUID equipmentId);
    List<SarkyLogRange> findByEquipmentIdOrderByEndDateDesc(UUID equipmentId);


}