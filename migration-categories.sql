-- Create Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(255),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create Subcategories Table
CREATE TABLE subcategories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create Tags Table
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Alter Items Table
ALTER TABLE items
ADD COLUMN category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
ADD COLUMN subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL,
ADD COLUMN tag_ids INTEGER[];

-- Create Indexes
CREATE INDEX idx_items_category_id ON items(category_id);
CREATE INDEX idx_items_subcategory_id ON items(subcategory_id);
