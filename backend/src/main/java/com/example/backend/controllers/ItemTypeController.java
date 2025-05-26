package com.example.backend.controllers;

import com.example.backend.models.ItemType;
import com.example.backend.services.ItemTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/itemTypes")
public class ItemTypeController {

    @Autowired
    private ItemTypeService itemTypeService;

    // Add a new ItemType (no need for warehouse ID anymore)
    @PostMapping
    public ResponseEntity<ItemType> addItemType(@RequestBody Map<String, Object> requestBody) {
        ItemType createdItemType = itemTypeService.addItemType(requestBody);
        return ResponseEntity.ok(createdItemType);
    }

    // Get all ItemTypes (no need for warehouse-specific logic)
    @GetMapping
    public ResponseEntity<List<ItemType>> getAllItemTypes() {
        List<ItemType> itemTypes = itemTypeService.getAllItemTypes();
        return ResponseEntity.ok(itemTypes);
    }

    // Update an existing ItemType
    @PutMapping("/{id}")
    public ResponseEntity<ItemType> updateItemType(@PathVariable UUID id, @RequestBody Map<String, Object> requestBody) {
        ItemType updatedItemType = itemTypeService.updateItemType(id, requestBody);
        return ResponseEntity.ok(updatedItemType);
    }

    // Delete an existing ItemType
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteItemType(@PathVariable UUID id) {
        itemTypeService.deleteItemType(id);
        return ResponseEntity.ok("ItemType with ID " + id + " deleted successfully");
    }
}
