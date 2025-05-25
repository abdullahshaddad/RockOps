package com.example.backend.models.finance;

import com.example.backend.models.Merchant;
import com.example.backend.models.site.Site;
import com.example.backend.models.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String invoiceNumber;

    @Column(nullable = false)
    private String vendorName;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false)
    private LocalDate invoiceDate;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(name = "amount", nullable = false)
    private BigDecimal amount;

    @Column(name = "description")
    private String description;
    // NEW FIELDS FOR PAYMENT TRACKING
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;
    @Column(name = "status", nullable = false)
    private InvoiceStatus status = InvoiceStatus.UNPAID;

    @Column(name = "category")
    private String category;

    @Column(name = "file_path")
    private String filePath;

    // Relationship with merchant (instead of vendor)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merchant_id")
    private Merchant merchant;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Payment> payments = new ArrayList<>();
    // Relationship with site
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id")
    private Site site;

    // Calculate remaining balance
    public BigDecimal getRemainingBalance() {
        return totalAmount.subtract(paidAmount);
    }
    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<InvoiceItem> items = new HashSet<>();

    // Check if invoice is fully paid
    public boolean isFullyPaid() {
        return paidAmount.compareTo(totalAmount) >= 0;
    }
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modified_by")
    private User modifiedBy;

    @Column(name = "modified_date")
    private LocalDateTime modifiedDate;

    // Pre-persist hook to set created date
    @PrePersist
    public void prePersist() {
        createdDate = LocalDateTime.now();
    }

    // Check if invoice is partially paid
    public boolean isPartiallyPaid() {
        return paidAmount.compareTo(BigDecimal.ZERO) > 0 &&
                paidAmount.compareTo(totalAmount) < 0;
    }
    // Pre-update hook to set modified date
    @PreUpdate
    public void preUpdate() {
        modifiedDate = LocalDateTime.now();
    }
}