package com.example.backend.services.equipment;

import com.example.backend.dto.equipment.EquipmentTypeDTO;
import com.example.backend.dto.equipment.WorkTypeDTO;
import com.example.backend.exceptions.ResourceNotFoundException;
import com.example.backend.models.equipment.EquipmentType;
import com.example.backend.models.equipment.WorkType;
import com.example.backend.repositories.equipment.EquipmentTypeRepository;
import com.example.backend.repositories.equipment.WorkTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EquipmentTypeService {

    private final EquipmentTypeRepository equipmentTypeRepository;
    private final WorkTypeRepository workTypeRepository;

    @Autowired
    public EquipmentTypeService(EquipmentTypeRepository equipmentTypeRepository, WorkTypeRepository workTypeRepository) {
        this.equipmentTypeRepository = equipmentTypeRepository;
        this.workTypeRepository = workTypeRepository;
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

    public EquipmentTypeDTO createEquipmentType(EquipmentTypeDTO dto) {
        if (equipmentTypeRepository.existsByName(dto.getName())) {
            throw new IllegalArgumentException("Equipment type with name '" + dto.getName() + "' already exists");
        }

        EquipmentType entity = dto.toEntity();
        entity.setDriverPositionName(dto.getName() + " Driver");
        entity.setDrivable(dto.isDrivable());
        EquipmentType savedEntity = equipmentTypeRepository.save(entity);
        return EquipmentTypeDTO.fromEntity(savedEntity);
    }

    public EquipmentTypeDTO updateEquipmentType(UUID id, EquipmentTypeDTO dto) {
        // Check if the type exists
        EquipmentType existingType = equipmentTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment type not found with id: " + id));

        // Check if the name is already used by another type
        if (!existingType.getName().equals(dto.getName()) &&
                equipmentTypeRepository.existsByName(dto.getName())) {
            throw new IllegalArgumentException("Equipment type with name '" + dto.getName() + "' already exists");
        }

        // Update fields
        existingType.setName(dto.getName());
        existingType.setDescription(dto.getDescription());
        existingType.setDriverPositionName(dto.getName()+" Driver");
        existingType.setDrivable(dto.isDrivable());

        // Save and return
        EquipmentType updatedEntity = equipmentTypeRepository.save(existingType);
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
     * Add supported work types to an equipment type
     */
    @Transactional
    public EquipmentTypeDTO addSupportedWorkTypes(UUID equipmentTypeId, List<UUID> workTypeIds) {
        EquipmentType equipmentType = equipmentTypeRepository.findById(equipmentTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment type not found with id: " + equipmentTypeId));

        for (UUID workTypeId : workTypeIds) {
            WorkType workType = workTypeRepository.findById(workTypeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Work type not found with id: " + workTypeId));
            
            if (!equipmentType.getSupportedWorkTypes().contains(workType)) {
                equipmentType.getSupportedWorkTypes().add(workType);
            }
        }

        EquipmentType savedEntity = equipmentTypeRepository.save(equipmentType);
        return EquipmentTypeDTO.fromEntity(savedEntity);
    }

    /**
     * Remove supported work types from an equipment type
     */
    @Transactional
    public EquipmentTypeDTO removeSupportedWorkTypes(UUID equipmentTypeId, List<UUID> workTypeIds) {
        EquipmentType equipmentType = equipmentTypeRepository.findById(equipmentTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment type not found with id: " + equipmentTypeId));

        for (UUID workTypeId : workTypeIds) {
            equipmentType.getSupportedWorkTypes().removeIf(wt -> wt.getId().equals(workTypeId));
        }

        EquipmentType savedEntity = equipmentTypeRepository.save(equipmentType);
        return EquipmentTypeDTO.fromEntity(savedEntity);
    }

    /**
     * Set supported work types for an equipment type (replaces existing)
     */
    @Transactional
    public EquipmentTypeDTO setSupportedWorkTypes(UUID equipmentTypeId, List<UUID> workTypeIds) {
        EquipmentType equipmentType = equipmentTypeRepository.findById(equipmentTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment type not found with id: " + equipmentTypeId));

        // Clear existing work types
        equipmentType.getSupportedWorkTypes().clear();

        // Add new work types
        for (UUID workTypeId : workTypeIds) {
            WorkType workType = workTypeRepository.findById(workTypeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Work type not found with id: " + workTypeId));
            equipmentType.getSupportedWorkTypes().add(workType);
        }

        EquipmentType savedEntity = equipmentTypeRepository.save(equipmentType);
        return EquipmentTypeDTO.fromEntity(savedEntity);
    }

    /**
     * Get supported work types for an equipment type
     */
    public List<WorkTypeDTO> getSupportedWorkTypes(UUID equipmentTypeId) {
        EquipmentType equipmentType = equipmentTypeRepository.findById(equipmentTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment type not found with id: " + equipmentTypeId));

        return equipmentType.getSupportedWorkTypes().stream()
                .filter(WorkType::isActive)
                .map(workType -> {
                    WorkTypeDTO dto = new WorkTypeDTO();
                    dto.setId(workType.getId());
                    dto.setName(workType.getName());
                    dto.setDescription(workType.getDescription());
                    dto.setActive(workType.isActive());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}