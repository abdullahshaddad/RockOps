package com.example.backend.controllers;

import com.example.backend.models.MaintenanceConsumable;
import com.example.backend.services.MaintenanceConsumableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/equipment/maintenance")
public class MaintenanceConsumableController {

    @Autowired
    private MaintenanceConsumableService consumableService;

    // Get all consumables for a maintenance
    @GetMapping("/insite/{maintenanceId}/consumables")
    public ResponseEntity<List<MaintenanceConsumable>> getConsumablesByMaintenanceId(@PathVariable UUID maintenanceId) {
        return ResponseEntity.ok(consumableService.getConsumablesByMaintenanceId(maintenanceId));
    }

    // Add consumable to maintenance
    @PostMapping("/insite/{maintenanceId}/consumables")
    public ResponseEntity<MaintenanceConsumable> addConsumableToMaintenance(
            @PathVariable UUID maintenanceId,
            @RequestParam UUID itemTypeId,
            @RequestParam Integer quantity) {

        MaintenanceConsumable consumable = consumableService.addConsumableToMaintenance(
                maintenanceId, itemTypeId, quantity);

        return ResponseEntity.status(HttpStatus.CREATED).body(consumable);
    }

    // Update consumable quantity
    @PutMapping("/consumables/{consumableId}")
    public ResponseEntity<MaintenanceConsumable> updateConsumableQuantity(
            @PathVariable UUID consumableId,
            @RequestParam Integer quantity) {

        MaintenanceConsumable consumable = consumableService.updateConsumableQuantity(consumableId, quantity);
        return ResponseEntity.ok(consumable);
    }

    // Remove consumable
    @DeleteMapping("/consumables/{consumableId}")
    public ResponseEntity<Void> removeConsumable(@PathVariable UUID consumableId) {
        consumableService.removeConsumable(consumableId);
        return ResponseEntity.noContent().build();
    }

    // Remove all consumables for a maintenance
    @DeleteMapping("/insite/{maintenanceId}/consumables")
    public ResponseEntity<Void> removeAllConsumablesForMaintenance(@PathVariable UUID maintenanceId) {
        consumableService.removeAllConsumablesForMaintenance(maintenanceId);
        return ResponseEntity.noContent().build();
    }
}