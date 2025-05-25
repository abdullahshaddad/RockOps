package com.example.backend.repositories.equipment;

import com.example.backend.repositories.equipment.finance.models.equipment.InSiteMaintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InSiteMaintenanceRepository extends JpaRepository<InSiteMaintenance, UUID> {

    // Find maintenance records by equipment ID
    List<InSiteMaintenance> findByEquipmentId(UUID equipmentId);

    }