package com.example.backend.repositories;

import com.example.backend.models.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, UUID> {
}
