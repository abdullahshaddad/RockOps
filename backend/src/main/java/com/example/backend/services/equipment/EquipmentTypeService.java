package com.example.backend.services.equipment;

import com.example.backend.dto.equipment.EquipmentTypeDTO;
import com.example.backend.exceptions.ResourceNotFoundException;
import com.example.backend.models.equipment.EquipmentType;
import com.example.backend.models.hr.Department;
import com.example.backend.models.hr.JobPosition;
import com.example.backend.repositories.equipment.EquipmentTypeRepository;
import com.example.backend.repositories.hr.DepartmentRepository;
import com.example.backend.repositories.hr.JobPositionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class EquipmentTypeService {

    private final EquipmentTypeRepository equipmentTypeRepository;
    private final DepartmentRepository departmentRepository;
    private final JobPositionRepository jobPositionRepository;

    @Autowired
    public EquipmentTypeService(EquipmentTypeRepository equipmentTypeRepository,
                                DepartmentRepository departmentRepository,
                                JobPositionRepository jobPositionRepository) {
        this.equipmentTypeRepository = equipmentTypeRepository;
        this.departmentRepository = departmentRepository;
        this.jobPositionRepository = jobPositionRepository;
    }

    public List<EquipmentTypeDTO> getAllEquipmentTypes() {
        return equipmentTypeRepository.findAll().stream()
                .map(EquipmentTypeDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public EquipmentTypeDTO getEquipmentTypeById(UUID id) {
        return equipmentTypeRepository.findById(id)
                .map(EquipmentTypeDTO::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment type not found with id: " + id));
    }

    public EquipmentTypeDTO getEquipmentTypeByName(String name) {
        return equipmentTypeRepository.findByName(name)
                .map(EquipmentTypeDTO::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment type not found with name: " + name));
    }

    @Transactional
    public EquipmentTypeDTO createEquipmentType(EquipmentTypeDTO dto) {
        if (equipmentTypeRepository.existsByName(dto.getName())) {
            throw new IllegalArgumentException("Equipment type with name '" + dto.getName() + "' already exists");
        }

        // Create the equipment type
        EquipmentType entity = dto.toEntity();
        entity.setDriverPositionName(dto.getName() + " Driver");
        EquipmentType savedEntity = equipmentTypeRepository.save(entity);

        log.info("Created equipment type: {}", savedEntity.getName());

        // IMMEDIATELY create the job position in the same transaction
        createJobPositionForEquipmentType(savedEntity);

        return EquipmentTypeDTO.fromEntity(savedEntity);
    }

    @Transactional
    public EquipmentTypeDTO updateEquipmentType(UUID id, EquipmentTypeDTO dto) {
        // Check if the type exists
        EquipmentType existingType = equipmentTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment type not found with id: " + id));

        // Check if the name is already used by another type
        if (!existingType.getName().equals(dto.getName()) &&
                equipmentTypeRepository.existsByName(dto.getName())) {
            throw new IllegalArgumentException("Equipment type with name '" + dto.getName() + "' already exists");
        }

        // Store the old name to check if it changed
        String oldName = existingType.getName();

        // Update fields
        existingType.setName(dto.getName());
        existingType.setDescription(dto.getDescription());
        existingType.setDriverPositionName(dto.getName() + " Driver");

        // Save and return
        EquipmentType updatedEntity = equipmentTypeRepository.save(existingType);

        // If the name changed, create new job position
        if (!oldName.equals(dto.getName())) {
            log.info("Equipment type renamed from '{}' to '{}' - creating new job position", oldName, dto.getName());
            createJobPositionForEquipmentType(updatedEntity);
        }

        return EquipmentTypeDTO.fromEntity(updatedEntity);
    }

    public void deleteEquipmentType(UUID id) {
        EquipmentType equipmentType = equipmentTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment type not found with id: " + id));

        if (!equipmentType.getEquipments().isEmpty()) {
            throw new IllegalStateException("Cannot delete equipment type that is used by equipment");
        }

        equipmentTypeRepository.delete(equipmentType);
    }

    public boolean existsByName(String name) {
        return equipmentTypeRepository.existsByName(name);
    }

    /**
     * Create job position immediately when equipment type is created
     * This method is called directly in the same transaction
     */
    private void createJobPositionForEquipmentType(EquipmentType equipmentType) {
        String requiredPositionName = equipmentType.getRequiredDriverPosition();

        log.info("Creating job position: {} for equipment type: {}",
                requiredPositionName, equipmentType.getName());

        // Check if the position already exists
        Optional<JobPosition> existingPosition = jobPositionRepository.findAll()
                .stream()
                .filter(jp -> requiredPositionName.equals(jp.getPositionName()))
                .findFirst();

        if (existingPosition.isPresent()) {
            log.info("Job position already exists: {}", requiredPositionName);
            return;
        }

        // Find the Logistics department
        Optional<Department> logisticsDept = departmentRepository.findByName("Logistics");

        if (logisticsDept.isEmpty()) {
            log.error("Logistics department not found. Cannot create job position for: {}", equipmentType.getName());
            return;
        }

        // Create the job position with smart defaults
        JobPosition driverPosition = JobPosition.builder()
                .positionName(requiredPositionName)
                .department(logisticsDept.get())
                .head("Operations Manager")
                .baseSalary(calculateBaseSalary(equipmentType))
                .probationPeriod(90) // 90 days probation
                .contractType(JobPosition.ContractType.MONTHLY)
                .experienceLevel(determineExperienceLevel(equipmentType))
                .monthlyBaseSalary(calculateBaseSalary(equipmentType))
                .shifts("Day Shift")
                .workingHours(8)
                .vacations("21 days annual leave")
                .active(true)
                .build();

        JobPosition savedPosition = jobPositionRepository.save(driverPosition);

        log.info("✅ Successfully created job position: {} with ID: {} for equipment type: {}",
                requiredPositionName, savedPosition.getId(), equipmentType.getName());
    }

    /**
     * Calculate base salary based on equipment type complexity
     */
    private Double calculateBaseSalary(EquipmentType equipmentType) {
        String typeName = equipmentType.getName().toLowerCase();

        // Crane operators - highest complexity and risk
        if (typeName.contains("crane")) {
            return 40000.0;
        }
        // Heavy construction equipment - high complexity
        else if (typeName.contains("excavator") || typeName.contains("bulldozer") ||
                typeName.contains("loader") || typeName.contains("grader")) {
            return 35000.0;
        }
        // Transport vehicles - medium complexity
        else if (typeName.contains("truck") || typeName.contains("trailer") ||
                typeName.contains("tanker")) {
            return 30000.0;
        }
        // Specialized equipment - medium complexity
        else if (typeName.contains("compactor") || typeName.contains("roller") ||
                typeName.contains("paver")) {
            return 32000.0;
        }
        // General equipment - base salary
        else {
            return 25000.0;
        }
    }

    /**
     * Determine experience level based on equipment type complexity
     */
    private String determineExperienceLevel(EquipmentType equipmentType) {
        String typeName = equipmentType.getName().toLowerCase();

        // High-risk, complex equipment requires senior experience
        if (typeName.contains("crane") || typeName.contains("tower")) {
            return "Senior Level";
        }
        // Heavy construction equipment requires mid-level experience
        else if (typeName.contains("excavator") || typeName.contains("bulldozer") ||
                typeName.contains("loader") || typeName.contains("grader")) {
            return "Mid Level";
        }
        // Transport and general equipment - entry level acceptable
        else {
            return "Entry Level";
        }
    }
}