-- ========================================
-- iWood Slim Database - Trigger Creation
-- ========================================

USE iwoodslim;

-- ========================================
-- CUSTOMER VISIT TRIGGERS
-- ========================================

DELIMITER $$  
CREATE TRIGGER trg_new_customer_visit
AFTER INSERT ON customers
FOR EACH ROW
BEGIN
    INSERT INTO customer_visits (customer_id, visit_type, visit_date)
    VALUES (NEW.customer_id, 'New Customer', NOW());
END$$  
DELIMITER ;

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

-- ========================================
-- ITEM PRICE LOG TRIGGERS
-- ========================================

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

-- ========================================
-- REPAIR ITEM TOTAL PRICE TRIGGERS
-- ========================================

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

-- ========================================
-- INSTALL ITEM TOTAL PRICE TRIGGERS
-- ========================================

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

-- ========================================
-- ORDER ITEM TOTAL PRICE TRIGGERS
-- ========================================

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

-- ========================================
-- INSTALL FINAL PRICE UPDATE TRIGGERS
-- ========================================

DELIMITER $$
CREATE TRIGGER trg_update_install_subtotal_insert
AFTER INSERT ON install_items
FOR EACH ROW
BEGIN
    DECLARE install_estimate DECIMAL(10,2);
    DECLARE items_total DECIMAL(10,2);
    
    -- Get install estimate
    SELECT estimate INTO install_estimate
    FROM installs
    WHERE install_id = NEW.install_id;
    
    -- Get current items total for this install
    SELECT COALESCE(SUM(total_price), 0) INTO items_total
    FROM install_items
    WHERE install_id = NEW.install_id;
    
    -- Update subtotal (estimate + items total)
    UPDATE installs
    SET subtotal = ROUND(install_estimate + items_total, 2)
    WHERE install_id = NEW.install_id;
END$$

CREATE TRIGGER trg_update_install_subtotal_update
AFTER UPDATE ON install_items
FOR EACH ROW
BEGIN
    DECLARE install_estimate DECIMAL(10,2);
    DECLARE items_total DECIMAL(10,2);
    
    -- Get install estimate
    SELECT estimate INTO install_estimate
    FROM installs
    WHERE install_id = NEW.install_id;
    
    -- Get current items total for this install
    SELECT COALESCE(SUM(total_price), 0) INTO items_total
    FROM install_items
    WHERE install_id = NEW.install_id;
    
    -- Update subtotal (estimate + items total)
    UPDATE installs
    SET subtotal = ROUND(install_estimate + items_total, 2)
    WHERE install_id = NEW.install_id;
END$$

CREATE TRIGGER trg_update_install_subtotal_delete
AFTER DELETE ON install_items
FOR EACH ROW
BEGIN
    DECLARE install_estimate DECIMAL(10,2);
    DECLARE items_total DECIMAL(10,2);
    
    -- Get install estimate
    SELECT estimate INTO install_estimate
    FROM installs
    WHERE install_id = OLD.install_id;
    
    -- Get current items total for this install
    SELECT COALESCE(SUM(total_price), 0) INTO items_total
    FROM install_items
    WHERE install_id = OLD.install_id;
    
    -- Update subtotal (estimate + items total)
    UPDATE installs
    SET subtotal = ROUND(install_estimate + items_total, 2)
    WHERE install_id = OLD.install_id;
END$$

-- Trigger to update subtotal when estimate changes
CREATE TRIGGER trg_update_install_subtotal_estimate
AFTER UPDATE ON installs
FOR EACH ROW
BEGIN
    DECLARE items_total DECIMAL(10,2);
    
    -- Only update if estimate changed and we're not already updating subtotal
    IF OLD.estimate != NEW.estimate AND OLD.subtotal = NEW.subtotal THEN
        -- Get current items total for this install
        SELECT COALESCE(SUM(total_price), 0) INTO items_total
        FROM install_items
        WHERE install_id = NEW.install_id;
        
        -- Update subtotal (estimate + items total)
        UPDATE installs
        SET subtotal = ROUND(NEW.estimate + items_total, 2)
        WHERE install_id = NEW.install_id;
    END IF;
END$$

DELIMITER ;

-- ========================================
-- ORDER SUBTOTAL TRIGGERS
-- ========================================

DELIMITER $$
CREATE TRIGGER trg_update_order_subtotal_insert
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    DECLARE items_total DECIMAL(10,2);
    
    -- Get current items total for this order
    SELECT COALESCE(SUM(total_price), 0) INTO items_total
    FROM order_items
    WHERE order_id = NEW.order_id;
    
    -- Update subtotal (sum of all items)
    UPDATE orders
    SET subtotal = ROUND(items_total, 2)
    WHERE order_id = NEW.order_id;
END$$

CREATE TRIGGER trg_update_order_subtotal_update
AFTER UPDATE ON order_items
FOR EACH ROW
BEGIN
    DECLARE items_total DECIMAL(10,2);
    
    -- Get current items total for this order
    SELECT COALESCE(SUM(total_price), 0) INTO items_total
    FROM order_items
    WHERE order_id = NEW.order_id;
    
    -- Update subtotal (sum of all items)
    UPDATE orders
    SET subtotal = ROUND(items_total, 2)
    WHERE order_id = NEW.order_id;
END$$

CREATE TRIGGER trg_update_order_subtotal_delete
AFTER DELETE ON order_items
FOR EACH ROW
BEGIN
    DECLARE items_total DECIMAL(10,2);
    
    -- Get current items total for this order
    SELECT COALESCE(SUM(total_price), 0) INTO items_total
    FROM order_items
    WHERE order_id = OLD.order_id;
    
    -- Update subtotal (sum of all items)
    UPDATE orders
    SET subtotal = ROUND(items_total, 2)
    WHERE order_id = OLD.order_id;
END$$

-- ========================================
-- REPAIR SUBTOTAL TRIGGERS
-- ========================================

CREATE TRIGGER trg_update_repair_subtotal_insert
AFTER INSERT ON repair_items
FOR EACH ROW
BEGIN
    DECLARE repair_estimate DECIMAL(10,2);
    DECLARE items_total DECIMAL(10,2);
    
    -- Get repair estimate
    SELECT estimate INTO repair_estimate
    FROM repairs
    WHERE repair_id = NEW.repair_id;
    
    -- Get current items total for this repair
    SELECT COALESCE(SUM(total_price), 0) INTO items_total
    FROM repair_items
    WHERE repair_id = NEW.repair_id;
    
    -- Update subtotal (estimate + items total)
    UPDATE repairs
    SET subtotal = ROUND(repair_estimate + items_total, 2)
    WHERE repair_id = NEW.repair_id;
END$$

CREATE TRIGGER trg_update_repair_subtotal_update
AFTER UPDATE ON repair_items
FOR EACH ROW
BEGIN
    DECLARE repair_estimate DECIMAL(10,2);
    DECLARE items_total DECIMAL(10,2);
    
    -- Get repair estimate
    SELECT estimate INTO repair_estimate
    FROM repairs
    WHERE repair_id = NEW.repair_id;
    
    -- Get current items total for this repair
    SELECT COALESCE(SUM(total_price), 0) INTO items_total
    FROM repair_items
    WHERE repair_id = NEW.repair_id;
    
    -- Update subtotal (estimate + items total)
    UPDATE repairs
    SET subtotal = ROUND(repair_estimate + items_total, 2)
    WHERE repair_id = NEW.repair_id;
END$$

CREATE TRIGGER trg_update_repair_subtotal_delete
AFTER DELETE ON repair_items
FOR EACH ROW
BEGIN
    DECLARE repair_estimate DECIMAL(10,2);
    DECLARE items_total DECIMAL(10,2);
    
    -- Get repair estimate
    SELECT estimate INTO repair_estimate
    FROM repairs
    WHERE repair_id = OLD.repair_id;
    
    -- Get current items total for this repair
    SELECT COALESCE(SUM(total_price), 0) INTO items_total
    FROM repair_items
    WHERE repair_id = OLD.repair_id;
    
    -- Update subtotal (estimate + items total)
    UPDATE repairs
    SET subtotal = ROUND(repair_estimate + items_total, 2)
    WHERE repair_id = OLD.repair_id;
END$$

-- Trigger to update subtotal when estimate changes
CREATE TRIGGER trg_update_repair_subtotal_estimate
AFTER UPDATE ON repairs
FOR EACH ROW
BEGIN
    DECLARE items_total DECIMAL(10,2);
    
    -- Only update if estimate changed and we're not already updating subtotal
    IF OLD.estimate != NEW.estimate AND OLD.subtotal = NEW.subtotal THEN
        -- Get current items total for this repair
        SELECT COALESCE(SUM(total_price), 0) INTO items_total
        FROM repair_items
        WHERE repair_id = NEW.repair_id;
        
        -- Update subtotal (estimate + items total)
        UPDATE repairs
        SET subtotal = ROUND(NEW.estimate + items_total, 2)
        WHERE repair_id = NEW.repair_id;
    END IF;
END$$

DELIMITER ;
