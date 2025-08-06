-- ========================================
-- Tech Repair Shop Database - Test Data
-- ========================================
-- This script populates the database with comprehensive test data
-- Uses subtotals instead of tax calculations
-- ========================================

USE iwoodslim;

-- ========================================
-- SAMPLE CUSTOMERS
-- ========================================

INSERT INTO customers (first_name, last_name, address, city, state, zip, phone, email) VALUES
('John', 'Smith', '123 Main St', 'Little Rock', 'AR', '72201', '501-555-0101', 'john.smith@email.com'),
('Sarah', 'Johnson', '456 Tech Plaza', 'Fayetteville', 'AR', '72701', '479-555-0102', 'sarah.johnson@email.com'),
('Michael', 'Williams', '789 Digital Ave', 'Jonesboro', 'AR', '72401', '870-555-0103', 'michael.williams@email.com'),
('Emily', 'Brown', '321 Circuit Dr', 'Conway', 'AR', '72032', '501-555-0104', 'emily.brown@email.com'),
('David', 'Davis', '654 Binary Blvd', 'Springdale', 'AR', '72762', '479-555-0105', 'david.davis@email.com'),
('Jennifer', 'Miller', '987 Network Ln', 'Rogers', 'AR', '72756', '479-555-0106', 'jennifer.miller@email.com'),
('Robert', 'Wilson', '147 Silicon Way', 'Bentonville', 'AR', '72712', '479-555-0107', 'robert.wilson@email.com'),
('Lisa', 'Moore', '258 Hardware St', 'Hot Springs', 'AR', '71901', '501-555-0108', 'lisa.moore@email.com'),
('James', 'Taylor', '369 Server Ave', 'Fort Smith', 'AR', '72901', '479-555-0109', 'james.taylor@email.com'),
('Michelle', 'Anderson', '741 Cloud Rd', 'North Little Rock', 'AR', '72114', '501-555-0110', 'michelle.anderson@email.com');

-- ========================================
-- SAMPLE ITEMS
-- ========================================

INSERT INTO items (item_name, item_color, item_model, description, cost, markup_rate, quantity, sell_item, repair_item, install_item) VALUES
-- Phone Replacement Parts
('iPhone 13 Screen', 'Black', 'IP13-SCR-BLK', 'OEM quality iPhone 13 screen assembly', 89.50, 85.00, 25, TRUE, TRUE, TRUE),
('iPhone 13 Battery', 'Original', 'IP13-BAT-OEM', 'OEM iPhone 13 battery 3240mAh', 35.75, 95.00, 30, TRUE, TRUE, TRUE),
('Samsung S21 Screen', 'Black', 'S21-SCR-BLK', 'Samsung Galaxy S21 OLED display assembly', 125.00, 75.00, 15, TRUE, TRUE, TRUE),
('Android Charging Port', 'Black', 'USB-C-PORT', 'Universal USB-C charging port module', 12.25, 120.00, 50, TRUE, TRUE, TRUE),

-- Computer Components
('DDR4 RAM 16GB', 'Green', 'DDR4-16GB-3200', 'Corsair DDR4 16GB 3200MHz memory stick', 65.00, 60.00, 20, TRUE, FALSE, TRUE),
('SSD 1TB', 'Black', 'SSD-1TB-NVME', 'Samsung 980 PRO 1TB NVMe SSD', 115.00, 55.00, 25, TRUE, FALSE, TRUE),
('CPU Cooler', 'Black', 'CPU-FAN-120', 'Noctua NH-U12S CPU cooler 120mm', 75.50, 70.00, 15, TRUE, FALSE, TRUE),

-- Repair Tools & Supplies
('Thermal Paste', 'Gray', 'THERM-PASTE-5G', 'Arctic Silver 5 thermal compound 5g tube', 8.95, 110.00, 40, TRUE, TRUE, FALSE),
('Precision Screwdriver Set', 'Multi', 'PREC-SCREWS-64', '64-piece precision screwdriver set', 28.50, 85.00, 30, TRUE, TRUE, FALSE),
('Anti-Static Wrist Strap', 'Blue', 'ESD-STRAP-ADJ', 'Adjustable anti-static wrist strap', 6.75, 125.00, 45, TRUE, TRUE, FALSE),
('Electronics Cleaner', 'Clear', 'CLEAN-ELEC-12OZ', 'Isopropyl alcohol electronics cleaner 12oz', 4.50, 135.00, 60, TRUE, TRUE, FALSE),

-- Cables & Accessories
('USB-C Cable 6ft', 'Black', 'USB-C-6FT-BLK', 'High-speed USB-C to USB-A cable 6 feet', 15.25, 90.00, 50, TRUE, FALSE, TRUE),
('HDMI Cable 10ft', 'Black', 'HDMI-10FT-4K', '4K HDMI cable 10 feet gold plated', 22.00, 80.00, 35, TRUE, FALSE, TRUE),
('Power Supply 650W', 'Black', 'PSU-650W-80PLUS', 'EVGA 650W 80+ Gold modular PSU', 89.99, 65.00, 12, TRUE, FALSE, TRUE),

-- Consumables
('Microfiber Cloth Pack', 'Multi', 'MICRO-CLOTH-10', 'Pack of 10 lint-free microfiber cloths', 12.75, 100.00, 25, TRUE, TRUE, TRUE),
('Compressed Air Can', 'Blue', 'AIR-CAN-10OZ', 'Compressed air duster 10oz can', 5.50, 120.00, 40, TRUE, TRUE, FALSE);

-- ========================================
-- SAMPLE ORDERS WITH ITEMS
-- ========================================

-- Order 1: John Smith - Phone Repair Parts Order
INSERT INTO orders (customer_id, order_date, subtotal) VALUES (1, '2025-01-15', 0.00);
SET @order1_id = LAST_INSERT_ID();

INSERT INTO order_items (order_id, item_id, order_item_quantity, total_price) VALUES
(@order1_id, 1, 2, 331.16), -- 2 iPhone 13 Screens: 89.50 * 1.85 * 2 = 331.16
(@order1_id, 2, 3, 209.13), -- 3 iPhone 13 Batteries: 35.75 * 1.95 * 3 = 209.13
(@order1_id, 8, 1, 18.80);  -- 1 Thermal Paste: 8.95 * 2.10 = 18.80

-- Order 2: Sarah Johnson - Computer Upgrade Parts
INSERT INTO orders (customer_id, order_date, subtotal) VALUES (2, '2025-01-18', 0.00);
SET @order2_id = LAST_INSERT_ID();

INSERT INTO order_items (order_id, item_id, order_item_quantity, total_price) VALUES
(@order2_id, 5, 2, 208.00),  -- 2 DDR4 RAM 16GB: 65.00 * 1.60 * 2 = 208.00
(@order2_id, 6, 1, 178.25),  -- 1 SSD 1TB: 115.00 * 1.55 = 178.25
(@order2_id, 13, 2, 79.20);  -- 2 HDMI Cables: 22.00 * 1.80 * 2 = 79.20

-- Order 3: Michael Williams - Cables and Accessories
INSERT INTO orders (customer_id, order_date, subtotal) VALUES (3, '2025-01-22', 0.00);
SET @order3_id = LAST_INSERT_ID();

INSERT INTO order_items (order_id, item_id, order_item_quantity, total_price) VALUES
(@order3_id, 12, 5, 144.88), -- 5 USB-C Cables: 15.25 * 1.90 * 5 = 144.88
(@order3_id, 13, 3, 118.80), -- 3 HDMI Cables: 22.00 * 1.80 * 3 = 118.80
(@order3_id, 15, 2, 0); -- 2 Microfiber Cloth Packs

-- ========================================
-- SAMPLE REPAIRS WITH ITEMS
-- ========================================

-- Repair 1: Emily Brown - iPhone Screen Replacement
INSERT INTO repairs (customer_id, items_brought, problem, solution, estimate, status, notes, drop_off_date, pickup_date) VALUES
(4, 'iPhone 13 with cracked screen and battery draining fast', 'Cracked screen and degraded battery', 'Replace screen assembly and battery', 185.00, 'Completed', 'Customer very satisfied, phone working like new', '2025-01-10 09:30:00', '2025-01-12 14:15:00');
SET @repair1_id = LAST_INSERT_ID();

INSERT INTO repair_items (repair_id, item_id, repair_item_quantity, total_price) VALUES
(@repair1_id, 1, 1, 165.58),  -- 1 iPhone 13 Screen: 89.50 * 1.85 = 165.58
(@repair1_id, 2, 1, 69.71),   -- 1 iPhone 13 Battery: 35.75 * 1.95 = 69.71
(@repair1_id, 11, 1, 10.58);  -- 1 Electronics Cleaner: 4.50 * 2.35 = 10.58

-- Repair 2: David Davis - Gaming Computer Overheating
INSERT INTO repairs (customer_id, items_brought, problem, solution, estimate, status, notes, drop_off_date) VALUES
(5, 'Gaming desktop computer shutting down during gameplay', 'CPU overheating due to old thermal paste and dust buildup', 'Clean system, replace thermal paste, install new CPU cooler', 125.00, 'In Progress', 'Waiting for customer approval on upgraded cooler', '2025-01-20 11:00:00');
SET @repair2_id = LAST_INSERT_ID();

INSERT INTO repair_items (repair_id, item_id, repair_item_quantity, total_price) VALUES
(@repair2_id, 7, 1, 128.35),  -- 1 CPU Cooler: 75.50 * 1.70 = 128.35
(@repair2_id, 8, 1, 18.80),   -- 1 Thermal Paste: 8.95 * 2.10 = 18.80
(@repair2_id, 16, 2, 24.20);  -- 2 Compressed Air Cans: 5.50 * 2.20 * 2 = 24.20

-- Repair 3: Jennifer Miller - Laptop Won't Boot
INSERT INTO repairs (customer_id, items_brought, problem, solution, estimate, status, notes, drop_off_date) VALUES
(6, 'Laptop won\t boot, blue screen errors, very slow performance', 'Hard drive failing, insufficient RAM for current OS', 'Replace HDD with SSD, upgrade RAM to 16GB', 225.00, 'Not Started', 'Data backup completed, parts ordered', '2025-01-25 10:15:00');
SET @repair3_id = LAST_INSERT_ID();

INSERT INTO repair_items (repair_id, item_id, repair_item_quantity, total_price) VALUES
(@repair3_id, 5, 1, 104.00),  -- 1 DDR4 RAM 16GB: 65.00 * 1.60 = 104.00
(@repair3_id, 6, 1, 178.25),  -- 1 SSD 1TB: 115.00 * 1.55 = 178.25
(@repair3_id, 15, 1, 25.50);  -- 1 Microfiber Cloth Pack: 12.75 * 2.00 = 25.50

-- ========================================
-- SAMPLE INSTALLS WITH ITEMS
-- ========================================

-- Install 1: Robert Wilson - Home Office Network Setup
INSERT INTO installs (customer_id, description, install_location, estimate, install_date, notes) VALUES
(7, 'Set up home office network with hardwired connections and new router', 'Home office and den', 125.00, '2025-02-05', 'Customer wants gigabit speeds throughout home office');
SET @install1_id = LAST_INSERT_ID();

INSERT INTO install_items (install_id, item_id, install_item_quantity, total_price) VALUES
(@install1_id, 12, 4, 115.90), -- 4 USB-C Cables: 15.25 * 1.90 * 4 = 115.90
(@install1_id, 13, 2, 79.20),  -- 2 HDMI Cables: 22.00 * 1.80 * 2 = 79.20
(@install1_id, 15, 1, 25.50);  -- 1 Microfiber Cloth Pack: 12.75 * 2.00 = 25.50

-- Install 2: Lisa Moore - Gaming Computer Build
INSERT INTO installs (customer_id, description, install_location, estimate, install_date, notes) VALUES
(8, 'Build custom gaming computer with high-end components', 'Bedroom gaming setup', 275.00, '2025-02-12', 'Customer provided most parts, we supply RAM, storage, and assembly');
SET @install2_id = LAST_INSERT_ID();

INSERT INTO install_items (install_id, item_id, install_item_quantity, total_price) VALUES
(@install2_id, 5, 2, 208.00),  -- 2 DDR4 RAM 16GB: 65.00 * 1.60 * 2 = 208.00
(@install2_id, 6, 1, 178.25),  -- 1 SSD 1TB: 115.00 * 1.55 = 178.25
(@install2_id, 7, 1, 128.35),  -- 1 CPU Cooler: 75.50 * 1.70 = 128.35
(@install2_id, 8, 1, 18.80),   -- 1 Thermal Paste: 8.95 * 2.10 = 18.80
(@install2_id, 14, 1, 148.48); -- 1 Power Supply 650W: 89.99 * 1.65 = 148.48

-- Install 3: James Taylor - Small Business Network Infrastructure
INSERT INTO installs (customer_id, description, install_location, estimate, install_date, notes) VALUES
(9, 'Install network infrastructure for small business with 8 workstations', 'Office building - all floors', 350.00, '2025-02-18', 'Includes cable management and network documentation');
SET @install3_id = LAST_INSERT_ID();

INSERT INTO install_items (install_id, item_id, install_item_quantity, total_price) VALUES
(@install3_id, 12, 10, 289.75), -- 10 USB-C Cables: 15.25 * 1.90 * 10 = 289.75
(@install3_id, 13, 8, 316.80),  -- 8 HDMI Cables: 22.00 * 1.80 * 8 = 316.80
(@install3_id, 15, 3, 76.50);   -- 3 Microfiber Cloth Packs: 12.75 * 2.00 * 3 = 76.50

-- Install 4: Michelle Anderson - Complete Workstation Setup
INSERT INTO installs (customer_id, description, install_location, estimate, install_date, notes) VALUES
(10, 'Set up complete workstation with dual monitors, docking station, and peripherals', 'Home office corner desk', 175.00, '2025-02-25', 'Premium setup with cable management and ergonomic positioning');
SET @install4_id = LAST_INSERT_ID();

INSERT INTO install_items (install_id, item_id, install_item_quantity, total_price) VALUES
(@install4_id, 12, 3, 86.93), -- 3 USB-C Cables: 15.25 * 1.90 * 3 = 86.93
(@install4_id, 13, 2, 79.20), -- 2 HDMI Cables: 22.00 * 1.80 * 2 = 79.20
(@install4_id, 15, 1, 25.50), -- 1 Microfiber Cloth Pack: 12.75 * 2.00 = 25.50
(@install4_id, 16, 1, 12.10); -- 1 Compressed Air Can: 5.50 * 2.20 = 12.10

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Show summary of test data
SELECT 'Test Data Summary' AS Section, '' AS Details
UNION ALL
SELECT 'Customers', CAST(COUNT(*) AS CHAR) FROM customers
UNION ALL
SELECT 'Items', CAST(COUNT(*) AS CHAR) FROM items
UNION ALL
SELECT 'Orders', CAST(COUNT(*) AS CHAR) FROM orders
UNION ALL
SELECT 'Order Items', CAST(COUNT(*) AS CHAR) FROM order_items
UNION ALL
SELECT 'Repairs', CAST(COUNT(*) AS CHAR) FROM repairs
UNION ALL
SELECT 'Repair Items', CAST(COUNT(*) AS CHAR) FROM repair_items
UNION ALL
SELECT 'Installs', CAST(COUNT(*) AS CHAR) FROM installs
UNION ALL
SELECT 'Install Items', CAST(COUNT(*) AS CHAR) FROM install_items;

-- Show install pricing examples
SELECT 
    CONCAT('Install #', i.install_id) AS Install,
    CONCAT(c.first_name, ' ', c.last_name) AS Customer,
    CONCAT('$', FORMAT(i.estimate, 2)) AS Labor_Estimate,
    CONCAT('$', FORMAT(COALESCE(SUM(ii.total_price), 0), 2)) AS Items_Total,
    CONCAT('$', FORMAT(i.subtotal, 2)) AS Subtotal
FROM installs i
JOIN customers c ON i.customer_id = c.customer_id
LEFT JOIN install_items ii ON i.install_id = ii.install_id
GROUP BY i.install_id
ORDER BY i.install_id;
