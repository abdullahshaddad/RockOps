package com.example.backend.repositories.transaction;

import com.example.backend.models.transaction.TransactionItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TransactionItemRepository extends JpaRepository<TransactionItem, UUID> {
}
