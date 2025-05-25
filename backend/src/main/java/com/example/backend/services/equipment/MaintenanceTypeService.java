package com.example.backend.services;

import com.example.backend.exceptions.ResourceAlreadyExistsException;
import com.example.backend.exceptions.ResourceNotFoundException;
import com.example.backend.services.finance.equipment.finance.models.equipment.MaintenanceType;
import com.example.backend.services.finance.equipment.MaintenanceTypeRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class MaintenanceTypeService {

    @Autowired
    private MaintenanceTypeRepository maintenanceTypeRepository;

    // Get all maintenance types
    public List<MaintenanceType> getAllMaintenanceTypes() {
        return maintenanceTypeRepository.findAll();
    }

    // Get all active maintenance types
    public List<MaintenanceType> getAllActiveMaintenanceTypes() {
        return maintenanceTypeRepository.findByActiveTrue();
    }

    // Get maintenance type by id
    public MaintenanceType getMaintenanceTypeById(UUID id) {
        return maintenanceTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance type not found with id: " + id));
    }

    // Add new maintenance type
    @Transactional
    public MaintenanceType addMaintenanceType(String name, String description) {
        // Check if maintenance type with same name already exists
        if (maintenanceTypeRepository.existsByNameIgnoreCase(name)) {
            throw new ResourceAlreadyExistsException("Maintenance type with name " + name + " already exists");
        }

        MaintenanceType maintenanceType = new MaintenanceType();
        maintenanceType.setName(name);
        maintenanceType.setDescription(description);
        maintenanceType.setActive(true);

        return maintenanceTypeRepository.save(maintenanceType);
    }

    // Update maintenance type
    @Transactional
    public MaintenanceType updateMaintenanceType(UUID id, String name, String description, Boolean active) {
        MaintenanceType maintenanceType = maintenanceTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance type not found with id: " + id));

        // If name is changing, check if new name already exists
        if (name != null && !name.equals(maintenanceType.getName())) {
            if (maintenanceTypeRepository.existsByNameIgnoreCase(name)) {
                throw new ResourceAlreadyExistsException("Maintenance type with name " + name + " already exists");
            }
            maintenanceType.setName(name);
        }

        if (description != null) maintenanceType.setDescription(description);
        if (active != null) maintenanceType.setActive(active);

        return maintenanceTypeRepository.save(maintenanceType);
    }

    // Delete maintenance type (or mark as inactive)
    @Transactional
    public void deleteMaintenanceType(UUID id) {
        MaintenanceType maintenanceType = maintenanceTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance type not found with id: " + id));

        // Option 1: Hard delete
        // maintenanceTypeRepository.deleteById(id);

        // Option 2: Soft delete (mark as inactive)
        maintenanceType.setActive(false);
        maintenanceTypeRepository.save(maintenanceType);
    }

    // Search maintenance types by name
    public List<MaintenanceType> searchMaintenanceTypes(String namePart) {
        return maintenanceTypeRepository.findByNameContainingIgnoreCase(namePart);
    }
}