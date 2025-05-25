package com.example.backend.controllers;

import com.example.backend.models.MaintenanceType;
import com.example.backend.services.MaintenanceTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/maintenancetypes")
public class MaintenanceTypeController {

    @Autowired
    private MaintenanceTypeService maintenanceTypeService;

    // Get all maintenance types
    @GetMapping
    public ResponseEntity<List<MaintenanceType>> getAllMaintenanceTypes() {
        return ResponseEntity.ok(maintenanceTypeService.getAllMaintenanceTypes());
    }

    // Get all active maintenance types
    @GetMapping("/active")
    public ResponseEntity<List<MaintenanceType>> getAllActiveMaintenanceTypes() {
        return ResponseEntity.ok(maintenanceTypeService.getAllActiveMaintenanceTypes());
    }

    // Get maintenance type by id
    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceType> getMaintenanceTypeById(@PathVariable UUID id) {
        return ResponseEntity.ok(maintenanceTypeService.getMaintenanceTypeById(id));
    }

    // Add new maintenance type
    @PostMapping
    public ResponseEntity<MaintenanceType> addMaintenanceType(@RequestBody Map<String, String> requestBody) {
        String name = requestBody.get("name");
        String description = requestBody.get("description");

        MaintenanceType maintenanceType = maintenanceTypeService.addMaintenanceType(name, description);
        return ResponseEntity.status(HttpStatus.CREATED).body(maintenanceType);
    }

    // Update maintenance type
    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceType> updateMaintenanceType(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> requestBody) {

        String name = (String) requestBody.get("name");
        String description = (String) requestBody.get("description");
        Boolean active = requestBody.get("active") != null ? (Boolean) requestBody.get("active") : null;

        MaintenanceType maintenanceType = maintenanceTypeService.updateMaintenanceType(id, name, description, active);
        return ResponseEntity.ok(maintenanceType);
    }

    // Delete maintenance type
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaintenanceType(@PathVariable UUID id) {
        maintenanceTypeService.deleteMaintenanceType(id);
        return ResponseEntity.noContent().build();
    }

    // Search maintenance types by name
    @GetMapping("/search")
    public ResponseEntity<List<MaintenanceType>> searchMaintenanceTypes(@RequestParam String name) {
        return ResponseEntity.ok(maintenanceTypeService.searchMaintenanceTypes(name));
    }
}