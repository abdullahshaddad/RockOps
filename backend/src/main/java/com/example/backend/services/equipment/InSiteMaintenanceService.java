package com.example.backend.services;

import com.example.backend.services.finance.equipment.EquipmentRepository;
import com.example.backend.services.finance.equipment.InSiteMaintenanceRepository;
import com.example.backend.services.finance.equipment.finance.models.*;
import com.example.backend.services.finance.equipment.finance.models.equipment.Equipment;
import com.example.backend.services.finance.equipment.finance.models.equipment.InSiteMaintenance;
import com.example.backend.services.finance.equipment.finance.models.hr.Employee;
import com.example.backend.repositories.*;
import com.example.backend.repositories.hr.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class InSiteMaintenanceService {

    @Autowired
    private InSiteMaintenanceRepository inSiteMaintenanceRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private TransactionRepository transactionRepository;

    // Get all maintenance records for equipment
    public List<InSiteMaintenance> getMaintenanceByEquipmentId(UUID equipmentId) {
        return inSiteMaintenanceRepository.findByEquipmentId(equipmentId);
    }

    // Create a new maintenance record
    public InSiteMaintenance createMaintenance(UUID equipmentId,
                                               UUID technicianId,
                                               LocalDateTime maintenanceDate,
                                               String maintenanceType,
                                               String description,
                                               String status) {

        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Equipment not found"));

        Employee technician = employeeRepository.findById(technicianId)
                .orElseThrow(() -> new IllegalArgumentException("Technician not found"));

        InSiteMaintenance maintenance = InSiteMaintenance.builder()
                .equipment(equipment)
                .technician(technician)
                .maintenanceDate(maintenanceDate)
                .maintenanceType(maintenanceType)
                .description(description)
                .status(status)
                .build();

        return inSiteMaintenanceRepository.save(maintenance);
    }

    // Find a transaction by batch number
    public Optional<Transaction> findTransactionByBatchNumber(int batchNumber) {
        return transactionRepository.findByBatchNumber(batchNumber);
    }

    // Link an existing transaction to a maintenance record
    public InSiteMaintenance linkTransactionToMaintenance(UUID maintenanceId, UUID transactionId) {
        InSiteMaintenance maintenance = inSiteMaintenanceRepository.findById(maintenanceId)
                .orElseThrow(() -> new IllegalArgumentException("Maintenance record not found"));

        Transaction transaction = transactionService.getTransactionById(transactionId);

        // Set the transaction purpose to MAINTENANCE if it's not already
        if (transaction.getPurpose() != TransactionPurpose.MAINTENANCE) {
            transaction.setPurpose(TransactionPurpose.MAINTENANCE);
            transactionRepository.save(transaction);
        }

        if (!maintenance.getRelatedTransactions().contains(transaction)) {
            maintenance.getRelatedTransactions().add(transaction);
        }

        return inSiteMaintenanceRepository.save(maintenance);
    }

    // Update maintenance record
    public InSiteMaintenance updateMaintenance(UUID maintenanceId,
                                               UUID technicianId,
                                               LocalDateTime maintenanceDate,
                                               String maintenanceType,
                                               String description,
                                               String status) {

        InSiteMaintenance maintenance = inSiteMaintenanceRepository.findById(maintenanceId)
                .orElseThrow(() -> new IllegalArgumentException("Maintenance record not found"));

        Employee technician = employeeRepository.findById(technicianId)
                .orElseThrow(() -> new IllegalArgumentException("Technician not found"));

        maintenance.setTechnician(technician);
        maintenance.setMaintenanceDate(maintenanceDate);
        maintenance.setMaintenanceType(maintenanceType);
        maintenance.setDescription(description);
        maintenance.setStatus(status);

        return inSiteMaintenanceRepository.save(maintenance);
    }

    // Delete maintenance record
    public void deleteMaintenance(UUID maintenanceId) {
        inSiteMaintenanceRepository.deleteById(maintenanceId);
    }
}