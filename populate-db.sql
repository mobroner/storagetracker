-- Drop tables in reverse order of creation to avoid foreign key constraints
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS storage_area_groups;
DROP TABLE IF EXISTS item_groups;
DROP TABLE IF EXISTS storage_areas;
DROP TABLE IF EXISTS subcategories;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS users;

-- Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Storage Areas Table
CREATE TABLE storage_areas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create Item Groups Table
CREATE TABLE item_groups (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create Storage Area Groups Junction Table
-- This table links item groups to specific storage areas
CREATE TABLE storage_area_groups (
    storage_area_id INTEGER NOT NULL REFERENCES storage_areas(id) ON DELETE CASCADE,
    group_id INTEGER NOT NULL REFERENCES item_groups(id) ON DELETE CASCADE,
    PRIMARY KEY (storage_area_id, group_id)
);

-- Create Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(255),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create Subcategories Table
CREATE TABLE subcategories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create Tags Table
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create Items Table
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    date_added TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATE,
    barcode VARCHAR(255),
    group_id INTEGER REFERENCES item_groups(id) ON DELETE SET NULL,
    original_group_id INTEGER REFERENCES item_groups(id) ON DELETE SET NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    storage_area_id INTEGER NOT NULL REFERENCES storage_areas(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL,
    tag_ids INTEGER[]
);

-- Create Indexes
CREATE INDEX idx_items_category_id ON items(category_id);
CREATE INDEX idx_items_subcategory_id ON items(subcategory_id);

-- Insert Sample Data
-- Replace with your actual user data.
-- The password 'password123' is hashed.
INSERT INTO users (name, email, password_hash) VALUES
('Test User', 'test@example.com', '$2a$10$FB/BO4Sg2vDq2So5.I.gI.Hre4V.v5S5JzY.sN4Aso2l3c9g.eC.e');

-- Get the ID of the user we just created
DO $$
DECLARE
    test_user_id INTEGER;
BEGIN
    SELECT id INTO test_user_id FROM users WHERE email = 'test@example.com';

    -- Insert Sample Storage Areas
    INSERT INTO storage_areas (name, user_id) VALUES
    ('Pantry', test_user_id),
    ('Fridge', test_user_id),
    ('Freezer', test_user_id);

    -- Insert Sample Item Groups
    INSERT INTO item_groups (group_name, user_id) VALUES
    ('Canned Goods', test_user_id),
    ('Dairy', test_user_id),
    ('Frozen Vegetables', test_user_id),
    ('Not in Storage', test_user_id);

    -- Link Groups to Storage Areas
    -- Pantry contains Canned Goods
    INSERT INTO storage_area_groups (storage_area_id, group_id) VALUES
    ((SELECT id FROM storage_areas WHERE name = 'Pantry' AND user_id = test_user_id), (SELECT id FROM item_groups WHERE group_name = 'Canned Goods' AND user_id = test_user_id));

    -- Fridge contains Dairy
    INSERT INTO storage_area_groups (storage_area_id, group_id) VALUES
    ((SELECT id FROM storage_areas WHERE name = 'Fridge' AND user_id = test_user_id), (SELECT id FROM item_groups WHERE group_name = 'Dairy' AND user_id = test_user_id));

    -- Freezer contains Frozen Vegetables
    INSERT INTO storage_area_groups (storage_area_id, group_id) VALUES
    ((SELECT id FROM storage_areas WHERE name = 'Freezer' AND user_id = test_user_id), (SELECT id FROM item_groups WHERE group_name = 'Frozen Vegetables' AND user_id = test_user_id));

    -- Insert Sample Categories
    INSERT INTO categories (name, icon, user_id) VALUES
    ('Food & Beverage', '🥫', test_user_id),
    ('Household Supplies', '🧽', test_user_id),
    ('Hygiene & Personal Care', '🧼', test_user_id);

    -- Insert Sample Subcategories
    INSERT INTO subcategories (name, category_id, user_id) VALUES
    ('Pantry Staples', (SELECT id FROM categories WHERE name = 'Food & Beverage' AND user_id = test_user_id), test_user_id),
    ('Cleaning Products', (SELECT id FROM categories WHERE name = 'Household Supplies' AND user_id = test_user_id), test_user_id),
    ('Oral Care', (SELECT id FROM categories WHERE name = 'Hygiene & Personal Care' AND user_id = test_user_id), test_user_id);

    -- Insert Sample Tags
    INSERT INTO tags (name, user_id) VALUES
    ('dry goods', test_user_id),
    ('cleaning', test_user_id),
    ('hygiene', test_user_id);

    -- Insert Sample Items
    INSERT INTO items (item_name, quantity, storage_area_id, group_id, user_id, expiry_date, category_id, subcategory_id, tag_ids) VALUES
    ('Canned Tomatoes', 5, (SELECT id FROM storage_areas WHERE name = 'Pantry' AND user_id = test_user_id), (SELECT id FROM item_groups WHERE group_name = 'Canned Goods' AND user_id = test_user_id), test_user_id, '2025-12-31', (SELECT id FROM categories WHERE name = 'Food & Beverage' AND user_id = test_user_id), (SELECT id FROM subcategories WHERE name = 'Pantry Staples' AND user_id = test_user_id), ARRAY[(SELECT id FROM tags WHERE name = 'dry goods' AND user_id = test_user_id)]),
    ('Milk', 1, (SELECT id FROM storage_areas WHERE name = 'Fridge' AND user_id = test_user_id), (SELECT id FROM item_groups WHERE group_name = 'Dairy' AND user_id = test_user_id), test_user_id, '2024-08-20', (SELECT id FROM categories WHERE name = 'Food & Beverage' AND user_id = test_user_id), (SELECT id FROM subcategories WHERE name = 'Pantry Staples' AND user_id = test_user_id), NULL),
    ('Frozen Peas', 2, (SELECT id FROM storage_areas WHERE name = 'Freezer' AND user_id = test_user_id), (SELECT id FROM item_groups WHERE group_name = 'Frozen Vegetables' AND user_id = test_user_id), test_user_id, '2026-01-15', (SELECT id FROM categories WHERE name = 'Food & Beverage' AND user_id = test_user_id), (SELECT id FROM subcategories WHERE name = 'Pantry Staples' AND user_id = test_user_id), NULL);
END $$;

-- Verify insertion
SELECT u.name as user_name, sa.name as storage_area, ig.group_name, i.item_name, i.quantity
FROM items i
JOIN users u ON i.user_id = u.id
JOIN storage_areas sa ON i.storage_area_id = sa.id
JOIN item_groups ig ON i.group_id = ig.id;
