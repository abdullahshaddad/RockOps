package com.example.backend.services.finance;

import com.example.backend.services.finance.equipment.finance.models.finance.FixedAssets;
import com.example.backend.services.finance.equipment.finance.FixedAssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FixedAssetsService {
    @Autowired
    private FixedAssetRepository fixedAssetRepository;

    public List<FixedAssets> getFixedAssets() {
        return fixedAssetRepository.findAll();
    }
}
