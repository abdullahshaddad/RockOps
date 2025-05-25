package com.example.Rock4Mining.controllers;

import com.example.Rock4Mining.models.Warehouse;
import com.example.Rock4Mining.services.WarehouseMTService;
import com.example.Rock4Mining.services.WarehouseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/warehouseMT")
public class WarehouseMTController
{
    @Autowired
    private WarehouseMTService warehouseMTService;



    @PostMapping()
    public ResponseEntity<Warehouse> addWarehouse(@RequestBody Map<String, Object> requestBody) {
        Warehouse savedWarehouse = warehouseMTService.addWarehouse(requestBody);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedWarehouse);
    }


    @PutMapping("/update/{id}")
    public ResponseEntity<Warehouse> updateWarehouse(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> requestBody) {

        Warehouse updatedWarehouse = warehouseMTService.updateWarehouse(id, requestBody);
        return ResponseEntity.ok(updatedWarehouse);
    }


}
