package com.example.backend.repositories;

import com.example.backend.repositories.finance.models.hr.Candidate;
import com.example.backend.repositories.finance.models.Vacancy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, UUID> {

    // Find all candidates for a specific vacancy
    List<Candidate> findByVacancy(Vacancy vacancy);

    // Find all candidates for a specific vacancy ID
    List<Candidate> findByVacancyId(UUID vacancyId);

    // Find candidates by name (for search functionality)
    List<Candidate> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(String firstName, String lastName);

    // Find candidates by email
    Candidate findByEmail(String email);

    // Find candidates by status (if you add a status field later)
    // List<Candidate> findByStatus(String status);
}