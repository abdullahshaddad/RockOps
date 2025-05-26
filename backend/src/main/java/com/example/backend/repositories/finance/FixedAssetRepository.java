package com.example.backend.repositories.finance;

import com.example.backend.models.finance.FixedAssets;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface FixedAssetRepository extends JpaRepository<FixedAssets, UUID> {
}
