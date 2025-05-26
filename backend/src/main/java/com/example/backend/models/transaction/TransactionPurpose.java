package com.example.backend.models.transaction;

public enum TransactionPurpose {
    GENERAL,       // Default for warehouse-to-warehouse transactions
    CONSUMABLE,    // Equipment consumables transaction
    MAINTENANCE    // Equipment maintenance transaction
}