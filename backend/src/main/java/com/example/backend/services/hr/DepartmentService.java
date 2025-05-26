package com.example.backend.services.hr;

import com.example.backend.models.hr.Department;
import com.example.backend.repositories.hr.DepartmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class DepartmentService {

    private static final Logger logger = LoggerFactory.getLogger(DepartmentService.class);

    @Autowired
    private DepartmentRepository departmentRepository;

    /**
     * Get all departments as Map objects
     */
    public List<Map<String, Object>> getAllDepartmentsAsMap() {
        try {
            logger.info("Fetching departments from repository...");
            List<Department> departments = departmentRepository.findAll();
            logger.info("Found {} departments", departments.size());

            return departments.stream()
                    .map(this::convertDepartmentToMap)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error in getAllDepartmentsAsMap: ", e);
            throw new RuntimeException("Failed to fetch departments: " + e.getMessage());
        }
    }

    /**
     * Get department by ID as Map
     */
    public Map<String, Object> getDepartmentByIdAsMap(UUID id) {
        try {
            logger.info("Fetching department by id: {}", id);
            Optional<Department> departmentOpt = departmentRepository.findById(id);
            if (departmentOpt.isPresent()) {
                return convertDepartmentToMap(departmentOpt.get());
            }
            return null;
        } catch (Exception e) {
            logger.error("Error in getDepartmentByIdAsMap: ", e);
            throw new RuntimeException("Failed to fetch department: " + e.getMessage());
        }
    }

    /**
     * Create department from Map
     */
    @Transactional
    public Map<String, Object> createDepartmentFromMap(Map<String, Object> departmentData) {
        try {
            logger.info("Creating department: {}", departmentData.get("name"));

            // Basic validation
            if (departmentData.get("name") == null ||
                    departmentData.get("name").toString().trim().isEmpty()) {
                throw new IllegalArgumentException("Department name is required");
            }

            String name = departmentData.get("name").toString().trim();
            String description = departmentData.get("description") != null ?
                    departmentData.get("description").toString().trim() : null;

            // Check if department with same name already exists
            if (departmentRepository.existsByName(name)) {
                throw new IllegalArgumentException("Department with name '" + name + "' already exists");
            }

            // Create new department
            Department department = Department.builder()
                    .name(name)
                    .description(description != null && !description.isEmpty() ? description : null)
                    .jobPositions(new ArrayList<>())
                    .build();

            Department savedDepartment = departmentRepository.save(department);
            logger.info("Successfully created department with id: {}", savedDepartment.getId());

            return convertDepartmentToMap(savedDepartment);

        } catch (IllegalArgumentException e) {
            logger.warn("Validation error: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error creating department: ", e);
            throw new RuntimeException("Failed to create department: " + e.getMessage());
        }
    }

    /**
     * Update department from Map
     */
    @Transactional
    public Map<String, Object> updateDepartmentFromMap(UUID id, Map<String, Object> departmentData) {
        try {
            logger.info("Updating department with id: {}", id);

            Department existingDepartment = departmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));

            // Validate name if provided
            if (departmentData.get("name") != null) {
                String newName = departmentData.get("name").toString().trim();
                if (newName.isEmpty()) {
                    throw new IllegalArgumentException("Department name cannot be empty");
                }

                // Check if another department with the same name exists
                if (!existingDepartment.getName().equals(newName) &&
                        departmentRepository.existsByName(newName)) {
                    throw new IllegalArgumentException("Department with name '" + newName + "' already exists");
                }

                existingDepartment.setName(newName);
            }

            // Update description if provided
            if (departmentData.containsKey("description")) {
                String description = departmentData.get("description") != null ?
                        departmentData.get("description").toString().trim() : null;
                existingDepartment.setDescription(description != null && !description.isEmpty() ? description : null);
            }

            Department updatedDepartment = departmentRepository.save(existingDepartment);
            logger.info("Successfully updated department: {}", updatedDepartment.getName());

            return convertDepartmentToMap(updatedDepartment);

        } catch (IllegalArgumentException e) {
            logger.warn("Validation error: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error updating department: ", e);
            throw new RuntimeException("Failed to update department: " + e.getMessage());
        }
    }

    /**
     * Delete department by ID
     */
    @Transactional
    public void deleteDepartment(UUID id) {
        try {
            logger.info("Deleting department with id: {}", id);

            Department department = departmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));

            // Check if department has job positions
            long jobPositionCount = departmentRepository.countJobPositionsByDepartmentId(id);
            if (jobPositionCount > 0) {
                throw new IllegalStateException("Cannot delete department with existing job positions. " +
                        "Please reassign or delete the " + jobPositionCount + " job position(s) first.");
            }

            departmentRepository.delete(department);
            logger.info("Successfully deleted department");

        } catch (Exception e) {
            logger.error("Error deleting department: ", e);
            if (e instanceof IllegalStateException) {
                throw e;
            }
            throw new RuntimeException("Failed to delete department: " + e.getMessage());
        }
    }

    /**
     * Convert Department entity to Map
     */
    private Map<String, Object> convertDepartmentToMap(Department department) {
        Map<String, Object> departmentMap = new HashMap<>();

        departmentMap.put("id", department.getId());
        departmentMap.put("name", department.getName());
        departmentMap.put("description", department.getDescription());

        // Add job positions count without loading the entire collection
        int jobPositionCount = department.getJobPositions() != null ?
                department.getJobPositions().size() : 0;
        departmentMap.put("jobPositionCount", jobPositionCount);

        // Add basic job position info if available (without triggering lazy loading issues)
        if (department.getJobPositions() != null && !department.getJobPositions().isEmpty()) {
            List<Map<String, Object>> jobPositions = department.getJobPositions().stream()
                    .map(jobPosition -> {
                        Map<String, Object> jpMap = new HashMap<>();
                        jpMap.put("id", jobPosition.getId());
                        jpMap.put("positionName", jobPosition.getPositionName());
                        jpMap.put("type", jobPosition.getType());
                        jpMap.put("active", jobPosition.getActive());
                        return jpMap;
                    })
                    .collect(Collectors.toList());
            departmentMap.put("jobPositions", jobPositions);
        } else {
            departmentMap.put("jobPositions", new ArrayList<>());
        }

        return departmentMap;
    }

    // Keep original methods for backward compatibility
    public List<Department> getAllDepartments() {
        try {
            logger.info("Fetching departments from repository...");
            List<Department> departments = departmentRepository.findAll();
            logger.info("Found {} departments", departments.size());
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
                department.setJobPositions(new ArrayList<>());
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