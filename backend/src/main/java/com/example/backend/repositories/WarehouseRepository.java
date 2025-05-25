package com.example.Rock4Mining.repositories;

import com.example.Rock4Mining.models.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, UUID> {

    List<Warehouse> findBySiteId(UUID siteId);

}
