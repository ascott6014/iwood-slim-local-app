-- ========================================
-- iWood Slim Database - Stored Procedures
-- ========================================

USE iwoodslim;

DELIMITER //

-- ========================================
-- CUSTOMER AND ORDER PROCEDURES
-- ========================================

-- Updated: Add Customer + Order (auto order_date, calculated subtotal)
DROP PROCEDURE IF EXISTS AddCustomerAndOrder//
CREATE PROCEDURE AddCustomerAndOrder (
    IN first_name VARCHAR(50),
    IN last_name VARCHAR(50),
    IN address VARCHAR(255),
    IN city VARCHAR(100),
    IN state VARCHAR(50),
    IN zip VARCHAR(20),
    IN phone VARCHAR(20),
    IN email VARCHAR(100)
)
BEGIN
    INSERT INTO customers (first_name, last_name, address, city, state, zip, phone, email)
    VALUES (first_name, last_name, address, city, state, zip, phone, email);

    SET @cust_id = LAST_INSERT_ID();

    INSERT INTO orders (customer_id, order_date, subtotal)
    VALUES (@cust_id, CURDATE(), 0.00);
    
    SELECT LAST_INSERT_ID() as order_id, @cust_id as customer_id;
END//

-- Updated: Add Order for Existing Customer (auto order_date, calculated subtotal)
DROP PROCEDURE IF EXISTS AddOrderForCustomer//
CREATE PROCEDURE AddOrderForCustomer (
    IN customer_id INT
)
BEGIN
    INSERT INTO orders (customer_id, order_date, subtotal)
    VALUES (customer_id, CURDATE(), 0.00);
    
    SELECT LAST_INSERT_ID() as order_id, customer_id;
END//

-- ========================================
-- ORDER ITEM MANAGEMENT PROCEDURES
-- ========================================

-- Add Order Item
DROP PROCEDURE IF EXISTS AddOrderItem//
CREATE PROCEDURE AddOrderItem (
    IN p_order_id INT,
    IN p_item_id INT,
    IN p_quantity INT
)
BEGIN
    DECLARE item_price DECIMAL(10,2);
    
    -- Get item price
    SELECT price INTO item_price FROM items WHERE item_id = p_item_id;
    
    INSERT INTO order_items (order_id, item_id, order_item_quantity, total_price)
    VALUES (p_order_id, p_item_id, p_quantity, item_price * p_quantity);
END//

-- Remove Order Item
DROP PROCEDURE IF EXISTS RemoveOrderItem//
CREATE PROCEDURE RemoveOrderItem (
    IN p_order_item_id INT
)
BEGIN
    DELETE FROM order_items WHERE order_item_id = p_order_item_id;
END//

-- Update Order Item Quantity
DROP PROCEDURE IF EXISTS UpdateOrderItem//
CREATE PROCEDURE UpdateOrderItem (
    IN p_order_item_id INT,
    IN p_new_quantity INT
)
BEGIN
    UPDATE order_items 
    SET order_item_quantity = p_new_quantity 
    WHERE order_item_id = p_order_item_id;
END//

-- ========================================
-- CUSTOMER AND REPAIR PROCEDURES
-- ========================================

-- Add Customer + Repair
DROP PROCEDURE IF EXISTS AddCustomerAndRepair//
CREATE PROCEDURE AddCustomerAndRepair (
    IN first_name VARCHAR(50),
    IN last_name VARCHAR(50),
    IN address VARCHAR(255),
    IN city VARCHAR(100),
    IN state VARCHAR(50),
    IN zip VARCHAR(20),
    IN phone VARCHAR(20),
    IN email VARCHAR(100),
    IN items_brought TEXT,
    IN problem VARCHAR(255),
    IN solution VARCHAR(255),
    IN estimate DECIMAL(10,2),
    IN status ENUM("Not Started", "In Progress", "Completed", "On Hold", "Cancelled"),
    IN notes TEXT,
    IN drop_off_date DATETIME
)
BEGIN
    INSERT INTO customers (first_name, last_name, address, city, state, zip, phone, email)
    VALUES (first_name, last_name, address, city, state, zip, phone, email);

    SET @cust_id = LAST_INSERT_ID();

    INSERT INTO repairs (customer_id, items_brought, problem, solution, estimate, status, notes, drop_off_date)
    VALUES (@cust_id, items_brought, problem, solution, estimate, status, notes, drop_off_date);
    
    SELECT LAST_INSERT_ID() as repair_id, @cust_id as customer_id;
END//

-- Add Repair for Existing Customer
DROP PROCEDURE IF EXISTS AddRepairForCustomer//
CREATE PROCEDURE AddRepairForCustomer (
    IN customer_id INT,
    IN items_brought TEXT,
    IN problem VARCHAR(255),
    IN solution VARCHAR(255),
    IN estimate DECIMAL(10,2),
    IN status ENUM("Not Started", "In Progress", "Completed", "On Hold", "Cancelled"),
    IN notes TEXT,
    IN drop_off_date DATETIME
)
BEGIN
    INSERT INTO repairs (customer_id, items_brought, problem, solution, estimate, status, notes, drop_off_date)
    VALUES (customer_id, items_brought, problem, solution, estimate, status, notes, drop_off_date);
    
    SELECT LAST_INSERT_ID() as repair_id, customer_id;
END//

-- ========================================
-- REPAIR MANAGEMENT PROCEDURES
-- ========================================

-- Update Repair Pickup Date
DROP PROCEDURE IF EXISTS UpdateRepairPickupDate//
CREATE PROCEDURE UpdateRepairPickupDate (
    IN p_repair_id INT
)
BEGIN
    UPDATE repairs 
    SET pickup_date = NOW() 
    WHERE repair_id = p_repair_id;
END//

-- Update Repair Status
DROP PROCEDURE IF EXISTS UpdateRepairStatus//
CREATE PROCEDURE UpdateRepairStatus (
    IN p_repair_id INT,
    IN p_new_status ENUM("Not Started", "In Progress", "Completed", "On Hold", "Cancelled"),
    IN p_new_notes TEXT
)
BEGIN
    UPDATE repairs 
    SET status = p_new_status, notes = p_new_notes 
    WHERE repair_id = p_repair_id;
END//

-- ========================================
-- REPAIR ITEM MANAGEMENT PROCEDURES
-- ========================================

-- Add Repair Item
DROP PROCEDURE IF EXISTS AddRepairItem//
CREATE PROCEDURE AddRepairItem (
    IN p_repair_id INT,
    IN p_item_id INT,
    IN p_quantity INT
)
BEGIN
    DECLARE item_price DECIMAL(10,2);
    
    -- Get item price
    SELECT price INTO item_price FROM items WHERE item_id = p_item_id;
    
    INSERT INTO repair_items (repair_id, item_id, repair_item_quantity, total_price)
    VALUES (p_repair_id, p_item_id, p_quantity, item_price * p_quantity);
END//

-- ========================================
-- CUSTOMER AND INSTALL PROCEDURES
-- ========================================

-- Add Customer + Install
DROP PROCEDURE IF EXISTS AddCustomerAndInstall//
CREATE PROCEDURE AddCustomerAndInstall (
    IN first_name VARCHAR(50),
    IN last_name VARCHAR(50),
    IN address VARCHAR(255),
    IN city VARCHAR(100),
    IN state VARCHAR(50),
    IN zip VARCHAR(20),
    IN phone VARCHAR(20),
    IN email VARCHAR(100),
    IN description TEXT,
    IN estimate DECIMAL(10,2),
    IN install_date DATE,
    IN notes TEXT
)
BEGIN
    INSERT INTO customers (first_name, last_name, address, city, state, zip, phone, email)
    VALUES (first_name, last_name, address, city, state, zip, phone, email);

    SET @cust_id = LAST_INSERT_ID();

    INSERT INTO installs (customer_id, description, estimate, install_date, notes)
    VALUES (@cust_id, description, estimate, install_date, notes);
    
    SELECT LAST_INSERT_ID() as install_id, @cust_id as customer_id;
END//

-- Add Install for Existing Customer
DROP PROCEDURE IF EXISTS AddInstallForCustomer//
CREATE PROCEDURE AddInstallForCustomer (
    IN customer_id INT,
    IN description TEXT,
    IN estimate DECIMAL(10,2),
    IN install_date DATE,
    IN notes TEXT
)
BEGIN
    INSERT INTO installs (customer_id, description, estimate, install_date, notes)
    VALUES (customer_id, description, estimate, install_date, notes);
    
    SELECT LAST_INSERT_ID() as install_id, customer_id;
END//

-- ========================================
-- INSTALL ITEM MANAGEMENT PROCEDURES
-- ========================================

-- Add Install Item  
DROP PROCEDURE IF EXISTS AddInstallItem//
CREATE PROCEDURE AddInstallItem (
    IN p_install_id INT,
    IN p_item_id INT,
    IN p_quantity INT
)
BEGIN
    DECLARE item_price DECIMAL(10,2);
    
    -- Get item price
    SELECT price INTO item_price FROM items WHERE item_id = p_item_id;
    
    INSERT INTO install_items (install_id, item_id, install_item_quantity, total_price)
    VALUES (p_install_id, p_item_id, p_quantity, item_price * p_quantity);
END//

-- Remove Install Item
DROP PROCEDURE IF EXISTS RemoveInstallItem//
CREATE PROCEDURE RemoveInstallItem (
    IN p_install_item_id INT
)
BEGIN
    DELETE FROM install_items WHERE install_item_id = p_install_item_id;
END//

-- Update Install Item Quantity
DROP PROCEDURE IF EXISTS UpdateInstallItem//
CREATE PROCEDURE UpdateInstallItem (
    IN p_install_item_id INT,
    IN p_new_quantity INT
)
BEGIN
    UPDATE install_items 
    SET install_item_quantity = p_new_quantity 
    WHERE install_item_id = p_install_item_id;
END//

DELIMITER ;
