package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Lightweight DTO for employee summaries in lists
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSummaryDTO {
    private UUID id;
    private String fullName;
    private String position;
    private String department;
    private String email;
    private String phoneNumber;
    private String status;
    private String siteName;
    private String photoUrl;
    private BigDecimal salary;
    private String employmentType;
    private String hireDate;
}