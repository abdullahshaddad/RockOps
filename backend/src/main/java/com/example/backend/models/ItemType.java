package com.example.backend.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemType {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String name;
    private String comment;
    private String measuringUnit;
    private String status;
    private int minQuantity;
    private String serialNumber;

    @OneToMany(mappedBy = "itemType", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference
    private List<Item> items = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "item_category_id", nullable = false)
    @JsonManagedReference
    private ItemCategory itemCategory;

    @OneToMany(mappedBy = "itemType", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference
    private List<TransactionItem> transactionItems = new ArrayList<>();

    // New relationship with RequestOrderItem
    @OneToMany(mappedBy = "itemType", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference
    private List<RequestOrderItem> requestOrderItems = new ArrayList<>();



    @OneToMany(mappedBy = "itemType")
    @JsonBackReference
    private List<OfferItem> offerItems = new ArrayList<>();
}