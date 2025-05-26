package com.example.backend.dto.equipment;

import com.example.backend.models.equipment.EquipmentType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentTypeDTO {
    private UUID id;
    private String name;
    private String description;

    // Convert Entity to DTO
    public static EquipmentTypeDTO fromEntity(EquipmentType equipmentType) {
        if (equipmentType == null) return null;

        EquipmentTypeDTO dto = new EquipmentTypeDTO();
        dto.setId(equipmentType.getId());
        dto.setName(equipmentType.getName());
        dto.setDescription(equipmentType.getDescription());
        return dto;
    }

    // Convert DTO to Entity
    public EquipmentType toEntity() {
        EquipmentType entity = new EquipmentType();
        entity.setId(this.id);
        entity.setName(this.name);
        entity.setDescription(this.description);
        return entity;
    }
}