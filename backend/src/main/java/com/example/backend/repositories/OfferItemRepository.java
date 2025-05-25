package com.example.Rock4Mining.repositories;

import com.example.Rock4Mining.models.OfferItem;
import com.example.Rock4Mining.models.RequestOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OfferItemRepository extends JpaRepository<OfferItem, UUID> {
    List<OfferItem> findByRequestOrderItem(RequestOrderItem requestOrderItem);
}
