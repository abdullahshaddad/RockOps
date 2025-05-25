package com.example.backend.services;

import com.example.backend.dto.hr.JobPositionDTO;
import com.example.backend.services.finance.equipment.finance.models.hr.Department;
import com.example.backend.services.finance.equipment.finance.models.hr.Employee;
import com.example.backend.services.finance.equipment.finance.models.hr.JobPosition;
import com.example.backend.repositories.hr.DepartmentRepository;
import com.example.backend.repositories.hr.JobPositionRepository;
import com.example.backend.repositories.site.SiteRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class JobPositionService {
    private static final Logger logger = LoggerFactory.getLogger(JobPositionService.class);

    @Autowired
    private JobPositionRepository jobPositionRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private SiteRepository siteRepository;

    /**
     * Convert JobPosition entity to JobPositionDTO
     */
    private JobPositionDTO convertToDTO(JobPosition jobPosition) {
        if (jobPosition == null) {
            return null;
        }

        JobPositionDTO dto = new JobPositionDTO();
        dto.setId(jobPosition.getId());
        dto.setPositionName(jobPosition.getPositionName());
        dto.setDepartment(jobPosition.getDepartment() != null ? jobPosition.getDepartment().getName() : null);
        dto.setHead(jobPosition.getHead());
        dto.setBaseSalary(jobPosition.getBaseSalary());
        dto.setProbationPeriod(jobPosition.getProbationPeriod());
        dto.setType(jobPosition.getType());
        dto.setExperienceLevel(jobPosition.getExperienceLevel());
        dto.setWorkingDays(jobPosition.getWorkingDays());
        dto.setShifts(jobPosition.getShifts());
        dto.setWorkingHours(jobPosition.getWorkingHours());
        dto.setVacations(jobPosition.getVacations());
        dto.setActive(jobPosition.getActive());

        return dto;
    }

    /**
     * Convert list of JobPosition entities to list of JobPositionDTOs
     */
    private List<JobPositionDTO> convertToDTOList(List<JobPosition> jobPositions) {
        if (jobPositions == null) {
            return null;
        }

        return jobPositions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create a new job position from DTO
     */
    @Transactional
    public JobPositionDTO createJobPosition(JobPositionDTO jobPositionDTO) {
        // Find the department if a department name is provided
        Department department = null;
        if (jobPositionDTO.getDepartment() != null) {
            department = departmentRepository.findByName(jobPositionDTO.getDepartment())
                    .orElseThrow(() -> new RuntimeException("Department not found: " + jobPositionDTO.getDepartment()));
        }

        // Set active to true by default if not provided
        if (jobPositionDTO.getActive() == null) {
            jobPositionDTO.setActive(true);
        }

        // Create new job position
        JobPosition jobPosition = new JobPosition();

        // Set all fields from DTO
        jobPosition.setPositionName(jobPositionDTO.getPositionName());
        jobPosition.setDepartment(department);
        jobPosition.setHead(jobPositionDTO.getHead());
        jobPosition.setBaseSalary(jobPositionDTO.getBaseSalary());
        jobPosition.setProbationPeriod(jobPositionDTO.getProbationPeriod());
        jobPosition.setType(jobPositionDTO.getType());
        jobPosition.setExperienceLevel(jobPositionDTO.getExperienceLevel());
        jobPosition.setWorkingDays(jobPositionDTO.getWorkingDays());
        jobPosition.setShifts(jobPositionDTO.getShifts());
        jobPosition.setWorkingHours(jobPositionDTO.getWorkingHours());
        jobPosition.setVacations(jobPositionDTO.getVacations());
        jobPosition.setActive(jobPositionDTO.getActive());

        // Save the entity
        JobPosition savedJobPosition = jobPositionRepository.save(jobPosition);

        // Convert back to DTO and return
        return convertToDTO(savedJobPosition);
    }

    /**
     * Get a job position by ID as DTO
     */
    public JobPositionDTO getJobPositionDTOById(UUID id) {
        JobPosition jobPosition = jobPositionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job position not found with id: " + id));
        return convertToDTO(jobPosition);
    }

    /**
     * Get all job positions as DTOs with eager loading of sites
     */
    public List<JobPositionDTO> getAllJobPositionDTOs() {
        List<JobPosition> jobPositions = jobPositionRepository.findAll();

        // Log number of positions found
        logger.debug("Found " + jobPositions.size() + " job positions");

        return convertToDTOList(jobPositions);
    }

    /**
     * Update a job position from DTO
     */
    @Transactional
    public JobPositionDTO updateJobPosition(UUID id, JobPositionDTO jobPositionDTO) {
        // Find the existing job position
        JobPosition existingJobPosition = jobPositionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job position not found with id: " + id));

        // Update department if provided
        if (jobPositionDTO.getDepartment() != null) {
            Department department = departmentRepository.findByName(jobPositionDTO.getDepartment())
                    .orElseThrow(() -> new RuntimeException("Department not found: " + jobPositionDTO.getDepartment()));
            existingJobPosition.setDepartment(department);
        }

        // Update other fields if provided
        if (jobPositionDTO.getPositionName() != null) {
            existingJobPosition.setPositionName(jobPositionDTO.getPositionName());
        }

        if (jobPositionDTO.getHead() != null) {
            existingJobPosition.setHead(jobPositionDTO.getHead());
        }

        if (jobPositionDTO.getBaseSalary() != null) {
            existingJobPosition.setBaseSalary(jobPositionDTO.getBaseSalary());
        }

        if (jobPositionDTO.getProbationPeriod() != null) {
            existingJobPosition.setProbationPeriod(jobPositionDTO.getProbationPeriod());
        }

        if (jobPositionDTO.getType() != null) {
            existingJobPosition.setType(jobPositionDTO.getType());
        }

        if (jobPositionDTO.getExperienceLevel() != null) {
            existingJobPosition.setExperienceLevel(jobPositionDTO.getExperienceLevel());
        }

        if (jobPositionDTO.getWorkingDays() != null) {
            existingJobPosition.setWorkingDays(jobPositionDTO.getWorkingDays());
        }

        if (jobPositionDTO.getShifts() != null) {
            existingJobPosition.setShifts(jobPositionDTO.getShifts());
        }

        if (jobPositionDTO.getWorkingHours() != null) {
            existingJobPosition.setWorkingHours(jobPositionDTO.getWorkingHours());
        }

        if (jobPositionDTO.getVacations() != null) {
            existingJobPosition.setVacations(jobPositionDTO.getVacations());
        }

        if (jobPositionDTO.getActive() != null) {
            existingJobPosition.setActive(jobPositionDTO.getActive());
        }

        // Save the updated entity
        JobPosition updatedJobPosition = jobPositionRepository.save(existingJobPosition);

        // Convert back to DTO and return
        return convertToDTO(updatedJobPosition);
    }

    /**
     * Delete a job position by ID
     */
    @Transactional
    public void deleteJobPosition(UUID id) {
        if (!jobPositionRepository.existsById(id)) {
            throw new RuntimeException("Job position not found with id: " + id);
        }
        jobPositionRepository.deleteById(id);
    }

    /**
     * Get a job position by ID (entity method)
     */
    public JobPosition getJobPositionById(UUID id) {
        return jobPositionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job position not found with id: " + id));
    }

    /**
     * Get employees by job position ID
     */
    public List<Employee> getEmployeesByJobPositionId(UUID jobPositionId) {
        JobPosition jobPosition = getJobPositionById(jobPositionId);
        return jobPosition.getEmployees();
    }

    /**
     * Create job position from Map (original method for backward compatibility)
     */
    @Transactional
    public JobPosition createJobPosition(Map<String, Object> jobPositionMap) {
        // Create a new JobPosition object
        JobPosition jobPosition = new JobPosition();

        // Set position name
        if (jobPositionMap.containsKey("positionName")) {
            jobPosition.setPositionName((String) jobPositionMap.get("positionName"));
        }

        // Set department
        if (jobPositionMap.containsKey("department")) {
            String departmentName = (String) jobPositionMap.get("department");
            Department department = departmentRepository.findByName(departmentName)
                    .orElseThrow(() -> new RuntimeException("Department not found: " + departmentName));
            jobPosition.setDepartment(department);
        }

        // Set head
        if (jobPositionMap.containsKey("head")) {
            jobPosition.setHead((String) jobPositionMap.get("head"));
        }

        // Set base salary
        if (jobPositionMap.containsKey("baseSalary")) {
            Object salaryObj = jobPositionMap.get("baseSalary");
            try {
                if (salaryObj instanceof Integer) {
                    jobPosition.setBaseSalary(((Integer) salaryObj).doubleValue());
                } else if (salaryObj instanceof Double) {
                    jobPosition.setBaseSalary((Double) salaryObj);
                } else if (salaryObj instanceof String) {
                    jobPosition.setBaseSalary(Double.parseDouble((String) salaryObj));
                }
            } catch (NumberFormatException e) {
                throw new RuntimeException("Invalid base salary format");
            }
        }

        // Set probation period
        if (jobPositionMap.containsKey("probationPeriod")) {
            try {
                Object probationObj = jobPositionMap.get("probationPeriod");
                if (probationObj instanceof Integer) {
                    jobPosition.setProbationPeriod((Integer) probationObj);
                } else if (probationObj instanceof String) {
                    jobPosition.setProbationPeriod(Integer.parseInt((String) probationObj));
                }
            } catch (NumberFormatException e) {
                throw new RuntimeException("Invalid probation period format");
            }
        }

        // Set type
        if (jobPositionMap.containsKey("type")) {
            jobPosition.setType((String) jobPositionMap.get("type"));
        }

        // Set experience level
        if (jobPositionMap.containsKey("experienceLevel")) {
            jobPosition.setExperienceLevel((String) jobPositionMap.get("experienceLevel"));
        }

        // Set working days
        if (jobPositionMap.containsKey("workingDays")) {
            try {
                Object daysObj = jobPositionMap.get("workingDays");
                if (daysObj instanceof Integer) {
                    jobPosition.setWorkingDays((Integer) daysObj);
                } else if (daysObj instanceof String) {
                    jobPosition.setWorkingDays(Integer.parseInt((String) daysObj));
                }
            } catch (NumberFormatException e) {
                throw new RuntimeException("Invalid working days format");
            }
        }

        // Set shifts
        if (jobPositionMap.containsKey("shifts")) {
            jobPosition.setShifts((String) jobPositionMap.get("shifts"));
        }

        // Set working hours
        if (jobPositionMap.containsKey("workingHours")) {
            try {
                Object hoursObj = jobPositionMap.get("workingHours");
                if (hoursObj instanceof Integer) {
                    jobPosition.setWorkingHours((Integer) hoursObj);
                } else if (hoursObj instanceof String) {
                    jobPosition.setWorkingHours(Integer.parseInt((String) hoursObj));
                }
            } catch (NumberFormatException e) {
                throw new RuntimeException("Invalid working hours format");
            }
        }

        // Set vacations
        if (jobPositionMap.containsKey("vacations")) {
            jobPosition.setVacations((String) jobPositionMap.get("vacations"));
        }

        // Set active to true by default if not provided
        if (jobPositionMap.containsKey("active")) {
            jobPosition.setActive((Boolean) jobPositionMap.get("active"));
        } else {
            jobPosition.setActive(true);
        }

        // Save and return the job position
        return jobPositionRepository.save(jobPosition);
    }

    /**
     * Update job position from Map (original method for backward compatibility)
     */
    @Transactional
    public JobPosition updateJobPosition(UUID id, Map<String, Object> jobPositionMap) {
        // Find the existing job position
        JobPosition existingJobPosition = jobPositionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job position not found with id: " + id));

        // Update position name
        if (jobPositionMap.containsKey("positionName")) {
            existingJobPosition.setPositionName((String) jobPositionMap.get("positionName"));
        }

        // Update department
        if (jobPositionMap.containsKey("department")) {
            String departmentName = (String) jobPositionMap.get("department");
            Department department = departmentRepository.findByName(departmentName)
                .orElseThrow(() -> new RuntimeException("Department not found: " + departmentName));
            existingJobPosition.setDepartment(department);
        }

        // Update head
        if (jobPositionMap.containsKey("head")) {
            existingJobPosition.setHead((String) jobPositionMap.get("head"));
        }

        // Update base salary
        if (jobPositionMap.containsKey("baseSalary")) {
            Object salaryObj = jobPositionMap.get("baseSalary");
            try {
                if (salaryObj instanceof Integer) {
                    existingJobPosition.setBaseSalary(((Integer) salaryObj).doubleValue());
                } else if (salaryObj instanceof Double) {
                    existingJobPosition.setBaseSalary((Double) salaryObj);
                } else if (salaryObj instanceof String) {
                    existingJobPosition.setBaseSalary(Double.parseDouble((String) salaryObj));
                }
            } catch (NumberFormatException e) {
                throw new RuntimeException("Invalid base salary format");
            }
        }

        // Update probation period
        if (jobPositionMap.containsKey("probationPeriod")) {
            try {
                Object probationObj = jobPositionMap.get("probationPeriod");
                if (probationObj instanceof Integer) {
                    existingJobPosition.setProbationPeriod((Integer) probationObj);
                } else if (probationObj instanceof String) {
                    existingJobPosition.setProbationPeriod(Integer.parseInt((String) probationObj));
                }
            } catch (NumberFormatException e) {
                throw new RuntimeException("Invalid probation period format");
            }
        }

        // Update type
        if (jobPositionMap.containsKey("type")) {
            existingJobPosition.setType((String) jobPositionMap.get("type"));
        }

        // Update experience level
        if (jobPositionMap.containsKey("experienceLevel")) {
            existingJobPosition.setExperienceLevel((String) jobPositionMap.get("experienceLevel"));
        }

        // Update working days
        if (jobPositionMap.containsKey("workingDays")) {
            try {
                Object daysObj = jobPositionMap.get("workingDays");
                if (daysObj instanceof Integer) {
                    existingJobPosition.setWorkingDays((Integer) daysObj);
                } else if (daysObj instanceof String) {
                    existingJobPosition.setWorkingDays(Integer.parseInt((String) daysObj));
                }
            } catch (NumberFormatException e) {
                throw new RuntimeException("Invalid working days format");
            }
        }

        // Update shifts
        if (jobPositionMap.containsKey("shifts")) {
            existingJobPosition.setShifts((String) jobPositionMap.get("shifts"));
        }

        // Update working hours
        if (jobPositionMap.containsKey("workingHours")) {
            try {
                Object hoursObj = jobPositionMap.get("workingHours");
                if (hoursObj instanceof Integer) {
                    existingJobPosition.setWorkingHours((Integer) hoursObj);
                } else if (hoursObj instanceof String) {
                    existingJobPosition.setWorkingHours(Integer.parseInt((String) hoursObj));
                }
            } catch (NumberFormatException e) {
                throw new RuntimeException("Invalid working hours format");
            }
        }

        // Update vacations
        if (jobPositionMap.containsKey("vacations")) {
            existingJobPosition.setVacations((String) jobPositionMap.get("vacations"));
        }

        // Update active status
        if (jobPositionMap.containsKey("active")) {
            existingJobPosition.setActive((Boolean) jobPositionMap.get("active"));
        }

        // Save and return the updated job position
        return jobPositionRepository.save(existingJobPosition);
    }
}