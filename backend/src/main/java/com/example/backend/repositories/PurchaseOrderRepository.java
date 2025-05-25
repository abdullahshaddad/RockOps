package com.example.Rock4Mining.repositories;

import com.example.Rock4Mining.models.PurchaseOrder;
import com.example.Rock4Mining.models.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, UUID> {
}
