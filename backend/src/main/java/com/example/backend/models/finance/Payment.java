package com.example.backend.models.finance;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    // How much was paid
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    // When the payment was made
    @Column(nullable = false)
    private LocalDate paymentDate;

    // Reference number (like check number or transaction ID)
    @Column(length = 100)
    private String referenceNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    // How the payment was made
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_method_id", nullable = false)
    private PaymentMethod paymentMethod;

    // Any notes about the payment
    @Column(length = 1000)
    private String notes;

    // Who created this payment record
    @Column(nullable = false, length = 100)
    private String createdBy;

    // When this record was created
    @Column(nullable = false)
    private LocalDateTime createdAt;

    // Auto-set creation timestamp
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
