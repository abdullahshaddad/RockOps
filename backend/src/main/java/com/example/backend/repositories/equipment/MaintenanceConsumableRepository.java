package com.example.backend.repositories.equipment;

import com.example.backend.repositories.equipment.finance.models.equipment.MaintenanceConsumable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MaintenanceConsumableRepository extends JpaRepository<MaintenanceConsumable, UUID> {

    // Find all consumables used in a specific maintenance
    List<MaintenanceConsumable> findByMaintenanceId(UUID maintenanceId);

    // Find all consumables of a specific item type used in maintenance
    List<MaintenanceConsumable> findByItemTypeId(UUID itemTypeId);

    // Find consumables used in maintenance for a specific equipment
    List<MaintenanceConsumable> findByMaintenanceEquipmentId(UUID equipmentId);

    // Delete all consumables associated with a maintenance
    void deleteByMaintenanceId(UUID maintenanceId);
}