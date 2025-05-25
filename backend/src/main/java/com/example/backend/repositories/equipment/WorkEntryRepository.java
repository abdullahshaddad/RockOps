package com.example.backend.repositories.equipment;

import com.example.backend.repositories.equipment.finance.models.equipment.WorkEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface WorkEntryRepository extends JpaRepository<WorkEntry, UUID> {

    // Find work entries by sarky log range ID
    List<WorkEntry> findBySarkyLogRangeIdOrderByDateAsc(UUID sarkyLogRangeId);

    // Find work entries by date
    List<WorkEntry> findBySarkyLogRangeIdAndDate(UUID sarkyLogRangeId, LocalDate date);

    // Check if any entry exists for a given equipment and date
    @Query("SELECT CASE WHEN COUNT(w) > 0 THEN true ELSE false END FROM WorkEntry w " +
            "JOIN w.sarkyLogRange s WHERE s.equipment.id = :equipmentId AND w.date = :date")
    boolean existsByEquipmentIdAndDate(@Param("equipmentId") UUID equipmentId, @Param("date") LocalDate date);
}