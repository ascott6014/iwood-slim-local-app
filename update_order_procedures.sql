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

DELIMITER ;
