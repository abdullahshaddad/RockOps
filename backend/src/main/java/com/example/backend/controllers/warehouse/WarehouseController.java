package com.example.backend.controllers.warehouse;


import com.example.backend.models.hr.Employee;
import com.example.backend.models.warehouse.Warehouse;
import com.example.backend.repositories.warehouse.WarehouseRepository;
import com.example.backend.services.warehouse.WarehouseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;


@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/warehouses")
public class WarehouseController {

    @Autowired
    private WarehouseService warehouseService;
    @Autowired
    private WarehouseRepository warehouseRepository;




    @GetMapping
    public List<Map<String, Object>> getAllWarehouses() {
        List<Warehouse> warehouses = warehouseRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Warehouse warehouse : warehouses) {
            Map<String, Object> warehouseMap = new HashMap<>();
            warehouseMap.put("id", warehouse.getId());
            warehouseMap.put("name", warehouse.getName());
            warehouseMap.put("photoUrl", warehouse.getPhotoUrl());

            // Handle site
            if (warehouse.getSite() != null) {
                Map<String, Object> siteMap = new HashMap<>();
                siteMap.put("id", warehouse.getSite().getId());
                siteMap.put("name", warehouse.getSite().getName());
                warehouseMap.put("site", siteMap);
            }

            // Handle employees with full details
            List<Map<String, Object>> employeesList = new ArrayList<>();
            if (warehouse.getEmployees() != null) {
                for (Employee employee : warehouse.getEmployees()) {
                    Map<String, Object> employeeMap = new HashMap<>();
                    employeeMap.put("id", employee.getId());
                    employeeMap.put("firstName", employee.getFirstName());
                    employeeMap.put("lastName", employee.getLastName());
                    employeeMap.put("email", employee.getEmail());
                    employeeMap.put("photoUrl", employee.getPhotoUrl());

                    // Add job position if available - renamed from position to jobPosition
                    if (employee.getJobPosition() != null) {
                        Map<String, Object> jobPositionMap = new HashMap<>();
                        jobPositionMap.put("id", employee.getJobPosition().getId());
                        jobPositionMap.put("positionName", employee.getJobPosition().getPositionName());
                        employeeMap.put("jobPosition", jobPositionMap); // Renamed from position to jobPosition
                    }

                    employeesList.add(employeeMap);
                }
            }
            warehouseMap.put("employees", employeesList);

            result.add(warehouseMap);
        }

        return result;
    }



    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getWarehouseDetails(@PathVariable UUID id) {
        Map<String, Object> warehouseDetails = warehouseService.getWarehouseDetails(id);
        return ResponseEntity.ok(warehouseDetails);
    }



    @GetMapping("/employees/{warehouseId}")
    public List<Employee> getEmployeesByWarehouseId(@PathVariable UUID warehouseId) {
        return warehouseService.getEmployeesByWarehouseId(warehouseId);
    }

    @GetMapping("/site/{siteId}")
    public ResponseEntity<List<Warehouse>> getWarehousesBySite(@PathVariable UUID siteId) {
        List<Warehouse> warehouses = warehouseService.getWarehousesBySite(siteId);
        return ResponseEntity.ok(warehouses);
    }







}
