package com.example.backend.repositories.hr;

import com.example.backend.models.hr.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {

    List<Attendance> findByEmployeeId(UUID employeeId);

    List<Attendance> findByEmployeeIdAndDateBetween(UUID employeeId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT a FROM Attendance a WHERE a.employee.id = :employeeId AND EXTRACT(YEAR FROM a.date) = :year AND EXTRACT(MONTH FROM a.date) = :month")
    List<Attendance> findByEmployeeIdAndYearAndMonth(UUID employeeId, int year, int month);

    List<Attendance> findByDateAndEmployeeIdIn(LocalDate date, List<UUID> employeeIds);
}