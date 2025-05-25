package com.example.backend.dto;

import com.example.backend.models.Document.EntityType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDTO {
    private UUID id;
    private EntityType entityType;
    private UUID entityId;
    private String entityName; // Name of the entity (e.g., equipment type, site name, etc.)
    private String name;
    private String type;
    private LocalDate dateUploaded;
    private String size;
    private String url;
    private String uploadedBy;
}