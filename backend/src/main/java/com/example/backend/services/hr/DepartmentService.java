package com.example.backend.services;

import com.example.backend.services.finance.equipment.finance.models.hr.Department;
import com.example.backend.repositories.hr.DepartmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class DepartmentService {

    private static final Logger logger = LoggerFactory.getLogger(DepartmentService.class);

    @Autowired
    private DepartmentRepository departmentRepository;

    public List<Department> getAllDepartments() {
        try {
            logger.info("Fetching departments from repository...");
            List<Department> departments = departmentRepository.findAll();
            logger.info("Found {} departments", departments.size());

            // Don't force lazy loading for now to avoid issues
            return departments;
        } catch (Exception e) {
            logger.error("Error in getAllDepartments: ", e);
            throw new RuntimeException("Failed to fetch departments: " + e.getMessage());
        }
    }

    public Optional<Department> getDepartmentById(UUID id) {
        try {
            logger.info("Fetching department by id: {}", id);
            return departmentRepository.findById(id);
        } catch (Exception e) {
            logger.error("Error in getDepartmentById: ", e);
            throw new RuntimeException("Failed to fetch department: " + e.getMessage());
        }
    }

    public Department createDepartment(Department department) {
        try {
            logger.info("Creating department: {}", department.getName());

            // Basic validation
            if (department.getName() == null || department.getName().trim().isEmpty()) {
                throw new IllegalArgumentException("Department name is required");
            }

            // Set ID to null to let JPA generate it
            department.setId(null);

            // Trim whitespace
            department.setName(department.getName().trim());
            if (department.getDescription() != null) {
                department.setDescription(department.getDescription().trim());
                if (department.getDescription().isEmpty()) {
                    department.setDescription(null);
                }
            }

            // Initialize jobPositions list to prevent null issues
            if (department.getJobPositions() == null) {
                department.setJobPositions(new java.util.ArrayList<>());
            }

            Department saved = departmentRepository.save(department);
            logger.info("Successfully created department with id: {}", saved.getId());
            return saved;

        } catch (IllegalArgumentException e) {
            logger.warn("Validation error: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error creating department: ", e);
            throw new RuntimeException("Failed to create department: " + e.getMessage());
        }
    }

    public Department updateDepartment(UUID id, Department departmentDetails) {
        try {
            logger.info("Updating department with id: {}", id);

            Department existingDepartment = departmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));

            // Validate
            if (departmentDetails.getName() == null || departmentDetails.getName().trim().isEmpty()) {
                throw new IllegalArgumentException("Department name is required");
            }

            // Update fields
            existingDepartment.setName(departmentDetails.getName().trim());
            existingDepartment.setDescription(
                    departmentDetails.getDescription() != null ?
                            departmentDetails.getDescription().trim() : null
            );

            Department updated = departmentRepository.save(existingDepartment);
            logger.info("Successfully updated department: {}", updated.getName());
            return updated;

        } catch (IllegalArgumentException e) {
            logger.warn("Validation error: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error updating department: ", e);
            throw new RuntimeException("Failed to update department: " + e.getMessage());
        }
    }

    public void deleteDepartment(UUID id) {
        try {
            logger.info("Deleting department with id: {}", id);

            Department department = departmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));

            departmentRepository.delete(department);
            logger.info("Successfully deleted department");

        } catch (Exception e) {
            logger.error("Error deleting department: ", e);
            throw new RuntimeException("Failed to delete department: " + e.getMessage());
        }
    }

    public boolean existsByName(String name) {
        try {
            return departmentRepository.existsByName(name);
        } catch (Exception e) {
            logger.error("Error checking if department exists: ", e);
            return false;
        }
    }

    public long getTotalCount() {
        try {
            return departmentRepository.count();
        } catch (Exception e) {
            logger.error("Error getting department count: ", e);
            return 0;
        }
    }
}