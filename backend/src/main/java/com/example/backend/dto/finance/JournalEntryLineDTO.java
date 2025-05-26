package com.example.backend.dto.finance;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class JournalEntryLineDTO {
    private UUID accountId;
    private BigDecimal amount;
    private boolean debit;
    private String description;
}