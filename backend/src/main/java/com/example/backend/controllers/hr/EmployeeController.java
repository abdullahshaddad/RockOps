package com.example.backend.controllers.hr;

import com.example.backend.models.hr.Employee;
import com.example.backend.services.hr.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @GetMapping("/warehouse-workers")
    public List<Employee> getWarehouseWorkers() {
        return employeeService.getWarehouseWorkers();
    }

    @GetMapping("/warehouse-managers")
    public List<Employee> getWarehouseManagers() {
        return employeeService.getWarehouseManagers();
    }

    @GetMapping("/drivers")
    public List<Employee> getDrivers() {
        return employeeService.getDrivers();
    }

    @GetMapping("/technicians")
    public List<Employee> getTechnicians() {
        return employeeService.getTechnicians();
    }


    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getEmployees() {
        List<Map<String, Object>> employeeList = employeeService.getEmployees().stream().map(emp -> {
            Map<String, Object> employeeData = new HashMap<>();

            // Basic information
            employeeData.put("id", emp.getId());
            employeeData.put("firstName", emp.getFirstName());
            employeeData.put("lastName", emp.getLastName());
            employeeData.put("middleName", emp.getMiddleName());
            employeeData.put("fullName", emp.getFullName());

            employeeData.put("status", emp.getStatus());

            // Contact information
            employeeData.put("email", emp.getEmail());
            employeeData.put("phoneNumber", emp.getPhoneNumber());
            employeeData.put("address", emp.getAddress());
            employeeData.put("city", emp.getCity());

            // Personal details
            employeeData.put("birthDate", emp.getBirthDate());
            employeeData.put("gender", emp.getGender());
            employeeData.put("maritalStatus", emp.getMaritalStatus());
            employeeData.put("militaryStatus", emp.getMilitaryStatus());
            employeeData.put("nationalIDNumber", emp.getNationalIDNumber());
            employeeData.put("license", emp.getLicense());

            // Employment details
            employeeData.put("hireDate", emp.getHireDate());

            // Additional details
            employeeData.put("education", emp.getEducation());

            // Financial information
            employeeData.put("baseSalary", emp.getBaseSalary());
            employeeData.put("monthlySalary", emp.getMonthlySalary());
            employeeData.put("annualTotalCompensation", emp.getAnnualTotalCompensation());

            // Images
            employeeData.put("photoUrl", emp.getPhotoUrl());
            employeeData.put("idFrontImage", emp.getIdFrontImage());
            employeeData.put("idBackImage", emp.getIdBackImage());

            // Related entities
            if (emp.getSite() != null) {
                employeeData.put("siteId", emp.getSite().getId());
                employeeData.put("siteName", emp.getSite().getName());
            }

            if (emp.getWarehouse() != null) {
                employeeData.put("warehouseId", emp.getWarehouse().getId());
                employeeData.put("warehouseName", emp.getWarehouse().getName());
            }

            if (emp.getJobPosition() != null) {
                employeeData.put("jobPositionId", emp.getJobPosition().getId());
                employeeData.put("jobPositionName", emp.getJobPosition().getPositionName());
                employeeData.put("jobPositionDepartment", emp.getJobPosition().getDepartment());
                employeeData.put("jobPositionType", emp.getJobPosition().getType());
            }

            return employeeData;
        }).toList();

        return ResponseEntity.ok(employeeList);
    }

//    @GetMapping("/drivers/byEquipmentType/{equipmentType}")
//    public ResponseEntity<List<Employee>> getDriversByEquipmentType(@PathVariable String equipmentType) {
//        return ResponseEntity.ok(employeeService.getDriversByEquipmentType(equipmentType));
//    }
//
//    @GetMapping("/drivers/{driverId}/validateForEquipment/{equipmentId}")
//    public ResponseEntity<Boolean> validateDriverForEquipment(
//            @PathVariable UUID driverId,
//            @PathVariable UUID equipmentId) {
//        try {
//            boolean isValid = employeeService.validateDriverForEquipment(driverId, equipmentId);
//            return ResponseEntity.ok(isValid);
//        } catch (RuntimeException e) {
//            return ResponseEntity.notFound().build();
//        }
//    }
}