package com.example.backend.models.finance;

public enum PaymentStatus {
    UNPAID("Unpaid"),
    PARTIALLY_PAID("Partially Paid"),
    FULLY_PAID("Fully Paid"),
    OVERPAID("Overpaid");

    private final String displayName;

    PaymentStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
