package com.example.backend.dto.finance;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Data
public class InvoiceCreateDTO {
    private String invoiceNumber;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private BigDecimal amount;
    private String description;
    private String category;
    private UUID merchantId;
    private UUID siteId;
    private Set<InvoiceItemCreateDTO> items;
}
