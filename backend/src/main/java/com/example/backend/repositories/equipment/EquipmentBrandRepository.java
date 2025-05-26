package com.example.backend.repositories.equipment;

import com.example.backend.models.equipment.EquipmentBrand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EquipmentBrandRepository extends JpaRepository<EquipmentBrand, UUID> {
    Optional<EquipmentBrand> findByName(String name);
    boolean existsByName(String name);
} 