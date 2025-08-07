USE iwoodslim;

DELIMITER //

-- Updated: Add Customer + Order (auto order_date, calculated order_total)
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

  INSERT INTO orders (customer_id, order_date, order_total)
  VALUES (@cust_id, CURDATE(), 0.00);
  
  SELECT LAST_INSERT_ID() as order_id, @cust_id as customer_id;
END//

-- Updated: Add Order for Existing Customer (auto order_date, calculated order_total)
DROP PROCEDURE IF EXISTS AddOrderForCustomer//
CREATE PROCEDURE AddOrderForCustomer (
  IN customer_id INT
)
BEGIN
  INSERT INTO orders (customer_id, order_date, order_total)
  VALUES (customer_id, CURDATE(), 0.00);
  
  SELECT LAST_INSERT_ID() as order_id, customer_id;
END//

-- Add Order Item
DROP PROCEDURE IF EXISTS AddOrderItem//
CREATE PROCEDURE AddOrderItem (
  IN order_id INT,
  IN item_id INT,
  IN quantity INT
)
BEGIN
  DECLARE item_price DECIMAL(10,2);
  
  -- Get item price
  SELECT price INTO item_price FROM items WHERE item_id = item_id;
  
  INSERT INTO order_items (order_id, item_id, order_item_quantity, total_price)
  VALUES (order_id, item_id, quantity, item_price * quantity);
END//

-- Remove Order Item
DROP PROCEDURE IF EXISTS RemoveOrderItem//
CREATE PROCEDURE RemoveOrderItem (
  IN order_item_id INT
)
BEGIN
  DELETE FROM order_items WHERE order_item_id = order_item_id;
END//

-- Update Order Item Quantity
DROP PROCEDURE IF EXISTS UpdateOrderItem//
CREATE PROCEDURE UpdateOrderItem (
  IN order_item_id INT,
  IN new_quantity INT
)
BEGIN
  UPDATE order_items 
  SET order_item_quantity = new_quantity 
  WHERE order_item_id = order_item_id;
END//

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

-- Update Repair Pickup Date
DROP PROCEDURE IF EXISTS UpdateRepairPickupDate//
CREATE PROCEDURE UpdateRepairPickupDate (
  IN repair_id INT
)
BEGIN
  UPDATE repairs 
  SET pickup_date = NOW() 
  WHERE repair_id = repair_id;
END//

-- Update Repair Status
DROP PROCEDURE IF EXISTS UpdateRepairStatus//
CREATE PROCEDURE UpdateRepairStatus (
  IN repair_id INT,
  IN new_status ENUM("Not Started", "In Progress", "Completed", "On Hold", "Cancelled"),
  IN new_notes TEXT
)
BEGIN
  UPDATE repairs 
  SET status = new_status, notes = new_notes 
  WHERE repair_id = repair_id;
END//

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

-- Add Repair Item
DROP PROCEDURE IF EXISTS AddRepairItem//
CREATE PROCEDURE AddRepairItem (
  IN repair_id INT,
  IN item_id INT,
  IN quantity INT
)
BEGIN
  DECLARE item_price DECIMAL(10,2);
  
  -- Get item price
  SELECT price INTO item_price FROM items WHERE item_id = item_id;
  
  INSERT INTO repair_items (repair_id, item_id, repair_item_quantity, total_price)
  VALUES (repair_id, item_id, quantity, item_price * quantity);
END//

-- Add Install Item  
DROP PROCEDURE IF EXISTS AddInstallItem//
CREATE PROCEDURE AddInstallItem (
  IN install_id INT,
  IN item_id INT,
  IN quantity INT
)
BEGIN
  DECLARE item_price DECIMAL(10,2);
  
  -- Get item price
  SELECT price INTO item_price FROM items WHERE item_id = item_id;
  
  INSERT INTO install_items (install_id, item_id, install_item_quantity, total_price)
  VALUES (install_id, item_id, quantity, item_price * quantity);
END//

-- Remove Install Item
DROP PROCEDURE IF EXISTS RemoveInstallItem//
CREATE PROCEDURE RemoveInstallItem (
  IN install_item_id INT
)
BEGIN
  DELETE FROM install_items WHERE install_item_id = install_item_id;
END//

-- Update Install Item Quantity
DROP PROCEDURE IF EXISTS UpdateInstallItem//
CREATE PROCEDURE UpdateInstallItem (
  IN install_item_id INT,
  IN new_quantity INT
)
BEGIN
  UPDATE install_items 
  SET install_item_quantity = new_quantity 
  WHERE install_item_id = install_item_id;
END//

-- Update Install Information
DROP PROCEDURE IF EXISTS UpdateInstall//
CREATE PROCEDURE UpdateInstall (
  IN p_install_id INT,
  IN p_install_date DATE,
  IN p_description TEXT,
  IN p_estimate DECIMAL(10,2),
  IN p_notes TEXT
)
BEGIN
  DECLARE items_total DECIMAL(10,2);
  
  -- Get current items total for this install
  SELECT COALESCE(SUM(total_price), 0) INTO items_total
  FROM install_items
  WHERE install_id = p_install_id;
  
  -- Update the install information and subtotal
  UPDATE installs 
  SET 
    install_date = COALESCE(p_install_date, install_date),
    description = COALESCE(p_description, description),
    estimate = COALESCE(p_estimate, estimate),
    notes = COALESCE(p_notes, notes),
    subtotal = ROUND(COALESCE(p_estimate, estimate) + items_total, 2)
  WHERE install_id = p_install_id;
END//

DELIMITER ;
