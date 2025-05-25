package com.example.Rock4Mining.controllers;

import com.example.Rock4Mining.models.ItemCategory;
import com.example.Rock4Mining.services.ItemCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/itemCategories")
public class ItemCategoryController {

    @Autowired
    private ItemCategoryService itemCategoryService;

    // Create a new item category
    @PostMapping
    public ResponseEntity<ItemCategory> createItemCategory(@RequestBody Map<String, Object> requestBody) {
        ItemCategory newCategory = itemCategoryService.addItemCategory(requestBody);
        return new ResponseEntity<>(newCategory, HttpStatus.CREATED);
    }

    // Get all categories
    @GetMapping
    public ResponseEntity<List<ItemCategory>> getAllCategories() {
        System.out.println("************");
        List<ItemCategory> categories = itemCategoryService.getAllCategories();
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    // Get parent categories (categories that have children)
    @GetMapping("/parents")
    public ResponseEntity<List<ItemCategory>> getParentCategories() {
        List<ItemCategory> categories = itemCategoryService.getParentCategories();
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    // Get child categories (categories with a parent or without children)
    @GetMapping("/children")
    public ResponseEntity<List<ItemCategory>> getChildCategories() {
        List<ItemCategory> categories = itemCategoryService.getChildCategories();
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    // Get leaf categories (categories that have a parent but no children of their own)
    @GetMapping("/leaves")
    public ResponseEntity<List<ItemCategory>> getLeafCategories() {
        List<ItemCategory> categories = itemCategoryService.getLeafCategories();
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    // Get a category by ID
    @GetMapping("/{id}")
    public ResponseEntity<ItemCategory> getCategoryById(@PathVariable UUID id) {
        ItemCategory category = itemCategoryService.getCategoryById(id);
        return new ResponseEntity<>(category, HttpStatus.OK);
    }

    // Update a category
    @PutMapping("/{id}")
    public ResponseEntity<ItemCategory> updateCategory(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> requestBody) {
        ItemCategory updatedCategory = itemCategoryService.updateItemCategory(id, requestBody);
        return new ResponseEntity<>(updatedCategory, HttpStatus.OK);
    }

    // Delete a category
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID id) {
        itemCategoryService.deleteItemCategory(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        System.out.println("🔥 TEST ENDPOINT HIT 🔥");
        return new ResponseEntity<>("Test OK ✅", HttpStatus.OK);
    }

}