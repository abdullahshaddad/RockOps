package com.example.backend.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Candidate {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    private String email;

    private String phoneNumber;

    private String country;

    @Column(length = 1024)
    private String resumeUrl;


    // Current job title
    private String currentPosition;

    // Current company
    private String currentCompany;

    // Application date
    private LocalDate applicationDate;

    // Notes about candidate
    @Column(length = 1000)
    private String notes;

    // The vacancy this candidate applied for
    @ManyToOne
    @JoinColumn(name = "vacancy_id")
    @JsonBackReference
    private Vacancy vacancy;

}