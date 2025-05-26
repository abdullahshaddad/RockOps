package com.example.backend.repositories;

import com.example.backend.models.ItemType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ItemTypeRepository extends JpaRepository<ItemType, UUID> {
}
