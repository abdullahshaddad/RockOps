package com.example.backend.services.hr;

import com.example.backend.services.MinioService;
import com.example.backend.models.hr.Candidate;
import com.example.backend.models.hr.Vacancy;
import com.example.backend.repositories.hr.CandidateRepository;
import com.example.backend.repositories.hr.EmployeeRepository;
import com.example.backend.repositories.VacancyRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class CandidateService {

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private VacancyRepository vacancyRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private MinioService minioService;

    // Get all candidates
    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }

    // Get candidate by ID
    public Candidate getCandidateById(UUID id) {
        return candidateRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Candidate not found with id: " + id));
    }

    // Get candidates by vacancy ID
    public List<Candidate> getCandidatesByVacancyId(UUID vacancyId) {
        return candidateRepository.findByVacancyId(vacancyId);
    }

    @Transactional
    public Map<String, Object> createCandidate(Map<String, Object> candidateData, MultipartFile resumeFile) {
        Candidate candidate = new Candidate();

        candidate.setFirstName((String) candidateData.get("firstName"));
        candidate.setLastName((String) candidateData.get("lastName"));
        candidate.setEmail((String) candidateData.get("email"));
        candidate.setPhoneNumber((String) candidateData.get("phoneNumber"));
        candidate.setCountry((String) candidateData.get("country"));
        candidate.setCurrentPosition((String) candidateData.get("currentPosition"));
        candidate.setCurrentCompany((String) candidateData.get("currentCompany"));
        candidate.setNotes((String) candidateData.get("notes"));

        if (candidateData.get("applicationDate") != null && !((String) candidateData.get("applicationDate")).trim().isEmpty()) {
            candidate.setApplicationDate(LocalDate.parse((String) candidateData.get("applicationDate")));
        } else {
            candidate.setApplicationDate(LocalDate.now());
        }

        if (candidateData.get("vacancyId") != null) {
            UUID vacancyId = UUID.fromString((String) candidateData.get("vacancyId"));
            Vacancy vacancy = vacancyRepository.findById(vacancyId)
                    .orElseThrow(() -> new EntityNotFoundException("Vacancy not found with id: " + vacancyId));
            candidate.setVacancy(vacancy);
        }

        if (resumeFile != null && !resumeFile.isEmpty()) {
            try {
                String fileName = "resumes/" + UUID.randomUUID() + "_" + resumeFile.getOriginalFilename();
                minioService.uploadFile(resumeFile, fileName);
                String fileUrl = minioService.getFileUrl(fileName);
                candidate.setResumeUrl(fileUrl);
            } catch (Exception e) {
                throw new RuntimeException("Could not upload resume: " + e.getMessage());
            }
        }

        Candidate savedCandidate = candidateRepository.save(candidate);

        // Now convert the saved candidate entity to Map<String, Object> for return
        Map<String, Object> response = new HashMap<>();
        response.put("id", savedCandidate.getId());
        response.put("firstName", savedCandidate.getFirstName());
        response.put("lastName", savedCandidate.getLastName());
        response.put("email", savedCandidate.getEmail());
        response.put("phoneNumber", savedCandidate.getPhoneNumber());
        response.put("country", savedCandidate.getCountry());
        response.put("currentPosition", savedCandidate.getCurrentPosition());
        response.put("currentCompany", savedCandidate.getCurrentCompany());
        response.put("notes", savedCandidate.getNotes());
        response.put("applicationDate", savedCandidate.getApplicationDate());
        response.put("resumeUrl", savedCandidate.getResumeUrl());

        if (savedCandidate.getVacancy() != null) {
            response.put("vacancyId", savedCandidate.getVacancy().getId());
        }

        return response;
    }


    // Update an existing candidate
    @Transactional
    public Candidate updateCandidate(UUID id, Map<String, Object> candidateData, MultipartFile resumeFile) {
        Candidate candidate = getCandidateById(id);

        // Update basic properties if provided
        if (candidateData.get("firstName") != null) {
            candidate.setFirstName((String) candidateData.get("firstName"));
        }

        if (candidateData.get("lastName") != null) {
            candidate.setLastName((String) candidateData.get("lastName"));
        }

        if (candidateData.get("email") != null) {
            candidate.setEmail((String) candidateData.get("email"));
        }

        if (candidateData.get("phoneNumber") != null) {
            candidate.setPhoneNumber((String) candidateData.get("phoneNumber"));
        }

        if (candidateData.get("country") != null) {
            candidate.setCountry((String) candidateData.get("country"));
        }

        if (candidateData.get("currentPosition") != null) {
            candidate.setCurrentPosition((String) candidateData.get("currentPosition"));
        }

        if (candidateData.get("currentCompany") != null) {
            candidate.setCurrentCompany((String) candidateData.get("currentCompany"));
        }

        if (candidateData.get("notes") != null) {
            candidate.setNotes((String) candidateData.get("notes"));
        }

        if (candidateData.get("applicationDate") != null && !((String) candidateData.get("applicationDate")).trim().isEmpty()) {
            candidate.setApplicationDate(LocalDate.parse((String) candidateData.get("applicationDate")));
        }

        // Update vacancy if provided
        if (candidateData.get("vacancyId") != null) {
            UUID vacancyId = UUID.fromString((String) candidateData.get("vacancyId"));
            Vacancy vacancy = vacancyRepository.findById(vacancyId)
                    .orElseThrow(() -> new EntityNotFoundException("Vacancy not found with id: " + vacancyId));
            candidate.setVacancy(vacancy);
        }

        // Upload new resume if provided
        if (resumeFile != null && !resumeFile.isEmpty()) {
            try {
                // Delete old resume file if exists
                // Implement deletion logic here if needed

                // Upload new resume
                String fileName = "resumes/" + UUID.randomUUID() + "_" + resumeFile.getOriginalFilename();
                minioService.uploadFile(resumeFile, fileName);
                String fileUrl = minioService.getFileUrl(fileName);
                candidate.setResumeUrl(fileUrl);
            } catch (Exception e) {
                throw new RuntimeException("Could not upload resume: " + e.getMessage());
            }
        }

        return candidateRepository.save(candidate);
    }

    // Delete a candidate
    @Transactional
    public void deleteCandidate(UUID id) {
        Candidate candidate = getCandidateById(id);

        // Delete resume file if exists
        if (candidate.getResumeUrl() != null && !candidate.getResumeUrl().isEmpty()) {
            try {
                // Extract file name from URL and delete
                // Implement deletion logic here if needed
            } catch (Exception e) {
                // Log error but continue with deletion
                System.err.println("Error deleting resume file: " + e.getMessage());
            }
        }

        candidateRepository.delete(candidate);
    }

    // Convert candidate to employee
    @Transactional
    public Map<String, Object> convertToEmployeeData(UUID candidateId) {
        Candidate candidate = getCandidateById(candidateId);

        // Create a map with employee initial data from candidate
        Map<String, Object> employeeData = Map.of(
                "firstName", candidate.getFirstName(),
                "lastName", candidate.getLastName(),
                "email", candidate.getEmail(),
                "phoneNumber", candidate.getPhoneNumber(),
                "country", candidate.getCountry(),
                "previousPosition", candidate.getCurrentPosition(),
                "previousCompany", candidate.getCurrentCompany(),
                "hireDate", LocalDate.now().toString()
                // Other fields will need to be filled in by the user
        );

        return employeeData;
    }

    // Update candidate status
    @Transactional
    public Candidate updateCandidateStatus(UUID candidateId, String newStatus) {
        Candidate candidate = getCandidateById(candidateId);
        
        try {
            Candidate.CandidateStatus status = Candidate.CandidateStatus.valueOf(newStatus.toUpperCase());
            candidate.setCandidateStatus(status);
            
            // Set hired date if status is HIRED
            if (status == Candidate.CandidateStatus.HIRED) {
                candidate.setHiredDate(LocalDate.now());
            }
            
            return candidateRepository.save(candidate);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid candidate status: " + newStatus);
        }
    }
}