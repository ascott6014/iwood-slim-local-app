-- Create a view that shows all customers with their most recent visit
CREATE VIEW customer_with_recent_visit AS
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    c.phone,
    c.email,
    c.address,
    c.city,
    c.state,
    c.zip,
    c.created_at as customer_created_at,
    cv.visit_date as last_visit_date,
    cv.visit_type as last_visit_type,
    cv.description as last_visit_description,
    cv.status as last_visit_status
FROM customers c
LEFT JOIN (
    SELECT 
        customer_id,
        visit_date,
        visit_type,
        description,
        status,
        ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY visit_date DESC) as rn
    FROM customer_visits
) cv ON c.customer_id = cv.customer_id AND cv.rn = 1;
