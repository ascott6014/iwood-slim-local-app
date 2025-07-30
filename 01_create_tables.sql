-- ========================================
-- iWood Slim Database - Table Creation
-- ========================================

DROP DATABASE IF EXISTS iwoodslim;
CREATE DATABASE iwoodslim;
USE iwoodslim;

-- Customer info
CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(2),
    zip VARCHAR(10),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255)
);

CREATE TABLE customer_visits (
    customer_visits_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    visit_type ENUM('Order', 'Repair', 'Install', 'New Customer') NOT NULL,
    visit_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT customer_visits_fk_customers FOREIGN KEY (customer_id) REFERENCES customers (customer_id)
);

CREATE TABLE items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    item_name VARCHAR(255) NOT NULL,
    item_color VARCHAR(255) NOT NULL,
    item_model VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    markup_rate DECIMAL(10,2) NOT NULL,
    price DECIMAL(10,2) GENERATED ALWAYS AS (cost * (1 + markup_rate / 100)) STORED,
    quantity INT NOT NULL,
    sell_item BOOLEAN NOT NULL,
    repair_item BOOLEAN NOT NULL,
    install_item BOOLEAN NOT NULL
);

CREATE TABLE item_price_log (
    item_price_log_id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    cost DECIMAL(10,2),
    markup_rate DECIMAL(10,2),
    price DECIMAL(10,2),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN,
    CONSTRAINT item_price_log_fk_items FOREIGN KEY (item_id) REFERENCES items(item_id)
);

CREATE TABLE installs (
    install_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    description TEXT,
    estimate DECIMAL(10,2) NOT NULL,
    install_date DATE,
    notes TEXT,
    subtotal DECIMAL(10,2) DEFAULT 0.00,
    CONSTRAINT installs_fk_customers FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE repairs (
    repair_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    items_brought TEXT NOT NULL,
    problem VARCHAR(255) NOT NULL,
    solution VARCHAR(255),
    estimate DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) DEFAULT 0.00,
    status ENUM("Not Started", "In Progress", "Completed", "On Hold", "Cancelled"),
    notes TEXT,
    drop_off_date DATETIME NOT NULL,
    pickup_date DATETIME,
    CONSTRAINT repairs_fk_customers FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    order_date DATE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT orders_fk_customers FOREIGN KEY (customer_id) REFERENCES customers (customer_id)
);

CREATE TABLE install_items (
    install_item_id INT PRIMARY KEY AUTO_INCREMENT,
    install_id INT NOT NULL,
    item_id INT NOT NULL,
    install_item_quantity INT NOT NULL,
    total_price DECIMAL(10,2),
    CONSTRAINT install_items_fk_installs FOREIGN KEY (install_id) REFERENCES installs (install_id),
    CONSTRAINT install_items_fk_items FOREIGN KEY (item_id) REFERENCES items (item_id)
);

CREATE TABLE repair_items (
    repair_item_id INT PRIMARY KEY AUTO_INCREMENT,
    repair_id INT NOT NULL,
    item_id INT NOT NULL,
    repair_item_quantity INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    CONSTRAINT repair_items_fk_repairs FOREIGN KEY (repair_id) REFERENCES repairs (repair_id),
    CONSTRAINT repair_items_fk_items FOREIGN KEY (item_id) REFERENCES items (item_id)
);

CREATE TABLE order_items (
    order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    order_item_quantity INT NOT NULL,
    total_price DECIMAL(10,2),
    CONSTRAINT order_items_fk_orders FOREIGN KEY (order_id) REFERENCES orders(order_id),
    CONSTRAINT order_items_fk_items FOREIGN KEY (item_id) REFERENCES items(item_id)
);
