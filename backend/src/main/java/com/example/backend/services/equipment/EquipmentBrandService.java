package com.example.backend.services.equipment;

import com.example.backend.models.equipment.EquipmentBrand;
import com.example.backend.repositories.equipment.EquipmentBrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class EquipmentBrandService {

    @Autowired
    private EquipmentBrandRepository equipmentBrandRepository;

    public List<EquipmentBrand> getAllEquipmentBrands() {
        return equipmentBrandRepository.findAll();
    }

    public Optional<EquipmentBrand> getEquipmentBrandById(UUID id) {
        return equipmentBrandRepository.findById(id);
    }

    public EquipmentBrand createEquipmentBrand(EquipmentBrand equipmentBrand) {
        if (equipmentBrandRepository.existsByName(equipmentBrand.getName())) {
            throw new RuntimeException("Equipment brand with this name already exists");
        }
        return equipmentBrandRepository.save(equipmentBrand);
    }

    public EquipmentBrand updateEquipmentBrand(UUID id, EquipmentBrand equipmentBrand) {
        Optional<EquipmentBrand> existingBrand = equipmentBrandRepository.findById(id);
        if (existingBrand.isPresent()) {
            EquipmentBrand brand = existingBrand.get();
            brand.setName(equipmentBrand.getName());
            brand.setDescription(equipmentBrand.getDescription());
            return equipmentBrandRepository.save(brand);
        }
        throw new RuntimeException("Equipment brand not found");
    }

    public void deleteEquipmentBrand(UUID id) {
        if (!equipmentBrandRepository.existsById(id)) {
            throw new RuntimeException("Equipment brand not found");
        }
        equipmentBrandRepository.deleteById(id);
    }
} 