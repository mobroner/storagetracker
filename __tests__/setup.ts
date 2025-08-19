import { db } from '../app/lib/db';

// Function to reset the test database to a known state
export async function resetTestDatabase() {
  await db.query('BEGIN');
  try {
    // Clear all tables
    await db.query('DELETE FROM tags WHERE user_id IN (SELECT id FROM users WHERE email LIKE \'%test%\')');
    await db.query('DELETE FROM subcategories WHERE user_id IN (SELECT id FROM users WHERE email LIKE \'%test%\')');
    await db.query('DELETE FROM categories WHERE user_id IN (SELECT id FROM users WHERE email LIKE \'%test%\')');
    await db.query('DELETE FROM items WHERE user_id IN (SELECT id FROM users WHERE email LIKE \'%test%\')');
    await db.query('DELETE FROM storage_area_locations WHERE storage_area_id IN (SELECT id FROM storage_areas WHERE user_id IN (SELECT id FROM users WHERE email LIKE \'%test%\'))');
    await db.query('DELETE FROM item_locations WHERE user_id IN (SELECT id FROM users WHERE email LIKE \'%test%\')');
    await db.query('DELETE FROM storage_areas WHERE user_id IN (SELECT id FROM users WHERE email LIKE \'%test%\'))');
    await db.query('DELETE FROM users WHERE email LIKE \'%test%\'');
    await db.query('COMMIT');
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
}

// Create a test user and return their credentials
export async function createTestUser() {
  const email = `test-${Date.now()}@example.com`;
  const password = 'testpassword123';
  const name = 'Test User';

  const result = await db.query(
    'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id',
    [email, password, name]
  );

  return {
    id: result.rows[0].id,
    email,
    password,
    name
  };
}

// Helper function to create test data
export async function createTestData(userId: string) {
  // Create a storage area
  const storageArea = await db.query(
    'INSERT INTO storage_areas (name, user_id) VALUES ($1, $2) RETURNING id',
    ['Test Storage', userId]
  );

  // Create a location
  const location = await db.query(
    'INSERT INTO item_locations (location_name, user_id) VALUES ($1, $2) RETURNING id',
    ['Test Location', userId]
  );

  // Link storage area and location
  await db.query(
    'INSERT INTO storage_area_locations (storage_area_id, location_id) VALUES ($1, $2)',
    [storageArea.rows[0].id, location.rows[0].id]
  );

  return {
    storageAreaId: storageArea.rows[0].id,
    locationId: location.rows[0].id
  };
}
