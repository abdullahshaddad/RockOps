package com.example.backend.services.equipment;

import com.example.backend.dto.equipment.*;
import com.example.backend.exceptions.ResourceNotFoundException;
import com.example.backend.models.User;
import com.example.backend.models.equipment.*;
import com.example.backend.services.MinioService;
import com.example.backend.repositories.equipment.EquipmentRepository;
import com.example.backend.repositories.equipment.SarkyLogRangeRepository;
import com.example.backend.repositories.equipment.SarkyLogRepository;
import com.example.backend.repositories.equipment.WorkTypeRepository;
import com.example.backend.models.hr.Employee;
import com.example.backend.repositories.*;
import com.example.backend.repositories.hr.EmployeeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SarkyLogService {

    @Autowired
    private SarkyLogRepository sarkyLogRepository;

    @Autowired
    private SarkyLogRangeRepository sarkyLogRangeRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private WorkTypeRepository workTypeRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private MinioService minioService;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper;

    public SarkyLogService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    /**
     * Get all sarky logs for a specific equipment
     */
    public List<SarkyLogResponseDTO> getSarkyLogsByEquipmentId(UUID equipmentId) {
        return sarkyLogRepository.findByEquipmentIdOrderByDateDesc(equipmentId).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all sarky log ranges for a specific equipment
     */
    public List<SarkyLogRangeResponseDTO> getSarkyLogRangesByEquipmentId(UUID equipmentId) {
        return sarkyLogRangeRepository.findByEquipmentIdOrderByStartDateDesc(equipmentId).stream()
                .map(this::convertRangeToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get the latest date for sarky logs and ranges for an equipment
     */
    public LocalDate getLatestSarkyDateForEquipment(UUID equipmentId) {
        LocalDate latestSingleDate = null;
        LocalDate latestRangeDate = null;

        // Find latest single date
        List<SarkyLog> latestSarkyLog = sarkyLogRepository.findByEquipmentIdOrderByDateDesc(equipmentId);
        if (!latestSarkyLog.isEmpty()) {
            latestSingleDate = latestSarkyLog.get(0).getDate();
        }

        // Find latest range date
        List<SarkyLogRange> latestRange = sarkyLogRangeRepository.findLatestByEquipmentId(equipmentId);
        if (!latestRange.isEmpty()) {
            latestRangeDate = latestRange.get(0).getEndDate();
        }

        // Return the most recent date
        if (latestSingleDate == null && latestRangeDate == null) {
            return null;
        } else if (latestSingleDate == null) {
            return latestRangeDate;
        } else if (latestRangeDate == null) {
            return latestSingleDate;
        } else {
            return latestSingleDate.isAfter(latestRangeDate) ? latestSingleDate : latestRangeDate;
        }
    }

    /**
     * Create a new sarky log entry
     */
    @Transactional
    public SarkyLogResponseDTO createSarkyLog(SarkyLogDTO sarkyLogDTO, MultipartFile file) throws Exception {
        // Find equipment
        Equipment equipment = equipmentRepository.findById(sarkyLogDTO.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + sarkyLogDTO.getEquipmentId()));

        // Find work type
        WorkType workType = workTypeRepository.findById(sarkyLogDTO.getWorkTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Work type not found with id: " + sarkyLogDTO.getWorkTypeId()));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Find the User entity based on the username
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + authentication.getName()));

        // Find driver
        Employee driver = employeeRepository.findById(sarkyLogDTO.getDriverId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + sarkyLogDTO.getDriverId()));

        LocalDate latestDate = getLatestSarkyDateForEquipment(sarkyLogDTO.getEquipmentId());
        if (latestDate != null) {
            LocalDate nextExpectedDate = latestDate.plusDays(1);
            if (!sarkyLogDTO.getDate().equals(nextExpectedDate)) {
                throw new IllegalArgumentException(
                        "New sarky entry must be for " + nextExpectedDate +
                                " (the day after the latest entry on " + latestDate + "). " +
                                "Sarky logs must be added in chronological order without gaps.");
            }
        }
        // Create new sarky log
        SarkyLog sarkyLog = new SarkyLog();
        sarkyLog.setEquipment(equipment);
        sarkyLog.setWorkType(workType);
        sarkyLog.setWorkedHours(sarkyLogDTO.getWorkedHours());
        sarkyLog.setDate(sarkyLogDTO.getDate());
        sarkyLog.setCreatedBy(currentUser);
        sarkyLog.setDriver(driver);


        // Save sarky log first to get the ID
        SarkyLog savedSarkyLog = sarkyLogRepository.save(sarkyLog);

        // Handle file upload if provided using MinIO
        if (file != null && !file.isEmpty()) {
            try {
                // Make sure the equipment bucket exists
                minioService.createEquipmentBucket(equipment.getId());

                // Upload the file with the sarky- prefix and the sarky log ID
                String fileName = "sarky-" + savedSarkyLog.getId().toString();
                minioService.uploadEquipmentFile(equipment.getId(), file, fileName);

                // Set the file URL in the sarky log
                String fileUrl = minioService.getEquipmentFileUrl(equipment.getId(), fileName);
                savedSarkyLog.setFileUrl(fileUrl);

                // Update the sarky log
                savedSarkyLog = sarkyLogRepository.save(savedSarkyLog);
            } catch (Exception e) {
                // Log error but continue
                System.err.println("Error uploading file to MinIO: " + e.getMessage());
            }
        }

        return convertToResponseDTO(savedSarkyLog);
    }

    /**
     * Create a new sarky log range entry
     */
    /**
     * Create a new sarky log range entry
     */
    @Transactional
    public SarkyLogRangeResponseDTO createSarkyLogRange(SarkyLogRangeDTO sarkyLogRangeDTO, MultipartFile file) throws Exception {
        // Validate date range
        if (sarkyLogRangeDTO.getEndDate().isBefore(sarkyLogRangeDTO.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }

        // Find equipment
        Equipment equipment = equipmentRepository.findById(sarkyLogRangeDTO.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + sarkyLogRangeDTO.getEquipmentId()));

        // Check for overlapping date ranges
        List<SarkyLogRange> overlappingRanges = sarkyLogRangeRepository.findOverlappingRanges(
                sarkyLogRangeDTO.getEquipmentId(), sarkyLogRangeDTO.getStartDate(), sarkyLogRangeDTO.getEndDate());

        if (!overlappingRanges.isEmpty()) {
            throw new IllegalArgumentException("Date range overlaps with existing entries");
        }

        // Check for continuity - make sure there's no gap between the latest entry and this new range
        LocalDate latestDate = getLatestSarkyDateForEquipment(sarkyLogRangeDTO.getEquipmentId());
        if (latestDate != null) {
            LocalDate nextExpectedDate = latestDate.plusDays(1);
            if (!sarkyLogRangeDTO.getStartDate().equals(nextExpectedDate)) {
                throw new IllegalArgumentException(
                        "New range must start on " + nextExpectedDate +
                                " (the day after the latest entry on " + latestDate + ")");
            }
        }

        // Validate work entries
        if (sarkyLogRangeDTO.getWorkEntries() == null || sarkyLogRangeDTO.getWorkEntries().isEmpty()) {
            throw new IllegalArgumentException("Work entries cannot be empty");
        }

        // Check that all dates within the range have entries
        List<LocalDate> allDates = new ArrayList<>();
        LocalDate current = sarkyLogRangeDTO.getStartDate();
        while (!current.isAfter(sarkyLogRangeDTO.getEndDate())) {
            allDates.add(current);
            current = current.plusDays(1);
        }

        // We now allow multiple work entries per day - but ensure each day has at least one entry
        List<LocalDate> entryDates = sarkyLogRangeDTO.getWorkEntries().stream()
                .map(WorkEntryDTO::getDate)
                .distinct()
                .collect(Collectors.toList());

        for (LocalDate date : allDates) {
            if (!entryDates.contains(date)) {
                throw new IllegalArgumentException("Missing work entry for date: " + date);
            }
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Find the User entity based on the username
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + authentication.getName()));

        // Create new sarky log range
        SarkyLogRange sarkyLogRange = new SarkyLogRange();
        sarkyLogRange.setEquipment(equipment);
        sarkyLogRange.setStartDate(sarkyLogRangeDTO.getStartDate());
        sarkyLogRange.setEndDate(sarkyLogRangeDTO.getEndDate());
        sarkyLogRange.setCreatedBy(currentUser);

        // Save sarky log range first to get the ID
        SarkyLogRange savedSarkyLogRange = sarkyLogRangeRepository.save(sarkyLogRange);

        // Add work entries
        for (WorkEntryDTO entryDTO : sarkyLogRangeDTO.getWorkEntries()) {
            WorkType workType = workTypeRepository.findById(entryDTO.getWorkTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Work type not found with id: " + entryDTO.getWorkTypeId()));

            Employee driver = employeeRepository.findById(entryDTO.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + entryDTO.getDriverId()));

            WorkEntry entry = new WorkEntry();
            entry.setSarkyLogRange(savedSarkyLogRange);
            entry.setDate(entryDTO.getDate());
            entry.setWorkType(workType);
            entry.setWorkedHours(entryDTO.getWorkedHours());
            entry.setDriver(driver);

            savedSarkyLogRange.addWorkEntry(entry);
        }

        // Handle file upload if provided using MinIO
        if (file != null && !file.isEmpty()) {
            try {
                // Make sure the equipment bucket exists
                minioService.createEquipmentBucket(equipment.getId());

                // Upload the file with the sarky-range- prefix and the range ID
                String fileName = "sarky-range-" + savedSarkyLogRange.getId().toString();
                minioService.uploadEquipmentFile(equipment.getId(), file, fileName);

                // Set the file URL in the sarky log range
                String fileUrl = minioService.getEquipmentFileUrl(equipment.getId(), fileName);
                savedSarkyLogRange.setFileUrl(fileUrl);
            } catch (Exception e) {
                // Log error but continue
                System.err.println("Error uploading file to MinIO: " + e.getMessage());
            }
        }

        // Save again with work entries and file URL
        savedSarkyLogRange = sarkyLogRangeRepository.save(savedSarkyLogRange);

        return convertRangeToResponseDTO(savedSarkyLogRange);
    }
    /**
     * Get sarky log by ID
     */
    public SarkyLogResponseDTO getSarkyLogById(UUID id) {
        SarkyLog sarkyLog = sarkyLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sarky log not found with id: " + id));
        return convertToResponseDTO(sarkyLog);
    }

    /**
     * Get sarky log range by ID
     */
    public SarkyLogRangeResponseDTO getSarkyLogRangeById(UUID id) {
        SarkyLogRange sarkyLogRange = sarkyLogRangeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sarky log range not found with id: " + id));
        return convertRangeToResponseDTO(sarkyLogRange);
    }

    /**
     * Update an existing sarky log
     */
    @Transactional
    public SarkyLogResponseDTO updateSarkyLog(UUID id, SarkyLogDTO sarkyLogDTO, MultipartFile file) throws Exception {
        SarkyLog sarkyLog = sarkyLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sarky log not found with id: " + id));

        // Find work type if changed
        if (!sarkyLog.getWorkType().getId().equals(sarkyLogDTO.getWorkTypeId())) {
            WorkType workType = workTypeRepository.findById(sarkyLogDTO.getWorkTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Work type not found with id: " + sarkyLogDTO.getWorkTypeId()));
            sarkyLog.setWorkType(workType);
        }

        // Find driver if changed
        if (!sarkyLog.getDriver().getId().equals(sarkyLogDTO.getDriverId())) {
            Employee driver = employeeRepository.findById(sarkyLogDTO.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + sarkyLogDTO.getDriverId()));
            sarkyLog.setDriver(driver);
        }

        // Add this near the beginning of the updateSarkyLog method
// Ensure the date is not being changed or if it is, it maintains chronological order
        if (!sarkyLog.getDate().equals(sarkyLogDTO.getDate())) {
            // Get earliest date after this entry
            LocalDate nextSarkyDate = getNextSarkyDateAfter(id, sarkyLog.getEquipment().getId());

            // Get latest date before this entry
            LocalDate previousSarkyDate = getPreviousSarkyDateBefore(id, sarkyLog.getEquipment().getId());

            // Check that the new date is after the previous entry and before the next entry
            if (previousSarkyDate != null && sarkyLogDTO.getDate().isBefore(previousSarkyDate.plusDays(1))) {
                throw new IllegalArgumentException(
                        "Cannot change date to " + sarkyLogDTO.getDate() +
                                ". It must be after " + previousSarkyDate +
                                " to maintain chronological order.");
            }

            if (nextSarkyDate != null && sarkyLogDTO.getDate().isAfter(nextSarkyDate.minusDays(1))) {
                throw new IllegalArgumentException(
                        "Cannot change date to " + sarkyLogDTO.getDate() +
                                ". It must be before " + nextSarkyDate +
                                " to maintain chronological order.");
            }
        }

        sarkyLog.setWorkedHours(sarkyLogDTO.getWorkedHours());
        sarkyLog.setDate(sarkyLogDTO.getDate());


        // Handle file upload if provided using MinIO
        if (file != null && !file.isEmpty()) {
            try {
                Equipment equipment = sarkyLog.getEquipment();

                // Make sure the equipment bucket exists
                minioService.createEquipmentBucket(equipment.getId());

                // Delete old file if it exists
                if (sarkyLog.getFileUrl() != null && !sarkyLog.getFileUrl().isEmpty()) {
                    try {
                        // Extract the filename from the URL (assumes filename is last part of URL)
                        String oldFileName = "sarky-" + id.toString();
                        minioService.deleteEquipmentFile(equipment.getId(), oldFileName);
                    } catch (Exception e) {
                        // Log error but continue
                        System.err.println("Error deleting old file from MinIO: " + e.getMessage());
                    }
                }

                // Upload the new file
                String fileName = "sarky-" + id.toString();
                minioService.uploadEquipmentFile(equipment.getId(), file, fileName);

                // Set the new file URL
                String fileUrl = minioService.getEquipmentFileUrl(equipment.getId(), fileName);
                sarkyLog.setFileUrl(fileUrl);
            } catch (Exception e) {
                // Log error but continue
                System.err.println("Error uploading file to MinIO: " + e.getMessage());
            }
        }

        SarkyLog updatedSarkyLog = sarkyLogRepository.save(sarkyLog);
        return convertToResponseDTO(updatedSarkyLog);
    }

    /**
     * Update an existing sarky log range
     */
    @Transactional
    public SarkyLogRangeResponseDTO updateSarkyLogRange(UUID id, SarkyLogRangeDTO sarkyLogRangeDTO, MultipartFile file) throws Exception {
        SarkyLogRange sarkyLogRange = sarkyLogRangeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sarky log range not found with id: " + id));

        // Validate date range
        if (sarkyLogRangeDTO.getEndDate().isBefore(sarkyLogRangeDTO.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }

        // Check for overlapping date ranges excluding the current range
        List<SarkyLogRange> overlappingRanges = sarkyLogRangeRepository.findOverlappingRangesExcludingCurrent(
                sarkyLogRange.getEquipment().getId(), sarkyLogRangeDTO.getStartDate(), sarkyLogRangeDTO.getEndDate(), id);

        if (!overlappingRanges.isEmpty()) {
            throw new IllegalArgumentException("Date range overlaps with existing entries");
        }

        // Validate work entries
        if (sarkyLogRangeDTO.getWorkEntries() == null || sarkyLogRangeDTO.getWorkEntries().isEmpty()) {
            throw new IllegalArgumentException("Work entries cannot be empty");
        }

        // Check that all dates within the new range have entries
        List<LocalDate> allDates = new ArrayList<>();
        LocalDate current = sarkyLogRangeDTO.getStartDate();
        while (!current.isAfter(sarkyLogRangeDTO.getEndDate())) {
            allDates.add(current);
            current = current.plusDays(1);
        }

        // We now allow multiple work entries per day - but ensure each day has at least one entry
        List<LocalDate> entryDates = sarkyLogRangeDTO.getWorkEntries().stream()
                .map(WorkEntryDTO::getDate)
                .distinct()
                .collect(Collectors.toList());

        for (LocalDate date : allDates) {
            if (!entryDates.contains(date)) {
                throw new IllegalArgumentException("Missing work entry for date: " + date);
            }
        }

        // Update range dates
        sarkyLogRange.setStartDate(sarkyLogRangeDTO.getStartDate());
        sarkyLogRange.setEndDate(sarkyLogRangeDTO.getEndDate());

        // Clear existing work entries and add new ones
        sarkyLogRange.getWorkEntries().clear();

        for (WorkEntryDTO entryDTO : sarkyLogRangeDTO.getWorkEntries()) {
            WorkType workType = workTypeRepository.findById(entryDTO.getWorkTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Work type not found with id: " + entryDTO.getWorkTypeId()));

            Employee driver = employeeRepository.findById(entryDTO.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + entryDTO.getDriverId()));

            WorkEntry entry = new WorkEntry();
            entry.setSarkyLogRange(sarkyLogRange);
            entry.setDate(entryDTO.getDate());
            entry.setWorkType(workType);
            entry.setWorkedHours(entryDTO.getWorkedHours());
            entry.setDriver(driver);

            sarkyLogRange.addWorkEntry(entry);
        }

        // Handle file upload if provided using MinIO
        if (file != null && !file.isEmpty()) {
            try {
                Equipment equipment = sarkyLogRange.getEquipment();

                // Make sure the equipment bucket exists
                minioService.createEquipmentBucket(equipment.getId());

                // Delete old file if it exists
                if (sarkyLogRange.getFileUrl() != null && !sarkyLogRange.getFileUrl().isEmpty()) {
                    try {
                        String oldFileName = "sarky-range-" + id.toString();
                        minioService.deleteEquipmentFile(equipment.getId(), oldFileName);
                    } catch (Exception e) {
                        System.err.println("Error deleting old file from MinIO: " + e.getMessage());
                    }
                }

                // Upload the new file
                String fileName = "sarky-range-" + id.toString();
                minioService.uploadEquipmentFile(equipment.getId(), file, fileName);

                // Set the new file URL
                String fileUrl = minioService.getEquipmentFileUrl(equipment.getId(), fileName);
                sarkyLogRange.setFileUrl(fileUrl);
            } catch (Exception e) {
                System.err.println("Error uploading file to MinIO: " + e.getMessage());
            }
        }

        SarkyLogRange updatedSarkyLogRange = sarkyLogRangeRepository.save(sarkyLogRange);
        return convertRangeToResponseDTO(updatedSarkyLogRange);
    }

    /**
     * Delete a sarky log
     */
    @Transactional
    public void deleteSarkyLog(UUID id) throws Exception {
        SarkyLog sarkyLog = sarkyLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sarky log not found with id: " + id));

        // Delete the file from MinIO if exists
        if (sarkyLog.getFileUrl() != null && !sarkyLog.getFileUrl().isEmpty()) {
            try {
                String fileName = "sarky-" + id.toString();
                minioService.deleteEquipmentFile(sarkyLog.getEquipment().getId(), fileName);
            } catch (Exception e) {
                // Log error but continue with deletion
                System.err.println("Error deleting file from MinIO: " + e.getMessage());
            }
        }

        sarkyLogRepository.delete(sarkyLog);
    }

    /**
     * Delete a sarky log range
     */
    @Transactional
    public void deleteSarkyLogRange(UUID id) throws Exception {
        SarkyLogRange sarkyLogRange = sarkyLogRangeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sarky log range not found with id: " + id));

        // Delete the file from MinIO if exists
        if (sarkyLogRange.getFileUrl() != null && !sarkyLogRange.getFileUrl().isEmpty()) {
            try {
                String fileName = "sarky-range-" + id.toString();
                minioService.deleteEquipmentFile(sarkyLogRange.getEquipment().getId(), fileName);
            } catch (Exception e) {
                // Log error but continue with deletion
                System.err.println("Error deleting file from MinIO: " + e.getMessage());
            }
        }

        sarkyLogRangeRepository.delete(sarkyLogRange);
    }

    /**
     * Convert entity to response DTO
     */
    private SarkyLogResponseDTO convertToResponseDTO(SarkyLog sarkyLog) {
        SarkyLogResponseDTO dto = new SarkyLogResponseDTO();
        dto.setId(sarkyLog.getId());
        dto.setEquipmentId(sarkyLog.getEquipment().getId());
        dto.setEquipmentType(sarkyLog.getEquipment().getType());

        WorkTypeDTO workTypeDTO = new WorkTypeDTO();
        workTypeDTO.setId(sarkyLog.getWorkType().getId());
        workTypeDTO.setName(sarkyLog.getWorkType().getName());
        workTypeDTO.setDescription(sarkyLog.getWorkType().getDescription());
        workTypeDTO.setActive(sarkyLog.getWorkType().isActive());

        dto.setWorkType(workTypeDTO);
        dto.setWorkedHours(sarkyLog.getWorkedHours());
        dto.setDate(sarkyLog.getDate());
        dto.setFilePath(sarkyLog.getFileUrl());

        // Add driver information
        dto.setDriverId(sarkyLog.getDriver().getId());
        dto.setDriverName(sarkyLog.getDriver().getFirstName() + " " + sarkyLog.getDriver().getLastName());

        if (sarkyLog.getCreatedBy() != null) {
            dto.setCreatedByName(sarkyLog.getCreatedBy().getFirstName() + " " + sarkyLog.getCreatedBy().getLastName());
        }

        dto.setCreatedAt(sarkyLog.getCreatedAt().toLocalDate());

        return dto;
    }
    /**
     * Convert sarky log range entity to response DTO
     */
    private SarkyLogRangeResponseDTO convertRangeToResponseDTO(SarkyLogRange sarkyLogRange) {
        SarkyLogRangeResponseDTO dto = new SarkyLogRangeResponseDTO();
        dto.setId(sarkyLogRange.getId());
        dto.setEquipmentId(sarkyLogRange.getEquipment().getId());
        dto.setEquipmentType(sarkyLogRange.getEquipment().getType());
        dto.setStartDate(sarkyLogRange.getStartDate());
        dto.setEndDate(sarkyLogRange.getEndDate());
        dto.setFilePath(sarkyLogRange.getFileUrl());
        dto.setStatus("Completed"); // Default status

        List<WorkEntryResponseDTO> workEntryDTOs = sarkyLogRange.getWorkEntries().stream()
                .map(this::convertWorkEntryToResponseDTO)
                .collect(Collectors.toList());

        dto.setWorkEntries(workEntryDTOs);

        if (sarkyLogRange.getCreatedBy() != null) {
            dto.setCreatedByName(sarkyLogRange.getCreatedBy().getFirstName() + " " +
                    sarkyLogRange.getCreatedBy().getLastName());
        }

        dto.setCreatedAt(sarkyLogRange.getCreatedAt().toLocalDate());

        return dto;
    }



    /**
     * Convert work entry entity to response DTO
     */
    private WorkEntryResponseDTO convertWorkEntryToResponseDTO(WorkEntry workEntry) {
        WorkEntryResponseDTO dto = new WorkEntryResponseDTO();
        dto.setId(workEntry.getId());
        dto.setDate(workEntry.getDate());

        WorkTypeDTO workTypeDTO = new WorkTypeDTO();
        workTypeDTO.setId(workEntry.getWorkType().getId());
        workTypeDTO.setName(workEntry.getWorkType().getName());
        workTypeDTO.setDescription(workEntry.getWorkType().getDescription());
        workTypeDTO.setActive(workEntry.getWorkType().isActive());

        dto.setWorkType(workTypeDTO);
        dto.setWorkedHours(workEntry.getWorkedHours());

        // Add driver information
        dto.setDriverId(workEntry.getDriver().getId());
        dto.setDriverName(workEntry.getDriver().getFirstName() + " " + workEntry.getDriver().getLastName());

        return dto;
    }

    /**
     * Get the date of the next sarky entry after a specific entry
     */
    private LocalDate getNextSarkyDateAfter(UUID sarkyId, UUID equipmentId) {
        // Find next single date
        List<SarkyLog> singleEntries = sarkyLogRepository.findByEquipmentIdOrderByDateAsc(equipmentId);

        LocalDate sarkyDate = sarkyLogRepository.findById(sarkyId)
                .map(SarkyLog::getDate)
                .orElse(null);

        if (sarkyDate == null) {
            return null;
        }

        LocalDate nextSingleDate = null;
        for (SarkyLog log : singleEntries) {
            if (log.getDate().isAfter(sarkyDate) &&
                    (nextSingleDate == null || log.getDate().isBefore(nextSingleDate))) {
                nextSingleDate = log.getDate();
            }
        }

        // Find next range start date
        List<SarkyLogRange> rangeEntries = sarkyLogRangeRepository.findByEquipmentIdOrderByStartDateAsc(equipmentId);
        LocalDate nextRangeDate = null;

        for (SarkyLogRange range : rangeEntries) {
            if (range.getStartDate().isAfter(sarkyDate) &&
                    (nextRangeDate == null || range.getStartDate().isBefore(nextRangeDate))) {
                nextRangeDate = range.getStartDate();
            }
        }

        // Return the earliest next date
        if (nextSingleDate == null && nextRangeDate == null) {
            return null;
        } else if (nextSingleDate == null) {
            return nextRangeDate;
        } else if (nextRangeDate == null) {
            return nextSingleDate;
        } else {
            return nextSingleDate.isBefore(nextRangeDate) ? nextSingleDate : nextRangeDate;
        }
    }

    /**
     * Get the date of the previous sarky entry before a specific entry
     */
    private LocalDate getPreviousSarkyDateBefore(UUID sarkyId, UUID equipmentId) {
        // Find previous single date
        List<SarkyLog> singleEntries = sarkyLogRepository.findByEquipmentIdOrderByDateDesc(equipmentId);

        LocalDate sarkyDate = sarkyLogRepository.findById(sarkyId)
                .map(SarkyLog::getDate)
                .orElse(null);

        if (sarkyDate == null) {
            return null;
        }

        LocalDate prevSingleDate = null;
        for (SarkyLog log : singleEntries) {
            if (log.getDate().isBefore(sarkyDate) &&
                    (prevSingleDate == null || log.getDate().isAfter(prevSingleDate))) {
                prevSingleDate = log.getDate();
            }
        }

        // Find previous range end date
        List<SarkyLogRange> rangeEntries = sarkyLogRangeRepository.findByEquipmentIdOrderByEndDateDesc(equipmentId);
        LocalDate prevRangeDate = null;

        for (SarkyLogRange range : rangeEntries) {
            if (range.getEndDate().isBefore(sarkyDate) &&
                    (prevRangeDate == null || range.getEndDate().isAfter(prevRangeDate))) {
                prevRangeDate = range.getEndDate();
            }
        }

        // Return the latest previous date
        if (prevSingleDate == null && prevRangeDate == null) {
            return null;
        } else if (prevSingleDate == null) {
            return prevRangeDate;
        } else if (prevRangeDate == null) {
            return prevSingleDate;
        } else {
            return prevSingleDate.isAfter(prevRangeDate) ? prevSingleDate : prevRangeDate;
        }
    }

}