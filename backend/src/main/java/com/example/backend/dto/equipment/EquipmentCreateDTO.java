package com.example.backend.dto;

import com.example.backend.models.EquipmentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentCreateDTO {
    private UUID typeId;
    private String model;
    private String name;
    private UUID brandId;
    private int manufactureYear;  // Using int instead of Year for easier JSON processing
    private LocalDate purchasedDate;
    private LocalDate deliveredDate;
    private double egpPrice;
    private double dollarPrice;
    private UUID  purchasedFrom;
    private String examinedBy;
    private String equipmentComplaints;
    private String countryOfOrigin;
    private String serialNumber;
    private String shipping;
    private String customs;
    private String modelNumber;
    private EquipmentStatus status;
    private String relatedDocuments;
    private Integer workedHours;
    private UUID siteId;
    private UUID mainDriverId;
    private UUID subDriverId;
}