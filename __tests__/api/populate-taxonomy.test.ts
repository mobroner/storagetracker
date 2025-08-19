import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resetTestDatabase, createTestUser, createTestData } from '../setup';
import { POST } from '../../app/api/populate-taxonomy/route';

describe('Populate Taxonomy API', () => {
  let testUser;
  
  beforeEach(async () => {
    await resetTestDatabase();
    testUser = await createTestUser();
  });

  afterEach(async () => {
    await resetTestDatabase();
  });

  it('should populate taxonomy for a new user', async () => {
    // Create the request
    const req = new Request('http://localhost/api/populate-taxonomy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: testUser.id })
    });

    // Call the API
    const response = await POST(req);
    expect(response.status).toBe(200);

    // Verify the categories were created
    const categories = await db.query(
      'SELECT * FROM categories WHERE user_id = $1',
      [testUser.id]
    );
    expect(categories.rows.length).toBeGreaterThan(0);

    // Verify subcategories were created
    const subcategories = await db.query(
      'SELECT * FROM subcategories WHERE user_id = $1',
      [testUser.id]
    );
    expect(subcategories.rows.length).toBeGreaterThan(0);
  });

  it('should not duplicate taxonomy for existing user', async () => {
    // First population
    const req1 = new Request('http://localhost/api/populate-taxonomy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: testUser.id })
    });
    await POST(req1);

    // Get initial counts
    const initialCategories = await db.query(
      'SELECT COUNT(*) FROM categories WHERE user_id = $1',
      [testUser.id]
    );
    const initialCount = parseInt(initialCategories.rows[0].count);

    // Second population
    const req2 = new Request('http://localhost/api/populate-taxonomy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: testUser.id })
    });
    await POST(req2);

    // Verify counts haven't changed
    const finalCategories = await db.query(
      'SELECT COUNT(*) FROM categories WHERE user_id = $1',
      [testUser.id]
    );
    expect(parseInt(finalCategories.rows[0].count)).toBe(initialCount);
  });
});
