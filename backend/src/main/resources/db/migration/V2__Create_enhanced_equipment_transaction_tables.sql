-- Enhanced Equipment Transaction System Migration
-- Creates tables for improved warehouse ↔ equipment transaction tracking
-- 
-- CRITICAL: This migration only affects warehouse-equipment transactions.
-- Warehouse-to-warehouse transactions remain completely untouched.

-- ========================================
-- Transaction History Table
-- Comprehensive audit trail for warehouse-equipment transaction changes
-- ========================================

CREATE TABLE IF NOT EXISTS transaction_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL,
    transaction_item_id UUID,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    equipment_status VARCHAR(50),
    change_type VARCHAR(50) NOT NULL,
    previous_quantity INTEGER,
    new_quantity INTEGER,
    reason TEXT,
    changed_by VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    additional_data TEXT,
    is_system_generated BOOLEAN DEFAULT FALSE,
    
    -- Foreign key constraints
    CONSTRAINT fk_transaction_history_transaction 
        FOREIGN KEY (transaction_id) REFERENCES transaction(id) ON DELETE CASCADE,
    CONSTRAINT fk_transaction_history_transaction_item 
        FOREIGN KEY (transaction_item_id) REFERENCES transaction_item(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transaction_history_transaction_id ON transaction_history(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_history_transaction_item_id ON transaction_history(transaction_item_id);
CREATE INDEX IF NOT EXISTS idx_transaction_history_changed_at ON transaction_history(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_history_changed_by ON transaction_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_transaction_history_change_type ON transaction_history(change_type);

-- ========================================
-- Consumable Movements Table
-- Accurate tracking of consumable movements between warehouses and equipment
-- ========================================

CREATE TABLE IF NOT EXISTS consumable_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL,
    transaction_item_id UUID NOT NULL,
    item_type_id UUID NOT NULL,
    
    -- Source information
    source_warehouse_id UUID,
    source_equipment_id UUID,
    
    -- Destination information
    destination_warehouse_id UUID,
    destination_equipment_id UUID,
    
    -- Movement details
    quantity INTEGER NOT NULL,
    expected_quantity INTEGER,
    movement_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    
    -- Timing
    movement_date TIMESTAMP,
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    recorded_by VARCHAR(255) NOT NULL,
    
    -- Additional tracking
    notes TEXT,
    is_discrepancy BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    resolved_by VARCHAR(255),
    
    -- Foreign key constraints
    CONSTRAINT fk_consumable_movements_transaction 
        FOREIGN KEY (transaction_id) REFERENCES transaction(id) ON DELETE CASCADE,
    CONSTRAINT fk_consumable_movements_transaction_item 
        FOREIGN KEY (transaction_item_id) REFERENCES transaction_item(id) ON DELETE CASCADE,
    CONSTRAINT fk_consumable_movements_item_type 
        FOREIGN KEY (item_type_id) REFERENCES item_type(id) ON DELETE RESTRICT,
    CONSTRAINT fk_consumable_movements_source_warehouse 
        FOREIGN KEY (source_warehouse_id) REFERENCES warehouse(id) ON DELETE SET NULL,
    CONSTRAINT fk_consumable_movements_source_equipment 
        FOREIGN KEY (source_equipment_id) REFERENCES equipment(id) ON DELETE SET NULL,
    CONSTRAINT fk_consumable_movements_destination_warehouse 
        FOREIGN KEY (destination_warehouse_id) REFERENCES warehouse(id) ON DELETE SET NULL,
    CONSTRAINT fk_consumable_movements_destination_equipment 
        FOREIGN KEY (destination_equipment_id) REFERENCES equipment(id) ON DELETE SET NULL,
    
    -- Business logic constraints
    CONSTRAINT chk_consumable_movements_quantity_positive 
        CHECK (quantity > 0),
    CONSTRAINT chk_consumable_movements_expected_quantity_positive 
        CHECK (expected_quantity IS NULL OR expected_quantity > 0),
    CONSTRAINT chk_consumable_movements_source_destination_different
        CHECK (
            (source_warehouse_id IS NOT NULL AND destination_equipment_id IS NOT NULL) OR
            (source_equipment_id IS NOT NULL AND destination_warehouse_id IS NOT NULL) OR
            (source_equipment_id IS NOT NULL AND destination_equipment_id IS NOT NULL)
        )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_consumable_movements_transaction_id ON consumable_movements(transaction_id);
CREATE INDEX IF NOT EXISTS idx_consumable_movements_transaction_item_id ON consumable_movements(transaction_item_id);
CREATE INDEX IF NOT EXISTS idx_consumable_movements_item_type_id ON consumable_movements(item_type_id);
CREATE INDEX IF NOT EXISTS idx_consumable_movements_source_warehouse_id ON consumable_movements(source_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_consumable_movements_source_equipment_id ON consumable_movements(source_equipment_id);
CREATE INDEX IF NOT EXISTS idx_consumable_movements_destination_warehouse_id ON consumable_movements(destination_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_consumable_movements_destination_equipment_id ON consumable_movements(destination_equipment_id);
CREATE INDEX IF NOT EXISTS idx_consumable_movements_movement_date ON consumable_movements(movement_date DESC);
CREATE INDEX IF NOT EXISTS idx_consumable_movements_recorded_at ON consumable_movements(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_consumable_movements_status ON consumable_movements(status);
CREATE INDEX IF NOT EXISTS idx_consumable_movements_movement_type ON consumable_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_consumable_movements_is_discrepancy ON consumable_movements(is_discrepancy);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_consumable_movements_equipment_item_type 
    ON consumable_movements(source_equipment_id, destination_equipment_id, item_type_id, movement_date DESC);
CREATE INDEX IF NOT EXISTS idx_consumable_movements_warehouse_equipment 
    ON consumable_movements(source_warehouse_id, destination_equipment_id, movement_date DESC);

-- ========================================
-- Views for Common Queries
-- ========================================

-- View for equipment consumable balance calculation
CREATE OR REPLACE VIEW equipment_consumable_balance AS
SELECT 
    COALESCE(cm.source_equipment_id, cm.destination_equipment_id) as equipment_id,
    cm.item_type_id,
    SUM(CASE WHEN cm.destination_equipment_id IS NOT NULL THEN cm.quantity ELSE 0 END) as total_received,
    SUM(CASE WHEN cm.source_equipment_id IS NOT NULL THEN cm.quantity ELSE 0 END) as total_sent,
    SUM(CASE WHEN cm.destination_equipment_id IS NOT NULL THEN cm.quantity ELSE 0 END) - 
    SUM(CASE WHEN cm.source_equipment_id IS NOT NULL THEN cm.quantity ELSE 0 END) as current_balance
FROM consumable_movements cm
WHERE cm.status = 'ACCEPTED'
GROUP BY COALESCE(cm.source_equipment_id, cm.destination_equipment_id), cm.item_type_id;

-- View for recent transaction activity (last 30 days)
CREATE OR REPLACE VIEW recent_equipment_transaction_activity AS
SELECT 
    th.transaction_id,
    th.change_type,
    th.changed_at,
    th.changed_by,
    t.sender_type,
    t.sender_id,
    t.receiver_type,
    t.receiver_id,
    t.purpose
FROM transaction_history th
JOIN transaction t ON th.transaction_id = t.id
WHERE th.changed_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
  AND (t.sender_type = 'EQUIPMENT' OR t.receiver_type = 'EQUIPMENT')
ORDER BY th.changed_at DESC;

-- ========================================
-- Functions for Data Integrity
-- ========================================

-- Function to validate consumable movement integrity
CREATE OR REPLACE FUNCTION validate_consumable_movement_integrity(
    p_equipment_id UUID,
    p_item_type_id UUID
) RETURNS TABLE(
    equipment_id UUID,
    item_type_id UUID,
    calculated_balance INTEGER,
    movement_balance INTEGER,
    is_valid BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p_equipment_id as equipment_id,
        p_item_type_id as item_type_id,
        COALESCE(ecb.current_balance, 0) as calculated_balance,
        COALESCE(
            (SELECT SUM(CASE WHEN cm.destination_equipment_id = p_equipment_id THEN cm.quantity ELSE -cm.quantity END)
             FROM consumable_movements cm 
             WHERE (cm.source_equipment_id = p_equipment_id OR cm.destination_equipment_id = p_equipment_id)
               AND cm.item_type_id = p_item_type_id), 0
        ) as movement_balance,
        COALESCE(ecb.current_balance, 0) = COALESCE(
            (SELECT SUM(CASE WHEN cm.destination_equipment_id = p_equipment_id THEN cm.quantity ELSE -cm.quantity END)
             FROM consumable_movements cm 
             WHERE (cm.source_equipment_id = p_equipment_id OR cm.destination_equipment_id = p_equipment_id)
               AND cm.item_type_id = p_item_type_id), 0
        ) as is_valid
    FROM equipment_consumable_balance ecb
    WHERE ecb.equipment_id = p_equipment_id 
      AND ecb.item_type_id = p_item_type_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Comments for Documentation
-- ========================================

COMMENT ON TABLE transaction_history IS 'Comprehensive audit trail for warehouse ↔ equipment transaction state changes. Tracks all status changes, quantities, and user actions for complete traceability.';

COMMENT ON TABLE consumable_movements IS 'Accurate tracking of consumable movements between warehouses and equipment. Provides reliable movement history to replace unreliable transaction field in consumables.';

COMMENT ON VIEW equipment_consumable_balance IS 'Calculated view showing current consumable balance for each equipment and item type combination based on movement history.';

COMMENT ON VIEW recent_equipment_transaction_activity IS 'Recent transaction activity view for monitoring and dashboard purposes. Shows last 30 days of equipment transaction changes.';

COMMENT ON FUNCTION validate_consumable_movement_integrity IS 'Validates the integrity of consumable movements by comparing calculated balance with movement balance. Used for data accuracy verification.'; 