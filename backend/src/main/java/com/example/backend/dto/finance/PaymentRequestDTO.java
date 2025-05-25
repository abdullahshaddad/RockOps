package com.example.backend.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDTO {

    @NotNull(message = "Invoice ID is required")
    private UUID invoiceId;

    @NotNull(message = "Payment amount is required")
    @DecimalMin(value = "0.01", message = "Payment amount must be greater than 0")
    private BigDecimal amount;

    @NotNull(message = "Payment date is required")
    private LocalDate paymentDate;

    @Size(max = 100, message = "Reference number cannot exceed 100 characters")
    private String referenceNumber;

    @NotNull(message = "Payment method is required")
    private UUID paymentMethodId;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;

    @NotBlank(message = "Created by is required")
    @Size(max = 100, message = "Created by cannot exceed 100 characters")
    private String createdBy;
}