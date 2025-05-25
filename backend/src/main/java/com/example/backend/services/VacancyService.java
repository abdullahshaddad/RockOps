package com.example.backend.services.hr;

import com.example.backend.models.JobPosition;
import com.example.backend.models.Vacancy;
import com.example.backend.repositories.JobPositionRepository;
import com.example.backend.repositories.VacancyRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class VacancyService {

    @Autowired
    private VacancyRepository vacancyRepository;

    @Autowired
    private JobPositionRepository jobPositionRepository;

    public List<Vacancy> getAllVacancies() {
        return vacancyRepository.findAll();
    }

    public Vacancy getVacancyById(UUID id) {
        return vacancyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vacancy not found with id: " + id));
    }


    @Transactional
    public Vacancy createVacancy(Map<String, Object> vacancyData) {
        Vacancy vacancy = new Vacancy();

        // Set required fields
        vacancy.setTitle((String) vacancyData.get("title"));
        vacancy.setDescription((String) vacancyData.get("description"));

        // Set optional fields with null checks
        if (vacancyData.get("requirements") != null) {
            vacancy.setRequirements((String) vacancyData.get("requirements"));
        }

        if (vacancyData.get("responsibilities") != null) {
            vacancy.setResponsibilities((String) vacancyData.get("responsibilities"));
        }

        // Handle job position if provided
        if (vacancyData.get("jobPosition") != null) {
            Map<String, Object> jobPositionData = (Map<String, Object>) vacancyData.get("jobPosition");
            if (jobPositionData.get("id") != null) {
                UUID jobPositionId = UUID.fromString(jobPositionData.get("id").toString());
                JobPosition jobPosition = jobPositionRepository.findById(jobPositionId)
                        .orElseThrow(() -> new EntityNotFoundException("Job position not found"));
                vacancy.setJobPosition(jobPosition);
            }
        }

        // Parse and set dates
        if (vacancyData.get("closingDate") != null) {
            vacancy.setClosingDate(LocalDate.parse((String) vacancyData.get("closingDate")));
        }

        // Set posting date (default to today if not provided)
        if (vacancyData.get("postingDate") != null) {
            vacancy.setPostingDate(LocalDate.parse((String) vacancyData.get("postingDate")));
        } else {
            vacancy.setPostingDate(LocalDate.now());
        }

        // Set status (default to OPEN if not provided)
        if (vacancyData.get("status") != null) {
            vacancy.setStatus((String) vacancyData.get("status"));
        } else {
            vacancy.setStatus("OPEN");
        }

        // Set number of positions
        if (vacancyData.get("numberOfPositions") != null) {
            vacancy.setNumberOfPositions(Integer.valueOf(vacancyData.get("numberOfPositions").toString()));
        }

        // Set priority
        if (vacancyData.get("priority") != null) {
            vacancy.setPriority((String) vacancyData.get("priority"));
        }

        return vacancyRepository.save(vacancy);
    }

    @Transactional
    public Vacancy updateVacancy(UUID id, Vacancy updatedVacancy) {
        Vacancy existingVacancy = getVacancyById(id);

        // Update basic fields
        existingVacancy.setTitle(updatedVacancy.getTitle());
        existingVacancy.setDescription(updatedVacancy.getDescription());
        existingVacancy.setRequirements(updatedVacancy.getRequirements());
        existingVacancy.setResponsibilities(updatedVacancy.getResponsibilities());
        existingVacancy.setClosingDate(updatedVacancy.getClosingDate());
        existingVacancy.setStatus(updatedVacancy.getStatus());
        existingVacancy.setNumberOfPositions(updatedVacancy.getNumberOfPositions());
        existingVacancy.setPriority(updatedVacancy.getPriority());

        // Update job position if provided
        if (updatedVacancy.getJobPosition() != null && updatedVacancy.getJobPosition().getId() != null) {
            JobPosition jobPosition = jobPositionRepository.findById(updatedVacancy.getJobPosition().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Job position not found"));
            existingVacancy.setJobPosition(jobPosition);
        }

        return vacancyRepository.save(existingVacancy);
    }

    @Transactional
    public void deleteVacancy(UUID id) {
        Vacancy vacancy = getVacancyById(id);
        vacancyRepository.delete(vacancy);
    }

    @Transactional
    public Vacancy updateVacancyStatus(UUID id, String status) {
        Vacancy vacancy = getVacancyById(id);
        vacancy.setStatus(status);
        return vacancyRepository.save(vacancy);
    }

    public List<Vacancy> findByJobPosition(UUID jobPositionId) {
        JobPosition jobPosition = jobPositionRepository.findById(jobPositionId)
                .orElseThrow(() -> new EntityNotFoundException("Job position not found with id: " + jobPositionId));
        return vacancyRepository.findByJobPosition(jobPosition);
    }

    public List<Vacancy> findByStatus(String status) {
        return vacancyRepository.findByStatus(status);
    }
}