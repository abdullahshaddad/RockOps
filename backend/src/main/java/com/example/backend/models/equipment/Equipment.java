package com.example.backend.models.equipment;

import com.example.backend.models.site.Site;
import com.example.backend.models.hr.Employee;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@Entity
public class Equipment
{
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String type;

    // Replace fullModelName with separate model and name fields
    @Column(nullable = false)
    private String model;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private Year manufactureYear;

    @Column(nullable = false)
    private LocalDate purchasedDate;

    @Column(nullable = false)
    private LocalDate deliveredDate;

    @Column(nullable = false)
    private double egpPrice;

    @Column(nullable = true)
    private double dollarPrice;

    @Column(nullable = false)
    private String purchasedFrom;

    @Column(nullable = false)
    private String examinedBy;

    @Column(nullable = true)
    private String equipmentComplaints;

    @Column(nullable = false)
    private String countryOfOrigin;

    @Column(nullable = false, unique = true)
    private String serialNumber;

    @Column(nullable = false)
    private String shipping;

    @Column(nullable = false)
    private String customs;

    @Column(nullable = false)
    private String modelNumber;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EquipmentStatus status;

    @Column(nullable = true)
    private String relatedDocuments;

    @Column(nullable = true)
    private Integer workedHours;

    @ManyToOne
    @JoinColumn(name = "site_id", referencedColumnName = "id") // Foreign key in Equipment
    @JsonManagedReference
    // @JsonIgnore
    //@JsonBackReference
    private Site site;

    @OneToOne
    @JoinColumn(name = "driver_id", referencedColumnName = "id")
    //@JsonManagedReference
    //@JsonIgnore
    private Employee mainDriver;

    @ManyToOne
    @JoinColumn(name = "sub_driver_id", referencedColumnName = "id")
    private Employee subDriver;


    @OneToMany(mappedBy = "equipment", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference
    private List<Consumable> consumables = new ArrayList<>();


    public Equipment() {
        this.status=EquipmentStatus.AVAILABLE;
    }

    // Optional - helper method to get combined model and name if needed for display purposes
    public String getFullModelName() {
        return model + " " + name;
    }
}