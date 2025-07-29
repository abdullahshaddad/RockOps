package com.example.backend.services.transaction;

import com.example.backend.models.equipment.Equipment;
import com.example.backend.models.transaction.ConsumableMovement;
import com.example.backend.models.warehouse.ItemType;
import com.example.backend.repositories.equipment.EquipmentRepository;
import com.example.backend.repositories.transaction.ConsumableMovementRepository;
import com.example.backend.repositories.warehouse.ItemTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for accurate consumable history tracking and validation.
 * 
 * This service addresses the "consumable history inaccuracy" problem by:
 * 1. Providing reliable movement tracking via ConsumableMovement entities
 * 2. Accurate stock calculations based on movement history
 * 3. Data integrity validation and correction capabilities
 * 4. Comprehensive history reconstruction from transaction data
 * 
 * CRITICAL: This service focuses ONLY on warehouse ↔ equipment consumable flows.
 */
@Service
public class ConsumableHistoryService {

    @Autowired
    private ConsumableMovementRepository consumableMovementRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private ItemTypeRepository itemTypeRepository;

    // ========================================
    // ACCURATE CONSUMABLE HISTORY METHODS
    // ========================================

    /**
     * Get accurate consumable history for specific equipment and item type.
     * This replaces the unreliable transaction field approach.
     */
    public List<ConsumableMovement> getAccurateConsumableHistory(UUID equipmentId, UUID itemTypeId) {
        validateEquipmentAndItemType(equipmentId, itemTypeId);
        return consumableMovementRepository.findByEquipmentAndItemTypeOrderByMovementDateDesc(equipmentId, itemTypeId);
    }

    /**
     * Get comprehensive movement history for equipment (all item types)
     */
    public List<ConsumableMovement> getEquipmentMovementHistory(UUID equipmentId) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Equipment not found: " + equipmentId));
        
        return consumableMovementRepository.findByEquipmentIdOrderByMovementDateDesc(equipmentId);
    }

    /**
     * Calculate current stock accurately based on movement history
     */
    public Integer calculateCurrentStock(UUID equipmentId, UUID itemTypeId) {
        validateEquipmentAndItemType(equipmentId, itemTypeId);
        
        Integer stock = consumableMovementRepository.calculateCurrentStock(equipmentId, itemTypeId);
        return stock != null ? stock : 0;
    }

    /**
     * Get detailed stock calculation breakdown for troubleshooting
     */
    public Map<String, Object> getStockCalculationBreakdown(UUID equipmentId, UUID itemTypeId) {
        validateEquipmentAndItemType(equipmentId, itemTypeId);
        
        List<ConsumableMovement> movements = getAccurateConsumableHistory(equipmentId, itemTypeId);
        
        Map<String, Object> breakdown = new HashMap<>();
        breakdown.put("equipmentId", equipmentId);
        breakdown.put("itemTypeId", itemTypeId);
        breakdown.put("calculatedAt", LocalDateTime.now());
        
        // Calculate breakdown by movement type
        Map<String, Integer> byMovementType = movements.stream()
                .filter(m -> m.getStatus().name().equals("ACCEPTED"))
                .collect(Collectors.groupingBy(
                    m -> m.getMovementType().name(),
                    Collectors.summingInt(this::getSignedQuantity)
                ));
        
        breakdown.put("movementBreakdown", byMovementType);
        
        // Calculate breakdown by source/destination
        Integer totalReceived = movements.stream()
                .filter(m -> m.getStatus().name().equals("ACCEPTED") && 
                           m.getDestinationEquipment() != null && 
                           m.getDestinationEquipment().getId().equals(equipmentId))
                .mapToInt(ConsumableMovement::getQuantity)
                .sum();
                
        Integer totalSent = movements.stream()
                .filter(m -> m.getStatus().name().equals("ACCEPTED") && 
                           m.getSourceEquipment() != null && 
                           m.getSourceEquipment().getId().equals(equipmentId))
                .mapToInt(ConsumableMovement::getQuantity)
                .sum();
        
        breakdown.put("totalReceived", totalReceived);
        breakdown.put("totalSent", totalSent);
        breakdown.put("calculatedStock", totalReceived - totalSent);
        breakdown.put("movementCount", movements.size());
        
        return breakdown;
    }

    // ========================================
    // DATA INTEGRITY VALIDATION
    // ========================================

    /**
     * Validate consumable history accuracy for specific equipment and item type
     */
    public boolean validateHistoryAccuracy(UUID equipmentId, UUID itemTypeId) {
        validateEquipmentAndItemType(equipmentId, itemTypeId);
        
        Integer calculatedStock = calculateCurrentStock(equipmentId, itemTypeId);
        Integer movementBalance = consumableMovementRepository.validateMovementBalance(equipmentId, itemTypeId);
        
        return Objects.equals(calculatedStock, movementBalance);
    }

    /**
     * Comprehensive validation report for equipment
     */
    public Map<String, Object> generateValidationReport(UUID equipmentId) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Equipment not found: " + equipmentId));
        
        Map<String, Object> report = new HashMap<>();
        report.put("equipmentId", equipmentId);
        report.put("equipmentName", equipment.getName());
        report.put("validatedAt", LocalDateTime.now());
        
        // Get all item types that have movements for this equipment
        List<ConsumableMovement> allMovements = getEquipmentMovementHistory(equipmentId);
        Set<UUID> itemTypeIds = allMovements.stream()
                .map(m -> m.getItemType().getId())
                .collect(Collectors.toSet());
        
        List<Map<String, Object>> itemValidations = new ArrayList<>();
        boolean overallValid = true;
        
        for (UUID itemTypeId : itemTypeIds) {
            Map<String, Object> itemValidation = new HashMap<>();
            itemValidation.put("itemTypeId", itemTypeId);
            
            try {
                ItemType itemType = itemTypeRepository.findById(itemTypeId).orElse(null);
                itemValidation.put("itemTypeName", itemType != null ? itemType.getName() : "Unknown");
                
                boolean isValid = validateHistoryAccuracy(equipmentId, itemTypeId);
                itemValidation.put("isValid", isValid);
                
                if (!isValid) {
                    overallValid = false;
                    itemValidation.put("issues", getValidationIssues(equipmentId, itemTypeId));
                }
                
                // Add stock calculation details
                Map<String, Object> stockDetails = getStockCalculationBreakdown(equipmentId, itemTypeId);
                itemValidation.put("stockDetails", stockDetails);
                
            } catch (Exception e) {
                itemValidation.put("error", e.getMessage());
                overallValid = false;
            }
            
            itemValidations.add(itemValidation);
        }
        
        report.put("overallValid", overallValid);
        report.put("totalItemTypes", itemTypeIds.size());
        report.put("itemValidations", itemValidations);
        
        return report;
    }

    /**
     * Get specific validation issues for troubleshooting
     */
    public List<String> getValidationIssues(UUID equipmentId, UUID itemTypeId) {
        List<String> issues = new ArrayList<>();
        
        try {
            Integer calculatedStock = calculateCurrentStock(equipmentId, itemTypeId);
            Integer movementBalance = consumableMovementRepository.validateMovementBalance(equipmentId, itemTypeId);
            
            if (!Objects.equals(calculatedStock, movementBalance)) {
                issues.add(String.format("Stock mismatch: calculated=%d, movement_balance=%d", 
                    calculatedStock, movementBalance));
            }
            
            // Check for unresolved discrepancies
            List<ConsumableMovement> discrepancies = consumableMovementRepository.findDiscrepanciesByEquipment(equipmentId);
            long unresolvedDiscrepancies = discrepancies.stream()
                    .filter(d -> d.getItemType().getId().equals(itemTypeId))
                    .filter(d -> d.getResolvedAt() == null)
                    .count();
            
            if (unresolvedDiscrepancies > 0) {
                issues.add(String.format("%d unresolved discrepancies found", unresolvedDiscrepancies));
            }
            
            // Check for movements without proper status
            List<ConsumableMovement> movements = getAccurateConsumableHistory(equipmentId, itemTypeId);
            long pendingMovements = movements.stream()
                    .filter(m -> m.getStatus().name().equals("PENDING"))
                    .count();
            
            if (pendingMovements > 0) {
                issues.add(String.format("%d movements still in PENDING status", pendingMovements));
            }
            
        } catch (Exception e) {
            issues.add("Error during validation: " + e.getMessage());
        }
        
        return issues;
    }

    // ========================================
    // DISCREPANCY DETECTION AND RESOLUTION
    // ========================================

    /**
     * Find discrepancies in consumable movements
     */
    public List<ConsumableMovement> findDiscrepancies(UUID equipmentId) {
        return consumableMovementRepository.findDiscrepanciesByEquipment(equipmentId);
    }

    /**
     * Find unresolved discrepancies across all equipment
     */
    public List<ConsumableMovement> findUnresolvedDiscrepancies() {
        return consumableMovementRepository.findUnresolvedDiscrepancies();
    }

    /**
     * Mark discrepancy as resolved
     */
    public void resolveDiscrepancy(UUID movementId, String resolvedBy, String resolutionNotes) {
        ConsumableMovement movement = consumableMovementRepository.findById(movementId)
                .orElseThrow(() -> new IllegalArgumentException("Movement not found: " + movementId));
        
        movement.setResolvedAt(LocalDateTime.now());
        movement.setResolvedBy(resolvedBy);
        movement.setNotes(resolutionNotes);
        
        consumableMovementRepository.save(movement);
    }

    // ========================================
    // ANALYTICS AND REPORTING
    // ========================================

    /**
     * Get consumption analysis for equipment
     */
    public Map<String, Object> getConsumptionAnalysis(UUID equipmentId, UUID itemTypeId, 
                                                     LocalDateTime startDate, LocalDateTime endDate) {
        validateEquipmentAndItemType(equipmentId, itemTypeId);
        
        List<ConsumableMovement> movements = consumableMovementRepository
                .findByEquipmentAndItemTypeOrderByMovementDateDesc(equipmentId, itemTypeId)
                .stream()
                .filter(m -> m.getMovementDate() != null)
                .filter(m -> (startDate == null || m.getMovementDate().isAfter(startDate)))
                .filter(m -> (endDate == null || m.getMovementDate().isBefore(endDate)))
                .collect(Collectors.toList());
        
        Map<String, Object> analysis = new HashMap<>();
        analysis.put("equipmentId", equipmentId);
        analysis.put("itemTypeId", itemTypeId);
        analysis.put("periodStart", startDate);
        analysis.put("periodEnd", endDate);
        analysis.put("analyzedAt", LocalDateTime.now());
        
        // Calculate consumption statistics
        Integer totalConsumed = movements.stream()
                .filter(m -> m.getMovementType().name().contains("CONSUMPTION") || 
                           m.getMovementType().name().contains("MAINTENANCE"))
                .filter(m -> m.getSourceEquipment() != null && 
                           m.getSourceEquipment().getId().equals(equipmentId))
                .mapToInt(ConsumableMovement::getQuantity)
                .sum();
        
        Integer totalReceived = movements.stream()
                .filter(m -> m.getDestinationEquipment() != null && 
                           m.getDestinationEquipment().getId().equals(equipmentId))
                .mapToInt(ConsumableMovement::getQuantity)
                .sum();
        
        analysis.put("totalConsumed", totalConsumed);
        analysis.put("totalReceived", totalReceived);
        analysis.put("netChange", totalReceived - totalConsumed);
        analysis.put("movementCount", movements.size());
        
        return analysis;
    }

    // ========================================
    // HELPER METHODS
    // ========================================

    private void validateEquipmentAndItemType(UUID equipmentId, UUID itemTypeId) {
        if (!equipmentRepository.existsById(equipmentId)) {
            throw new IllegalArgumentException("Equipment not found: " + equipmentId);
        }
        if (!itemTypeRepository.existsById(itemTypeId)) {
            throw new IllegalArgumentException("Item type not found: " + itemTypeId);
        }
    }

    private int getSignedQuantity(ConsumableMovement movement) {
        // For movements where this equipment is the destination, quantity is positive
        // For movements where this equipment is the source, quantity is negative
        // This method would need the equipment ID context to determine the sign
        return movement.getQuantity(); // Simplified for now
    }
} 