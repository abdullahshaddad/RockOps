package com.example.backend.services;

import com.example.backend.models.hr.Employee;
import com.example.backend.models.site.Site;
import com.example.backend.models.Warehouse;
import com.example.backend.repositories.hr.EmployeeRepository;
import com.example.backend.repositories.site.SiteRepository;
import com.example.backend.repositories.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class WarehouseMTService {

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private SiteRepository siteRepository;

    @Autowired
    private EmployeeRepository employeeRepository;


    public Warehouse addWarehouse(Map<String, Object> requestBody) {
        Warehouse warehouse = new Warehouse();

        warehouse.setName((String) requestBody.get("name"));



        if (requestBody.containsKey("site")) {
            Map<String, Object> siteData = (Map<String, Object>) requestBody.get("site");
            UUID siteId = UUID.fromString((String) siteData.get("id"));
            Site site = siteRepository.findById(siteId)
                    .orElseThrow(() -> new RuntimeException("Site not found"));
            warehouse.setSite(site);
        } else {
            throw new RuntimeException("Site is required");
        }

        List<Employee> employees = new ArrayList<>();


        if (requestBody.containsKey("employees")) {
            List<Map<String, Object>> employeeList = (List<Map<String, Object>>) requestBody.get("employees");
            List<UUID> employeeIds = employeeList.stream()
                    .map(emp -> UUID.fromString((String) emp.get("id")))
                    .toList();
            employees = employeeRepository.findAllById(employeeIds);


            for (Employee employee : employees) {
                employee.setWarehouse(warehouse);
            }

            warehouse.setEmployees(employees);
        } else {
            warehouse.setEmployees(new ArrayList<>());
        }


        Warehouse savedWarehouse = warehouseRepository.save(warehouse);


        employeeRepository.saveAll(employees);

        return savedWarehouse;
    }



    public Warehouse updateWarehouse(UUID id, Map<String, Object> requestBody) {
        // Find the existing warehouse
        Warehouse existingWarehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        // Update warehouse attributes
        if (requestBody.containsKey("name")) {
            existingWarehouse.setName((String) requestBody.get("name"));
        }

        // Update site if provided
        if (requestBody.containsKey("site")) {
            Map<String, Object> siteData = (Map<String, Object>) requestBody.get("site");
            UUID siteId = UUID.fromString((String) siteData.get("id"));
            Site site = siteRepository.findById(siteId)
                    .orElseThrow(() -> new RuntimeException("Site not found"));
            existingWarehouse.setSite(site);
        }

        // Update employees if provided
        if (requestBody.containsKey("employees")) {
            List<Map<String, Object>> employeeList = (List<Map<String, Object>>) requestBody.get("employees");
            List<UUID> employeeIds = employeeList.stream()
                    .map(emp -> UUID.fromString((String) emp.get("id")))
                    .toList();

            List<Employee> updatedEmployees = employeeRepository.findAllById(employeeIds);

            // Remove old employees from warehouse (disassociate them)
            for (Employee oldEmployee : existingWarehouse.getEmployees()) {
                oldEmployee.setWarehouse(null); // Disassociate the old employees
            }

            // Clear current employees safely
            existingWarehouse.getEmployees().clear();

            // Add updated employees to the warehouse
            for (Employee employee : updatedEmployees) {
                employee.setWarehouse(existingWarehouse); // Ensure bidirectional relationship
                existingWarehouse.getEmployees().add(employee);
            }
        }

        // Save warehouse first (cascades employees if configured)
        return warehouseRepository.save(existingWarehouse);
    }



}
