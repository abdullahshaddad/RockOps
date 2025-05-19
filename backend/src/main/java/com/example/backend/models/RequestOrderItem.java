package com.example.backend.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
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
public class RequestOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    // Item quantity requested
    private double quantity;

    // Any additional comments for this specific item
    private String comment;

    // Relationship with parent request
    @ManyToOne
    @JoinColumn(name = "request_order_id")
    @JsonBackReference // ✅ This is correct
    private RequestOrder requestOrder;


    // The type of item being requested
    @ManyToOne
    @JoinColumn(name = "item_type_id")
    @JsonManagedReference
    private ItemType itemType;
}
