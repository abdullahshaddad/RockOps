package com.example.backend.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Employee
{
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    private String middleName;

    private LocalDate birthDate;

    private String email;

    private String phoneNumber;

    private String address;

    private String city;

    private String country;

    private String maritalStatus;

    private String militaryStatus;

    private String nationalIDNumber;

    private String license;

    private LocalDate hireDate;

    private String managerName;

    private String education;

    // Image fields
    @Column(length = 1024) // Increase length to accommodate longer URLs
    private String photoUrl;

    @Column(length = 1024) // Increase length to accommodate longer URLs
    private String idFrontImage;

    @Column(length = 1024) // Increase length to accommodate longer URLs
    private String idBackImage;


    private String gender;

    private String status;  // ACTIVE, O N_LEAVE, SUSPENDED, TERMINATED

    // Additional salary attributes
    private BigDecimal baseSalaryOverride;

    private String contractType;

    // Relationships
    @ManyToOne
    @JoinColumn(name = "site_id", referencedColumnName = "id")
    @JsonManagedReference
    private Site site;

    @ManyToOne
    @JoinColumn(name = "warehouse_id", referencedColumnName = "id")
    @JsonBackReference("warehouse-employee") // Update this annotation
    private Warehouse warehouse;

    @ManyToOne
    @JsonManagedReference
    @JoinColumn(name = "job_position_id", referencedColumnName = "id")
    private JobPosition jobPosition;

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference
    private List<Attendance> attendances;


    // Helper methods
    public String getFullName() {
        if (middleName != null && !middleName.isEmpty()) {
            return firstName + " " + middleName + " " + lastName;
        }
        return firstName + " " + lastName;
    }

    /**
     * Get the base salary for this employee
     * If a base salary override is set, use that value
     * Otherwise, use the job position's base salary
     * @return The base salary as BigDecimal
     */
    public BigDecimal getBaseSalary() {
        // If override is set, use that
        if (baseSalaryOverride != null) {
            return baseSalaryOverride;
        }

        // Otherwise use job position's salary if available
        if (jobPosition != null && jobPosition.getBaseSalary() != null) {
            return BigDecimal.valueOf(jobPosition.getBaseSalary());
        }

        // Default to zero if no salary data available
        return BigDecimal.ZERO;
    }

    /**
     * Calculate the monthly salary
     * @return Monthly salary amount
     */
    public BigDecimal getMonthlySalary() {
        return getBaseSalary()
                .divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
    }

    /**
     * Calculate the annual total compensation
     * @return Annual total
     */
    public BigDecimal getAnnualTotalCompensation() {
        return getBaseSalary();
    }
}