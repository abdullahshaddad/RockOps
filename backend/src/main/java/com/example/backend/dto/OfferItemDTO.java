package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfferItemDTO {
    private UUID requestOrderItemId;
    private double quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String currency;
    private UUID merchantId;
    private Integer estimatedDeliveryDays;
    private String deliveryNotes;
    private String comment;
}