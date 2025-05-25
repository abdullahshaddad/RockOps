package com.example.backend.services;

import com.example.backend.services.finance.equipment.finance.models.hr.Attendance;
import com.example.backend.services.finance.equipment.finance.models.hr.AttendanceStatus;
import com.example.backend.services.finance.equipment.finance.models.hr.AttendanceType;
import com.example.backend.services.finance.equipment.finance.models.hr.Employee;
import com.example.backend.repositories.hr.AttendanceRepository;
import com.example.backend.repositories.hr.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    /**
     * Get all attendance records for a specific employee
     */
    public List<Map<String, Object>> getAttendanceByEmployeeId(UUID employeeId) {
        List<Attendance> attendances = attendanceRepository.findByEmployeeId(employeeId);
        return convertAttendanceListToMapList(attendances, employeeId);
    }

    /**
     * Get monthly attendance for an employee
     */
    public List<Map<String, Object>> getMonthlyAttendance(UUID employeeId, int year, int month) {
        List<Attendance> attendances = attendanceRepository.findByEmployeeIdAndYearAndMonth(employeeId, year, month);
        return convertAttendanceListToMapList(attendances, employeeId);
    }

    /**
     * Create attendance for a full-time employee for a whole month
     */
    @Transactional
    public List<Map<String, Object>> generateMonthlyAttendance(UUID employeeId, int year, int month) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (employee.getJobPosition() == null ||
                !employee.getJobPosition().getType().equals("FULL_TIME")) {
            throw new IllegalArgumentException("Employee must have a FULL_TIME job position");
        }

        // Default to 5 working days per week if not specified
        int workingDaysPerWeek = 5;
        if (employee.getJobPosition().getWorkingDays() != null) {
            workingDaysPerWeek = employee.getJobPosition().getWorkingDays();
        }

        // Generate a list of working dates for the month
        List<LocalDate> workingDates = generateWorkingDatesForMonth(year, month, workingDaysPerWeek);

        List<Attendance> attendances = new ArrayList<>();
        for (LocalDate date : workingDates) {
            Attendance attendance = Attendance.builder()
                    .employee(employee)
                    .date(date)
                    .status(AttendanceStatus.ABSENT) // Default to absent
                    .type(AttendanceType.FULL_TIME)
                    .isHoliday(false)
                    .isLeave(false)
                    .build();

            attendances.add(attendance);
        }

        List<Attendance> savedAttendances = attendanceRepository.saveAll(attendances);
        return convertAttendanceListToMapList(savedAttendances, employeeId);
    }

    /**
     * Record attendance for hourly employee
     */
    @Transactional
    public Map<String, Object> recordHourlyAttendance(UUID employeeId, LocalDate date,
                                                      LocalTime startTime, LocalTime endTime) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (employee.getJobPosition() == null ||
                !employee.getJobPosition().getType().equals("HOURLY")) {
            throw new IllegalArgumentException("Employee must have an HOURLY job position");
        }

        Attendance attendance = Attendance.builder()
                .employee(employee)
                .date(date)
                .startTime(startTime)
                .endTime(endTime)
                .type(AttendanceType.HOURLY)
                .build();

        // Calculate hours worked
        if (startTime != null && endTime != null) {
            Duration duration = Duration.between(startTime, endTime);
            double hoursWorked = duration.toMinutes() / 60.0;

            // Calculate overtime if applicable (assuming 8 hours standard workday)
            if (hoursWorked > 8) {
                attendance.setOvertimeHours(hoursWorked - 8);
            }
        }

        Attendance savedAttendance = attendanceRepository.save(attendance);
        return convertAttendanceToMap(savedAttendance, employeeId);
    }

    /**
     * Record attendance for daily worker
     */
    @Transactional
    public Map<String, Object> recordDailyAttendance(UUID employeeId, LocalDate date) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (employee.getJobPosition() == null ||
                !employee.getJobPosition().getType().equals("DAILY")) {
            throw new IllegalArgumentException("Employee must have a DAILY job position");
        }

        Attendance attendance = Attendance.builder()
                .employee(employee)
                .date(date)
                .status(AttendanceStatus.PRESENT)
                .type(AttendanceType.DAILY)
                .build();

        Attendance savedAttendance = attendanceRepository.save(attendance);
        return convertAttendanceToMap(savedAttendance, employeeId);
    }

    /**
     * Update attendance status for full-time employee
     */
    @Transactional
    public Map<String, Object> updateAttendanceStatus(UUID attendanceId, AttendanceStatus status) {
        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new RuntimeException("Attendance record not found"));

        attendance.setStatus(status);
        Attendance savedAttendance = attendanceRepository.save(attendance);
        return convertAttendanceToMap(savedAttendance, savedAttendance.getEmployee().getId());
    }

    /**
     * Mark employee as present for a specific date
     */
    @Transactional
    public Map<String, Object> markPresent(UUID employeeId, LocalDate date) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        List<Attendance> existingAttendance = attendanceRepository.findByEmployeeIdAndDateBetween(
                employeeId, date, date);

        Attendance savedAttendance;
        if (!existingAttendance.isEmpty()) {
            Attendance attendance = existingAttendance.get(0);
            attendance.setStatus(AttendanceStatus.PRESENT);
            savedAttendance = attendanceRepository.save(attendance);
        } else {
            Attendance attendance = Attendance.builder()
                    .employee(employee)
                    .date(date)
                    .status(AttendanceStatus.PRESENT)
                    .type(AttendanceType.valueOf(employee.getJobPosition().getType()))
                    .build();

            savedAttendance = attendanceRepository.save(attendance);
        }

        return convertAttendanceToMap(savedAttendance, employeeId);
    }

    /**
     * Helper method to convert Attendance to Map
     */
    private Map<String, Object> convertAttendanceToMap(Attendance attendance, UUID employeeId) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", attendance.getId().toString());
        result.put("date", attendance.getDate().toString());
        result.put("status", attendance.getStatus() != null ? attendance.getStatus().name() : null);
        result.put("type", attendance.getType() != null ? attendance.getType().name() : null);

        // Format times as strings if present
        result.put("startTime", attendance.getStartTime() != null ?
                attendance.getStartTime().toString() : null);
        result.put("endTime", attendance.getEndTime() != null ?
                attendance.getEndTime().toString() : null);

        result.put("notes", attendance.getNotes());
        result.put("isHoliday", attendance.getIsHoliday());
        result.put("isLeave", attendance.getIsLeave());
        result.put("overtimeHours", attendance.getOvertimeHours());

        // Add employee ID only - avoid serializing the entire employee
        result.put("employeeId", employeeId.toString());

        return result;
    }

    /**
     * Helper method to convert Attendance list to Map list
     */
    private List<Map<String, Object>> convertAttendanceListToMapList(List<Attendance> attendances, UUID employeeId) {
        return attendances.stream()
                .map(attendance -> convertAttendanceToMap(attendance, employeeId))
                .collect(Collectors.toList());
    }

    /**
     * Generate working dates for a month, excluding weekends
     */
    private List<LocalDate> generateWorkingDatesForMonth(int year, int month, int workingDaysPerWeek) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        List<LocalDate> workingDates = new ArrayList<>();
        LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {
            // Assuming Friday is DayOfWeek.FRIDAY (5) and Saturday is DayOfWeek.SATURDAY (6)
            // If workingDaysPerWeek is 5, then Friday and Saturday are weekends
            if (workingDaysPerWeek == 5 &&
                    (currentDate.getDayOfWeek() != DayOfWeek.FRIDAY &&
                            currentDate.getDayOfWeek() != DayOfWeek.SATURDAY)) {
                workingDates.add(currentDate);
            }
            // If workingDaysPerWeek is 6, then only Saturday is a weekend
            else if (workingDaysPerWeek == 6 &&
                    currentDate.getDayOfWeek() != DayOfWeek.SATURDAY) {
                workingDates.add(currentDate);
            }

            currentDate = currentDate.plusDays(1);
        }

        return workingDates;
    }

    /**
     * Get attendance summary for a specific day
     */
    public Map<String, List<Map<String, Object>>> getDailyAttendanceSummary(LocalDate date) {
        List<Employee> employees = employeeRepository.findAll();
        List<UUID> employeeIds = employees.stream().map(Employee::getId).collect(Collectors.toList());

        List<Attendance> attendances = attendanceRepository.findByDateAndEmployeeIdIn(date, employeeIds);

        Map<String, List<Map<String, Object>>> summary = new HashMap<>();
        summary.put("present", new ArrayList<>());
        summary.put("absent", new ArrayList<>());
        summary.put("late", new ArrayList<>());
        summary.put("leave", new ArrayList<>());

        // Create a map for quick access to attendance by employee ID
        Map<UUID, Attendance> attendanceByEmployeeId = attendances.stream()
                .collect(Collectors.toMap(a -> a.getEmployee().getId(), a -> a));

        for (Employee employee : employees) {
            Attendance attendance = attendanceByEmployeeId.get(employee.getId());

            Map<String, Object> employeeData = new HashMap<>();
            employeeData.put("id", employee.getId());
            employeeData.put("name", employee.getFirstName() + " " + employee.getLastName());
            employeeData.put("position", employee.getJobPosition() != null ?
                    employee.getJobPosition().getPositionName() : "");
            employeeData.put("department", employee.getJobPosition() != null && employee.getJobPosition().getDepartment() != null ? employee.getJobPosition().getDepartment().getName() : "");

            if (attendance == null) {
                // If no attendance record exists for this employee on this date
                if (employee.getJobPosition() != null &&
                        employee.getJobPosition().getType().equals("FULL_TIME")) {
                    summary.get("absent").add(employeeData);
                }
            } else {
                if (attendance.getIsLeave() != null && attendance.getIsLeave()) {
                    summary.get("leave").add(employeeData);
                } else if (attendance.getStatus() == AttendanceStatus.PRESENT) {
                    summary.get("present").add(employeeData);
                } else if (attendance.getStatus() == AttendanceStatus.LATE) {
                    summary.get("late").add(employeeData);
                } else if (attendance.getStatus() == AttendanceStatus.ABSENT) {
                    summary.get("absent").add(employeeData);
                }
            }
        }

        return summary;
    }
}