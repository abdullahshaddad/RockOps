package com.example.backend.repositories;

import com.example.backend.models.OfferItem;
import com.example.backend.models.RequestOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OfferItemRepository extends JpaRepository<OfferItem, UUID> {
    List<OfferItem> findByRequestOrderItem(RequestOrderItem requestOrderItem);
}
