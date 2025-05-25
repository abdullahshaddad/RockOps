package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfferDTO {
    private String title;
    private String description;
    private UUID requestOrderId;
    private LocalDateTime validUntil;
    private String notes;
    private List<OfferItemDTO> offerItems;
}
