package com.example.backend.repositories.procurement;


import com.example.backend.models.procurement.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, UUID> {
}
