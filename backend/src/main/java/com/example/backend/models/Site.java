package com.example.backend.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Site
{
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    private String name;
    private String physicalAddress;
    private String companyAddress;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate creationDate;

    @Column(length = 500)
    private String photoUrl;

//    @ManyToMany
//    @JoinTable(
//            name = "site_partner",
//            joinColumns = @JoinColumn(name = "site_id"),
//            inverseJoinColumns = @JoinColumn(name = "partner_id")
//    )
//    @JsonManagedReference
//    @JsonIgnore
//    private List<Partner> partners = new ArrayList<>();

    @OneToMany(mappedBy = "site", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<SitePartner> sitePartners = new ArrayList<>();


    @OneToMany(mappedBy = "site", cascade = CascadeType.ALL) // Equipment is the owner
    @JsonBackReference // Prevents infinite loop
    //@JsonIgnore
    //@JsonManagedReference
    //@JsonIgnoreProperties("equipment")
    private List<Equipment> equipment;

    @OneToMany(mappedBy = "site", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference
    private List<Warehouse> warehouses;

    @OneToMany(mappedBy = "site", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference
    private List<Employee> employees;

    @OneToMany(mappedBy = "site", cascade = CascadeType.ALL)
    @JsonBackReference // for Merchant -> Site relationship
    private List<Merchant> merchants;

    @OneToMany(mappedBy = "site", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<FixedAssets> fixedAssets;


}