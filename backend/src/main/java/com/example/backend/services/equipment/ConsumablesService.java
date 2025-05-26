package com.example.backend.services.equipment;

import com.example.backend.models.ItemStatus;
import com.example.backend.models.Warehouse;
import com.example.backend.models.equipment.Consumable;
import com.example.backend.models.equipment.Equipment;
import com.example.backend.repositories.equipment.ConsumableRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ConsumablesService {


    @Autowired
    private ConsumableRepository consumableRepository;

    @Transactional
    public void createConsumableTransaction(Equipment equipment, Warehouse warehouse, Integer quantity, LocalDateTime timestamp) {

    }


    // You can implement other methods as needed, such as for viewing pending transactions, etc.
    public List<Consumable> getConsumablesByEquipmentId(UUID equipmentId) {
        return consumableRepository.findByEquipmentId(equipmentId);
    }

    // Add to ConsumablesService.java
    /**
     * Get regular consumables (not STOLEN or OVERRECEIVED)
     */
    public List<Consumable> getRegularConsumables(UUID equipmentId) {
        // Get all consumables for this equipment that are NOT marked as STOLEN or OVERRECEIVED
        return consumableRepository.findByEquipmentId(equipmentId).stream()
                .filter(c -> c.getStatus() != ItemStatus.STOLEN && c.getStatus() != ItemStatus.OVERRECEIVED)
                .collect(Collectors.toList());
    }

    public List<Consumable> getConsumablesByEquipmentIdAndStatus(UUID equipmentId, ItemStatus itemStatus) {
        return consumableRepository.findByEquipmentIdAndStatus(equipmentId, itemStatus);
    }
}

