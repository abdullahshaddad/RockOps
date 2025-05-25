package com.example.backend.repositories.equipment;

import com.example.backend.repositories.equipment.finance.models.equipment.MaintenanceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MaintenanceTypeRepository extends JpaRepository<MaintenanceType, UUID> {

    // Find a maintenance type by name (case insensitive)
    Optional<MaintenanceType> findByNameIgnoreCase(String name);

    // Find all active maintenance types
    List<MaintenanceType> findByActiveTrue();

    // Find maintenance types containing a specific string in name
    List<MaintenanceType> findByNameContainingIgnoreCase(String namePart);

    // Check if a maintenance type with this name exists
    boolean existsByNameIgnoreCase(String name);
}