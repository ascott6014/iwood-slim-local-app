-- ========================================
-- iWood Slim Database - View Creation
-- ========================================

USE iwoodslim;

-- ========================================
-- INSTALL SUMMARY VIEW
-- ========================================

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
    ins.subtotal,
    COALESCE(SUM(ii.total_price), 0) AS install_items_total
FROM
    installs ins
JOIN customers c ON ins.customer_id = c.customer_id
LEFT JOIN install_items ii ON ins.install_id = ii.install_id
GROUP BY ins.install_id;

-- ========================================
-- REPAIR SUMMARY VIEW
-- ========================================

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
    r.subtotal,
    r.status,
    r.notes,
    r.drop_off_date,
    r.pickup_date,
    COALESCE(SUM(ri.total_price), 0) AS repair_items_total
FROM
    repairs r
JOIN customers c ON r.customer_id = c.customer_id
LEFT JOIN repair_items ri ON r.repair_id = ri.repair_id
GROUP BY r.repair_id;

-- ========================================
-- ORDER SUMMARY VIEW
-- ========================================

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
    o.subtotal,
    COALESCE(SUM(oi.total_price), 0) AS order_items_total
FROM
    orders o
JOIN customers c ON o.customer_id = c.customer_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY o.order_id;

-- ========================================
-- CUSTOMER WITH RECENT VISIT VIEW
-- ========================================

CREATE OR REPLACE VIEW customer_with_recent_visit AS
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
