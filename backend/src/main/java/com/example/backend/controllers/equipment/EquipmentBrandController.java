package com.example.backend.controllers.equipment;

import com.example.backend.models.equipment.EquipmentBrand;
import com.example.backend.services.equipment.EquipmentBrandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/equipment/brands")
public class EquipmentBrandController {
    @Autowired
    private EquipmentBrandService equipmentBrandService;

    @GetMapping
    public ResponseEntity<List<EquipmentBrand>> getAllEquipmentBrands() {
        return ResponseEntity.ok(equipmentBrandService.getAllEquipmentBrands());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipmentBrand> getEquipmentBrandById(@PathVariable UUID id) {
        return equipmentBrandService.getEquipmentBrandById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<EquipmentBrand> createEquipmentBrand(@RequestBody EquipmentBrand equipmentBrand) {
        return ResponseEntity.ok(equipmentBrandService.createEquipmentBrand(equipmentBrand));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipmentBrand> updateEquipmentBrand(@PathVariable UUID id, @RequestBody EquipmentBrand equipmentBrand) {
        return ResponseEntity.ok(equipmentBrandService.updateEquipmentBrand(id, equipmentBrand));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEquipmentBrand(@PathVariable UUID id) {
        equipmentBrandService.deleteEquipmentBrand(id);
        return ResponseEntity.ok().build();
    }
} 