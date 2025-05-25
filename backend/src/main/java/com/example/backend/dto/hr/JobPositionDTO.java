package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobPositionDTO {

    private UUID id;
    private String positionName;
    private String department;
    private String head;
    private Double baseSalary;
    private Integer probationPeriod;
    private String type;
    private String experienceLevel;
    private Integer workingDays;
    private String shifts;
    private Integer workingHours;
    private String vacations;
    private Boolean active;
}