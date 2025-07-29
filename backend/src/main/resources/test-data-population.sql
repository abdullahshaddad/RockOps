-- Comprehensive Test Data Population for Frontend Testing
-- Run this script after the database migration V2__Create_enhanced_equipment_transaction_tables.sql

-- Clear existing test data (optional - uncomment if needed)
-- DELETE FROM consumable_movements;
-- DELETE FROM transaction_history;
-- DELETE FROM item WHERE created_by = 'test-data';
-- DELETE FROM equipment WHERE serial_number LIKE 'TEST-%';
-- DELETE FROM warehouse WHERE name LIKE '%Test%';

-- ========================================
-- EQUIPMENT BRANDS
-- ========================================
INSERT INTO equipment_brand (id, name, description) VALUES 
('11111111-1111-1111-1111-111111111111', 'Caterpillar', 'Leading heavy equipment manufacturer'),
('22222222-2222-2222-2222-222222222222', 'John Deere', 'Agricultural and construction equipment'),
('33333333-3333-3333-3333-333333333333', 'Liebherr', 'German heavy equipment manufacturer'),
('44444444-4444-4444-4444-444444444444', 'Komatsu', 'Japanese construction equipment'),
('55555555-5555-5555-5555-555555555555', 'Volvo', 'Swedish heavy equipment manufacturer')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- EQUIPMENT TYPES  
-- ========================================
INSERT INTO equipment_type (id, name, description, drivable, driver_position_name) VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Excavator', 'Heavy equipment for digging and excavation', true, 'Operator'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bulldozer', 'Heavy equipment for pushing soil and debris', true, 'Operator'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Dump Truck', 'Heavy truck for transporting materials', true, 'Driver'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Crane', 'Heavy equipment for lifting and moving', false, 'Operator'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Loader', 'Heavy equipment for loading materials', true, 'Operator'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Grader', 'Heavy equipment for grading surfaces', true, 'Operator')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- WAREHOUSES
-- ========================================
INSERT INTO warehouse (id, name, photo_url) VALUES 
('77777777-7777-7777-7777-777777777777', 'Central Warehouse', 'Main central storage facility'),
('88888888-8888-8888-8888-888888888888', 'North Site Warehouse', 'Northern construction site warehouse'),
('99999999-9999-9999-9999-999999999999', 'South Depot', 'Southern depot for heavy equipment supplies'),
('00000000-0000-0000-0000-000000000000', 'Emergency Supplies', 'Emergency and backup supplies warehouse')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- EQUIPMENT
-- ========================================
INSERT INTO equipment (
    id, name, model, serial_number, manufacture_year, purchased_date, delivered_date,
    egp_price, dollar_price, country_of_origin, status, worked_hours,
    equipment_type_id, equipment_brand_id
) VALUES 
('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'CAT-EX001', 'Caterpillar Excavator 320D', 'TEST-CAT-EX001', 2020, '2023-01-15', '2023-02-01', 500000, 16000, 'USA', 'AVAILABLE', 1000, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111'),
('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', 'JD-BD002', 'John Deere Bulldozer 850K', 'TEST-JD-BD002', 2021, '2023-02-15', '2023-03-01', 600000, 19000, 'USA', 'AVAILABLE', 800, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222'),
('e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3', 'CAT-DT003', 'Caterpillar Dump Truck 775G', 'TEST-CAT-DT003', 2020, '2023-03-15', '2023-04-01', 750000, 24000, 'USA', 'AVAILABLE', 1200, 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111'),
('e4e4e4e4-e4e4-e4e4-e4e4-e4e4e4e4e4e4', 'LB-CR004', 'Liebherr Crane LTM 1200', 'TEST-LB-CR004', 2019, '2023-04-15', '2023-05-01', 1200000, 38000, 'Germany', 'AVAILABLE', 600, 'dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333'),
('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5', 'CAT-LD005', 'Caterpillar Loader 950M', 'TEST-CAT-LD005', 2021, '2023-05-15', '2023-06-01', 400000, 13000, 'USA', 'AVAILABLE', 900, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111'),
('e6e6e6e6-e6e6-e6e6-e6e6-e6e6e6e6e6e6', 'JD-GR006', 'John Deere Grader 770G', 'TEST-JD-GR006', 2020, '2023-06-15', '2023-07-01', 550000, 17500, 'USA', 'AVAILABLE', 700, 'ffffffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (serial_number) DO NOTHING;

-- ========================================
-- ITEM CATEGORIES
-- ========================================
INSERT INTO item_category (id, name, parent_category, deleted) VALUES 
('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'Consumables', NULL, false),
('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'Maintenance Parts', NULL, false)
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- ITEM TYPES (CONSUMABLES)
-- ========================================
INSERT INTO item_type (id, name, comment, measuring_unit, status, min_quantity, serial_number, item_category_id) VALUES 
-- CONSUMABLE Items
('i1i1i1i1-i1i1-i1i1-i1i1-i1i1i1i1i1i1', 'Hydraulic Oil', 'High-grade hydraulic oil for heavy equipment', 'LITERS', 'ACTIVE', 20, 'IT-HYD-OIL-001', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'),
('i2i2i2i2-i2i2-i2i2-i2i2-i2i2i2i2i2i2', 'Engine Oil', 'Premium engine oil for diesel engines', 'LITERS', 'ACTIVE', 15, 'IT-ENG-OIL-002', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'),
('i3i3i3i3-i3i3-i3i3-i3i3-i3i3i3i3i3i3', 'Diesel Fuel', 'Ultra-low sulfur diesel fuel', 'LITERS', 'ACTIVE', 100, 'IT-DIESEL-003', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'),
('i4i4i4i4-i4i4-i4i4-i4i4-i4i4i4i4i4i4', 'Grease', 'Multi-purpose lithium grease', 'KG', 'ACTIVE', 10, 'IT-GREASE-004', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'),
('i5i5i5i5-i5i5-i5i5-i5i5-i5i5i5i5i5i5', 'Coolant', 'Heavy-duty engine coolant', 'LITERS', 'ACTIVE', 25, 'IT-COOLANT-005', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'),
('i6i6i6i6-i6i6-i6i6-i6i6-i6i6i6i6i6i6', 'Hydraulic Filters', 'High-efficiency hydraulic filters', 'PIECES', 'ACTIVE', 10, 'IT-HYD-FILT-006', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'),
('i7i7i7i7-i7i7-i7i7-i7i7-i7i7i7i7i7i7', 'Air Filters', 'Heavy-duty air filtration system', 'PIECES', 'ACTIVE', 8, 'IT-AIR-FILT-007', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'),
('i8i8i8i8-i8i8-i8i8-i8i8-i8i8i8i8i8i8', 'Fuel Filters', 'Premium fuel filtration components', 'PIECES', 'ACTIVE', 12, 'IT-FUEL-FILT-008', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'),

-- MAINTENANCE Items  
('m1m1m1m1-m1m1-m1m1-m1m1-m1m1m1m1m1m1', 'Track Pads', 'Rubber track pads for excavators', 'PIECES', 'ACTIVE', 5, 'IT-TRACK-PAD-009', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2'),
('m2m2m2m2-m2m2-m2m2-m2m2-m2m2m2m2m2m2', 'Cutting Edges', 'Hardened steel cutting edges', 'PIECES', 'ACTIVE', 3, 'IT-CUT-EDGE-010', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2'),
('m3m3m3m3-m3m3-m3m3-m3m3-m3m3m3m3m3m3', 'Hydraulic Hoses', 'Heavy-duty hydraulic hose assemblies', 'PIECES', 'ACTIVE', 6, 'IT-HYD-HOSE-011', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2'),
('m4m4m4m4-m4m4-m4m4-m4m4-m4m4m4m4m4m4', 'Belts', 'Drive belts and fan belts', 'PIECES', 'ACTIVE', 8, 'IT-BELTS-012', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2'),
('m5m5m5m5-m5m5-m5m5-m5m5-m5m5m5m5m5m5', 'Spark Plugs', 'Heavy-duty spark plugs', 'PIECES', 'ACTIVE', 15, 'IT-SPARK-013', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2'),
('m6m6m6m6-m6m6-m6m6-m6m6-m6m6m6m6m6m6', 'Brake Pads', 'High-performance brake pad sets', 'PIECES', 'ACTIVE', 4, 'IT-BRAKE-014', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2'),
('m7m7m7m7-m7m7-m7m7-m7m7-m7m7m7m7m7m7', 'Seals and Gaskets', 'Complete seal and gasket kits', 'SETS', 'ACTIVE', 10, 'IT-SEALS-015', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2'),
('m8m8m8m8-m8m8-m8m8-m8m8-m8m8m8m8m8m8', 'Bearings', 'Precision bearings for heavy equipment', 'PIECES', 'ACTIVE', 12, 'IT-BEARINGS-016', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2'),
('m9m9m9m9-m9m9-m9m9-m9m9-m9m9m9m9m9m9', 'Electrical Components', 'Wiring harnesses and electrical parts', 'SETS', 'ACTIVE', 6, 'IT-ELEC-017', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2'),
('m0m0m0m0-m0m0-m0m0-m0m0-m0m0m0m0m0m0', 'Tire Repair Kits', 'Complete tire repair and patch kits', 'KITS', 'ACTIVE', 8, 'IT-TIRE-018', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2')
ON CONFLICT (serial_number) DO NOTHING;

-- ========================================
-- WAREHOUSE INVENTORY (ITEMS)
-- ========================================

-- Central Warehouse Inventory
INSERT INTO item (id, quantity, warehouse_id, item_type_id, item_status, resolved, created_at, created_by) VALUES 
-- Central Warehouse - Consumables
(gen_random_uuid(), 150, '77777777-7777-7777-7777-777777777777', 'i1i1i1i1-i1i1-i1i1-i1i1-i1i1i1i1i1i1', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 120, '77777777-7777-7777-7777-777777777777', 'i2i2i2i2-i2i2-i2i2-i2i2-i2i2i2i2i2i2', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 800, '77777777-7777-7777-7777-777777777777', 'i3i3i3i3-i3i3-i3i3-i3i3-i3i3i3i3i3i3', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 75, '77777777-7777-7777-7777-777777777777', 'i4i4i4i4-i4i4-i4i4-i4i4-i4i4i4i4i4i4', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 200, '77777777-7777-7777-7777-777777777777', 'i5i5i5i5-i5i5-i5i5-i5i5-i5i5i5i5i5i5', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 45, '77777777-7777-7777-7777-777777777777', 'i6i6i6i6-i6i6-i6i6-i6i6-i6i6i6i6i6i6', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 35, '77777777-7777-7777-7777-777777777777', 'i7i7i7i7-i7i7-i7i7-i7i7-i7i7i7i7i7i7', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 55, '77777777-7777-7777-7777-777777777777', 'i8i8i8i8-i8i8-i8i8-i8i8-i8i8i8i8i8i8', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
-- Central Warehouse - Maintenance Parts
(gen_random_uuid(), 25, '77777777-7777-7777-7777-777777777777', 'm1m1m1m1-m1m1-m1m1-m1m1-m1m1m1m1m1m1', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 15, '77777777-7777-7777-7777-777777777777', 'm2m2m2m2-m2m2-m2m2-m2m2-m2m2m2m2m2m2', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 30, '77777777-7777-7777-7777-777777777777', 'm3m3m3m3-m3m3-m3m3-m3m3-m3m3m3m3m3m3', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 40, '77777777-7777-7777-7777-777777777777', 'm4m4m4m4-m4m4-m4m4-m4m4-m4m4m4m4m4m4', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 60, '77777777-7777-7777-7777-777777777777', 'm5m5m5m5-m5m5-m5m5-m5m5-m5m5m5m5m5m5', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 20, '77777777-7777-7777-7777-777777777777', 'm6m6m6m6-m6m6-m6m6-m6m6-m6m6m6m6m6m6', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 35, '77777777-7777-7777-7777-777777777777', 'm7m7m7m7-m7m7-m7m7-m7m7-m7m7m7m7m7m7', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 50, '77777777-7777-7777-7777-777777777777', 'm8m8m8m8-m8m8-m8m8-m8m8-m8m8m8m8m8m8', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 25, '77777777-7777-7777-7777-777777777777', 'm9m9m9m9-m9m9-m9m9-m9m9-m9m9m9m9m9m9', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 18, '77777777-7777-7777-7777-777777777777', 'm0m0m0m0-m0m0-m0m0-m0m0-m0m0m0m0m0m0', 'IN_WAREHOUSE', false, NOW(), 'test-data');

-- North Site Warehouse Inventory (similar pattern for other warehouses)
INSERT INTO item (id, quantity, warehouse_id, item_type_id, item_status, resolved, created_at, created_by) VALUES 
-- North Site - Consumables
(gen_random_uuid(), 100, '88888888-8888-8888-8888-888888888888', 'i1i1i1i1-i1i1-i1i1-i1i1-i1i1i1i1i1i1', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 80, '88888888-8888-8888-8888-888888888888', 'i2i2i2i2-i2i2-i2i2-i2i2-i2i2i2i2i2i2', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 600, '88888888-8888-8888-8888-888888888888', 'i3i3i3i3-i3i3-i3i3-i3i3-i3i3i3i3i3i3', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 50, '88888888-8888-8888-8888-888888888888', 'i4i4i4i4-i4i4-i4i4-i4i4-i4i4i4i4i4i4', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
-- North Site - Maintenance Parts
(gen_random_uuid(), 20, '88888888-8888-8888-8888-888888888888', 'm1m1m1m1-m1m1-m1m1-m1m1-m1m1m1m1m1m1', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 12, '88888888-8888-8888-8888-888888888888', 'm2m2m2m2-m2m2-m2m2-m2m2-m2m2m2m2m2m2', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 25, '88888888-8888-8888-8888-888888888888', 'm3m3m3m3-m3m3-m3m3-m3m3-m3m3m3m3m3m3', 'IN_WAREHOUSE', false, NOW(), 'test-data');

-- South Depot Inventory
INSERT INTO item (id, quantity, warehouse_id, item_type_id, item_status, resolved, created_at, created_by) VALUES 
-- South Depot - Mixed inventory
(gen_random_uuid(), 180, '99999999-9999-9999-9999-999999999999', 'i1i1i1i1-i1i1-i1i1-i1i1-i1i1i1i1i1i1', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 160, '99999999-9999-9999-9999-999999999999', 'i2i2i2i2-i2i2-i2i2-i2i2-i2i2i2i2i2i2', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 1000, '99999999-9999-9999-9999-999999999999', 'i3i3i3i3-i3i3-i3i3-i3i3-i3i3i3i3i3i3', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 30, '99999999-9999-9999-9999-999999999999', 'm1m1m1m1-m1m1-m1m1-m1m1-m1m1m1m1m1m1', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 18, '99999999-9999-9999-9999-999999999999', 'm2m2m2m2-m2m2-m2m2-m2m2-m2m2m2m2m2m2', 'IN_WAREHOUSE', false, NOW(), 'test-data');

-- Emergency Supplies Inventory
INSERT INTO item (id, quantity, warehouse_id, item_type_id, item_status, resolved, created_at, created_by) VALUES 
-- Emergency Supplies - Smaller quantities for emergency use
(gen_random_uuid(), 50, '00000000-0000-0000-0000-000000000000', 'i1i1i1i1-i1i1-i1i1-i1i1-i1i1i1i1i1i1', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 40, '00000000-0000-0000-0000-000000000000', 'i2i2i2i2-i2i2-i2i2-i2i2-i2i2i2i2i2i2', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 200, '00000000-0000-0000-0000-000000000000', 'i3i3i3i3-i3i3-i3i3-i3i3-i3i3i3i3i3i3', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 15, '00000000-0000-0000-0000-000000000000', 'm1m1m1m1-m1m1-m1m1-m1m1-m1m1m1m1m1m1', 'IN_WAREHOUSE', false, NOW(), 'test-data'),
(gen_random_uuid(), 10, '00000000-0000-0000-0000-000000000000', 'm2m2m2m2-m2m2-m2m2-m2m2-m2m2m2m2m2m2', 'IN_WAREHOUSE', false, NOW(), 'test-data');

-- ========================================
-- SUMMARY OF TEST DATA
-- ========================================

-- PRINT SUMMARY (PostgreSQL version)
DO $$
BEGIN
    RAISE NOTICE '🎉 TEST DATA POPULATION COMPLETE!';
    RAISE NOTICE '📊 Database Population Summary:';
    RAISE NOTICE '   • Equipment Brands: 5';
    RAISE NOTICE '   • Equipment Types: 6'; 
    RAISE NOTICE '   • Warehouses: 4';
    RAISE NOTICE '   • Equipment Units: 6';
    RAISE NOTICE '   • Item Types: 18 (8 Consumables + 10 Maintenance)';
    RAISE NOTICE '   • Total Warehouse Items: %', (SELECT COUNT(*) FROM item WHERE created_by = 'test-data');
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Ready for Frontend Testing!';
    RAISE NOTICE '🔧 Use these IDs for testing enhanced equipment transactions:';
    RAISE NOTICE '   • Central Warehouse: 77777777-7777-7777-7777-777777777777';
    RAISE NOTICE '   • CAT Excavator: e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1';
    RAISE NOTICE '   • Hydraulic Oil: i1i1i1i1-i1i1-i1i1-i1i1-i1i1i1i1i1i1';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Enhanced Transaction Endpoints Available:';
    RAISE NOTICE '   • POST /api/v1/equipment-transactions/warehouse-to-equipment';
    RAISE NOTICE '   • POST /api/v1/equipment-transactions/equipment-to-warehouse';
    RAISE NOTICE '   • POST /api/v1/equipment-transactions/{id}/accept';
    RAISE NOTICE '   • GET /api/v1/equipment-transactions/equipment/{id}/history';
    RAISE NOTICE '   • GET /api/v1/equipment-transactions/equipment/{id}/dashboard';
END $$; 