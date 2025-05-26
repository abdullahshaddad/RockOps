package com.example.backend.services.hr;

import com.example.backend.models.hr.Vacancy;
import com.example.backend.models.hr.Candidate;
import com.example.backend.models.hr.JobPosition;
import com.example.backend.repositories.VacancyRepository;
import com.example.backend.repositories.hr.CandidateRepository;
import com.example.backend.repositories.hr.JobPositionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VacancyService {

    @Autowired
    private VacancyRepository vacancyRepository;

    @Autowired
    private JobPositionRepository jobPositionRepository;

    @Autowired
    private CandidateRepository candidateRepository;

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

        vacancy.setTitle((String) vacancyData.get("title"));
        vacancy.setDescription((String) vacancyData.get("description"));
        vacancy.setRequirements((String) vacancyData.get("requirements"));
        vacancy.setResponsibilities((String) vacancyData.get("responsibilities"));
        vacancy.setStatus((String) vacancyData.get("status"));
        vacancy.setPriority((String) vacancyData.get("priority"));
        vacancy.setHiredCount(0); // Initialize hired count

        // Handle dates
        if (vacancyData.get("postingDate") != null) {
            vacancy.setPostingDate(LocalDate.parse((String) vacancyData.get("postingDate")));
        }
        if (vacancyData.get("closingDate") != null) {
            vacancy.setClosingDate(LocalDate.parse((String) vacancyData.get("closingDate")));
        }

        // Handle number of positions
        if (vacancyData.get("numberOfPositions") != null) {
            vacancy.setNumberOfPositions((Integer) vacancyData.get("numberOfPositions"));
        }

        // Handle job position
        if (vacancyData.get("jobPosition") != null) {
            Map<String, Object> jobPositionData = (Map<String, Object>) vacancyData.get("jobPosition");
            if (jobPositionData.get("id") != null) {
                String jobPositionId = (String) jobPositionData.get("id");
                JobPosition jobPosition = jobPositionRepository.findById(UUID.fromString(jobPositionId))
                        .orElseThrow(() -> new EntityNotFoundException("Job position not found"));
                vacancy.setJobPosition(jobPosition);
            }
        }

        return vacancyRepository.save(vacancy);
    }

    @Transactional
    public Vacancy updateVacancy(UUID id, Vacancy vacancyDetails) {
        Vacancy vacancy = getVacancyById(id);

        vacancy.setTitle(vacancyDetails.getTitle());
        vacancy.setDescription(vacancyDetails.getDescription());
        vacancy.setRequirements(vacancyDetails.getRequirements());
        vacancy.setResponsibilities(vacancyDetails.getResponsibilities());
        vacancy.setPostingDate(vacancyDetails.getPostingDate());
        vacancy.setClosingDate(vacancyDetails.getClosingDate());
        vacancy.setStatus(vacancyDetails.getStatus());
        vacancy.setNumberOfPositions(vacancyDetails.getNumberOfPositions());
        vacancy.setPriority(vacancyDetails.getPriority());
        vacancy.setJobPosition(vacancyDetails.getJobPosition());

        return vacancyRepository.save(vacancy);
    }

    @Transactional
    public void deleteVacancy(UUID id) {
        if (!vacancyRepository.existsById(id)) {
            throw new EntityNotFoundException("Vacancy not found with id: " + id);
        }

        // Handle candidates when deleting vacancy
        List<Candidate> candidates = candidateRepository.findByVacancyId(id);
        for (Candidate candidate : candidates) {
            if (candidate.getCandidateStatus() == Candidate.CandidateStatus.POTENTIAL) {
                // Keep potential candidates but remove vacancy association
                candidate.setVacancy(null);
                candidateRepository.save(candidate);
            }
        }

        vacancyRepository.deleteById(id);
    }

    /**
     * Hire a candidate and update vacancy position count
     */
    @Transactional
    public void hireCandidate(UUID candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new EntityNotFoundException("Candidate not found"));

        Vacancy vacancy = candidate.getVacancy();
        if (vacancy == null) {
            throw new IllegalStateException("Candidate is not associated with any vacancy");
        }

        // Check if vacancy has available positions
        if (!vacancy.hasAvailablePositions()) {
            throw new IllegalStateException("No available positions in this vacancy");
        }

        // Update candidate status
        candidate.setCandidateStatus(Candidate.CandidateStatus.HIRED);
        candidate.setHiredDate(LocalDate.now());
        candidateRepository.save(candidate);

        // Update vacancy hired count
        vacancy.incrementHiredCount();
        vacancyRepository.save(vacancy);

        // Move remaining candidates to potential list if vacancy is now full
        if (vacancy.isFull()) {
            moveCandidatesToPotentialList(vacancy.getId());
        }
    }

    /**
     * Move candidates to potential list when vacancy becomes full
     */
    @Transactional
    public void moveCandidatesToPotentialList(UUID vacancyId) {
        List<Candidate> activeCandidates = candidateRepository.findByVacancyId(vacancyId)
                .stream()
                .filter(Candidate::isActive)
                .collect(Collectors.toList());

        for (Candidate candidate : activeCandidates) {
            candidate.setCandidateStatus(Candidate.CandidateStatus.POTENTIAL);
            candidateRepository.save(candidate);
        }
    }

    /**
     * Get vacancy statistics including position information
     */
    public Map<String, Object> getVacancyStatistics(UUID vacancyId) {
        Vacancy vacancy = getVacancyById(vacancyId);
        List<Candidate> candidates = candidateRepository.findByVacancyId(vacancyId);

        long appliedCount = candidates.stream()
                .filter(c -> c.getCandidateStatus() == Candidate.CandidateStatus.APPLIED)
                .count();
        long underReviewCount = candidates.stream()
                .filter(c -> c.getCandidateStatus() == Candidate.CandidateStatus.UNDER_REVIEW)
                .count();
        long interviewedCount = candidates.stream()
                .filter(c -> c.getCandidateStatus() == Candidate.CandidateStatus.INTERVIEWED)
                .count();
        long hiredCount = candidates.stream()
                .filter(c -> c.getCandidateStatus() == Candidate.CandidateStatus.HIRED)
                .count();
        long potentialCount = candidates.stream()
                .filter(c -> c.getCandidateStatus() == Candidate.CandidateStatus.POTENTIAL)
                .count();

        return Map.of(
                "totalPositions", vacancy.getNumberOfPositions(),
                "remainingPositions", vacancy.getRemainingPositions(),
                "hiredCount", vacancy.getHiredCount(),
                "filledPercentage", vacancy.getFilledPercentage(),
                "isFull", vacancy.isFull(),
                "candidateStats", Map.of(
                        "applied", appliedCount,
                        "underReview", underReviewCount,
                        "interviewed", interviewedCount,
                        "hired", hiredCount,
                        "potential", potentialCount,
                        "total", candidates.size()
                )
        );
    }

    /**
     * Get potential candidates (from filled vacancies)
     */
    public List<Candidate> getPotentialCandidates() {
        return candidateRepository.findAll().stream()
                .filter(c -> c.getCandidateStatus() == Candidate.CandidateStatus.POTENTIAL)
                .collect(Collectors.toList());
    }
}