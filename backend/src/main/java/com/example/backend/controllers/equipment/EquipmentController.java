package com.example.backend.controllers.equipment;

import com.example.backend.dto.equipment.*;
import com.example.backend.dto.hr.EmployeeSummaryDTO;
import com.example.backend.models.equipment.Consumable;
import com.example.backend.models.ItemStatus;
import com.example.backend.services.equipment.ConsumablesService;
import com.example.backend.services.equipment.EquipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    @Autowired
    private EquipmentService equipmentService;

    @Autowired
    private ConsumablesService consumableService;



    // GET endpoints

    @GetMapping
    public ResponseEntity<List<EquipmentDTO>> getAllEquipment() {
        return ResponseEntity.ok(equipmentService.getAllEquipment());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipmentDTO> getEquipmentById(@PathVariable UUID id) {
        return ResponseEntity.ok(equipmentService.getEquipmentById(id));
    }

    @GetMapping("/type/{typeId}")
    public ResponseEntity<List<EquipmentDTO>> getEquipmentByType(@PathVariable UUID typeId) {
        return ResponseEntity.ok(equipmentService.getEquipmentByType(typeId));
    }

    @GetMapping("/{equipmentId}/consumables")
    public ResponseEntity<List<ConsumableDetailDTO>> getEquipmentConsumables(@PathVariable UUID equipmentId) {
        List<Consumable> consumables = consumableService.getConsumablesByEquipmentId(equipmentId);
        List<ConsumableDetailDTO> consumableDetails = consumables.stream()
                .map(ConsumableDetailDTO::fromConsumable)
                .collect(Collectors.toList());
        return ResponseEntity.ok(consumableDetails);
    }

    // POST endpoints - Using both DTO and Map approaches for backward compatibility

    @PostMapping
    public ResponseEntity<EquipmentDTO> addEquipment(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam Map<String, Object> requestBody) throws Exception {
        EquipmentDTO savedEquipment = equipmentService.createEquipment(requestBody, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedEquipment);
    }

    @PostMapping("/dto")
    public ResponseEntity<EquipmentDTO> addEquipmentWithDTO(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestBody EquipmentCreateDTO createDTO) throws Exception {
        EquipmentDTO savedEquipment = equipmentService.createEquipment(createDTO, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedEquipment);
    }

    // PUT endpoints - Using both DTO and Map approaches for backward compatibility

    @PutMapping("/{id}")
    public ResponseEntity<EquipmentDTO> updateEquipment(
            @PathVariable UUID id,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam Map<String, Object> requestBody) throws Exception {

        System.out.println("Received Request Body: " + requestBody);
        if (file != null) {
            System.out.println("Received File: " + file.getOriginalFilename());
        }

        EquipmentDTO updatedEquipment = equipmentService.updateEquipment(id, requestBody, file);
        return ResponseEntity.ok(updatedEquipment);
    }

    @PutMapping("/dto/{id}")
    public ResponseEntity<EquipmentDTO> updateEquipmentWithDTO(
            @PathVariable UUID id,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestBody EquipmentUpdateDTO updateDTO) throws Exception {

        EquipmentDTO updatedEquipment = equipmentService.updateEquipment(id, updateDTO, file);
        return ResponseEntity.ok(updatedEquipment);
    }

    // PATCH endpoints for status update - Using both DTO and Map approaches

    @PatchMapping("/status/{id}")
    public ResponseEntity<EquipmentDTO> updateEquipmentStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> requestBody) {

        EquipmentDTO updatedEquipment = equipmentService.updateEquipmentStatus(id, requestBody);
        return ResponseEntity.ok(updatedEquipment);
    }

    @PatchMapping("/status/dto/{id}")
    public ResponseEntity<EquipmentDTO> updateEquipmentStatusWithDTO(
            @PathVariable UUID id,
            @RequestBody EquipmentStatusUpdateDTO statusDTO) {

        EquipmentDTO updatedEquipment = equipmentService.updateEquipmentStatus(id, statusDTO);
        return ResponseEntity.ok(updatedEquipment);
    }

    // DELETE endpoint

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEquipment(@PathVariable UUID id) {
        equipmentService.deleteEquipment(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get all eligible drivers for a specific equipment type
     */
    @GetMapping("/type/{typeId}/eligible-drivers")
    public ResponseEntity<List<EmployeeSummaryDTO>> getEligibleDriversForEquipmentType(@PathVariable UUID typeId) {
        return ResponseEntity.ok(equipmentService.getEligibleDriversForEquipmentType(typeId));
    }

    /**
     * Check if an employee can be assigned as a driver for a specific equipment
     */
    @GetMapping("/{equipmentId}/check-driver-compatibility/{employeeId}")
    public ResponseEntity<EquipmentService.DriverCompatibilityResponse> checkDriverCompatibility(
            @PathVariable UUID equipmentId,
            @PathVariable UUID employeeId) {
        return ResponseEntity.ok(equipmentService.checkDriverCompatibility(equipmentId, employeeId));
    }

    // Update in EquipmentController.java
    @GetMapping("/{equipmentId}/consumables/by-category/{category}")
    public ResponseEntity<List<ConsumableDetailDTO>> getEquipmentConsumablesByCategory(
            @PathVariable UUID equipmentId,
            @PathVariable String category) {

        List<Consumable> consumables;

        switch(category.toLowerCase()) {
            case "current":
                // Regular inventory items (anything that's not STOLEN or OVERRECEIVED)
                consumables = consumableService.getRegularConsumables(equipmentId);
                break;
            case "shortage":
                // Items marked as STOLEN (underage)
                consumables = consumableService.getConsumablesByEquipmentIdAndStatus(equipmentId, ItemStatus.STOLEN);
                break;
            case "surplus":
                // Items marked as OVERRECEIVED (overage)
                consumables = consumableService.getConsumablesByEquipmentIdAndStatus(equipmentId, ItemStatus.OVERRECEIVED);
                break;
            default:
                // All consumables regardless of status
                consumables = consumableService.getConsumablesByEquipmentId(equipmentId);
        }

        List<ConsumableDetailDTO> consumableDetails = consumables.stream()
                .map(ConsumableDetailDTO::fromConsumable)
                .collect(Collectors.toList());

        return ResponseEntity.ok(consumableDetails);
    }

}