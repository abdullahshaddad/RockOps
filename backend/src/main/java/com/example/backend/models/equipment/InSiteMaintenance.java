package com.example.backend.models.equipment;

import com.example.backend.models.transaction.Transaction;
import com.example.backend.models.hr.Employee;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InSiteMaintenance {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "equipment_id")
    @JsonManagedReference("equipment-maintenance")
    private Equipment equipment;

    // Changed from String to Employee
    @ManyToOne
    @JoinColumn(name = "technician_id", referencedColumnName = "id")
    private Employee technician;

    private LocalDateTime maintenanceDate;
    private String maintenanceType;
    private String description;
    private String status; // e.g., "COMPLETED", "IN_PROGRESS"

    // Link to related transaction(s)
    @OneToMany
    @JoinColumn(name = "maintenance_id")
    @JsonManagedReference
    private List<Transaction> relatedTransactions = new ArrayList<>();
}