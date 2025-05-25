package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

// DTO for creating/updating work types
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkTypeDTO {
    private UUID id;
    private String name;
    private String description;
    private boolean active;
}



