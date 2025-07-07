-- Inventory Management System Database Schema
-- MySQL 8.0 Compatible

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS inventory_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE inventory_db;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS products;

-- Products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    productId VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    category VARCHAR(100) NOT NULL,
    lowStockThreshold INT NOT NULL DEFAULT 10,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_category (category),
    INDEX idx_stock (stock),
    INDEX idx_product_id (productId),
    INDEX idx_low_stock (stock, lowStockThreshold)
);

-- Customers table
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customerId VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_customer_id (customerId),
    INDEX idx_email (email)
);

-- Transactions table
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transactionId VARCHAR(50) NOT NULL UNIQUE,
    productId VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    type ENUM('purchase', 'sale') NOT NULL,
    customerId VARCHAR(50),
    unitPrice DECIMAL(10, 2) NOT NULL,
    totalAmount DECIMAL(10, 2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (productId) REFERENCES products(productId) ON DELETE CASCADE,
    FOREIGN KEY (customerId) REFERENCES customers(customerId) ON DELETE SET NULL,
    
    -- Indexes for performance
    INDEX idx_product_id (productId),
    INDEX idx_customer_id (customerId),
    INDEX idx_transaction_type (type),
    INDEX idx_created_at (createdAt),
    INDEX idx_transaction_id (transactionId)
);

-- Insert seed data for testing and demo

-- Sample products
INSERT INTO products (productId, name, price, stock, category, lowStockThreshold) VALUES
('MBP16-001', 'MacBook Pro 16"', 2499.99, 25, 'Electronics', 5),
('IP15P-128', 'iPhone 15 Pro', 999.99, 45, 'Electronics', 10),
('SONY-WH5', 'Sony WH-1000XM5', 299.99, 78, 'Audio', 15),
('GCP-001', 'Gaming Chair Pro', 349.99, 32, 'Furniture', 8),
('OCB-500G', 'Organic Coffee Beans', 24.99, 156, 'Food & Beverage', 50),
('DELL-MON', 'Dell 27" Monitor', 449.99, 18, 'Electronics', 10),
('MECH-KB1', 'Mechanical Keyboard', 159.99, 67, 'Electronics', 20),
('DESK-LAMP', 'LED Desk Lamp', 89.99, 41, 'Furniture', 15),
('WATER-BOT', 'Stainless Steel Water Bottle', 29.99, 89, 'Lifestyle', 25),
('YOGA-MAT', 'Premium Yoga Mat', 79.99, 23, 'Fitness', 12);

-- Sample customers
INSERT INTO customers (customerId, name, email, phone) VALUES
('CUST-001', 'John Smith', 'john.smith@email.com', '+1-555-0101'),
('CUST-002', 'Sarah Johnson', 'sarah.j@email.com', '+1-555-0102'),
('CUST-003', 'Mike Chen', 'mike.chen@email.com', '+1-555-0103'),
('CUST-004', 'Emily Davis', 'emily.davis@email.com', '+1-555-0104'),
('CUST-005', 'Alex Rodriguez', 'alex.r@email.com', '+1-555-0105');

-- Sample transactions (sales and purchases)
INSERT INTO transactions (transactionId, productId, quantity, type, customerId, unitPrice, totalAmount) VALUES
-- Sales transactions
('TXN-001', 'MBP16-001', 3, 'sale', 'CUST-001', 2499.99, 7499.97),
('TXN-002', 'IP15P-128', 5, 'sale', 'CUST-002', 999.99, 4999.95),
('TXN-003', 'SONY-WH5', 8, 'sale', 'CUST-003', 299.99, 2399.92),
('TXN-004', 'GCP-001', 2, 'sale', 'CUST-001', 349.99, 699.98),
('TXN-005', 'OCB-500G', 12, 'sale', 'CUST-004', 24.99, 299.88),
('TXN-006', 'DELL-MON', 4, 'sale', 'CUST-005', 449.99, 1799.96),
('TXN-007', 'MECH-KB1', 6, 'sale', 'CUST-002', 159.99, 959.94),
('TXN-008', 'WATER-BOT', 15, 'sale', 'CUST-003', 29.99, 449.85),

-- Purchase transactions (restocking)
('TXN-009', 'MBP16-001', 10, 'purchase', NULL, 2499.99, 24999.90),
('TXN-010', 'IP15P-128', 20, 'purchase', NULL, 999.99, 19999.80),
('TXN-011', 'SONY-WH5', 25, 'purchase', NULL, 299.99, 7499.75),
('TXN-012', 'OCB-500G', 100, 'purchase', NULL, 24.99, 2499.00),
('TXN-013', 'YOGA-MAT', 15, 'purchase', NULL, 79.99, 1199.85);

-- Update stock based on transactions (this would normally be handled by the application)
UPDATE products SET stock = stock - 3 WHERE productId = 'MBP16-001';
UPDATE products SET stock = stock - 5 WHERE productId = 'IP15P-128';
UPDATE products SET stock = stock - 8 WHERE productId = 'SONY-WH5';
UPDATE products SET stock = stock - 2 WHERE productId = 'GCP-001';
UPDATE products SET stock = stock - 12 WHERE productId = 'OCB-500G';
UPDATE products SET stock = stock - 4 WHERE productId = 'DELL-MON';
UPDATE products SET stock = stock - 6 WHERE productId = 'MECH-KB1';
UPDATE products SET stock = stock - 15 WHERE productId = 'WATER-BOT';

-- Create a few low stock scenarios for testing alerts
UPDATE products SET stock = 3 WHERE productId = 'GCP-001';
UPDATE products SET stock = 7 WHERE productId = 'DELL-MON';
UPDATE products SET stock = 4 WHERE productId = 'MBP16-001';

-- Create user for application
CREATE USER IF NOT EXISTS 'appuser'@'%' IDENTIFIED BY 'app123';
GRANT ALL PRIVILEGES ON inventory_db.* TO 'appuser'@'%';
FLUSH PRIVILEGES;

-- Verification queries
SELECT 'Products' as Table_Name, COUNT(*) as Record_Count FROM products
UNION ALL
SELECT 'Customers', COUNT(*) FROM customers
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transactions;

-- Show low stock products
SELECT 
    productId,
    name,
    stock,
    lowStockThreshold,
    category
FROM products 
WHERE stock <= lowStockThreshold
ORDER BY stock ASC;
