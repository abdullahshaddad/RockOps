package com.example.Rock4Mining.services;

import com.example.Rock4Mining.models.PartyType;
import com.example.Rock4Mining.models.Site;
import com.example.Rock4Mining.models.Warehouse;
import com.example.Rock4Mining.repositories.SiteRepository;
import com.example.Rock4Mining.repositories.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class EntityService {
    @Autowired
    private WarehouseRepository warehouseRepository;

//    @Autowired
//    private EquipmentRepository equipmentRepository;

    @Autowired
    private SiteRepository siteRepository;



    /**
     * Get entity name by type and ID
     */
    public String getEntityName(PartyType type, UUID id) {
        switch (type) {
            case WAREHOUSE:
                return warehouseRepository.findById(id)
                        .map(Warehouse::getName)
                        .orElse("Unknown Warehouse");
//            case EQUIPMENT:
//                return equipmentRepository.findById(id)
//                        .map(Equipment::getName)
//                        .orElse("Unknown Equipment");


            default:
                return "Unknown Entity";
        }
    }
}
