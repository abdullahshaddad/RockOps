package com.example.backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vacancy {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String title;

    private String description;

    private String requirements;

    private String responsibilities;

    private LocalDate postingDate;

    private LocalDate closingDate;

    private String status; // OPEN, CLOSED, FILLED

    private Integer numberOfPositions;

    private String priority; // HIGH, MEDIUM, LOW

    @ManyToOne
    @JoinColumn(name = "job_position_id")
    private JobPosition jobPosition;

    @OneToMany(mappedBy = "vacancy", cascade = CascadeType.ALL)
    private List<Candidate> candidates = new ArrayList<>();
}