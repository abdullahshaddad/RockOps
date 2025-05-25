package com.example.backend.models.hr;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "attendances")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate date;

    // For hourly positions
    private LocalTime startTime;
    private LocalTime endTime;

    // For full-time positions
    private AttendanceStatus status;

    // Common fields
    private String notes;
    private Boolean isHoliday;
    private Boolean isLeave;

    @Enumerated(EnumType.STRING)
    private AttendanceType type;

    // If overtime is applicable
    private Double overtimeHours;
}