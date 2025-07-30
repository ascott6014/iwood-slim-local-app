DROP DATABASE IF EXISTS iwoodslim;
CREATE DATABASE iwoodslim;
USE iwoodslim;

-- Customer info
CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(2),
    zip VARCHAR(10),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255)
);

CREATE TABLE customer_visits (
    customer_visits_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    visit_type ENUM('Order', 'Repair', 'Install', 'New Customer') NOT NULL,
    visit_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT customer_visits_fk_customers FOREIGN KEY (customer_id) REFERENCES customers (customer_id)
);

CREATE TABLE items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    item_name VARCHAR(255) NOT NULL,
    item_color VARCHAR(255) NOT NULL,
    item_model VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    markup_rate DECIMAL(10,2) NOT NULL,
    price DECIMAL(10,2) GENERATED ALWAYS AS (cost * (1 + markup_rate / 100)) STORED,
    quantity INT NOT NULL,
    sell_item BOOLEAN NOT NULL,
    repair_item BOOLEAN NOT NULL,
    install_item BOOLEAN NOT NULL
);

CREATE TABLE item_price_log (
    item_price_log_id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    cost DECIMAL(10,2),
    markup_rate DECIMAL(10,2),
    price DECIMAL(10,2),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN,
    CONSTRAINT item_price_log_fk_items FOREIGN KEY (item_id) REFERENCES items(item_id)
);

CREATE TABLE installs (
    install_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    description TEXT,
    estimate DECIMAL(10,2) NOT NULL,
    install_date DATE,
    notes TEXT,
    final_price DECIMAL(10,2) DEFAULT 0.00,
    CONSTRAINT installs_fk_customers FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE repairs (
    repair_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    items_brought TEXT NOT NULL,
    problem VARCHAR(255) NOT NULL,
    solution VARCHAR(255),
    estimate DECIMAL(10,2) NOT NULL,
    status ENUM("Not Started", "In Progress", "Completed", "On Hold", "Cancelled"),
    notes TEXT,
    drop_off_date DATETIME NOT NULL,
    pickup_date DATETIME,
    CONSTRAINT repairs_fk_customers FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    order_date DATE NOT NULL,
    order_total DECIMAL(10,2) NOT NULL,
    CONSTRAINT orders_fk_customers FOREIGN KEY (customer_id) REFERENCES customers (customer_id)
);

CREATE TABLE install_items (
    install_item_id INT PRIMARY KEY AUTO_INCREMENT,
    install_id INT NOT NULL,
    item_id INT NOT NULL,
    install_item_quantity INT NOT NULL,
    total_price DECIMAL(10,2),
    CONSTRAINT install_items_fk_installs FOREIGN KEY (install_id) REFERENCES installs (install_id),
    CONSTRAINT install_items_fk_items FOREIGN KEY (item_id) REFERENCES items (item_id)
);

CREATE TABLE repair_items (
    repair_item_id INT PRIMARY KEY AUTO_INCREMENT,
    repair_id INT NOT NULL,
    item_id INT NOT NULL,
    repair_item_quantity INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    CONSTRAINT repair_items_fk_repairs FOREIGN KEY (repair_id) REFERENCES repairs (repair_id),
    CONSTRAINT repair_items_fk_items FOREIGN KEY (item_id) REFERENCES items (item_id)
);

CREATE TABLE order_items (
    order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    order_item_quantity INT NOT NULL,
    total_price DECIMAL(10,2),
    CONSTRAINT order_items_fk_orders FOREIGN KEY (order_id) REFERENCES orders(order_id),
    CONSTRAINT order_items_fk_items FOREIGN KEY (item_id) REFERENCES items(item_id)
);

CREATE TABLE tax_rate (
    tax_rate_id INT PRIMARY KEY AUTO_INCREMENT,
    tax_rate DECIMAL(10,2)
);

CREATE TABLE tax_log (
    tax_log_id INT PRIMARY KEY AUTO_INCREMENT,
    tax_rate_id INT NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME,
    is_active BOOLEAN,
    CONSTRAINT tax_log_fk_tax_rate FOREIGN KEY (tax_rate_id) REFERENCES tax_rate (tax_rate_id)
);

-- ========================================
-- TRIGGERS
-- ========================================

-- Customer visit triggers
DELIMITER $$  
CREATE TRIGGER trg_order_visit
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    INSERT INTO customer_visits (customer_id, visit_type, visit_date)
    VALUES (NEW.customer_id, 'Order', NOW());
END$$  
DELIMITER ;

DELIMITER $$  
CREATE TRIGGER trg_install_visit
AFTER INSERT ON installs
FOR EACH ROW
BEGIN
    INSERT INTO customer_visits (customer_id, visit_type, visit_date)
    VALUES (NEW.customer_id, 'Install', NOW());
END$$  
DELIMITER ;

DELIMITER $$  
CREATE TRIGGER trg_repair_visit
AFTER INSERT ON repairs
FOR EACH ROW
BEGIN
    INSERT INTO customer_visits (customer_id, visit_type, visit_date)
    VALUES (NEW.customer_id, 'Repair', NOW());
END$$  
DELIMITER ;

-- Item price log triggers
DELIMITER $$
CREATE TRIGGER trg_item_insert
AFTER INSERT ON items
FOR EACH ROW
INSERT INTO item_price_log (item_id, cost, markup_rate, price, start_date, is_active)
VALUES (NEW.item_id, NEW.cost, NEW.markup_rate, NEW.price, CURDATE(), TRUE);
DELIMITER ;

DELIMITER $$
CREATE TRIGGER trg_item_cost_markup_update
BEFORE UPDATE ON items
FOR EACH ROW
BEGIN
    IF OLD.cost != NEW.cost OR OLD.markup_rate != NEW.markup_rate THEN
        -- End current active price log
        UPDATE item_price_log
        SET end_date = CURDATE(), is_active = FALSE
        WHERE item_id = OLD.item_id AND is_active = TRUE;

        -- Insert new price log entry
        INSERT INTO item_price_log (item_id, cost, markup_rate, price, start_date, is_active)
        VALUES (NEW.item_id, NEW.cost, NEW.markup_rate, NEW.price, CURDATE(), TRUE);
    END IF;
END$$
DELIMITER ;

-- Repair item total price triggers
DELIMITER $$  
CREATE TRIGGER trg_repair_items_total_price
BEFORE INSERT ON repair_items
FOR EACH ROW
BEGIN
    DECLARE item_price DECIMAL(10,2);

    SELECT price INTO item_price
    FROM items
    WHERE item_id = NEW.item_id;

    SET NEW.total_price = item_price * NEW.repair_item_quantity;
END$$  
DELIMITER ;

DELIMITER $$  
CREATE TRIGGER trg_repair_items_total_price_update
BEFORE UPDATE ON repair_items
FOR EACH ROW
BEGIN
    DECLARE item_price DECIMAL(10,2);

    SELECT price INTO item_price
    FROM items
    WHERE item_id = NEW.item_id;

    SET NEW.total_price = item_price * NEW.repair_item_quantity;
END$$  
DELIMITER ;

-- Install item total price triggers
DELIMITER $$  
CREATE TRIGGER trg_install_items_total_price
BEFORE INSERT ON install_items
FOR EACH ROW
BEGIN
    DECLARE item_price DECIMAL(10,2);

    SELECT price INTO item_price
    FROM items
    WHERE item_id = NEW.item_id;

    SET NEW.total_price = item_price * NEW.install_item_quantity;
END$$  
DELIMITER ;

DELIMITER $$  
CREATE TRIGGER trg_install_items_total_price_update
BEFORE UPDATE ON install_items
FOR EACH ROW
BEGIN
    DECLARE item_price DECIMAL(10,2);

    SELECT price INTO item_price
    FROM items
    WHERE item_id = NEW.item_id;

    SET NEW.total_price = item_price * NEW.install_item_quantity;
END$$  
DELIMITER ;

-- Order item total price triggers
DELIMITER $$  
CREATE TRIGGER trg_order_items_total_price
BEFORE INSERT ON order_items
FOR EACH ROW
BEGIN
    DECLARE item_price DECIMAL(10,2);

    SELECT price INTO item_price
    FROM items
    WHERE item_id = NEW.item_id;

    SET NEW.total_price = item_price * NEW.order_item_quantity;
END$$  
DELIMITER ;

DELIMITER $$  
CREATE TRIGGER trg_order_items_total_price_update
BEFORE UPDATE ON order_items
FOR EACH ROW
BEGIN
    DECLARE item_price DECIMAL(10,2);

    SELECT price INTO item_price
    FROM items
    WHERE item_id = NEW.item_id;

    SET NEW.total_price = item_price * NEW.order_item_quantity;
END$$  
DELIMITER ;

-- Install final_price update triggers
DELIMITER $$
CREATE TRIGGER trg_update_install_final_price_insert
AFTER INSERT ON install_items
FOR EACH ROW
BEGIN
    DECLARE install_estimate DECIMAL(10,2);
    DECLARE items_total DECIMAL(10,2);
    DECLARE tax_rate DECIMAL(10,2);
    
    -- Get install estimate
    SELECT estimate INTO install_estimate
    FROM installs
    WHERE install_id = NEW.install_id;
    
    -- Get current items total for this install
    SELECT COALESCE(SUM(total_price), 0) INTO items_total
    FROM install_items
    WHERE install_id = NEW.install_id;
    
    -- Get current tax rate
    SELECT rate INTO tax_rate
    FROM tax_log
    WHERE is_active = TRUE
    LIMIT 1;
    
    -- Update final_price (estimate + items total + tax)
    UPDATE installs
    SET final_price = ROUND((install_estimate + items_total) * (1 + COALESCE(tax_rate, 0) / 100), 2)
    WHERE install_id = NEW.install_id;
END$$

CREATE TRIGGER trg_update_install_final_price_update
AFTER UPDATE ON install_items
FOR EACH ROW
BEGIN
    DECLARE install_estimate DECIMAL(10,2);
    DECLARE items_total DECIMAL(10,2);
    DECLARE tax_rate DECIMAL(10,2);
    
    -- Get install estimate
    SELECT estimate INTO install_estimate
    FROM installs
    WHERE install_id = NEW.install_id;
    
    -- Get current items total for this install
    SELECT COALESCE(SUM(total_price), 0) INTO items_total
    FROM install_items
    WHERE install_id = NEW.install_id;
    
    -- Get current tax rate
    SELECT rate INTO tax_rate
    FROM tax_log
    WHERE is_active = TRUE
    LIMIT 1;
    
    -- Update final_price (estimate + items total + tax)
    UPDATE installs
    SET final_price = ROUND((install_estimate + items_total) * (1 + COALESCE(tax_rate, 0) / 100), 2)
    WHERE install_id = NEW.install_id;
END$$

CREATE TRIGGER trg_update_install_final_price_delete
AFTER DELETE ON install_items
FOR EACH ROW
BEGIN
    DECLARE install_estimate DECIMAL(10,2);
    DECLARE items_total DECIMAL(10,2);
    DECLARE tax_rate DECIMAL(10,2);
    
    -- Get install estimate
    SELECT estimate INTO install_estimate
    FROM installs
    WHERE install_id = OLD.install_id;
    
    -- Get current items total for this install
    SELECT COALESCE(SUM(total_price), 0) INTO items_total
    FROM install_items
    WHERE install_id = OLD.install_id;
    
    -- Get current tax rate
    SELECT rate INTO tax_rate
    FROM tax_log
    WHERE is_active = TRUE
    LIMIT 1;
    
    -- Update final_price (estimate + items total + tax)
    UPDATE installs
    SET final_price = ROUND((install_estimate + items_total) * (1 + COALESCE(tax_rate, 0) / 100), 2)
    WHERE install_id = OLD.install_id;
END$$

-- Trigger to update final_price when estimate changes
CREATE TRIGGER trg_update_install_final_price_estimate
AFTER UPDATE ON installs
FOR EACH ROW
BEGIN
    DECLARE items_total DECIMAL(10,2);
    DECLARE tax_rate DECIMAL(10,2);
    
    -- Only update if estimate changed and we're not already updating final_price
    IF OLD.estimate != NEW.estimate AND OLD.final_price = NEW.final_price THEN
        -- Get current items total for this install
        SELECT COALESCE(SUM(total_price), 0) INTO items_total
        FROM install_items
        WHERE install_id = NEW.install_id;
        
        -- Get current tax rate
        SELECT rate INTO tax_rate
        FROM tax_log
        WHERE is_active = TRUE
        LIMIT 1;
        
        -- Update final_price (estimate + items total + tax)
        UPDATE installs
        SET final_price = ROUND((NEW.estimate + items_total) * (1 + COALESCE(tax_rate, 0) / 100), 2)
        WHERE install_id = NEW.install_id;
    END IF;
END$$

DELIMITER ;

-- Tax log triggers
DELIMITER //
CREATE TRIGGER trg_insert_tax_log
AFTER INSERT ON tax_rate
FOR EACH ROW
BEGIN
    INSERT INTO tax_log (tax_rate_id, rate, start_date, is_active)
    VALUES (NEW.tax_rate_id, NEW.tax_rate, NOW(), TRUE);
END;
//
DELIMITER ;

DELIMITER //
CREATE TRIGGER trg_tax_rate_change_log
AFTER UPDATE ON tax_rate
FOR EACH ROW
BEGIN
    -- Only act if the tax_rate value changed
    IF OLD.tax_rate <> NEW.tax_rate THEN
        -- Mark previous active logs for this tax_rate_id as inactive
        UPDATE tax_log
        SET is_active = FALSE, end_date = NOW()
        WHERE tax_rate_id = NEW.tax_rate_id AND is_active = TRUE;

        -- Insert new log entry with updated rate
        INSERT INTO tax_log (tax_rate_id, rate, start_date, is_active)
        VALUES (NEW.tax_rate_id, NEW.tax_rate, NOW(), TRUE);
    END IF;
END;
//
DELIMITER ;

-- ========================================
-- STORED PROCEDURES
-- ========================================

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

DELIMITER ;

-- ========================================
-- VIEWS
-- ========================================

-- vw_install_summary
CREATE OR REPLACE VIEW vw_install_summary AS
SELECT
    c.customer_id,
    c.first_name,
    c.last_name,
    c.address,
    c.city,
    c.state,
    c.zip,
    c.phone,
    c.email,
    ins.install_id,
    ins.description,
    ins.estimate,
    ins.install_date,
    ins.notes,
    ins.final_price,
    COALESCE(SUM(ii.total_price), 0) AS install_items_total,
    ins.estimate + COALESCE(SUM(ii.total_price), 0) AS subtotal,
    ROUND((ins.estimate + COALESCE(SUM(ii.total_price), 0)) * 
          (SELECT rate FROM tax_log WHERE is_active = TRUE LIMIT 1) / 100, 2) AS tax_amount
FROM
    installs ins
JOIN customers c ON ins.customer_id = c.customer_id
LEFT JOIN install_items ii ON ins.install_id = ii.install_id
GROUP BY ins.install_id;

-- vw_repair_summary
CREATE OR REPLACE VIEW vw_repair_summary AS
SELECT
    c.customer_id,
    c.first_name,
    c.last_name,
    c.address,
    c.city,
    c.state,
    c.zip,
    c.phone,
    c.email,
    r.repair_id,
    r.items_brought,
    r.problem,
    r.solution,
    r.estimate,
    r.status,
    r.notes,
    r.drop_off_date,
    r.pickup_date,
    COALESCE(SUM(ri.total_price), 0) AS repair_items_total,
    r.estimate + COALESCE(SUM(ri.total_price), 0) AS subtotal,
    ROUND((r.estimate + COALESCE(SUM(ri.total_price), 0)) *
          (SELECT rate FROM tax_log WHERE is_active = TRUE LIMIT 1) / 100, 2) AS tax_amount,
    ROUND((r.estimate + COALESCE(SUM(ri.total_price), 0)) *
          (1 + (SELECT rate FROM tax_log WHERE is_active = TRUE LIMIT 1) / 100), 2) AS final_price
FROM
    repairs r
JOIN customers c ON r.customer_id = c.customer_id
LEFT JOIN repair_items ri ON r.repair_id = ri.repair_id
GROUP BY r.repair_id;

-- vw_order_summary
CREATE OR REPLACE VIEW vw_order_summary AS
SELECT
    c.customer_id,
    c.first_name,
    c.last_name,
    c.address,
    c.city,
    c.state,
    c.zip,
    c.phone,
    c.email,
    o.order_id,
    o.order_date,
    COALESCE(SUM(oi.total_price), 0) AS order_items_total,
    ROUND(COALESCE(SUM(oi.total_price), 0) * 
          (SELECT rate FROM tax_log WHERE is_active = TRUE LIMIT 1) / 100, 2) AS tax_amount,
    ROUND(COALESCE(SUM(oi.total_price), 0) *
          (1 + (SELECT rate FROM tax_log WHERE is_active = TRUE LIMIT 1) / 100), 2) AS final_price
FROM
    orders o
JOIN customers c ON o.customer_id = c.customer_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY o.order_id;

-- ========================================
-- INITIAL DATA (Optional - add a default tax rate)
-- ========================================

-- Add a default tax rate (you can modify this value as needed)
INSERT INTO tax_rate (tax_rate) VALUES (8.50); -- 8.5% default tax rate
