package com.example.backend.dto.equipment;

import com.example.backend.models.equipment.EquipmentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentStatusUpdateDTO {
    private EquipmentStatus status;
}