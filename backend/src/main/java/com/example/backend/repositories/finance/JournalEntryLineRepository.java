package com.example.backend.repositories.finance;

import com.example.backend.models.finance.JournalEntryLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface JournalEntryLineRepository extends JpaRepository<JournalEntryLine, UUID> {
}
