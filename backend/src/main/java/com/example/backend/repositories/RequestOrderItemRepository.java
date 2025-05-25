package com.example.Rock4Mining.repositories;

import com.example.Rock4Mining.models.RequestOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RequestOrderItemRepository extends JpaRepository<RequestOrderItem, UUID> {
}
