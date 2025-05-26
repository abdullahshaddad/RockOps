package com.example.backend.dto.finance;

import com.example.backend.models.finance.InvoiceStatus;
import com.example.backend.models.finance.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDTO {
    private UUID id;
    private String invoiceNumber;
    private String vendorName;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal remainingBalance;
    private PaymentStatus paymentStatus;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private BigDecimal amount;
    private String description;
    private InvoiceStatus status;
    private String category;
    private String filePath;
    private UUID merchantId;
    private String merchantName;
    private UUID siteId;
    private String siteName;
    private Set<InvoiceItemDTO> items;
    private UUID createdById;
    private String createdByName;
    private LocalDateTime createdDate;
    private UUID modifiedById;
    private String modifiedByName;
    private LocalDateTime modifiedDate;
    private Integer paymentCount; // How many payments have been made
}