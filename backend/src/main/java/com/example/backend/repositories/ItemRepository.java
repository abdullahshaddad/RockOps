package com.example.backend.repositories;

import com.example.backend.models.Item;
import com.example.backend.models.ItemStatus;
import com.example.backend.models.ItemType;
import com.example.backend.models.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ItemRepository extends JpaRepository<Item, UUID> {

    Optional<Item> findByItemTypeIdAndWarehouseId(UUID itemTypeId, UUID warehouseId);

    // Methods that return multiple items (List)
    List<Item> findAllByItemTypeIdAndWarehouseId(UUID itemTypeId, UUID warehouseId);

    List<Item> findAllByItemTypeIdAndWarehouseIdAndItemStatus(
            UUID itemTypeId,
            UUID warehouseId,
            ItemStatus status);

    List<Item> findAllByItemTypeIdAndWarehouseIdAndItemStatusAndQuantity(
            UUID itemTypeId,
            UUID warehouseId,
            ItemStatus status,
            int quantity);

    List<Item> findByWarehouse(Warehouse warehouse);

    Optional<Item> findByItemTypeAndWarehouse(ItemType itemType, Warehouse warehouse);

}

