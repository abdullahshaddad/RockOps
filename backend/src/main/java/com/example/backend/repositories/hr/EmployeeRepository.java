package com.example.backend.repositories.hr;

import com.example.backend.models.hr.Employee;
import com.example.backend.models.site.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, UUID> { // Using UUID

    // Find by department
    @Query("SELECT e FROM Employee e JOIN e.jobPosition jp WHERE jp.department.name = :departmentName")
    List<Employee> findByJobPositionDepartment(String departmentName);

    @Query("SELECT e FROM Employee e JOIN e.jobPosition jp WHERE jp.positionName = :positionName")
    List<Employee> findByJobPositionName(String positionName);

    // Count by status
    long countByStatus(String status);

    // Count new hires
    long countByHireDateAfter(LocalDate date);

    // Find by job position
    List<Employee> findByJobPositionId(UUID jobPositionId); // Changed to UUID

    // Find by site
    List<Employee> findBySiteId(UUID siteId);

    // Find by site object
    List<Employee> findBySite(Site site);
}