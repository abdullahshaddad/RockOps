package com.example.backend.repositories.warehouse;


import com.example.backend.models.warehouse.ItemResolution;
import com.example.backend.models.warehouse.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ItemResolutionRepository extends JpaRepository<ItemResolution, UUID> {

    // Find resolutions by item ID
    List<ItemResolution> findByItemId(UUID itemId);

    // Find resolutions by who resolved them
    List<ItemResolution> findByResolvedBy(String resolvedBy);

    // Find resolutions by warehouse - using a custom query to join through Item
    @Query("SELECT ir FROM ItemResolution ir JOIN ir.item i WHERE i.warehouse = :warehouse ORDER BY ir.resolvedAt DESC")
    List<ItemResolution> findByItemWarehouseOrderByResolvedAtDesc(@Param("warehouse") Warehouse warehouse);

    // Alternative method if the above doesn't work
    @Query("SELECT ir FROM ItemResolution ir WHERE ir.item.warehouse.id = :warehouseId ORDER BY ir.resolvedAt DESC")
    List<ItemResolution> findByItemWarehouseIdOrderByResolvedAtDesc(@Param("warehouseId") UUID warehouseId);
}