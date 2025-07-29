USE iwoodslim;

DELIMITER //

-- Updated: Add Customer + Order (now includes order_total)
DROP PROCEDURE IF EXISTS AddCustomerAndOrder//
CREATE PROCEDURE AddCustomerAndOrder (
  IN first_name VARCHAR(50),
  IN last_name VARCHAR(50),
  IN address VARCHAR(255),
  IN city VARCHAR(100),
  IN state VARCHAR(50),
  IN zip VARCHAR(20),
  IN phone VARCHAR(20),
  IN email VARCHAR(100),
  IN order_date DATE,
  IN order_total DECIMAL(10,2)
)
BEGIN
  INSERT INTO customers (first_name, last_name, address, city, state, zip, phone, email)
  VALUES (first_name, last_name, address, city, state, zip, phone, email);

  SET @cust_id = LAST_INSERT_ID();

  INSERT INTO orders (customer_id, order_date, order_total)
  VALUES (@cust_id, order_date, order_total);
END//

-- Updated: Add Order for Existing Customer (now includes order_total)
DROP PROCEDURE IF EXISTS AddOrderForCustomer//
CREATE PROCEDURE AddOrderForCustomer (
  IN customer_id INT,
  IN order_date DATE,
  IN order_total DECIMAL(10,2)
)
BEGIN
  INSERT INTO orders (customer_id, order_date, order_total)
  VALUES (customer_id, order_date, order_total);
END//

DELIMITER ;
