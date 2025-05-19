package com.example.backend.models;


public enum AccountType {
    ASSET("Asset"),
    LIABILITY("Liability"),
    EQUITY("Equity"),
    REVENUE("Revenue"),
    EXPENSE("Expense");

    private final String displayName;

    AccountType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
