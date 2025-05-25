package com.example.backend.controllers;

import com.example.backend.models.Department;
import com.example.backend.services.DepartmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/departments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DepartmentController {

    private static final Logger logger = LoggerFactory.getLogger(DepartmentController.class);

    @Autowired
    private DepartmentService departmentService;

    @GetMapping
    public ResponseEntity<?> getAllDepartments() {
        try {
            logger.info("Fetching all departments...");
            List<Department> departments = departmentService.getAllDepartments();
            logger.info("Successfully fetched {} departments", departments.size());
            return ResponseEntity.ok(departments);
        } catch (Exception e) {
            logger.error("Error fetching departments: ", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch departments");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("type", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDepartmentById(@PathVariable UUID id) {
        try {
            logger.info("Fetching department with id: {}", id);
            Optional<Department> department = departmentService.getDepartmentById(id);
            if (department.isPresent()) {
                logger.info("Found department: {}", department.get().getName());
                return ResponseEntity.ok(department.get());
            } else {
                logger.warn("Department not found with id: {}", id);
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Department not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
        } catch (Exception e) {
            logger.error("Error fetching department by id {}: ", id, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch department");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping
    public ResponseEntity<?> createDepartment(@RequestBody Department department) {
        try {
            logger.info("Creating department with name: {}", department.getName());
            Department createdDepartment = departmentService.createDepartment(department);
            logger.info("Successfully created department with id: {}", createdDepartment.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdDepartment);
        } catch (IllegalArgumentException e) {
            logger.warn("Validation error creating department: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            logger.error("Error creating department: ", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create department");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("type", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDepartment(@PathVariable UUID id, @RequestBody Department department) {
        try {
            logger.info("Updating department with id: {}", id);
            Department updatedDepartment = departmentService.updateDepartment(id, department);
            logger.info("Successfully updated department: {}", updatedDepartment.getName());
            return ResponseEntity.ok(updatedDepartment);
        } catch (IllegalArgumentException e) {
            logger.warn("Validation error updating department: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                logger.warn("Department not found for update: {}", id);
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", e.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            logger.error("Error updating department: ", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update department");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDepartment(@PathVariable UUID id) {
        try {
            logger.info("Deleting department with id: {}", id);
            departmentService.deleteDepartment(id);
            logger.info("Successfully deleted department with id: {}", id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Department deleted successfully");
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            logger.warn("Cannot delete department: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                logger.warn("Department not found for deletion: {}", id);
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", e.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            logger.error("Error deleting department: ", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete department");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Simple endpoint to test if the controller is working
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> testEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "ok");
        response.put("message", "Department controller is working");
        return ResponseEntity.ok(response);
    }
}