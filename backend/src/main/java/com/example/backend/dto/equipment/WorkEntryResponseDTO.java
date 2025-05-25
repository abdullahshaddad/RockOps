package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkEntryResponseDTO {
    private UUID id;
    private LocalDate date;
    private WorkTypeDTO workType;
    private Double workedHours;
    private UUID driverId;
    private String driverName;
}