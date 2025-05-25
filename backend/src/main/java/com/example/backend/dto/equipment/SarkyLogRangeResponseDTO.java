package com.example.backend.dto;

import com.example.backend.models.EquipmentType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SarkyLogRangeResponseDTO {
    private UUID id;
    private UUID equipmentId;
    private EquipmentType equipmentType;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<WorkEntryResponseDTO> workEntries;
    private String filePath;
    private String createdByName;
    private LocalDate createdAt;
    private String status;
}