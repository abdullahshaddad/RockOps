package com.example.backend.controllers;

import com.example.backend.dto.JobPositionDTO;
import com.example.backend.models.Employee;
import com.example.backend.models.JobPosition;
import com.example.backend.repositories.JobPositionRepository;
import com.example.backend.services.JobPositionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/job-positions")
public class JobPositionController {

    @Autowired
    private JobPositionService jobPositionService;

    @Autowired
    private JobPositionRepository jobPositionRepository;

    /**
     * Create a new job position using DTO
     */
    @PostMapping("/dto")
    public ResponseEntity<JobPositionDTO> createJobPositionDTO(@RequestBody JobPositionDTO jobPositionDTO) {
        return ResponseEntity.ok(jobPositionService.createJobPosition(jobPositionDTO));
    }

    /**
     * Get all job positions as DTOs
     */
    @GetMapping("")
    public ResponseEntity<List<JobPositionDTO>> getAllJobPositionDTOs() {
        return ResponseEntity.ok(jobPositionService.getAllJobPositionDTOs());
    }

    /**
     * Get a job position by ID as DTO
     */
    @GetMapping("/dto/{id}")
    public ResponseEntity<JobPositionDTO> getJobPositionDTOById(@PathVariable UUID id) {
        return ResponseEntity.ok(jobPositionService.getJobPositionDTOById(id));
    }

    /**
     * Update a job position using DTO
     */
    @PutMapping("/dto/{id}")
    public ResponseEntity<JobPositionDTO> updateJobPositionDTO(@PathVariable UUID id, @RequestBody JobPositionDTO jobPositionDTO) {
        return ResponseEntity.ok(jobPositionService.updateJobPosition(id, jobPositionDTO));
    }

    /**
     * Delete a job position
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobPosition(@PathVariable UUID id) {
        jobPositionService.deleteJobPosition(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Original methods using Map/Entity for backward compatibility
     */
    @PostMapping("")
    public ResponseEntity<JobPosition> createJobPosition(@RequestBody Map<String, Object> jobPositionMap) {
        return ResponseEntity.ok(jobPositionService.createJobPosition(jobPositionMap));
    }

//    @GetMapping("")
//    public ResponseEntity<List<JobPosition>> getAllJobPositions() {
//        return ResponseEntity.ok(jobPositionRepository.findAll());
//    }

    @GetMapping("/{id}")
    public ResponseEntity<JobPosition> getJobPositionById(@PathVariable UUID id) {
        return ResponseEntity.ok(jobPositionService.getJobPositionById(id));
    }

    @GetMapping("/{id}/employees")
    public ResponseEntity<List<Employee>> getEmployeesByJobPositionId(@PathVariable UUID id) {
        return ResponseEntity.ok(jobPositionService.getEmployeesByJobPositionId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobPosition> updateJobPosition(@PathVariable UUID id, @RequestBody Map<String, Object> jobPositionMap) {
        return ResponseEntity.ok(jobPositionService.updateJobPosition(id, jobPositionMap));
    }
}