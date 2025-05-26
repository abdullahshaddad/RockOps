package com.example.backend.repositories.hr;

import com.example.backend.models.hr.JobPosition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobPositionRepository extends JpaRepository<JobPosition, UUID> {

    List<JobPosition> findByPositionNameContainingIgnoreCaseOrDepartmentContainingIgnoreCase(
            String positionNameSearch, String departmentSearch, Sort sort);

    Page<JobPosition> findByPositionNameContainingIgnoreCase(String search, Pageable pageable);

    Optional<JobPosition> findById(UUID jobPositionId);

    List<JobPosition> findByDepartment_NameContainingIgnoreCase(String departmentName);
}