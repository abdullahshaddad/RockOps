package com.example.backend.services;

import com.example.backend.dto.hr.EmployeeDistributionDTO;
import com.example.backend.dto.hr.EmployeeRequestDTO;
import com.example.backend.dto.hr.SalaryStatisticsDTO;
import com.example.backend.services.finance.equipment.finance.models.hr.Employee;
import com.example.backend.services.finance.equipment.finance.models.hr.JobPosition;
import com.example.backend.services.finance.equipment.finance.models.site.Site;
import com.example.backend.repositories.hr.EmployeeRepository;
import com.example.backend.repositories.hr.JobPositionRepository;
import com.example.backend.repositories.site.SiteRepository;
import com.example.backend.repositories.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class HREmployeeService {

    // Subfolder in MinIO bucket for employee images
    private static final String EMPLOYEE_IMAGES_FOLDER = "employees";
    private final EmployeeRepository employeeRepository;
    private final SiteRepository siteRepository;
    private final JobPositionRepository jobPositionRepository;
    private final WarehouseRepository warehouseRepository;
    private final MinioService minioService;

    /**
     * Calculate and retrieve salary statistics
     */
    public SalaryStatisticsDTO getSalaryStatistics() {
        List<Employee> employees = employeeRepository.findAll();

        // Calculate total and average salaries
        BigDecimal totalSalary = BigDecimal.ZERO;
        Map<String, List<BigDecimal>> departmentSalaries = new HashMap<>();
        Map<String, List<BigDecimal>> experienceLevelSalaries = new HashMap<>();
        Map<String, BigDecimal> monthlySalaries = new HashMap<>();

        // Initialize past 12 months
        LocalDate now = LocalDate.now();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yyyy");
        for (int i = 11; i >= 0; i--) {
            LocalDate monthDate = now.minusMonths(i);
            monthlySalaries.put(monthDate.format(monthFormatter), BigDecimal.ZERO);
        }

        for (Employee employee : employees) {
            JobPosition position = employee.getJobPosition();
            if (position != null) {
                // Convert Double baseSalary from JobPosition to BigDecimal
                BigDecimal salary = BigDecimal.ZERO;
                if (position.getBaseSalary() != null) {
                    salary = BigDecimal.valueOf(position.getBaseSalary());
                }

                totalSalary = totalSalary.add(salary);

                // Add to department salaries
                String department = position.getDepartment() != null ? position.getDepartment().getName() : null;
                if (department != null) {
                    if (!departmentSalaries.containsKey(department)) {
                        departmentSalaries.put(department, new ArrayList<>());
                    }
                    departmentSalaries.get(department).add(salary);
                }

                // Add to experience level salaries
                String experienceLevel = position.getExperienceLevel();
                if (experienceLevel != null) {
                    if (!experienceLevelSalaries.containsKey(experienceLevel)) {
                        experienceLevelSalaries.put(experienceLevel, new ArrayList<>());
                    }
                    experienceLevelSalaries.get(experienceLevel).add(salary);
                }

                // Add salary data for monthly totals
                for (String month : monthlySalaries.keySet()) {
                    monthlySalaries.put(month, monthlySalaries.get(month).add(
                            salary.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP)));
                }
            }
        }

        int employeeCount = employees.size();
        BigDecimal averageSalary = employeeCount > 0
                ? totalSalary.divide(BigDecimal.valueOf(employeeCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Calculate department average salaries
        Map<String, BigDecimal> departmentAverageSalaries = new HashMap<>();
        for (Map.Entry<String, List<BigDecimal>> entry : departmentSalaries.entrySet()) {
            List<BigDecimal> salaries = entry.getValue();
            if (!salaries.isEmpty()) {
                BigDecimal total = salaries.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal average = total.divide(BigDecimal.valueOf(salaries.size()), 2, RoundingMode.HALF_UP);
                departmentAverageSalaries.put(entry.getKey(), average);
            }
        }

        // Calculate experience level average salaries
        Map<String, BigDecimal> experienceLevelAverageSalaries = new HashMap<>();
        for (Map.Entry<String, List<BigDecimal>> entry : experienceLevelSalaries.entrySet()) {
            List<BigDecimal> salaries = entry.getValue();
            if (!salaries.isEmpty()) {
                BigDecimal total = salaries.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal average = total.divide(BigDecimal.valueOf(salaries.size()), 2, RoundingMode.HALF_UP);
                experienceLevelAverageSalaries.put(entry.getKey(), average);
            }
        }

        return SalaryStatisticsDTO.builder()
                .averageSalary(averageSalary)
                .totalSalaries(totalSalary)
                .employeeCount(employeeCount)
                .departmentAverageSalaries(departmentAverageSalaries)
                .monthlySalaryTotals(monthlySalaries)
                .experienceLevelSalaries(experienceLevelAverageSalaries)
                .build();
    }

    /**
     * Get employee distribution by site
     */
    public List<EmployeeDistributionDTO> getEmployeeDistribution() {
        List<Site> sites = siteRepository.findAll();
        List<EmployeeDistributionDTO> distributions = new ArrayList<>();

        for (Site site : sites) {
            List<Employee> siteEmployees = employeeRepository.findBySite(site);

            // Count by department
            Map<String, Integer> departmentCounts = new HashMap<>();
            // Count by position
            Map<String, Integer> positionCounts = new HashMap<>();
            // Count by employment type
            Map<String, Integer> employmentTypeCounts = new HashMap<>();

            for (Employee employee : siteEmployees) {
                JobPosition position = employee.getJobPosition();
                if (position != null) {
                    // Count by department
                    String department = position.getDepartment() != null ? position.getDepartment().getName() : null;
                    if (department != null && !department.isEmpty()) {
                        departmentCounts.put(department, departmentCounts.getOrDefault(department, 0) + 1);
                    }

                    // Count by position
                    String positionName = position.getPositionName();
                    if (positionName != null && !positionName.isEmpty()) {
                        positionCounts.put(positionName, positionCounts.getOrDefault(positionName, 0) + 1);
                    }

                    // Count by employment type
                    String employmentType = position.getType();
                    if (employmentType != null && !employmentType.isEmpty()) {
                        employmentTypeCounts.put(employmentType, employmentTypeCounts.getOrDefault(employmentType, 0) + 1);
                    }
                } else {
                    // Default categories for employees without job positions
                    departmentCounts.put("Unassigned", departmentCounts.getOrDefault("Unassigned", 0) + 1);
                }
            }

            EmployeeDistributionDTO distribution = EmployeeDistributionDTO.builder()
                    .siteName(site.getName())
                    .siteLocation(site.getPhysicalAddress())
                    .totalEmployees(siteEmployees.size())
                    .departmentCounts(departmentCounts)
                    .positionCounts(positionCounts)
                    .employmentTypeCounts(employmentTypeCounts)
                    .build();

            distributions.add(distribution);
        }

        return distributions;
    }

    /**
     * Add a new employee with photos
     */
    @Transactional
    public Map<String, Object> addEmployee(
            EmployeeRequestDTO employeeData,
            MultipartFile photo,
            MultipartFile idFrontImage,
            MultipartFile idBackImage) {
        try {
            log.info("Starting employee creation");
            // Create employee entity from DTO
            Employee employee = mapToEntity(employeeData);

                employee.setSite(employee.getSite());


//            // Process the photo file if provided
//            if (photo != null && !photo.isEmpty()) {
//                String photoFileName = System.currentTimeMillis() + "_" + photo.getOriginalFilename();
//                try {
//                    // Store in the main bucket (just like sites)
//                    minioService.uploadFile(photo, photoFileName);
//                    String photoUrl = minioService.getFileUrl(photoFileName);  // Get the full URL
//                    employee.setPhotoUrl(photoUrl); // Set the full URL in the employee entity
//                    log.info("Uploaded employee photo: {}", photoFileName);
//                } catch (Exception e) {
//                    log.error("Error uploading employee photo", e);
//                }
//            }
//
//            // Process the ID front image if provided
//            if (idFrontImage != null && !idFrontImage.isEmpty()) {
//                String idFrontFileName = System.currentTimeMillis() + "_" + idFrontImage.getOriginalFilename();
//                try {
//                    // Store in the main bucket (just like sites)
//                    minioService.uploadFile(idFrontImage, idFrontFileName);
//                    String idFrontImageUrl = minioService.getFileUrl(idFrontFileName);  // Get the full URL
//                    employee.setIdFrontImage(idFrontImageUrl); // Set the full URL in the employee entity
//                    log.info("Uploaded employee ID front: {}", idFrontFileName);
//                } catch (Exception e) {
//                    log.error("Error uploading ID front image", e);
//                }
//            }
//
//            // Process the ID back image if provided
//            if (idBackImage != null && !idBackImage.isEmpty()) {
//                String idBackFileName = System.currentTimeMillis() + "_" + idBackImage.getOriginalFilename();
//                try {
//                    // Store in the main bucket (just like sites)
//                    minioService.uploadFile(idBackImage, idBackFileName);
//                    String idBackImageUrl = minioService.getFileUrl(idBackFileName);  // Get the full URL
//                    employee.setIdBackImage(idBackImageUrl); // Set the full URL in the employee entity
//                    log.info("Uploaded employee ID back: {}", idBackFileName);
//                } catch (Exception e) {
//                    log.error("Error uploading ID back image", e);
//                }
//            }
            employee.setPhotoUrl(employeeData.getPhotoUrl());
            employee.setIdFrontImage(employeeData.getIdFrontImage());
            employee.setIdBackImage(employeeData.getIdBackImage());
            // Save the employee entity (with updated image URLs)
            employee = employeeRepository.save(employee);
            log.info("Successfully saved employee with ID: {}", employee.getId());
            // Convert employee to Map with proper URLs (to return in the response)
            return convertEmployeeToMap(employee);
        } catch (Exception e) {
            log.error("Error creating employee: ", e);
            throw e;  // Re-throw the exception or handle accordingly
        }
    }

    /**
     * Update an existing employee
     */
    public Map<String, Object> updateEmployee(
            UUID id,
            EmployeeRequestDTO employeeData,
            MultipartFile photo,
            MultipartFile idFrontImage,
            MultipartFile idBackImage) {

        try {
            log.info("Starting employee update for ID: {}", id);

            // Find existing employee
            Employee existingEmployee = employeeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Employee not found"));

            // Update employee data
            updateEmployeeFromDTO(existingEmployee, employeeData);

            // Update site if provided in the request
            if (employeeData.getSiteId() != null) {
                Site site = siteRepository.findById(employeeData.getSiteId())
                        .orElseThrow(() -> new RuntimeException("Site not found with ID: " + employeeData.getSiteId()));
                existingEmployee.setSite(site);
                log.info("Updated site directly from request: {}", site.getName());
            }

            // Update photo if provided
            if (photo != null && !photo.isEmpty()) {
                String photoFileName = generateImageFileName(id, "photo", photo.getOriginalFilename());
                try {
                    minioService.uploadFile(photo, EMPLOYEE_IMAGES_FOLDER + "/" + photoFileName);
                    existingEmployee.setPhotoUrl(EMPLOYEE_IMAGES_FOLDER + "/" + photoFileName);
                } catch (Exception e) {
                    log.error("Error updating employee photo", e);
                    throw new RuntimeException("Failed to update employee photo: " + e.getMessage());
                }
            }

            // Update ID front image if provided
            if (idFrontImage != null && !idFrontImage.isEmpty()) {
                String idFrontFileName = generateImageFileName(id, "id_front", idFrontImage.getOriginalFilename());
                try {
                    minioService.uploadFile(idFrontImage, EMPLOYEE_IMAGES_FOLDER + "/" + idFrontFileName);
                    existingEmployee.setIdFrontImage(EMPLOYEE_IMAGES_FOLDER + "/" + idFrontFileName);
                } catch (Exception e) {
                    log.error("Error updating ID front image", e);
                    throw new RuntimeException("Failed to update ID front image: " + e.getMessage());
                }
            }

            // Update ID back image if provided
            if (idBackImage != null && !idBackImage.isEmpty()) {
                String idBackFileName = generateImageFileName(id, "id_back", idBackImage.getOriginalFilename());
                try {
                    minioService.uploadFile(idBackImage, EMPLOYEE_IMAGES_FOLDER + "/" + idBackFileName);
                    existingEmployee.setIdBackImage(EMPLOYEE_IMAGES_FOLDER + "/" + idBackFileName);
                } catch (Exception e) {
                    log.error("Error updating ID back image", e);
                    throw new RuntimeException("Failed to update ID back image: " + e.getMessage());
                }
            }

            // Save updated employee
            Employee updatedEmployee = employeeRepository.save(existingEmployee);
            log.info("Successfully updated employee with ID: {}", updatedEmployee.getId());

            // Return response as Map
            return convertEmployeeToMap(updatedEmployee);

        } catch (Exception e) {
            log.error("Error updating employee: ", e);
            throw e;
        }
    }

    /**
     * Get employee by ID
     */
    public Map<String, Object> getEmployeeById(UUID id) {
        try {
            Employee employee = employeeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Employee not found"));


            return convertEmployeeToMap(employee);
        } catch (Exception e) {
            log.error("Error retrieving employee: ", e);
            throw e;
        }
    }

    /**
     * Delete employee by ID
     */
    public void deleteEmployee(UUID id) {
        try {
            log.info("Starting employee deletion for ID: {}", id);

            Employee employee = employeeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Employee not found"));

            // Delete images from MinIO
            try {
                if (employee.getPhotoUrl() != null) {
                    minioService.deleteFile(employee.getPhotoUrl());
                }

                if (employee.getIdFrontImage() != null) {
                    minioService.deleteFile(employee.getIdFrontImage());
                }

                if (employee.getIdBackImage() != null) {
                    minioService.deleteFile(employee.getIdBackImage());
                }
            } catch (Exception e) {
                log.error("Error deleting employee images", e);
                // Continue with employee deletion even if image deletion fails
            }

            employeeRepository.delete(employee);
            log.info("Successfully deleted employee with ID: {}", id);
        } catch (Exception e) {
            log.error("Error deleting employee: ", e);
            throw e;
        }
    }

    /**
     * Convert Employee entity to Map
     */
    private Map<String, Object> convertEmployeeToMap(Employee employee) {
        Map<String, Object> employeeMap = new HashMap<>();

        // Basic information
        employeeMap.put("id", employee.getId());
        employeeMap.put("firstName", employee.getFirstName());
        employeeMap.put("lastName", employee.getLastName());
        employeeMap.put("middleName", employee.getMiddleName());
        employeeMap.put("fullName", employee.getFullName());
        employeeMap.put("email", employee.getEmail());
        employeeMap.put("phoneNumber", employee.getPhoneNumber());

        // Address information
        employeeMap.put("address", employee.getAddress());
        employeeMap.put("city", employee.getCity());
        employeeMap.put("country", employee.getCountry());

        // Personal details
        employeeMap.put("gender", employee.getGender());
        employeeMap.put("birthDate", employee.getBirthDate());
        employeeMap.put("maritalStatus", employee.getMaritalStatus());
        employeeMap.put("militaryStatus", employee.getMilitaryStatus());
        employeeMap.put("nationalIDNumber", employee.getNationalIDNumber());
        employeeMap.put("education", employee.getEducation());

        // Employment details
        employeeMap.put("status", employee.getStatus());
        employeeMap.put("hireDate", employee.getHireDate());
        employeeMap.put("contractType", employee.getContractType());

        // Financial details
        employeeMap.put("baseSalary", employee.getBaseSalary());
        employeeMap.put("baseSalaryOverride", employee.getBaseSalaryOverride());
        employeeMap.put("monthlySalary", employee.getMonthlySalary());
        employeeMap.put("annualSalary", employee.getAnnualTotalCompensation());

        // Image URLs
        employeeMap.put("photoUrl", employee.getPhotoUrl());
        employeeMap.put("idFrontImage", employee.getIdFrontImage());
        employeeMap.put("idBackImage", employee.getIdBackImage());

        // Related entities
        if (employee.getJobPosition() != null) {
            Map<String, Object> jobPositionMap = new HashMap<>();
            JobPosition position = employee.getJobPosition();

            // Basic fields currently included
            jobPositionMap.put("id", position.getId());
            jobPositionMap.put("positionName", position.getPositionName());
            jobPositionMap.put("department", position.getDepartment() != null ? position.getDepartment().getName() : null);

            // Add all the missing fields
            jobPositionMap.put("head", position.getHead());
            jobPositionMap.put("baseSalary", position.getBaseSalary());
            jobPositionMap.put("probationPeriod", position.getProbationPeriod());
            jobPositionMap.put("type", position.getType());
            jobPositionMap.put("experienceLevel", position.getExperienceLevel());
            jobPositionMap.put("workingDays", position.getWorkingDays());
            jobPositionMap.put("shifts", position.getShifts());
            jobPositionMap.put("workingHours", position.getWorkingHours());
            jobPositionMap.put("vacations", position.getVacations());
            jobPositionMap.put("active", position.getActive());

            // Add the complete job position map to the employee map
            employeeMap.put("jobPosition", jobPositionMap);
        }

        if (employee.getSite() != null) {
            Map<String, Object> siteMap = new HashMap<>();
            siteMap.put("id", employee.getSite().getId());
            siteMap.put("name", employee.getSite().getName());
            employeeMap.put("site", siteMap);
        }

        return employeeMap;
    }

    /**
     * Generate a unique file name for an employee image
     */
    private String generateImageFileName(UUID employeeId, String imageType, String originalFilename) {
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        return employeeId + "/" + imageType + "_" + System.currentTimeMillis() + extension;
    }

    /**
     * Map DTO to entity
     */
    private Employee mapToEntity(EmployeeRequestDTO dto) {
        Employee employee = new Employee();

        // Set basic personal details
        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setMiddleName(dto.getMiddleName());
        employee.setEmail(dto.getEmail());
        employee.setPhoneNumber(dto.getPhoneNumber());
        employee.setAddress(dto.getAddress());
        employee.setCity(dto.getCity());
        employee.setCountry(dto.getCountry());
        employee.setMaritalStatus(dto.getMaritalStatus());
        employee.setMilitaryStatus(dto.getMilitaryStatus());
        employee.setNationalIDNumber(dto.getNationalIDNumber());
        employee.setGender(dto.getGender());
        employee.setStatus(dto.getStatus());
        employee.setEducation(dto.getEducation());

        // Set financial details
        employee.setBaseSalaryOverride(dto.getBaseSalaryOverride());

        // Set dates if provided
        if (dto.getBirthDate() != null) {
            employee.setBirthDate(LocalDate.parse(dto.getBirthDate()));
        }

        if (dto.getHireDate() != null) {
            employee.setHireDate(LocalDate.parse(dto.getHireDate()));
        }

        // Set job position
        if (dto.getJobPositionId() != null) {
            JobPosition jobPosition = jobPositionRepository.findById(dto.getJobPositionId())
                    .orElseThrow(() -> new RuntimeException("Job position not found"));
            employee.setJobPosition(jobPosition);

            // Set contract type from job position if needed
            if (employee.getContractType() == null && jobPosition.getType() != null) {
                employee.setContractType(jobPosition.getType());
            }
        }

        // Set site if provided in DTO
        if (dto.getSiteId() != null) {
            Site site = siteRepository.findById(dto.getSiteId())
                    .orElseThrow(() -> new RuntimeException("Site not found"));
            employee.setSite(site);
        }

        return employee;
    }

    /**
     * Update entity from DTO
     */
    private void updateEmployeeFromDTO(Employee employee, EmployeeRequestDTO dto) {
        // Update basic personal details if provided
        if (dto.getFirstName() != null) employee.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) employee.setLastName(dto.getLastName());
        if (dto.getMiddleName() != null) employee.setMiddleName(dto.getMiddleName());
        if (dto.getEmail() != null) employee.setEmail(dto.getEmail());
        if (dto.getPhoneNumber() != null) employee.setPhoneNumber(dto.getPhoneNumber());
        if (dto.getAddress() != null) employee.setAddress(dto.getAddress());
        if (dto.getCity() != null) employee.setCity(dto.getCity());
        if (dto.getCountry() != null) employee.setCountry(dto.getCountry());
        if (dto.getMaritalStatus() != null) employee.setMaritalStatus(dto.getMaritalStatus());
        if (dto.getMilitaryStatus() != null) employee.setMilitaryStatus(dto.getMilitaryStatus());
        if (dto.getNationalIDNumber() != null) employee.setNationalIDNumber(dto.getNationalIDNumber());
        if (dto.getGender() != null) employee.setGender(dto.getGender());
        if (dto.getStatus() != null) employee.setStatus(dto.getStatus());
        if (dto.getEducation() != null) employee.setEducation(dto.getEducation());
        if (dto.getBaseSalaryOverride() != null) employee.setBaseSalaryOverride(dto.getBaseSalaryOverride());

        // Update dates if provided
        if (dto.getBirthDate() != null) {
            employee.setBirthDate(LocalDate.parse(dto.getBirthDate()));
        }

        if (dto.getHireDate() != null) {
            employee.setHireDate(LocalDate.parse(dto.getHireDate()));
        }

        // Update job position if provided
        if (dto.getJobPositionId() != null) {
            JobPosition jobPosition = jobPositionRepository.findById(dto.getJobPositionId())
                    .orElseThrow(() -> new RuntimeException("Job position not found"));
            employee.setJobPosition(jobPosition);

            // Update contract type if not set
            if (employee.getContractType() == null && jobPosition.getType() != null) {
                employee.setContractType(jobPosition.getType());
            }
        }

        // Update site if provided
        if (dto.getSiteId() != null) {
            Site site = siteRepository.findById(dto.getSiteId())
                    .orElseThrow(() -> new RuntimeException("Site not found"));
            employee.setSite(site);
        }
    }
}