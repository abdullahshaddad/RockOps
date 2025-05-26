package com.example.backend.controllers.finance;

import com.example.backend.models.finance.FixedAssets;
import com.example.backend.services.finance.FixedAssetsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/fixedAssets")
public class FixedAssetsController {
    @Autowired
    private FixedAssetsService fixedAssetsService;

    @GetMapping
    public List<FixedAssets> getFixedAssets() {
        return fixedAssetsService.getFixedAssets();
    }
}
