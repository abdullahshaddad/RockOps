package com.example.backend.repositories;

import com.example.backend.models.RequestOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RequestOrderItemRepository extends JpaRepository<RequestOrderItem, UUID> {
}
