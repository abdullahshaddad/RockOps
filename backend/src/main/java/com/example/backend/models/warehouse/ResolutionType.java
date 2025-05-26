package com.example.backend.models.warehouse;

public enum ResolutionType {
    // For STOLEN items (under-received)
    ACKNOWLEDGE_LOSS,
    COUNTING_ERROR,
    FOUND_ITEMS,
    REPORT_THEFT,

    // For OVER_RECEIVED items
    ACCEPT_SURPLUS,
    RETURN_TO_SENDER
}