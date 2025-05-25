package com.example.backend.controllers;

import com.example.backend.dto.DocumentDTO;
import com.example.backend.models.Document.EntityType;
import com.example.backend.services.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @GetMapping("/documents/{id}")
    public ResponseEntity<DocumentDTO> getDocumentById(@PathVariable UUID id) {
        return ResponseEntity.ok(documentService.getDocumentById(id));
    }

    @GetMapping("/{entityType}/{entityId}/documents")
    public ResponseEntity<List<DocumentDTO>> getDocumentsByEntity(
            @PathVariable String entityType,
            @PathVariable String entityId) {
        try {
            UUID id = UUID.fromString(entityId);
            EntityType type = EntityType.valueOf(entityType.toUpperCase());
            return ResponseEntity.ok(documentService.getDocumentsByEntity(type, id));
        } catch (IllegalArgumentException e) {
            // Log the error
            System.err.println("Invalid parameters: " + e.getMessage());
            // Return empty list instead of error
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @PostMapping("/{entityType}/{entityId}/documents")
    public ResponseEntity<DocumentDTO> createDocument(
            @PathVariable String entityType,
            @PathVariable UUID entityId,
            @RequestParam("name") String name,
            @RequestParam("type") String type,
            @RequestParam("file") MultipartFile file) throws Exception {

        try {
            EntityType entityTypeEnum = EntityType.valueOf(entityType.toUpperCase());
            DocumentDTO createdDocument = documentService.createDocument(entityTypeEnum, entityId, name, type, file);
            return new ResponseEntity<>(createdDocument, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/documents/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable UUID id) throws Exception {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}