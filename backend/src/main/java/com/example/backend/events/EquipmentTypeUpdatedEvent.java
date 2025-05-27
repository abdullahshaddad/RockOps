package com.example.backend.events;

import com.example.backend.models.equipment.EquipmentType;
import lombok.Getter;
import lombok.RequiredArgsConstructor; /**
 * Event published when an equipment type is updated (especially name changes)
 */
@Getter
@RequiredArgsConstructor
public class EquipmentTypeUpdatedEvent {
    private final String oldName;
    private final EquipmentType updatedEquipmentType;
}
