package com.example.backend.repositories.warehouse;


import com.example.backend.models.warehouse.ItemType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ItemTypeRepository extends JpaRepository<ItemType, UUID> {
}
