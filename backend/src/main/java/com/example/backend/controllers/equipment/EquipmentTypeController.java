package com.example.backend.controllers;

import com.example.backend.dto.EquipmentTypeDTO;
import com.example.backend.services.EquipmentTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/equipment-types")
public class EquipmentTypeController {

    private final EquipmentTypeService equipmentTypeService;

    @Autowired
    public EquipmentTypeController(EquipmentTypeService equipmentTypeService) {
        this.equipmentTypeService = equipmentTypeService;
    }

    @GetMapping
    public ResponseEntity<List<EquipmentTypeDTO>> getAllEquipmentTypes() {
        return ResponseEntity.ok(equipmentTypeService.getAllEquipmentTypes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipmentTypeDTO> getEquipmentTypeById(@PathVariable UUID id) {
        return ResponseEntity.ok(equipmentTypeService.getEquipmentTypeById(id));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<EquipmentTypeDTO> getEquipmentTypeByName(@PathVariable String name) {
        return ResponseEntity.ok(equipmentTypeService.getEquipmentTypeByName(name));
    }

    @PostMapping
    public ResponseEntity<EquipmentTypeDTO> createEquipmentType(@RequestBody EquipmentTypeDTO equipmentTypeDTO) {
        EquipmentTypeDTO savedType = equipmentTypeService.createEquipmentType(equipmentTypeDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedType);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipmentTypeDTO> updateEquipmentType(
            @PathVariable UUID id,
            @RequestBody EquipmentTypeDTO equipmentTypeDTO) {

        EquipmentTypeDTO updatedType = equipmentTypeService.updateEquipmentType(id, equipmentTypeDTO);
        return ResponseEntity.ok(updatedType);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEquipmentType(@PathVariable UUID id) {
        equipmentTypeService.deleteEquipmentType(id);
        return ResponseEntity.noContent().build();
    }
}