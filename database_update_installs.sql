USE iwoodslim;

-- Add final_price column to installs table
ALTER TABLE installs 
ADD COLUMN final_price DECIMAL(10,2) DEFAULT 0.00;

-- Create trigger to update final_price when install_items change
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
  SET final_price = ROUND((install_estimate + items_total) * (1 + tax_rate / 100), 2)
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
  SET final_price = ROUND((install_estimate + items_total) * (1 + tax_rate / 100), 2)
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
  SET final_price = ROUND((install_estimate + items_total) * (1 + tax_rate / 100), 2)
  WHERE install_id = OLD.install_id;
END$$

-- Trigger to update final_price when estimate changes
CREATE TRIGGER trg_update_install_final_price_estimate
AFTER UPDATE ON installs
FOR EACH ROW
BEGIN
  DECLARE items_total DECIMAL(10,2);
  DECLARE tax_rate DECIMAL(10,2);
  
  -- Only update if estimate changed
  IF OLD.estimate != NEW.estimate THEN
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
    SET final_price = ROUND((NEW.estimate + items_total) * (1 + tax_rate / 100), 2)
    WHERE install_id = NEW.install_id;
  END IF;
END$$

DELIMITER ;

-- Update existing installs to calculate their final_price
UPDATE installs i
SET final_price = (
  SELECT ROUND((i.estimate + COALESCE(SUM(ii.total_price), 0)) * 
               (1 + (SELECT rate FROM tax_log WHERE is_active = TRUE LIMIT 1) / 100), 2)
  FROM install_items ii
  WHERE ii.install_id = i.install_id
  GROUP BY ii.install_id
)
WHERE EXISTS (
  SELECT 1 FROM install_items ii WHERE ii.install_id = i.install_id
);

-- For installs with no items, just calculate based on estimate
UPDATE installs i
SET final_price = ROUND(i.estimate * (1 + (SELECT rate FROM tax_log WHERE is_active = TRUE LIMIT 1) / 100), 2)
WHERE NOT EXISTS (
  SELECT 1 FROM install_items ii WHERE ii.install_id = i.install_id
);
