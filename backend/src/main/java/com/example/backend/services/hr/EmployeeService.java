package com.example.backend.services.hr;

import com.example.backend.models.hr.Employee;
import com.example.backend.repositories.hr.EmployeeRepository;
import com.example.backend.repositories.equipment.EquipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    public List<Employee> getWarehouseWorkers() {
        return employeeRepository.findByJobPositionName("Warehouse Worker");
    }

    public List<Employee> getWarehouseManagers() {
        return employeeRepository.findByJobPositionName("Warehouse Manager");
}

    public List<Employee> getDrivers() {
        return employeeRepository.findByJobPositionName("Driver");

    }

    public List<Employee> getTechnicians() {
        return employeeRepository.findByJobPositionName("Technician");
    }

    public List<Employee> getEmployees() {
        return employeeRepository.findAll();
    }

    // In your existing EmployeeService.java file, add these methods:

//    public List<Employee> getDriversByEquipmentType(String equipmentType) {
//        String driverPositionName = equipmentType + " Driver";
//        return employeeRepository.findByJobPositionName(driverPositionName);
//    }
//
//    public boolean validateDriverForEquipment(UUID driverId, UUID equipmentId) {
//        Employee driver = employeeRepository.findById(driverId)
//                .orElseThrow(() -> new RuntimeException("Driver not found"));
//
//        Equipment equipment = equipmentRepository.findById(equipmentId)
//                .orElseThrow(() -> new RuntimeException("Equipment not found"));
//
//        return equipment.isDriverCompatible(driver);
//    }

}