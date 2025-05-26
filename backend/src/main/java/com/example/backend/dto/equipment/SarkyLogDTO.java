package com.example.backend.dto.equipment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SarkyLogDTO {
    private UUID id;
    private UUID equipmentId;
    private UUID workTypeId;
    private Double workedHours;
    private LocalDate date;
    private String filePath;
    private UUID driverId;

}
