package com.example.backend.controllers.hr;

import com.example.backend.models.hr.AttendanceStatus;
import com.example.backend.services.hr.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Map<String, Object>>> getEmployeeAttendance(
            @PathVariable UUID employeeId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByEmployeeId(employeeId));
    }

    @GetMapping("/employee/{employeeId}/monthly")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyAttendance(
            @PathVariable UUID employeeId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(attendanceService.getMonthlyAttendance(employeeId, year, month));
    }

    @PostMapping("/generate-monthly")
    public ResponseEntity<List<Map<String, Object>>> generateMonthlyAttendance(
            @RequestParam UUID employeeId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(attendanceService.generateMonthlyAttendance(employeeId, year, month));
    }

    @PostMapping("/hourly")
    public ResponseEntity<Map<String, Object>> recordHourlyAttendance(
            @RequestParam UUID employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime) {
        return ResponseEntity.ok(attendanceService.recordHourlyAttendance(employeeId, date, startTime, endTime));
    }

    @PostMapping("/daily")
    public ResponseEntity<Map<String, Object>> recordDailyAttendance(
            @RequestParam UUID employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.recordDailyAttendance(employeeId, date));
    }

    @PutMapping("/{attendanceId}/status")
    public ResponseEntity<Map<String, Object>> updateAttendanceStatus(
            @PathVariable UUID attendanceId,
            @RequestParam AttendanceStatus status) {
        return ResponseEntity.ok(attendanceService.updateAttendanceStatus(attendanceId, status));
    }

    @PostMapping("/mark-present")
    public ResponseEntity<Map<String, Object>> markPresent(
            @RequestParam UUID employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.markPresent(employeeId, date));
    }

    @GetMapping("/daily-summary")
    public ResponseEntity<Map<String, List<Map<String, Object>>>> getDailySummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getDailyAttendanceSummary(date));
    }
}