package com.example.backend.repositories.equipment;

import com.example.backend.models.equipment.EquipmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EquipmentTypeRepository extends JpaRepository<EquipmentType, UUID> {
    Optional<EquipmentType> findByName(String name);
    boolean existsByName(String name);
}