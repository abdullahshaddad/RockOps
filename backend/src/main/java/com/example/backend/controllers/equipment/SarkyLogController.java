package com.example.backend.controllers;

import com.example.backend.services.SarkyLogService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class SarkyLogController {

    @Autowired
    private SarkyLogService sarkyLogService;

    @GetMapping("/equipment/{equipmentId}/sarky")
    public ResponseEntity<List<SarkyLogResponseDTO>> getSarkyLogsByEquipmentId(@PathVariable UUID equipmentId) {
        return ResponseEntity.ok(sarkyLogService.getSarkyLogsByEquipmentId(equipmentId));
    }

    @GetMapping("/equipment/{equipmentId}/sarky/range")
    public ResponseEntity<List<SarkyLogRangeResponseDTO>> getSarkyLogRangesByEquipmentId(@PathVariable UUID equipmentId) {
        return ResponseEntity.ok(sarkyLogService.getSarkyLogRangesByEquipmentId(equipmentId));
    }

    @GetMapping("/equipment/{equipmentId}/sarky/latest-date")
    public ResponseEntity<String> getLatestSarkyDateForEquipment(@PathVariable UUID equipmentId) {
        LocalDate latestDate = sarkyLogService.getLatestSarkyDateForEquipment(equipmentId);
        return ResponseEntity.ok(latestDate != null ? latestDate.toString() : null);
    }

    @GetMapping("/sarky/{id}")
    public ResponseEntity<SarkyLogResponseDTO> getSarkyLogById(@PathVariable UUID id) {
        return ResponseEntity.ok(sarkyLogService.getSarkyLogById(id));
    }

    @GetMapping("/sarky/range/{id}")
    public ResponseEntity<SarkyLogRangeResponseDTO> getSarkyLogRangeById(@PathVariable UUID id) {
        return ResponseEntity.ok(sarkyLogService.getSarkyLogRangeById(id));
    }

    @PostMapping("/equipment/{equipmentId}/sarky")
    public ResponseEntity<SarkyLogResponseDTO> createSarkyLog(
            @PathVariable UUID equipmentId,
            @RequestParam("workType") UUID workTypeId,
            @RequestParam("workedHours") Double workedHours,
            @RequestParam("date") String date,
            @RequestParam("driver") UUID driverId,
            @RequestParam(value = "file", required = false) MultipartFile file) throws Exception {

        SarkyLogDTO sarkyLogDTO = new SarkyLogDTO();
        sarkyLogDTO.setEquipmentId(equipmentId);
        sarkyLogDTO.setWorkTypeId(workTypeId);
        sarkyLogDTO.setWorkedHours(workedHours);
        sarkyLogDTO.setDate(LocalDate.parse(date));
        sarkyLogDTO.setDriverId(driverId);


        return new ResponseEntity<>(sarkyLogService.createSarkyLog(sarkyLogDTO, file), HttpStatus.CREATED);
    }

    @PostMapping("/equipment/{equipmentId}/sarky/range")
    public ResponseEntity<SarkyLogRangeResponseDTO> createSarkyLogRange(
            @PathVariable UUID equipmentId,
            @RequestParam("startDate") String startDate,
            @RequestParam("endDate") String endDate,
            @RequestParam("workEntries") String workEntries,
            @RequestParam(value = "file", required = false) MultipartFile file) throws Exception {

        SarkyLogRangeDTO sarkyLogRangeDTO = new SarkyLogRangeDTO();
        sarkyLogRangeDTO.setEquipmentId(equipmentId);
        sarkyLogRangeDTO.setStartDate(LocalDate.parse(startDate));
        sarkyLogRangeDTO.setEndDate(LocalDate.parse(endDate));

        // Parse work entries
        List<WorkEntryDTO> workEntryDTOs;
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.registerModule(new JavaTimeModule());
            workEntryDTOs = objectMapper.readValue(workEntries,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, WorkEntryDTO.class));
            sarkyLogRangeDTO.setWorkEntries(workEntryDTOs);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid work entries format: " + e.getMessage());
        }

        return new ResponseEntity<>(
                sarkyLogService.createSarkyLogRange(sarkyLogRangeDTO, file),
                HttpStatus.CREATED);
    }

    @PutMapping("/sarky/{id}")
    public ResponseEntity<SarkyLogResponseDTO> updateSarkyLog(
            @PathVariable UUID id,
            @RequestParam("workType") UUID workTypeId,
            @RequestParam("workedHours") Double workedHours,
            @RequestParam("date") String date,
            @RequestParam("driver") UUID driverId,
            @RequestParam(value = "file", required = false) MultipartFile file) throws Exception {

        SarkyLogDTO sarkyLogDTO = new SarkyLogDTO();
        sarkyLogDTO.setId(id);
        sarkyLogDTO.setWorkTypeId(workTypeId);
        sarkyLogDTO.setWorkedHours(workedHours);
        sarkyLogDTO.setDate(LocalDate.parse(date));
        sarkyLogDTO.setDriverId(driverId);

        return ResponseEntity.ok(sarkyLogService.updateSarkyLog(id, sarkyLogDTO, file));
    }

    @PutMapping("/sarky/range/{id}")
    public ResponseEntity<SarkyLogRangeResponseDTO> updateSarkyLogRange(
            @PathVariable UUID id,
            @RequestParam("startDate") String startDate,
            @RequestParam("endDate") String endDate,
            @RequestParam("workEntries") String workEntries,
            @RequestParam(value = "file", required = false) MultipartFile file) throws Exception {

        SarkyLogRangeDTO sarkyLogRangeDTO = new SarkyLogRangeDTO();
        sarkyLogRangeDTO.setId(id);
        sarkyLogRangeDTO.setStartDate(LocalDate.parse(startDate));
        sarkyLogRangeDTO.setEndDate(LocalDate.parse(endDate));

        // Parse work entries
        List<WorkEntryDTO> workEntryDTOs;
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.registerModule(new JavaTimeModule());
            workEntryDTOs = objectMapper.readValue(workEntries,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, WorkEntryDTO.class));
            sarkyLogRangeDTO.setWorkEntries(workEntryDTOs);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid work entries format: " + e.getMessage());
        }

        return ResponseEntity.ok(sarkyLogService.updateSarkyLogRange(id, sarkyLogRangeDTO, file));
    }

    @DeleteMapping("/sarky/{id}")
    public ResponseEntity<Void> deleteSarkyLog(@PathVariable UUID id) throws Exception {
        sarkyLogService.deleteSarkyLog(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/sarky/range/{id}")
    public ResponseEntity<Void> deleteSarkyLogRange(@PathVariable UUID id) throws Exception {
        sarkyLogService.deleteSarkyLogRange(id);
        return ResponseEntity.noContent().build();
    }
}