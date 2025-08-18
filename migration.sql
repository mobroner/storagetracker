-- Rename the item_groups table to item_locations
ALTER TABLE item_groups RENAME TO item_locations;

-- Rename the group_name column to location_name in the item_locations table
ALTER TABLE item_locations RENAME COLUMN group_name TO location_name;

-- Rename the storage_area_groups table to storage_area_locations
ALTER TABLE storage_area_groups RENAME TO storage_area_locations;

-- Rename the group_id column to location_id in the storage_area_locations table
ALTER TABLE storage_area_locations RENAME COLUMN group_id TO location_id;

-- Rename the group_id column to location_id in the items table
ALTER TABLE items RENAME COLUMN group_id TO location_id;

-- Rename the original_group_id column to original_location_id in the items table
ALTER TABLE items RENAME COLUMN original_group_id TO original_location_id;
