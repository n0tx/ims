-- Schema and Seed Script for Inventory Management System
-- This script creates the database structure and populates it with sample data

-- Drop existing tables if they exist (for fresh starts)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS discount_rules CASCADE;

-- Create Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    product_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL,
    low_stock_threshold INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create Customers table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    customer_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    category TEXT NOT NULL DEFAULT 'regular',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create Suppliers table
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    supplier_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    address TEXT,
    contact TEXT,
    payment_terms TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create Discount Rules table
CREATE TABLE discount_rules (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    threshold INTEGER NOT NULL,
    percent DECIMAL(5, 2) NOT NULL,
    category_target TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create Transactions table with foreign key constraints
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    transaction_id TEXT NOT NULL UNIQUE,
    product_id TEXT NOT NULL REFERENCES products(product_id),
    quantity INTEGER NOT NULL,
    type TEXT NOT NULL,
    customer_id TEXT REFERENCES customers(customer_id),
    supplier_id TEXT REFERENCES suppliers(supplier_id),
    unit_price DECIMAL(10, 2) NOT NULL,
    discount_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Seed data for testing pagination and functionality

-- Insert suppliers (10 suppliers)
INSERT INTO suppliers (supplier_id, name, address, contact, payment_terms) VALUES
('SUP-001', 'TechSupply Inc.', '123 Tech Street, Silicon Valley, CA 94000', 'contact@techsupply.com', 'Net 30'),
('SUP-002', 'ElectroWorld', '456 Electric Ave, Houston, TX 77001', 'sales@electroworld.com', 'Net 15'),
('SUP-003', 'FurnitureHub', '789 Furniture Blvd, Chicago, IL 60601', 'orders@furniturehub.com', 'COD'),
('SUP-004', 'AccessoryPro', '321 Accessory Lane, New York, NY 10001', 'info@accessorypro.com', 'Net 45'),
('SUP-005', 'ClothingSource', '654 Fashion St, Los Angeles, CA 90001', 'wholesale@clothingsource.com', 'Net 30'),
('SUP-006', 'GadgetSupply', '987 Gadget Road, Austin, TX 78701', 'support@gadgetsupply.com', 'Net 15'),
('SUP-007', 'OfficeEquip', '147 Office Way, Seattle, WA 98101', 'sales@officeequip.com', 'Net 30'),
('SUP-008', 'SportGear Ltd', '258 Sports Ave, Denver, CO 80201', 'orders@sportgear.com', 'COD'),
('SUP-009', 'HomeDecor Co', '369 Home Lane, Miami, FL 33101', 'info@homedecoroute.com', 'Net 45'),
('SUP-010', 'BookSupply', '741 Literature St, Boston, MA 02101', 'books@booksupply.com', 'Net 30');

-- Insert customers (10 customers)
INSERT INTO customers (customer_id, name, email, phone, address, category) VALUES
('CUST-001', 'John Smith', 'john.smith@email.com', '555-0123', '123 Main St, City, State 12345', 'regular'),
('CUST-002', 'Sarah Johnson', 'sarah.johnson@email.com', '555-0456', '456 Oak Ave, City, State 12346', 'premium'),
('CUST-003', 'Mike Davis', 'mike.davis@email.com', '555-0789', '789 Pine Rd, City, State 12347', 'regular'),
('CUST-004', 'Emma Wilson', 'emma.wilson@email.com', '555-0101', '101 Elm St, City, State 12348', 'vip'),
('CUST-005', 'James Brown', 'james.brown@email.com', '555-0202', '202 Maple Ave, City, State 12349', 'regular'),
('CUST-006', 'Lisa Garcia', 'lisa.garcia@email.com', '555-0303', '303 Cedar Rd, City, State 12350', 'premium'),
('CUST-007', 'Robert Lee', 'robert.lee@email.com', '555-0404', '404 Birch Lane, City, State 12351', 'regular'),
('CUST-008', 'Maria Rodriguez', 'maria.rodriguez@email.com', '555-0505', '505 Spruce Way, City, State 12352', 'vip'),
('CUST-009', 'David Taylor', 'david.taylor@email.com', '555-0606', '606 Ash St, City, State 12353', 'regular'),
('CUST-010', 'Amanda White', 'amanda.white@email.com', '555-0707', '707 Willow Ave, City, State 12354', 'premium');

-- Insert products (20 products)
INSERT INTO products (product_id, name, price, stock, category, low_stock_threshold) VALUES
('PROD-001', 'Wireless Bluetooth Headphones', 99.99, 50, 'Electronics', 10),
('PROD-002', 'Ergonomic Office Chair', 249.99, 25, 'Furniture', 5),
('PROD-003', 'Stainless Steel Water Bottle', 24.99, 100, 'Accessories', 20),
('PROD-004', 'Organic Cotton T-Shirt', 19.99, 75, 'Clothing', 15),
('PROD-005', 'Smart Fitness Tracker', 129.99, 40, 'Electronics', 8),
('PROD-006', 'Wooden Desk Lamp', 79.99, 30, 'Furniture', 6),
('PROD-007', 'Leather Laptop Bag', 149.99, 35, 'Accessories', 10),
('PROD-008', 'Merino Wool Sweater', 89.99, 60, 'Clothing', 12),
('PROD-009', 'Wireless Charging Pad', 39.99, 80, 'Electronics', 15),
('PROD-010', 'Adjustable Standing Desk', 399.99, 20, 'Furniture', 3),
('PROD-011', 'Bamboo Phone Case', 29.99, 90, 'Accessories', 18),
('PROD-012', 'Denim Jeans', 69.99, 45, 'Clothing', 10),
('PROD-013', 'Bluetooth Speaker', 79.99, 55, 'Electronics', 12),
('PROD-014', 'Bookshelf', 199.99, 15, 'Furniture', 4),
('PROD-015', 'Canvas Backpack', 59.99, 70, 'Accessories', 14),
('PROD-016', 'Flannel Shirt', 49.99, 65, 'Clothing', 13),
('PROD-017', 'Tablet Stand', 34.99, 85, 'Electronics', 16),
('PROD-018', 'Coffee Table', 299.99, 12, 'Furniture', 3),
('PROD-019', 'Travel Mug', 19.99, 95, 'Accessories', 20),
('PROD-020', 'Hoodie', 39.99, 80, 'Clothing', 15);

-- Insert discount rules (4 discount rules)
INSERT INTO discount_rules (type, threshold, percent, category_target, is_active) VALUES
('quantity', 10, 5.00, NULL, TRUE),
('quantity', 20, 10.00, NULL, TRUE),
('customer_category', 1, 10.00, 'premium', TRUE),
('customer_category', 1, 15.00, 'vip', TRUE);

-- Insert transactions (50 transactions mix of purchases and sales)
INSERT INTO transactions (transaction_id, product_id, quantity, type, customer_id, supplier_id, unit_price, discount_rate, total_amount) VALUES
-- Sales transactions
('TXN-001', 'PROD-001', 2, 'sale', 'CUST-001', NULL, 99.99, 0.00, 199.98),
('TXN-002', 'PROD-002', 1, 'sale', 'CUST-002', NULL, 249.99, 10.00, 224.99),
('TXN-003', 'PROD-003', 5, 'sale', 'CUST-003', NULL, 24.99, 0.00, 124.95),
('TXN-004', 'PROD-004', 3, 'sale', 'CUST-001', NULL, 19.99, 0.00, 59.97),
('TXN-005', 'PROD-005', 1, 'sale', 'CUST-004', NULL, 129.99, 15.00, 110.49),
('TXN-006', 'PROD-006', 2, 'sale', 'CUST-005', NULL, 79.99, 0.00, 159.98),
('TXN-007', 'PROD-007', 1, 'sale', 'CUST-006', NULL, 149.99, 10.00, 134.99),
('TXN-008', 'PROD-008', 4, 'sale', 'CUST-007', NULL, 89.99, 0.00, 359.96),
('TXN-009', 'PROD-009', 3, 'sale', 'CUST-008', NULL, 39.99, 15.00, 101.97),
('TXN-010', 'PROD-010', 1, 'sale', 'CUST-009', NULL, 399.99, 0.00, 399.99),
('TXN-011', 'PROD-011', 6, 'sale', 'CUST-010', NULL, 29.99, 10.00, 161.95),
('TXN-012', 'PROD-012', 2, 'sale', 'CUST-001', NULL, 69.99, 0.00, 139.98),
('TXN-013', 'PROD-013', 1, 'sale', 'CUST-002', NULL, 79.99, 10.00, 71.99),
('TXN-014', 'PROD-014', 1, 'sale', 'CUST-003', NULL, 199.99, 0.00, 199.99),
('TXN-015', 'PROD-015', 2, 'sale', 'CUST-004', NULL, 59.99, 15.00, 101.98),
('TXN-016', 'PROD-016', 3, 'sale', 'CUST-005', NULL, 49.99, 0.00, 149.97),
('TXN-017', 'PROD-017', 4, 'sale', 'CUST-006', NULL, 34.99, 10.00, 125.96),
('TXN-018', 'PROD-018', 1, 'sale', 'CUST-007', NULL, 299.99, 0.00, 299.99),
('TXN-019', 'PROD-019', 5, 'sale', 'CUST-008', NULL, 19.99, 15.00, 84.96),
('TXN-020', 'PROD-020', 2, 'sale', 'CUST-009', NULL, 39.99, 0.00, 79.98),
('TXN-021', 'PROD-001', 1, 'sale', 'CUST-010', NULL, 99.99, 10.00, 89.99),
('TXN-022', 'PROD-003', 8, 'sale', 'CUST-001', NULL, 24.99, 0.00, 199.92),
('TXN-023', 'PROD-005', 2, 'sale', 'CUST-002', NULL, 129.99, 10.00, 233.98),
('TXN-024', 'PROD-007', 1, 'sale', 'CUST-003', NULL, 149.99, 0.00, 149.99),
('TXN-025', 'PROD-009', 6, 'sale', 'CUST-004', NULL, 39.99, 15.00, 203.95),
-- Purchase transactions
('TXN-026', 'PROD-001', 25, 'purchase', NULL, 'SUP-001', 75.00, 0.00, 1875.00),
('TXN-027', 'PROD-002', 15, 'purchase', NULL, 'SUP-003', 200.00, 0.00, 3000.00),
('TXN-028', 'PROD-003', 50, 'purchase', NULL, 'SUP-004', 18.00, 0.00, 900.00),
('TXN-029', 'PROD-004', 40, 'purchase', NULL, 'SUP-005', 15.00, 0.00, 600.00),
('TXN-030', 'PROD-005', 20, 'purchase', NULL, 'SUP-002', 100.00, 0.00, 2000.00),
('TXN-031', 'PROD-006', 18, 'purchase', NULL, 'SUP-003', 60.00, 0.00, 1080.00),
('TXN-032', 'PROD-007', 22, 'purchase', NULL, 'SUP-004', 120.00, 0.00, 2640.00),
('TXN-033', 'PROD-008', 30, 'purchase', NULL, 'SUP-005', 70.00, 0.00, 2100.00),
('TXN-034', 'PROD-009', 35, 'purchase', NULL, 'SUP-002', 30.00, 0.00, 1050.00),
('TXN-035', 'PROD-010', 10, 'purchase', NULL, 'SUP-003', 320.00, 0.00, 3200.00),
('TXN-036', 'PROD-011', 45, 'purchase', NULL, 'SUP-004', 22.00, 0.00, 990.00),
('TXN-037', 'PROD-012', 28, 'purchase', NULL, 'SUP-005', 55.00, 0.00, 1540.00),
('TXN-038', 'PROD-013', 32, 'purchase', NULL, 'SUP-002', 60.00, 0.00, 1920.00),
('TXN-039', 'PROD-014', 8, 'purchase', NULL, 'SUP-003', 160.00, 0.00, 1280.00),
('TXN-040', 'PROD-015', 38, 'purchase', NULL, 'SUP-004', 45.00, 0.00, 1710.00),
('TXN-041', 'PROD-016', 33, 'purchase', NULL, 'SUP-005', 38.00, 0.00, 1254.00),
('TXN-042', 'PROD-017', 42, 'purchase', NULL, 'SUP-002', 26.00, 0.00, 1092.00),
('TXN-043', 'PROD-018', 6, 'purchase', NULL, 'SUP-003', 240.00, 0.00, 1440.00),
('TXN-044', 'PROD-019', 48, 'purchase', NULL, 'SUP-004', 15.00, 0.00, 720.00),
('TXN-045', 'PROD-020', 40, 'purchase', NULL, 'SUP-005', 30.00, 0.00, 1200.00),
('TXN-046', 'PROD-001', 3, 'sale', 'CUST-001', NULL, 99.99, 0.00, 299.97),
('TXN-047', 'PROD-002', 1, 'sale', 'CUST-002', NULL, 249.99, 10.00, 224.99),
('TXN-048', 'PROD-003', 12, 'sale', 'CUST-003', NULL, 24.99, 10.00, 269.89),
('TXN-049', 'PROD-004', 25, 'sale', 'CUST-004', NULL, 19.99, 15.00, 424.79),
('TXN-050', 'PROD-005', 2, 'sale', 'CUST-005', NULL, 129.99, 0.00, 259.98);

-- Create indexes for better performance
CREATE INDEX idx_transactions_product_id ON transactions(product_id);
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_supplier_id ON transactions(supplier_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_customers_category ON customers(category);