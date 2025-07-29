-- ============================================================================
-- ENHANCED EQUIPMENT-WAREHOUSE TRANSACTION SYSTEM - DATABASE POPULATION
-- ============================================================================
-- 
-- This script populates the database with comprehensive test data for
-- testing the enhanced warehouse-equipment transaction system.
--
-- Prerequisites: 
-- 1. Run the main database migrations first
-- 2. Run the enhanced transaction migration: V2__Create_enhanced_equipment_transaction_tables.sql
--
-- Usage: Execute this script in your PostgreSQL database
-- ============================================================================

-- Clear existing test data (optional - uncomment if needed)
-- DELETE FROM consumable_movements WHERE recorded_by LIKE '%test%';
-- DELETE FROM transaction_history WHERE changed_by LIKE '%test%';
-- DELETE FROM item WHERE created_by = 'test-data-script';
-- DELETE FROM equipment WHERE serial_number LIKE 'TEST-%';
-- DELETE FROM warehouse WHERE name LIKE '%Test%' OR name LIKE '%Central%' OR name LIKE '%North%' OR name LIKE '%South%' OR name LIKE '%Emergency%';

-- ========================================
-- EQUIPMENT BRANDS
-- ========================================
INSERT INTO equipment_brand (id, name, description) VALUES 
('11111111-1111-1111-1111-111111111111', 'Caterpillar', 'Leading heavy equipment manufacturer'),
('22222222-2222-2222-2222-222222222222', 'John Deere', 'Agricultural and construction equipment'),
('33333333-3333-3333-3333-333333333333', 'Liebherr', 'German heavy equipment manufacturer'),
('44444444-4444-4444-4444-444444444444', 'Komatsu', 'Japanese construction equipment'),
('55555555-5555-5555-5555-555555555555', 'Volvo', 'Swedish heavy equipment manufacturer')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

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
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- ========================================
-- WAREHOUSES
-- ========================================
INSERT INTO warehouse (id, name, photo_url, capacity, site_id) VALUES 
('77777777-7777-7777-7777-777777777777', 'Central Test Warehouse', 'Main central storage facility for testing', 1000, NULL),
('88888888-8888-8888-8888-888888888888', 'North Test Warehouse', 'Northern construction site warehouse for testing', 800, NULL),
('99999999-9999-9999-9999-999999999999', 'South Test Depot', 'Southern depot for heavy equipment supplies testing', 1200, NULL),
('00000000-0000-0000-0000-000000000000', 'Emergency Test Supplies', 'Emergency and backup supplies warehouse for testing', 500, NULL)
ON CONFLICT (name) DO UPDATE SET 
    photo_url = EXCLUDED.photo_url,
    capacity = EXCLUDED.capacity;

-- ========================================
-- EQUIPMENT
-- ========================================
INSERT INTO equipment (
    id, name, model, serial_number, manufacture_year, purchased_date, delivered_date,
    egp_price, dollar_price, country_of_origin, status, worked_hours,
    equipment_type_id, equipment_brand_id
) VALUES 
('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'TEST-CAT-EX001', 'Caterpillar Excavator 320D', 'TEST-CAT-EX001-2024', 2020, '2023-01-15', '2023-02-01', 500000, 16000, 'USA', 'AVAILABLE', 1000, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111'),
('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', 'TEST-JD-BD002', 'John Deere Bulldozer 850K', 'TEST-JD-BD002-2024', 2021, '2023-02-15', '2023-03-01', 600000, 19000, 'USA', 'AVAILABLE', 800, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222'),
('e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3', 'TEST-CAT-DT003', 'Caterpillar Dump Truck 775G', 'TEST-CAT-DT003-2024', 2020, '2023-03-15', '2023-04-01', 750000, 24000, 'USA', 'AVAILABLE', 1200, 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111'),
('e4e4e4e4-e4e4-e4e4-e4e4-e4e4e4e4e4e4', 'TEST-LB-CR004', 'Liebherr Crane LTM 1200', 'TEST-LB-CR004-2024', 2019, '2023-04-15', '2023-05-01', 1200000, 38000, 'Germany', 'AVAILABLE', 600, 'dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333'),
('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5', 'TEST-CAT-LD005', 'Caterpillar Loader 950M', 'TEST-CAT-LD005-2024', 2021, '2023-05-15', '2023-06-01', 400000, 13000, 'USA', 'AVAILABLE', 900, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111'),
('e6e6e6e6-e6e6-e6e6-e6e6-e6e6e6e6e6e6', 'TEST-JD-GR006', 'John Deere Grader 770G', 'TEST-JD-GR006-2024', 2020, '2023-06-15', '2023-07-01', 550000, 17500, 'USA', 'AVAILABLE', 700, 'ffffffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (serial_number) DO UPDATE SET 
    name = EXCLUDED.name,
    model = EXCLUDED.model,
    status = EXCLUDED.status;

-- ========================================
-- ITEM CATEGORIES
-- ========================================
INSERT INTO item_category (id, name, parent_category, deleted) VALUES 
('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'Test Consumables', NULL, false),
('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'Test Maintenance Parts', NULL, false)
ON CONFLICT (name) DO UPDATE SET deleted = EXCLUDED.deleted;

-- ========================================
-- ITEM TYPES (CONSUMABLES & MAINTENANCE)
-- ========================================
INSERT INTO item_type (id, name, comment, measuring_unit, status, min_quantity, serial_number, item_category_id) VALUES 
-- CONSUMABLE Items
('i1i1i1i1-i1i1-i1i1-i1i1-i1i1i1i1i1i1', 'Test Hydraulic Oil', 'High-grade hydraulic oil for heavy equipment testing', 'LITERS', 'ACTIVE', 20, 'TEST-HYD-OIL-001', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'),
('i2i2i2i2-i2i2-i2i2-i2i2-i2i2i2i2i2i2', 'Test Engine Oil', 'Premium engine oil for diesel engines testing', 'LITERS', 'ACTIVE', 15, 'TEST-ENG-OIL-002', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'),
('i3i3i3i3-i3i3-i3i3-i3i3-i3i3i3i3i3i3', 'Test Diesel Fuel', 'Ultra-low sulfur diesel fuel for testing', 'LITERS', 'ACTIVE', 100, 'TEST-DIESEL-003', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'),
('i4i4i4i4-i4i4-i4i4-i4i4-i4i4i4i4i4i4', 'Test Grease', 'Multi-purpose lithium grease for testing', 'KG', 'ACTIVE', 10, 'TEST-GREASE-004', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'),
('i5i5i5i5-i5i5-i5i5-i5i5-i5i5i5i5i5i5', 'Test Coolant', 'Heavy-duty engine coolant for testing', 'LITERS', 'ACTIVE', 25, 'TEST-COOLANT-005', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'),
('i6i6i6i6-i6i6-i6i6-i6i6-i6i6i6i6i6i6', 'Test Hydraulic Filters', 'High-efficiency hydraulic filters for testing', 'PIECES', 'ACTIVE', 10, 'TEST-HYD-FILT-006', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'),
('i7i7i7i7-i7i7-i7i7-i7i7-i7i7i7i7i7i7', 'Test Air Filters', 'Heavy-duty air filtration system for testing', 'PIECES', 'ACTIVE', 8, 'TEST-AIR-FILT-007', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'),
('i8i8i8i8-i8i8-i8i8-i8i8-i8i8i8i8i8i8', 'Test Fuel Filters', 'Premium fuel filtration components for testing', 'PIECES', 'ACTIVE', 12, 'TEST-FUEL-FILT-008', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'),

-- MAINTENANCE Items  
('m1m1m1m1-m1m1-m1m1-m1m1-m1m1m1m1m1m1', 'Test Track Pads', 'Rubber track pads for excavators testing', 'PIECES', 'ACTIVE', 5, 'TEST-TRACK-PAD-009', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2'),
('m2m2m2m2-m2m2-m2m2-m2m2-m2m2m2m2m2m2', 'Test Cutting Edges', 'Hardened steel cutting edges for testing', 'PIECES', 'ACTIVE', 3, 'TEST-CUT-EDGE-010', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2'),
('m3m3m3m3-m3m3-m3m3-m3m3-m3m3m3m3m3m3', 'Test Hydraulic Hoses', 'Heavy-duty hydraulic hose assemblies for testing', 'PIECES', 'ACTIVE', 6, 'TEST-HYD-HOSE-011', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2'),
('m4m4m4m4-m4m4-m4m4-m4m4-m4m4m4m4m4m4', 'Test Belts', 'Drive belts and fan belts for testing', 'PIECES', 'ACTIVE', 8, 'TEST-BELTS-012', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2'),
('m5m5m5m5-m5m5-m5m5-m5m5-m5m5m5m5m5m5', 'Test Spark Plugs', 'Heavy-duty spark plugs for testing', 'PIECES', 'ACTIVE', 15, 'TEST-SPARK-013', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2'),
('m6m6m6m6-m6m6-m6m6-m6m6-m6m6m6m6m6m6', 'Test Brake Pads', 'High-performance brake pad sets for testing', 'PIECES', 'ACTIVE', 4, 'TEST-BRAKE-014', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2'),
('m7m7m7m7-m7m7-m7m7-m7m7-m7m7m7m7m7m7', 'Test Seals and Gaskets', 'Complete seal and gasket kits for testing', 'SETS', 'ACTIVE', 10, 'TEST-SEALS-015', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2'),
('m8m8m8m8-m8m8-m8m8-m8m8-m8m8m8m8m8m8', 'Test Bearings', 'Precision bearings for heavy equipment testing', 'PIECES', 'ACTIVE', 12, 'TEST-BEARINGS-016', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2'),
('m9m9m9m9-m9m9-m9m9-m9m9-m9m9m9m9m9m9', 'Test Electrical Components', 'Wiring harnesses and electrical parts for testing', 'SETS', 'ACTIVE', 6, 'TEST-ELEC-017', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2'),
('m0m0m0m0-m0m0-m0m0-m0m0-m0m0m0m0m0m0', 'Test Tire Repair Kits', 'Complete tire repair and patch kits for testing', 'KITS', 'ACTIVE', 8, 'TEST-TIRE-018', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2')
ON CONFLICT (serial_number) DO UPDATE SET 
    name = EXCLUDED.name,
    comment = EXCLUDED.comment,
    status = EXCLUDED.status;

-- ========================================
-- WAREHOUSE INVENTORY (ITEMS)
-- ========================================

-- Central Test Warehouse Inventory
INSERT INTO item (id, quantity, warehouse_id, item_type_id, item_status, resolved, created_at, created_by) VALUES 
-- Central Warehouse - Consumables
(gen_random_uuid(), 250, '77777777-7777-7777-7777-777777777777', 'i1i1i1i1-i1i1-i1i1-i1i1-i1i1i1i1i1i1', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 200, '77777777-7777-7777-7777-777777777777', 'i2i2i2i2-i2i2-i2i2-i2i2-i2i2i2i2i2i2', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 1500, '77777777-7777-7777-7777-777777777777', 'i3i3i3i3-i3i3-i3i3-i3i3-i3i3i3i3i3i3', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 120, '77777777-7777-7777-7777-777777777777', 'i4i4i4i4-i4i4-i4i4-i4i4-i4i4i4i4i4i4', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 300, '77777777-7777-7777-7777-777777777777', 'i5i5i5i5-i5i5-i5i5-i5i5-i5i5i5i5i5i5', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 80, '77777777-7777-7777-7777-777777777777', 'i6i6i6i6-i6i6-i6i6-i6i6-i6i6i6i6i6i6', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 60, '77777777-7777-7777-7777-777777777777', 'i7i7i7i7-i7i7-i7i7-i7i7-i7i7i7i7i7i7', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 90, '77777777-7777-7777-7777-777777777777', 'i8i8i8i8-i8i8-i8i8-i8i8-i8i8i8i8i8i8', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
-- Central Warehouse - Maintenance Parts
(gen_random_uuid(), 40, '77777777-7777-7777-7777-777777777777', 'm1m1m1m1-m1m1-m1m1-m1m1-m1m1m1m1m1m1', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 25, '77777777-7777-7777-7777-777777777777', 'm2m2m2m2-m2m2-m2m2-m2m2-m2m2m2m2m2m2', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 50, '77777777-7777-7777-7777-777777777777', 'm3m3m3m3-m3m3-m3m3-m3m3-m3m3m3m3m3m3', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 70, '77777777-7777-7777-7777-777777777777', 'm4m4m4m4-m4m4-m4m4-m4m4-m4m4m4m4m4m4', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 100, '77777777-7777-7777-7777-777777777777', 'm5m5m5m5-m5m5-m5m5-m5m5-m5m5m5m5m5m5', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 35, '77777777-7777-7777-7777-777777777777', 'm6m6m6m6-m6m6-m6m6-m6m6-m6m6m6m6m6m6', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 60, '77777777-7777-7777-7777-777777777777', 'm7m7m7m7-m7m7-m7m7-m7m7-m7m7m7m7m7m7', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 80, '77777777-7777-7777-7777-777777777777', 'm8m8m8m8-m8m8-m8m8-m8m8-m8m8m8m8m8m8', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 45, '77777777-7777-7777-7777-777777777777', 'm9m9m9m9-m9m9-m9m9-m9m9-m9m9m9m9m9m9', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 30, '77777777-7777-7777-7777-777777777777', 'm0m0m0m0-m0m0-m0m0-m0m0-m0m0m0m0m0m0', 'IN_WAREHOUSE', false, NOW(), 'test-data-script');

-- North Test Warehouse Inventory
INSERT INTO item (id, quantity, warehouse_id, item_type_id, item_status, resolved, created_at, created_by) VALUES 
-- North Site - Key Consumables
(gen_random_uuid(), 180, '88888888-8888-8888-8888-888888888888', 'i1i1i1i1-i1i1-i1i1-i1i1-i1i1i1i1i1i1', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 150, '88888888-8888-8888-8888-888888888888', 'i2i2i2i2-i2i2-i2i2-i2i2-i2i2i2i2i2i2', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 1200, '88888888-8888-8888-8888-888888888888', 'i3i3i3i3-i3i3-i3i3-i3i3-i3i3i3i3i3i3', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 90, '88888888-8888-8888-8888-888888888888', 'i4i4i4i4-i4i4-i4i4-i4i4-i4i4i4i4i4i4', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
-- North Site - Key Maintenance Parts
(gen_random_uuid(), 30, '88888888-8888-8888-8888-888888888888', 'm1m1m1m1-m1m1-m1m1-m1m1-m1m1m1m1m1m1', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 20, '88888888-8888-8888-8888-888888888888', 'm2m2m2m2-m2m2-m2m2-m2m2-m2m2m2m2m2m2', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 40, '88888888-8888-8888-8888-888888888888', 'm3m3m3m3-m3m3-m3m3-m3m3-m3m3m3m3m3m3', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 55, '88888888-8888-8888-8888-888888888888', 'm4m4m4m4-m4m4-m4m4-m4m4-m4m4m4m4m4m4', 'IN_WAREHOUSE', false, NOW(), 'test-data-script');

-- South Test Depot Inventory
INSERT INTO item (id, quantity, warehouse_id, item_type_id, item_status, resolved, created_at, created_by) VALUES 
-- South Depot - High Volume Items
(gen_random_uuid(), 300, '99999999-9999-9999-9999-999999999999', 'i1i1i1i1-i1i1-i1i1-i1i1-i1i1i1i1i1i1', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 250, '99999999-9999-9999-9999-999999999999', 'i2i2i2i2-i2i2-i2i2-i2i2-i2i2i2i2i2i2', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 2000, '99999999-9999-9999-9999-999999999999', 'i3i3i3i3-i3i3-i3i3-i3i3-i3i3i3i3i3i3', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 50, '99999999-9999-9999-9999-999999999999', 'm1m1m1m1-m1m1-m1m1-m1m1-m1m1m1m1m1m1', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 35, '99999999-9999-9999-9999-999999999999', 'm2m2m2m2-m2m2-m2m2-m2m2-m2m2m2m2m2m2', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 75, '99999999-9999-9999-9999-999999999999', 'm8m8m8m8-m8m8-m8m8-m8m8-m8m8m8m8m8m8', 'IN_WAREHOUSE', false, NOW(), 'test-data-script');

-- Emergency Test Supplies Inventory
INSERT INTO item (id, quantity, warehouse_id, item_type_id, item_status, resolved, created_at, created_by) VALUES 
-- Emergency Supplies - Essential Items Only
(gen_random_uuid(), 100, '00000000-0000-0000-0000-000000000000', 'i1i1i1i1-i1i1-i1i1-i1i1-i1i1i1i1i1i1', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 80, '00000000-0000-0000-0000-000000000000', 'i2i2i2i2-i2i2-i2i2-i2i2-i2i2i2i2i2i2', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 500, '00000000-0000-0000-0000-000000000000', 'i3i3i3i3-i3i3-i3i3-i3i3-i3i3i3i3i3i3', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 25, '00000000-0000-0000-0000-000000000000', 'm1m1m1m1-m1m1-m1m1-m1m1-m1m1m1m1m1m1', 'IN_WAREHOUSE', false, NOW(), 'test-data-script'),
(gen_random_uuid(), 15, '00000000-0000-0000-0000-000000000000', 'm2m2m2m2-m2m2-m2m2-m2m2-m2m2m2m2m2m2', 'IN_WAREHOUSE', false, NOW(), 'test-data-script');

-- ========================================
-- VERIFICATION AND SUMMARY
-- ========================================

-- Verify data was inserted correctly
DO $$
DECLARE
    warehouse_count INTEGER;
    equipment_count INTEGER;
    item_type_count INTEGER;
    item_count INTEGER;
    brand_count INTEGER;
    type_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO warehouse_count FROM warehouse WHERE name LIKE '%Test%';
    SELECT COUNT(*) INTO equipment_count FROM equipment WHERE serial_number LIKE 'TEST-%';
    SELECT COUNT(*) INTO item_type_count FROM item_type WHERE serial_number LIKE 'TEST-%';
    SELECT COUNT(*) INTO item_count FROM item WHERE created_by = 'test-data-script';
    SELECT COUNT(*) INTO brand_count FROM equipment_brand WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555');
    SELECT COUNT(*) INTO type_count FROM equipment_type WHERE id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'ffffffff-ffff-ffff-ffff-ffffffffffff');
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 DATABASE POPULATION COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '=====================================';
    RAISE NOTICE '📊 Summary of Created Test Data:';
    RAISE NOTICE '   • Equipment Brands: %', brand_count;
    RAISE NOTICE '   • Equipment Types: %', type_count;
    RAISE NOTICE '   • Test Warehouses: %', warehouse_count;
    RAISE NOTICE '   • Test Equipment: %', equipment_count;
    RAISE NOTICE '   • Test Item Types: %', item_type_count;
    RAISE NOTICE '   • Total Warehouse Items: %', item_count;
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Test Equipment Available:';
    RAISE NOTICE '   • TEST-CAT-EX001: e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1 (Excavator)';
    RAISE NOTICE '   • TEST-JD-BD002: e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2 (Bulldozer)';
    RAISE NOTICE '   • TEST-CAT-DT003: e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3 (Dump Truck)';
    RAISE NOTICE '   • TEST-LB-CR004: e4e4e4e4-e4e4-e4e4-e4e4-e4e4e4e4e4e4 (Crane)';
    RAISE NOTICE '   • TEST-CAT-LD005: e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5 (Loader)';
    RAISE NOTICE '   • TEST-JD-GR006: e6e6e6e6-e6e6-e6e6-e6e6-e6e6e6e6e6e6 (Grader)';
    RAISE NOTICE '';
    RAISE NOTICE '🏢 Test Warehouses Available:';
    RAISE NOTICE '   • Central Test Warehouse: 77777777-7777-7777-7777-777777777777';
    RAISE NOTICE '   • North Test Warehouse: 88888888-8888-8888-8888-888888888888';
    RAISE NOTICE '   • South Test Depot: 99999999-9999-9999-9999-999999999999';
    RAISE NOTICE '   • Emergency Test Supplies: 00000000-0000-0000-0000-000000000000';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Sample Test Items Available:';
    RAISE NOTICE '   • Test Hydraulic Oil: i1i1i1i1-i1i1-i1i1-i1i1-i1i1i1i1i1i1 (CONSUMABLE)';
    RAISE NOTICE '   • Test Engine Oil: i2i2i2i2-i2i2-i2i2-i2i2-i2i2i2i2i2i2 (CONSUMABLE)';
    RAISE NOTICE '   • Test Track Pads: m1m1m1m1-m1m1-m1m1-m1m1-m1m1m1m1m1m1 (MAINTENANCE)';
    RAISE NOTICE '   • Test Cutting Edges: m2m2m2m2-m2m2-m2m2-m2m2-m2m2m2m2m2m2 (MAINTENANCE)';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready for Enhanced Transaction Testing!';
    RAISE NOTICE '=====================================';
    RAISE NOTICE '';
    
    IF warehouse_count = 4 AND equipment_count = 6 AND item_type_count = 18 AND item_count > 25 THEN
        RAISE NOTICE '✅ All test data populated successfully! Ready to run tests.';
    ELSE
        RAISE WARNING '⚠️  Some test data may be missing. Please check the results above.';
    END IF;
END $$; 