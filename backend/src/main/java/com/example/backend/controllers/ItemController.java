package com.example.Rock4Mining.controllers;

import com.example.Rock4Mining.models.Item;
import com.example.Rock4Mining.models.ItemCategory;
import com.example.Rock4Mining.models.Transaction;
import com.example.Rock4Mining.models.Warehouse;
import com.example.Rock4Mining.repositories.ItemRepository;
import com.example.Rock4Mining.services.ItemCategoryService;
import com.example.Rock4Mining.services.ItemService;
import com.example.Rock4Mining.services.WarehouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;


@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/items")
public class ItemController {

    @Autowired
    private  ItemService itemService;

    @Autowired
    private WarehouseService warehouseService;

    @Autowired
    private ItemCategoryService itemCategoryService;

    @Autowired
    private ItemRepository itemRepository;

//    @PostMapping("/process-transaction")
//    public ResponseEntity<?> processTransaction(@RequestBody Map<String, Object> transactionData) {
//        try {
//            Item updatedItem = itemService.processTransaction(transactionData);
//            return ResponseEntity.ok(updatedItem);
//        } catch (IllegalArgumentException e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong: " + e.getMessage());
//        }
//    }

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<Item>> getItemsByWarehouse(@PathVariable UUID warehouseId) {
        return ResponseEntity.ok(itemService.getItemsByWarehouse(warehouseId));
    }


    @PostMapping()
    public ResponseEntity<Item> createItem(@RequestBody Map<String, Object> request) {
        try {
            UUID itemTypeId = UUID.fromString((String) request.get("itemTypeId"));
            UUID warehouseId = UUID.fromString((String) request.get("warehouseId"));
            int initialQuantity = (int) request.get("initialQuantity");

            Item newItem = itemService.createItem(itemTypeId, warehouseId, initialQuantity);
            return ResponseEntity.ok(newItem);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

}
