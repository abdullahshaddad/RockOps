package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SarkyLogRangeDTO {
    private UUID id;
    private UUID equipmentId;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<WorkEntryDTO> workEntries;
    private String filePath;
}