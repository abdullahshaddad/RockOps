package com.example.backend.repositories;

import com.example.backend.models.hr.JobPosition;
import com.example.backend.models.hr.Vacancy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VacancyRepository extends JpaRepository<Vacancy, UUID> {
    List<Vacancy> findByJobPosition(JobPosition jobPosition);
    List<Vacancy> findByStatus(String status);
}