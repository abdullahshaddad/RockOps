package com.example.backend.events;

import com.example.backend.services.hr.JobPositionAutomationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Event listener that automatically creates job positions when equipment types are created
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EquipmentTypeEventListener {

    private final JobPositionAutomationService jobPositionAutomationService;

    /**
     * Listen for equipment type creation events and automatically create corresponding job positions
     * This runs IMMEDIATELY after an equipment type is created via API
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleEquipmentTypeCreated(EquipmentTypeCreatedEvent event) {
        log.info("Equipment type created: {} - Creating corresponding job position",
                event.getEquipmentType().getName());

        try {
            jobPositionAutomationService.createDriverPositionForEquipmentType(event.getEquipmentType());
            log.info("Successfully created job position for equipment type: {}",
                    event.getEquipmentType().getName());
        } catch (Exception e) {
            log.error("Failed to create job position for equipment type: {}",
                    event.getEquipmentType().getName(), e);
            // Don't throw the exception to avoid rolling back the equipment type creation
        }
    }

    /**
     * Handle equipment type updates (name changes)
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleEquipmentTypeUpdated(EquipmentTypeUpdatedEvent event) {
        if (!event.getOldName().equals(event.getUpdatedEquipmentType().getName())) {
            log.info("Equipment type renamed from '{}' to '{}' - Updating job position",
                    event.getOldName(), event.getUpdatedEquipmentType().getName());

            try {
                jobPositionAutomationService.handleEquipmentTypeRenamed(
                        event.getOldName(), event.getUpdatedEquipmentType());
            } catch (Exception e) {
                log.error("Failed to update job position for renamed equipment type", e);
            }
        }
    }
}