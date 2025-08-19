import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resetTestDatabase, createTestUser, createTestData } from '../setup';
import { db } from '../../app/lib/db';
import { TestUser, TestData } from '../types';

describe('Category and Item Integration', () => {
  let testUser: TestUser;
  let testData: TestData;

  beforeEach(async () => {
    await resetTestDatabase();
    testUser = await createTestUser();
    testData = await createTestData(testUser.id);
  });

  afterEach(async () => {
    await resetTestDatabase();
  });

  it('should correctly associate items with categories after taxonomy population', async () => {
    // First populate the taxonomy
    const req = new Request('http://localhost/api/populate-taxonomy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: testUser.id })
    });
    
    await fetch(req);

    // Get a category to use
    const categoryResult = await db.query(
      'SELECT id FROM categories WHERE user_id = $1 LIMIT 1',
      [testUser.id]
    );
    const categoryId = categoryResult.rows[0].id;

    // Create an item with the category
    const itemData = {
      itemName: 'Test Item',
      quantity: 1,
      dateAdded: new Date().toISOString(),
      storageAreaId: testData.storageAreaId,
      locationId: testData.locationId,
      categoryId: categoryId
    };

    await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });

    // Verify the item appears correctly in various views
    const itemsResponse = await fetch('/api/items');
    const items = await itemsResponse.json();

    // Check item exists and has correct category
    const itemFound = Object.values(items).some((storageArea: any) =>
      Object.values(storageArea).some((locationItems: any) =>
        locationItems.some((item: any) => 
          item.category_id === String(categoryId) && 
          item.item_name === itemData.itemName
        )
      )
    );

    expect(itemFound).toBe(true);
  });

  it('should maintain data integrity when populating taxonomy multiple times', async () => {
    // First population
    await fetch('/api/populate-taxonomy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: testUser.id })
    });

    // Get initial counts
    const initialCounts = await Promise.all([
      db.query('SELECT COUNT(*) FROM categories WHERE user_id = $1', [testUser.id]),
      db.query('SELECT COUNT(*) FROM subcategories WHERE user_id = $1', [testUser.id])
    ]);

    // Second population
    await fetch('/api/populate-taxonomy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: testUser.id })
    });

    // Get final counts
    const finalCounts = await Promise.all([
      db.query('SELECT COUNT(*) FROM categories WHERE user_id = $1', [testUser.id]),
      db.query('SELECT COUNT(*) FROM subcategories WHERE user_id = $1', [testUser.id])
    ]);

    // Verify counts haven't changed
    expect(initialCounts[0].rows[0].count).toBe(finalCounts[0].rows[0].count);
    expect(initialCounts[1].rows[0].count).toBe(finalCounts[1].rows[0].count);
  });
});
