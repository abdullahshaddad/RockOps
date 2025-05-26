package com.example.backend.services;//package com.example.Rock4Mining.services;
//
//import com.example.Rock4Mining.models.*;
//import com.example.Rock4Mining.repositories.*;
//import jakarta.transaction.Transactional;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.time.LocalDate;
//import java.time.Year;
//import java.util.ArrayList;
//import java.util.Date;
//import java.util.List;
//import java.util.UUID;
//
//@Service
//@Transactional
//public class SeedService {
//
//    @Autowired
//    private SiteRepository siteRepository;
//
//    @Autowired
//    private WarehouseRepository warehouseRepository;
//
//    @Autowired
//    private EmployeeRepository employeeRepository;
//
//    @Autowired
//    private EquipmentRepository equipmentRepository;
//
//    @Autowired
//    private MerchantRepository merchantRepository;
//
//    @Autowired
//    private FixedAssetRepository fixedAssetsRepository;
//
//    @Autowired
//    private PartnerRepository partnerRepository;
//
//    @Autowired
//    private JobPositionRepository jobPositionRepository;
//
//
//    public void seedDatabase() {
//        // Clear existing data
//        jobPositionRepository.deleteAll();
//        equipmentRepository.deleteAll();
//        employeeRepository.deleteAll();
//        warehouseRepository.deleteAll();
//        merchantRepository.deleteAll();
//        fixedAssetsRepository.deleteAll();
//        siteRepository.deleteAll();
//        partnerRepository.deleteAll();
//
//
//        System.out.println("All previous data deleted!");
//        System.out.println("Seeding database...");
//
//        // Create and save Site
//        Site site = siteRepository.save(Site.builder()
//                .name("Main Site")
//                .physicalAddress("123 Mining Street")
//                .companyAddress("456 Industrial Ave")
//                .build());
//
//        System.out.println("Site saved: " + site.getId());
//
//        //Create and save Partners
//        Partner partner = partnerRepository.save(Partner.builder()
//                .firstName("Gino")
//                .lastName("G")
//                .build());
//
//        Partner partner2 = partnerRepository.save(Partner.builder()
//                .firstName("Ibya")
//                .lastName("Rashad")
//                .build());
//
//        Partner partner3 = partnerRepository.save(Partner.builder()
//                .firstName("Shedo")
//                .lastName("Shaddad")
//                .build());
//
//        System.out.println("Partners saved successfully");
//
//
//
//        // Create and save FixedAsset
//        FixedAssets fixedAsset = fixedAssetsRepository.save(FixedAssets.builder()
//                .Id(UUID.randomUUID())
//                .Name("Heavy Duty Generator")
//                .creationDate(new Date())
//                .area(150)
////                .site(site)
//                .build());
//
//        System.out.println("Fixed Asset saved: " + fixedAsset.getId());
//
//        // Create and save Warehouses
//        Warehouse warehouse1 = warehouseRepository.save(Warehouse.builder()
//                .name("Main Warehouse")
//                .totalItems(500)
//                .location("Zone A, Industrial Complex")
//                .site(site)
////                .employees(List.of(emp2)) // Assign Warehouse Manager
//                .build());
//
//        Warehouse warehouse2 = warehouseRepository.save(Warehouse.builder()
//                .name("Backup Warehouse")
//                .totalItems(200)
//                .location("Zone B, Storage Area")
//                .build());
//
//        Warehouse warehouse3 = warehouseRepository.save(Warehouse.builder()
//                .name("ZZZ Warehouse")
//                .totalItems(200)
//                .location("Zone B, Storage Area")
//                .build());
//
//        Warehouse warehouse4 = warehouseRepository.save(Warehouse.builder()
//                .name("PPP Warehouse")
//                .totalItems(200)
//                .location("Zone B, Storage Area")
//                .build());
//
//
//        System.out.println("Warehouses saved successfully!");
//
//        JobPosition jobPosition1 = jobPositionRepository.save(JobPosition.builder()
//                .positionName("Warehouse Manager")
//                .department(departmentA)
//                .head("Head A")
//                .baseSalary(200000.00)
//                .probationPeriod(3)
//                .type("Type A")
//                .experienceLevel("Experience A")
//                .workingDays(5)
//                .shifts("Shifts A")
//                .workingHours(8)
//                .vacations("Vacations A")
//                .active(true)
//                .build()
//        );
//
//        // Create and save Employees
//        Employee emp1 = employeeRepository.save(Employee.builder()
//                .firstName("John")
//                .lastName("Doe")
//                //.position("Technician")
//                //.warehouse(warehouse1)
//                .phoneNumber("+4781929213517")
//                .build());
//
//        Employee emp2 = employeeRepository.save(Employee.builder()
//                .firstName("Jane")
//                .lastName("Smith")
//                //.position("Warehouse Manager")
//                .jobPosition(jobPosition1)
//                .phoneNumber("+2091973023618")
////                .site(site)
//                .warehouse(warehouse1)
//                .build());
//
//        Employee emp3 = employeeRepository.save(Employee.builder()
//                .firstName("Jack")
//                .lastName("Snow")
//                //.position("Warehouse Manager")
//                .jobPosition(jobPosition1)
//                .phoneNumber("+20919457693q5")
//                //.site(site)
//                .warehouse(warehouse2)
//                .build());
//
//        System.out.println("Employees saved successfully!");
//
//
//
//
//        // Create and save Equipment
//        Equipment equipment = equipmentRepository.save(Equipment.builder()
//                .type("Bulldozer")
//                .fullModelName("Bulldozer320")
//                .modelNumber("D65EX")
//                .brand("Komatsu")
//                .status(EquipmentStatus.AVAILABLE)
//                .mainDriver(emp2)
//                .manufactureYear(Year.of(2018))
//                .purchasedDate(LocalDate.of(2019, 5, 15))
//                .deliveredDate(LocalDate.of(2019, 6, 20))
//                .egpPrice(1200000)
//                .dollarPrice(75000)
//                .purchasedFrom("Heavy Machinery Ltd")
//                .examinedBy("Inspection Co.")
//                .equipmentComplaints("None")
//                .countryOfOrigin("Japan")
//                .serialNumber("KMT12345678")
//                .shipping("Air Freight")
//                .customs("Cleared")
//                .relatedDocuments("Invoice123, Warranty2025")
//                .workedHours(1500)
//                .build());
//
//        Equipment equipment2 = equipmentRepository.save(Equipment.builder()
//                .type("Dump Truck")
//                .fullModelName("Dump Truck320")
//                .modelNumber("HD785")
//                .brand("Komatsu")
//                .status(EquipmentStatus.AVAILABLE)
//                .mainDriver(emp1)
//                .manufactureYear(Year.of(2020))
//                .purchasedDate(LocalDate.of(2021, 3, 10))
//                .deliveredDate(LocalDate.of(2021, 4, 5))
//                .egpPrice(2200000)
//                .dollarPrice(120000)
//                .purchasedFrom("Mining Equipment Corp")
//                .examinedBy("TechCheck Services")
//                .equipmentComplaints("Engine overheating reported")
//                .countryOfOrigin("Germany")
//                .serialNumber("KHD785-456789")
//                .shipping("Sea Freight")
//                .customs("Pending")
//                .relatedDocuments("InspectionReport2024, ServiceHistory")
//                .workedHours(2000)
//                .build());
//
//
//
//        System.out.println("Equipment saved: " + equipment.getId());
//
//        // Create and save Merchants
//        Merchant merchant1 = merchantRepository.save(Merchant.builder()
//                .name("ABC Supplies Ltd.")
//                .contactPerson("Robert Johnson")
//                .contactEmail("robert.johnson@abcsupplies.com")
//                .contactPhone("+1234567890")
//                .address("789 Supplier Street, Industrial Zone")
//                .taxIdentificationNumber("TAX-123456")
//                .merchantType("SUPPLIER")
//                .category("Electronics")
//                .totalSales(67892)
//                .paymentTerms("Net 30")
//                .notes("Preferred supplier for heavy machinery parts.")
//                .site(site)
//                .build());
//
//        Merchant merchant2 = merchantRepository.save(Merchant.builder()
//                .name("XYZ Construction Materials")
//                .contactPerson("Sarah Lee")
//                .contactEmail("sarah.lee@xyzmaterials.com")
//                .contactPhone("+9876543210")
//                .address("456 Customer Road, Business Park")
//                .taxIdentificationNumber("TAX-987654")
//                .merchantType("CUSTOMER")
//                .category("Heavy Equipment")
//                .totalSales(789260)
//                .paymentTerms("Net 60")
//                .notes("Bulk orders for concrete and steel beams.")
//                .site(site)
//                .build());
//
//        Merchant merchant3 = merchantRepository.save(Merchant.builder()
//                .name("Global Heavy Equipment")
//                .contactPerson("Michael Brown")
//                .contactEmail("michael.brown@globalheavy.com")
//                .contactPhone("+1928374650")
//                .address("101 Machinery Ave, Logistics Hub")
//                .taxIdentificationNumber("TAX-555666")
//                .merchantType("BOTH")
//                .category("Light Equipment")
//                .totalSales(3718)
//                .paymentTerms("Net 45")
//                .notes("Sells and buys heavy construction equipment.")
//                .site(site)
//                .build());
//
//        System.out.println("Merchants saved successfully!");
//    }
//}