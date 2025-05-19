package com.example.backend.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
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
public class ItemCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String name;

    private String description;

    // Parent Category (Many-to-One)
    @ManyToOne
    @JoinColumn(name = "parent_category_id")
    @JsonManagedReference // Prevents infinite recursion
    private ItemCategory parentCategory;

    // Child Categories (One-to-Many)
    @OneToMany(mappedBy = "parentCategory", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference // Matches @JsonBackReference to serialize this side
    private List<ItemCategory> childCategories = new ArrayList<>();

    // Relationship with ItemType
    @OneToMany(mappedBy = "itemCategory", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference
    private List<ItemType> itemTypes = new ArrayList<>();

    @ManyToMany(mappedBy = "itemCategories")
    @JsonIgnore
    private List<Merchant> merchants = new ArrayList<>();

}
