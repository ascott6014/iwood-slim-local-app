-- ========================================
-- iWood Slim Database - Master Setup Script
-- ========================================
-- This script executes all database setup files in the correct order
-- 
-- USAGE:
-- Run this script in MySQL to set up the complete iWood Slim database
-- Or run the individual files in order:
-- 1. 01_create_tables.sql
-- 2. 02_create_triggers.sql  
-- 3. 03_create_procedures.sql
-- 4. 04_create_views.sql
-- ========================================

-- Execute table creation
SOURCE 01_create_tables.sql;

-- Execute trigger creation
SOURCE 02_create_triggers.sql;

-- Execute stored procedure creation
SOURCE 03_create_procedures.sql;

-- Execute view creation
SOURCE 04_create_views.sql;

-- ========================================
-- SETUP COMPLETE
-- ========================================

SELECT 'iWood Slim Database Setup Complete!' AS Status;

-- Display summary of created objects
SELECT 
    'Tables' AS Object_Type,
    COUNT(*) AS Count
FROM information_schema.tables 
WHERE table_schema = 'iwoodslim'
    AND table_type = 'BASE TABLE'

UNION ALL

SELECT 
    'Views' AS Object_Type,
    COUNT(*) AS Count
FROM information_schema.views 
WHERE table_schema = 'iwoodslim'

UNION ALL

SELECT 
    'Triggers' AS Object_Type,
    COUNT(*) AS Count
FROM information_schema.triggers 
WHERE trigger_schema = 'iwoodslim'

UNION ALL

SELECT 
    'Procedures' AS Object_Type,
    COUNT(*) AS Count
FROM information_schema.routines 
WHERE routine_schema = 'iwoodslim'
    AND routine_type = 'PROCEDURE';
