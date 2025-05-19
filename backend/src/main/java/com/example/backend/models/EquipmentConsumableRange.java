package com.example.backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentConsumableRange {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    private LocalDate startDate;
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private TransactionStatus status;

    private String filePath;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "consumableRange", cascade = CascadeType.ALL)
    private List<ConsumablesLog> consumableEntries = new ArrayList<>();
}