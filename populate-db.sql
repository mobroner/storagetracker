-- Drop tables in reverse order of creation to avoid foreign key constraints
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS storage_area_groups;
DROP TABLE IF EXISTS item_groups;
DROP TABLE IF EXISTS storage_areas;
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
    storage_area_id INTEGER NOT NULL REFERENCES storage_areas(id) ON DELETE CASCADE
);

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

    -- Insert Sample Items
    INSERT INTO items (item_name, quantity, storage_area_id, group_id, user_id, expiry_date) VALUES
    ('Canned Tomatoes', 5, (SELECT id FROM storage_areas WHERE name = 'Pantry' AND user_id = test_user_id), (SELECT id FROM item_groups WHERE group_name = 'Canned Goods' AND user_id = test_user_id), test_user_id, '2025-12-31'),
    ('Milk', 1, (SELECT id FROM storage_areas WHERE name = 'Fridge' AND user_id = test_user_id), (SELECT id FROM item_groups WHERE group_name = 'Dairy' AND user_id = test_user_id), test_user_id, '2024-08-20'),
    ('Frozen Peas', 2, (SELECT id FROM storage_areas WHERE name = 'Freezer' AND user_id = test_user_id), (SELECT id FROM item_groups WHERE group_name = 'Frozen Vegetables' AND user_id = test_user_id), test_user_id, '2026-01-15');
END $$;

-- Verify insertion
SELECT u.name as user_name, sa.name as storage_area, ig.group_name, i.item_name, i.quantity
FROM items i
JOIN users u ON i.user_id = u.id
JOIN storage_areas sa ON i.storage_area_id = sa.id
JOIN item_groups ig ON i.group_id = ig.id;
