package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponseDTO {
    private UUID id;
    private BigDecimal amount;
    private LocalDate paymentDate;
    private String referenceNumber;
    private String notes;
    private String createdBy;
    private LocalDateTime createdAt;

    // Invoice information
    private UUID invoiceId;
    private String invoiceNumber;
    private String vendorName;

    // Payment method information
    private UUID paymentMethodId;
    private String paymentMethodName;
}