-- Migration to add CASCADE DELETE to customer foreign key constraints
-- This will allow deleting customers even if they have related records

USE iwoodslim;

-- Drop existing foreign key constraints
ALTER TABLE customer_visits DROP FOREIGN KEY customer_visits_fk_customers;
ALTER TABLE installs DROP FOREIGN KEY installs_fk_customers;
ALTER TABLE repairs DROP FOREIGN KEY repairs_fk_customers;
ALTER TABLE orders DROP FOREIGN KEY orders_fk_customers;

-- Recreate foreign key constraints with CASCADE DELETE
ALTER TABLE customer_visits 
ADD CONSTRAINT customer_visits_fk_customers 
FOREIGN KEY (customer_id) REFERENCES customers (customer_id) ON DELETE CASCADE;

ALTER TABLE installs 
ADD CONSTRAINT installs_fk_customers 
FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE;

ALTER TABLE repairs 
ADD CONSTRAINT repairs_fk_customers 
FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE;

ALTER TABLE orders 
ADD CONSTRAINT orders_fk_customers 
FOREIGN KEY (customer_id) REFERENCES customers (customer_id) ON DELETE CASCADE;

-- Verify the constraints are in place
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    DELETE_RULE
FROM information_schema.REFERENTIAL_CONSTRAINTS 
WHERE CONSTRAINT_SCHEMA = 'iwoodslim' 
AND REFERENCED_TABLE_NAME = 'customers';
