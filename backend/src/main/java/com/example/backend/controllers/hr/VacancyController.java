package com.example.backend.controllers;

import com.example.backend.models.Vacancy;
import com.example.backend.services.VacancyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/vacancies")
public class VacancyController {

    @Autowired
    private VacancyService vacancyService;

    // Create a new vacancy
    @PostMapping
    public ResponseEntity<Vacancy> createVacancy(@RequestBody Map<String, Object> vacancyData) {
        Vacancy createdVacancy = vacancyService.createVacancy(vacancyData);
        return ResponseEntity.ok(createdVacancy);
    }

    // Get all vacancies
    @GetMapping
    public ResponseEntity<List<Vacancy>> getAllVacancies() {
        List<Vacancy> vacancies = vacancyService.getAllVacancies();
        return ResponseEntity.ok(vacancies);
    }

    // Get a specific vacancy by ID
    @GetMapping("/{id}")
    public ResponseEntity<Vacancy> getVacancyById(@PathVariable UUID id) {
        Vacancy vacancy = vacancyService.getVacancyById(id);
        return ResponseEntity.ok(vacancy);
    }

    // Update an existing vacancy
    @PutMapping("/{id}")
    public ResponseEntity<Vacancy> updateVacancy(@PathVariable UUID id, @RequestBody Vacancy vacancyDetails) {
        Vacancy updatedVacancy = vacancyService.updateVacancy(id, vacancyDetails);
        return ResponseEntity.ok(updatedVacancy);
    }

    // Delete a vacancy
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVacancy(@PathVariable UUID id) {
        vacancyService.deleteVacancy(id);
        return ResponseEntity.noContent().build();
    }
}
