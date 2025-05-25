package com.example.Rock4Mining.repositories;

import com.example.Rock4Mining.models.ItemType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ItemTypeRepository extends JpaRepository<ItemType, UUID> {
}
