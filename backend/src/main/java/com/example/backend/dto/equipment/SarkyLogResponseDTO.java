package com.example.backend.dto;

import com.example.backend.models.EquipmentType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

// DTO for sarky log response including related data
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SarkyLogResponseDTO {
    private UUID id;
    private UUID equipmentId;
    private EquipmentType equipmentType;
    private WorkTypeDTO workType;
    private Double workedHours;
    private LocalDate date;
    private String filePath;
    private String createdByName;
    private LocalDate createdAt;
    private UUID driverId;
    private String driverName;
}