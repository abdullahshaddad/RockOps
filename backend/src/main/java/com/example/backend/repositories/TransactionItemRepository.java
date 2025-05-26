package com.example.backend.repositories;

import com.example.backend.models.TransactionItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TransactionItemRepository extends JpaRepository<TransactionItem, UUID> {
}
