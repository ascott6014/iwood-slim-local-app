-- Copy and paste this entire script into MySQL to add test data

-- Insert customers
INSERT INTO customers (first_name, last_name, address, city, state, zip, phone, email) VALUES
('John', 'Smith', '123 Main St', 'Springfield', 'IL', '62701', '217-555-0101', 'john.smith@email.com'),
('Sarah', 'Johnson', '456 Oak Ave', 'Springfield', 'IL', '62702', '217-555-0102', 'sarah.johnson@email.com'),
('Michael', 'Brown', '789 Elm St', 'Decatur', 'IL', '62521', '217-555-0103', 'michael.brown@email.com'),
('Emily', 'Davis', '321 Pine Rd', 'Champaign', 'IL', '61820', '217-555-0104', 'emily.davis@email.com'),
('Robert', 'Wilson', '654 Maple Dr', 'Urbana', 'IL', '61801', '217-555-0105', 'robert.wilson@email.com'),
('Jennifer', 'Taylor', '987 Cedar Ln', 'Springfield', 'IL', '62703', '217-555-0106', 'jennifer.taylor@email.com'),
('David', 'Anderson', '147 Birch St', 'Peoria', 'IL', '61601', '309-555-0107', 'david.anderson@email.com'),
('Lisa', 'Thomas', '258 Walnut Ave', 'Bloomington', 'IL', '61701', '309-555-0108', 'lisa.thomas@email.com'),
('James', 'Jackson', '369 Cherry St', 'Normal', 'IL', '61761', '309-555-0109', 'james.jackson@email.com'),
('Mary', 'White', '741 Spruce Rd', 'Springfield', 'IL', '62704', '217-555-0110', 'mary.white@email.com');

-- Insert items
INSERT INTO items (item_name, item_color, item_model, description, cost, markup_rate, quantity, sell_item, repair_item, install_item) VALUES
('iPhone Screen', 'Black', 'iPhone 12 Pro', 'OLED display assembly with digitizer', 120.00, 25.00, 15, TRUE, TRUE, FALSE),
('Samsung Battery', 'Original', 'Galaxy S21', 'OEM lithium-ion battery 4000mAh', 35.00, 128.57, 20, TRUE, TRUE, FALSE),
('Laptop RAM', 'Silver', 'DDR4-3200', '16GB memory module for laptops', 60.00, 100.00, 25, TRUE, FALSE, TRUE),
('SSD Drive', 'Black', '500GB NVME', 'High-speed solid state drive', 45.00, 88.89, 30, TRUE, FALSE, TRUE),
('Charging Port', 'Black', 'USB-C', 'Universal charging port assembly', 15.00, 200.00, 40, TRUE, TRUE, FALSE),
('Tablet Screen', 'White', 'iPad Air 4', 'LCD display with touch digitizer', 150.00, 33.33, 10, TRUE, TRUE, FALSE),
('Laptop Keyboard', 'Black', 'MacBook Pro', 'Replacement keyboard with backlight', 75.00, 26.67, 12, TRUE, TRUE, FALSE),
('HDMI Port', 'Black', 'PS5/Xbox', 'Gaming console HDMI connector', 25.00, 160.00, 18, TRUE, TRUE, FALSE),
('Watch Band', 'Sport Blue', 'Apple Watch', 'Silicone sport band 44mm', 8.00, 212.50, 50, TRUE, FALSE, FALSE),
('Earbuds Case', 'White', 'AirPods Pro', 'Replacement charging case', 20.00, 100.00, 15, TRUE, TRUE, FALSE);

-- Insert tax rate
INSERT INTO tax_rate (tax_rate) VALUES (8.25);

-- Insert active tax log
INSERT INTO tax_log (tax_rate_id, rate, start_date, is_active) VALUES 
(1, 8.25, '2025-01-01 00:00:00', TRUE);

-- Insert customer visits
INSERT INTO customer_visits (customer_id, visit_type, visit_date) VALUES
(1, 'Repair', '2025-01-15 09:30:00'),
(2, 'Repair', '2025-01-20 14:15:00'),
(3, 'Order', '2025-01-25 10:00:00'),
(4, 'Repair', '2025-02-10 11:30:00'),
(5, 'Order', '2025-02-05 16:45:00'),
(6, 'Repair', '2025-02-18 13:20:00'),
(7, 'Order', '2025-02-12 09:15:00'),
(8, 'Repair', '2025-02-25 15:30:00'),
(2, 'Install', '2025-02-15 08:00:00'),
(4, 'Install', '2025-03-01 10:30:00');

-- Insert repairs
INSERT INTO repairs (customer_id, items_brought, problem, solution, estimate, status, notes, drop_off_date, pickup_date) VALUES
(1, 'iPhone 12 Pro', 'Cracked screen, touch not responding', 'Replace LCD screen and digitizer', 175.00, 'Completed', 'Customer very satisfied', '2025-01-15 09:30:00', '2025-01-18 16:00:00'),
(2, 'Samsung Galaxy S21', 'Battery drains quickly', 'Replace battery and calibrate', 95.00, 'Completed', 'Battery life restored', '2025-01-20 14:15:00', '2025-01-25 10:30:00'),
(3, 'MacBook Pro 2019', 'Keyboard keys sticking', 'Replace keyboard assembly', 250.00, 'In Progress', 'Parts ordered', '2025-02-01 11:00:00', NULL),
(4, 'iPad Air', 'Screen flickering', 'Replace LCD display', 280.00, 'Not Started', 'Waiting for screen delivery', '2025-02-10 11:30:00', NULL),
(5, 'Nintendo Switch', 'Joy-Con drift issue', 'Replace analog stick modules', 65.00, 'On Hold', 'Customer requested delay', '2025-02-15 13:45:00', NULL),
(6, 'Dell Laptop', 'Won\'t turn on', 'Replace power jack and adapter', 85.00, 'Completed', 'Powers on perfectly', '2025-02-18 13:20:00', '2025-02-20 15:00:00'),
(7, 'Apple Watch Series 6', 'Cracked screen', 'Replace watch face glass', 120.00, 'Cancelled', 'Customer bought new watch', '2025-02-22 10:00:00', NULL),
(8, 'Google Pixel 6', 'Water damage', 'Clean internals and replace components', 150.00, 'In Progress', 'Drying and testing', '2025-02-25 15:30:00', NULL);

-- Insert orders
INSERT INTO orders (customer_id, order_date, order_total) VALUES
(1, '2025-01-10', 645.00),
(3, '2025-01-25', 470.00),
(5, '2025-02-05', 445.00),
(7, '2025-02-12', 285.00),
(9, '2025-02-20', 240.00);

-- Insert order items
INSERT INTO order_items (order_id, item_id, order_item_quantity, total_price) VALUES
(1, 1, 4, 600.00), (1, 2, 1, 45.00),
(2, 6, 1, 200.00), (2, 7, 1, 95.00), (2, 3, 1, 120.00), (2, 9, 2, 50.00),
(3, 5, 1, 45.00), (3, 8, 1, 65.00), (3, 4, 1, 85.00), (3, 10, 1, 40.00), (3, 2, 5, 225.00),
(4, 4, 1, 85.00), (4, 10, 2, 80.00), (4, 3, 1, 120.00),
(5, 3, 1, 120.00), (5, 9, 2, 50.00), (5, 2, 2, 90.00);

-- Insert repair items
INSERT INTO repair_items (repair_id, item_id, repair_item_quantity, total_price) VALUES
(1, 1, 1, 150.00),
(2, 2, 1, 45.00),
(3, 7, 1, 95.00),
(4, 6, 1, 200.00),
(6, 5, 1, 45.00),
(8, 1, 1, 150.00), (8, 5, 1, 45.00);

-- Insert installs
INSERT INTO installs (customer_id, description, install_location, estimate, install_date, notes) VALUES
(2, 'Home security camera system setup', 'Living room and exterior', 450.00, '2025-02-15', 'All cameras functioning perfectly'),
(4, 'Smart home automation installation', 'Throughout house', 650.00, '2025-03-01', 'Equipment ready for install'),
(6, 'Gaming PC build and setup', 'Home office', 1200.00, '2025-03-10', 'CPU and motherboard installed'),
(8, 'Home theater system wiring', 'Basement entertainment room', 380.00, '2025-03-15', 'Surround sound working great'),
(10, 'Network and Wi-Fi optimization', 'Home office and bedrooms', 250.00, '2025-03-20', 'Site survey completed');

-- Insert install items
INSERT INTO install_items (install_id, item_id, install_item_quantity, total_price) VALUES
(2, 3, 2, 240.00), (2, 4, 1, 85.00),
(3, 3, 4, 480.00), (3, 4, 2, 170.00),
(4, 3, 8, 960.00), (4, 4, 4, 340.00),
(5, 3, 1, 120.00), (5, 4, 3, 255.00);

-- Insert item price log for historical pricing
INSERT INTO item_price_log (item_id, cost, markup_rate, price, start_date, is_active) VALUES
(1, 120.00, 25.00, 150.00, '2025-01-01', TRUE),
(2, 35.00, 128.57, 80.00, '2025-01-01', TRUE),
(3, 60.00, 100.00, 120.00, '2025-01-01', TRUE),
(4, 45.00, 88.89, 85.00, '2025-01-01', TRUE),
(5, 15.00, 200.00, 45.00, '2025-01-01', TRUE),
(6, 150.00, 33.33, 200.00, '2025-01-01', TRUE),
(7, 75.00, 26.67, 95.00, '2025-01-01', TRUE),
(8, 25.00, 160.00, 65.00, '2025-01-01', TRUE),
(9, 8.00, 212.50, 25.00, '2025-01-01', TRUE),
(10, 20.00, 100.00, 40.00, '2025-01-01', TRUE);
