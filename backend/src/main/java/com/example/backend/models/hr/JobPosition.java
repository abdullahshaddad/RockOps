package com.example.backend.models.hr;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Entity
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"employees"}) // Prevent circular hash issues
@ToString(exclude = {"employees"})
public class JobPosition {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String positionName;
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;
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

    @OneToMany(mappedBy = "jobPosition", cascade = CascadeType.ALL)
    @JsonBackReference("job-employee")
    private List<Employee> employees;

    @OneToMany(mappedBy = "jobPosition", cascade = CascadeType.ALL)
    @JsonBackReference()
    private List<Vacancy> vacancies;



}