package com.example.backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sarky_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SarkyLog {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @ManyToOne
    @JoinColumn(name = "work_type_id", nullable = false)
    private WorkType workType;

    @ManyToOne
    @JoinColumn(name = "driver_id", nullable = false)
    private Employee driver;

    @Column(name = "worked_hours", nullable = false)
    private Double workedHours;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "file_url", length = 1000)  // Increased length to 1000 characters
    private String fileUrl;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}