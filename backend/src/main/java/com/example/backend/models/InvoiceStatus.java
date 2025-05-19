// Create InvoiceStatus.java enum
package com.example.backend.models;

public enum InvoiceStatus {
    UNPAID("Unpaid"),
    PARTIALLY_PAID("Partially Paid"),
    PAID("Paid");

    private final String displayName;

    InvoiceStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}