package com.example.backend.dto;

import com.example.backend.models.EquipmentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentStatusUpdateDTO {
    private EquipmentStatus status;
}