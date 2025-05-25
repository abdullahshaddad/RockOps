package com.example.backend.services;

import com.example.backend.dto.equipment.EquipmentTypeDTO;
import com.example.backend.exceptions.ResourceNotFoundException;
import com.example.backend.services.finance.equipment.finance.models.equipment.EquipmentType;
import com.example.backend.services.finance.equipment.EquipmentTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EquipmentTypeService {

    private final EquipmentTypeRepository equipmentTypeRepository;

    @Autowired
    public EquipmentTypeService(EquipmentTypeRepository equipmentTypeRepository) {
        this.equipmentTypeRepository = equipmentTypeRepository;
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

}