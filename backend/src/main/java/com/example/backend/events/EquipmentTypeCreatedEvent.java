package com.example.backend.events;

import com.example.backend.models.equipment.EquipmentType;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Event published when a new equipment type is created
 */
@Getter
@RequiredArgsConstructor
public class EquipmentTypeCreatedEvent {
    private final EquipmentType equipmentType;
}

