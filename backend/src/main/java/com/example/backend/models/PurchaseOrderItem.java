package com.example.backend.models;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private double quantity;
    private double unitPrice;
    private double totalPrice;
    private String comment;

    // Status and delivery information
    private String status;
    private int estimatedDeliveryDays;
    private String deliveryNotes;

    @ManyToOne
    @JoinColumn(name = "purchase_order_id")
    @JsonManagedReference
    private PurchaseOrder purchaseOrder;

    @OneToOne
    @JoinColumn(name = "offer_item_id")
    @JsonManagedReference
    private OfferItem offerItem;
}