-- =============================================
-- POPULATE DATABASE FOR ANALYTICS DASHBOARD
-- =============================================

-- Insert Manufacturers
INSERT INTO manufacturers (id, name, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'DePuy Synthes', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Zimmer Biomet', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Stryker', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'Smith & Nephew', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Hospitals
INSERT INTO hospitals (id, name, address, phone, created_at, updated_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Johns Hopkins Hospital', '1800 Orleans St, Baltimore, MD 21287', '(410) 955-5000', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440002', 'Mayo Clinic', '200 First St SW, Rochester, MN 55905', '(507) 284-2511', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440003', 'Cleveland Clinic', '9500 Euclid Ave, Cleveland, OH 44195', '(216) 444-2200', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440004', 'Massachusetts General Hospital', '55 Fruit St, Boston, MA 02114', '(617) 726-2000', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Surgeons
INSERT INTO surgeons (id, name, specialty, hospital_id, phone, email, created_at, updated_at) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Dr. Sarah Smith', 'Orthopedic Surgery', '660e8400-e29b-41d4-a716-446655440001', '(410) 955-1234', 'sarah.smith@jhmi.edu', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440002', 'Dr. Michael Johnson', 'Spine Surgery', '660e8400-e29b-41d4-a716-446655440002', '(507) 284-1234', 'michael.johnson@mayo.edu', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440003', 'Dr. Emily Williams', 'Knee Surgery', '660e8400-e29b-41d4-a716-446655440003', '(216) 444-1234', 'emily.williams@ccf.org', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440004', 'Dr. David Brown', 'Hip Surgery', '660e8400-e29b-41d4-a716-446655440004', '(617) 726-1234', 'david.brown@mgh.harvard.edu', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440005', 'Dr. Lisa Davis', 'Trauma Surgery', '660e8400-e29b-41d4-a716-446655440001', '(410) 955-5678', 'lisa.davis@jhmi.edu', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Products
INSERT INTO products (id, name, category, manufacturer_id, list_price, created_at, updated_at) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'ATTUNE Knee System', 'Knee Implants', '550e8400-e29b-41d4-a716-446655440001', 4500.00, NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440002', 'PINNACLE Hip System', 'Hip Implants', '550e8400-e29b-41d4-a716-446655440001', 5200.00, NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440003', 'EXPEDIUM Spine Rod', 'Spine Hardware', '550e8400-e29b-41d4-a716-446655440001', 2800.00, NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440004', 'Zimmer Knee Implant', 'Knee Implants', '550e8400-e29b-41d4-a716-446655440002', 4200.00, NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440005', 'Stryker Hip Cup', 'Hip Implants', '550e8400-e29b-41d4-a716-446655440003', 3800.00, NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440006', 'EXPERT Tibial Nail', 'Trauma Plates', '550e8400-e29b-41d4-a716-446655440001', 1850.00, NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440007', 'SYNTHES Bone Plate', 'Trauma Plates', '550e8400-e29b-41d4-a716-446655440001', 920.00, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Inventory
INSERT INTO inventory (id, product_id, quantity, location, expiration_date, cost_per_unit, created_at, updated_at) VALUES
('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 45, 'Warehouse A-1', '2025-12-31', 4500.00, NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', 32, 'Warehouse A-2', '2025-11-30', 5200.00, NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440003', 67, 'Warehouse B-1', '2025-10-15', 2800.00, NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440004', 28, 'Warehouse A-3', '2025-09-30', 4200.00, NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440005', 19, 'Warehouse B-2', '2025-08-15', 3800.00, NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440006', 156, 'Warehouse C-1', '2026-03-31', 1850.00, NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440007', '880e8400-e29b-41d4-a716-446655440007', 203, 'Warehouse C-2', '2026-05-31', 920.00, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Surgery Cases (Current Year)
INSERT INTO surgery_cases (id, surgeon_id, hospital_id, scheduled_at, actual_cost, status, created_at, updated_at) VALUES
-- January 2024
('aa0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '2024-01-15 09:00:00', 12500.00, 'completed', '2024-01-15', NOW()),
('aa0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '2024-01-18 10:30:00', 18700.00, 'completed', '2024-01-18', NOW()),
('aa0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', '2024-01-22 14:00:00', 9800.00, 'completed', '2024-01-22', NOW()),
-- February 2024
('aa0e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004', '2024-02-05 08:30:00', 15200.00, 'completed', '2024-02-05', NOW()),
('aa0e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', '2024-02-12 11:00:00', 8900.00, 'completed', '2024-02-12', NOW()),
('aa0e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '2024-02-20 13:30:00', 13400.00, 'completed', '2024-02-20', NOW()),
-- March 2024
('aa0e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '2024-03-08 09:15:00', 21500.00, 'completed', '2024-03-08', NOW()),
('aa0e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', '2024-03-15 10:45:00', 11200.00, 'completed', '2024-03-15', NOW()),
-- April 2024
('aa0e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004', '2024-04-10 12:00:00', 16800.00, 'completed', '2024-04-10', NOW()),
('aa0e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', '2024-04-25 14:30:00', 7650.00, 'completed', '2024-04-25', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Case Assets (linking cases to products used)
INSERT INTO case_assets (id, case_id, product_id, quantity_used, total_cost, created_at, updated_at) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 2, 9000.00, NOW(), NOW()),
('bb0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440007', 4, 3680.00, NOW(), NOW()),
('bb0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440003', 3, 8400.00, NOW(), NOW()),
('bb0e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', 2, 10400.00, NOW(), NOW()),
('bb0e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440004', 2, 8400.00, NOW(), NOW()),
('bb0e8400-e29b-41d4-a716-446655440006', 'aa0e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440005', 3, 11400.00, NOW(), NOW()),
('bb0e8400-e29b-41d4-a716-446655440007', 'aa0e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440007', 4, 3680.00, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Daily Sales
INSERT INTO daily_sales (id, sale_date, total_revenue, total_cases, average_case_value, created_at, updated_at) VALUES
('cc0e8400-e29b-41d4-a716-446655440001', '2024-01-15', 12500.00, 1, 12500.00, NOW(), NOW()),
('cc0e8400-e29b-41d4-a716-446655440002', '2024-01-18', 18700.00, 1, 18700.00, NOW(), NOW()),
('cc0e8400-e29b-41d4-a716-446655440003', '2024-01-22', 9800.00, 1, 9800.00, NOW(), NOW()),
('cc0e8400-e29b-41d4-a716-446655440004', '2024-02-05', 15200.00, 1, 15200.00, NOW(), NOW()),
('cc0e8400-e29b-41d4-a716-446655440005', '2024-02-12', 8900.00, 1, 8900.00, NOW(), NOW()),
('cc0e8400-e29b-41d4-a716-446655440006', '2024-02-20', 13400.00, 1, 13400.00, NOW(), NOW()),
('cc0e8400-e29b-41d4-a716-446655440007', '2024-03-08', 21500.00, 1, 21500.00, NOW(), NOW()),
('cc0e8400-e29b-41d4-a716-446655440008', '2024-03-15', 11200.00, 1, 11200.00, NOW(), NOW()),
('cc0e8400-e29b-41d4-a716-446655440009', '2024-04-10', 16800.00, 1, 16800.00, NOW(), NOW()),
('cc0e8400-e29b-41d4-a716-446655440010', '2024-04-25', 7650.00, 1, 7650.00, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Backorder Reports
INSERT INTO backorder_reports (id, product_id, quantity_backordered, expected_restock_date, priority_level, created_at, updated_at) VALUES
('dd0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 12, '2024-07-15', 'high', NOW(), NOW()),
('dd0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', 8, '2024-07-20', 'medium', NOW(), NOW()),
('dd0e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440003', 15, '2024-08-05', 'critical', NOW(), NOW()),
('dd0e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440004', 6, '2024-07-30', 'low', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Expiring Reports
INSERT INTO expiring_reports (id, inventory_id, days_until_expiration, estimated_loss_value, action_required, created_at, updated_at) VALUES
('ee0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440004', 92, 117600.00, 'priority_sale', NOW(), NOW()),
('ee0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440005', 47, 72200.00, 'urgent_sale', NOW(), NOW()),
('ee0e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440002', 123, 166400.00, 'monitor', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Analytics Events (for tracking)
INSERT INTO analytics_events (id, event_type, event_data, user_id, created_at) VALUES
('ff0e8400-e29b-41d4-a716-446655440001', 'dashboard_view', '{"section": "analytics", "duration": 45}', NULL, NOW()),
('ff0e8400-e29b-41d4-a716-446655440002', 'case_completed', '{"case_id": "aa0e8400-e29b-41d4-a716-446655440001", "revenue": 12500}', NULL, NOW()),
('ff0e8400-e29b-41d4-a716-446655440003', 'inventory_alert', '{"type": "expiring", "product_count": 3}', NULL, NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Financial Data (monthly aggregates)
INSERT INTO financial_data (id, month, year, total_revenue, total_costs, gross_profit, operating_expenses, net_profit, created_at, updated_at) VALUES
('ff0e8400-e29b-41d4-a716-446655440011', 1, 2024, 41000.00, 28700.00, 12300.00, 8500.00, 3800.00, NOW(), NOW()),
('ff0e8400-e29b-41d4-a716-446655440012', 2, 2024, 37500.00, 26250.00, 11250.00, 7800.00, 3450.00, NOW(), NOW()),
('ff0e8400-e29b-41d4-a716-446655440013', 3, 2024, 32700.00, 22890.00, 9810.00, 6900.00, 2910.00, NOW(), NOW()),
('ff0e8400-e29b-41d4-a716-446655440014', 4, 2024, 24450.00, 17115.00, 7335.00, 5200.00, 2135.00, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check data counts
SELECT 'manufacturers' as table_name, COUNT(*) as record_count FROM manufacturers
UNION ALL
SELECT 'hospitals', COUNT(*) FROM hospitals
UNION ALL
SELECT 'surgeons', COUNT(*) FROM surgeons
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'inventory', COUNT(*) FROM inventory
UNION ALL
SELECT 'surgery_cases', COUNT(*) FROM surgery_cases
UNION ALL
SELECT 'case_assets', COUNT(*) FROM case_assets
UNION ALL
SELECT 'daily_sales', COUNT(*) FROM daily_sales
UNION ALL
SELECT 'backorder_reports', COUNT(*) FROM backorder_reports
UNION ALL
SELECT 'expiring_reports', COUNT(*) FROM expiring_reports
UNION ALL
SELECT 'analytics_events', COUNT(*) FROM analytics_events
UNION ALL
SELECT 'financial_data', COUNT(*) FROM financial_data
ORDER BY table_name; 