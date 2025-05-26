package com.example.backend.services.equipment;

import com.example.backend.exceptions.ResourceNotFoundException;
import com.example.backend.models.equipment.InSiteMaintenance;
import com.example.backend.models.equipment.MaintenanceConsumable;
import com.example.backend.models.warehouse.ItemType;
import com.example.backend.repositories.equipment.InSiteMaintenanceRepository;
import com.example.backend.repositories.equipment.MaintenanceConsumableRepository;
import com.example.backend.repositories.warehouse.ItemTypeRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class MaintenanceConsumableService {

    @Autowired
    private MaintenanceConsumableRepository maintenanceConsumableRepository;

    @Autowired
    private InSiteMaintenanceRepository maintenanceRepository;

    @Autowired
    private ItemTypeRepository itemTypeRepository;

    // Get all consumables used in a specific maintenance
    public List<MaintenanceConsumable> getConsumablesByMaintenanceId(UUID maintenanceId) {
        return maintenanceConsumableRepository.findByMaintenanceId(maintenanceId);
    }

    // Add consumable to maintenance
    @Transactional
    public MaintenanceConsumable addConsumableToMaintenance(UUID maintenanceId, UUID itemTypeId, Integer quantity) {
        InSiteMaintenance maintenance = maintenanceRepository.findById(maintenanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance not found with id: " + maintenanceId));

        ItemType itemType = itemTypeRepository.findById(itemTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Item type not found with id: " + itemTypeId));

        MaintenanceConsumable consumable = new MaintenanceConsumable();
        consumable.setMaintenance(maintenance);
        consumable.setItemType(itemType);
        consumable.setQuantity(quantity);

        return maintenanceConsumableRepository.save(consumable);
    }

    // Update consumable quantity
    @Transactional
    public MaintenanceConsumable updateConsumableQuantity(UUID consumableId, Integer quantity) {
        MaintenanceConsumable consumable = maintenanceConsumableRepository.findById(consumableId)
                .orElseThrow(() -> new ResourceNotFoundException("Consumable not found with id: " + consumableId));

        consumable.setQuantity(quantity);
        return maintenanceConsumableRepository.save(consumable);
    }

    // Remove consumable from maintenance
    @Transactional
    public void removeConsumable(UUID consumableId) {
        if (!maintenanceConsumableRepository.existsById(consumableId)) {
            throw new ResourceNotFoundException("Consumable not found with id: " + consumableId);
        }

        maintenanceConsumableRepository.deleteById(consumableId);
    }

    // Remove all consumables for a maintenance
    @Transactional
    public void removeAllConsumablesForMaintenance(UUID maintenanceId) {
        if (!maintenanceRepository.existsById(maintenanceId)) {
            throw new ResourceNotFoundException("Maintenance not found with id: " + maintenanceId);
        }

        maintenanceConsumableRepository.deleteByMaintenanceId(maintenanceId);
    }
}