package com.example.backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "sarky_log_ranges")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SarkyLogRange {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @OneToMany(mappedBy = "sarkyLogRange", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkEntry> workEntries = new ArrayList<>();

    @Column(name = "file_url", length = 1000)
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

    // Helper method to add work entry
    public void addWorkEntry(WorkEntry workEntry) {
        workEntries.add(workEntry);
        workEntry.setSarkyLogRange(this);
    }

    // Helper method to remove work entry
    public void removeWorkEntry(WorkEntry workEntry) {
        workEntries.remove(workEntry);
        workEntry.setSarkyLogRange(null);
    }

}