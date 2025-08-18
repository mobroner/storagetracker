const { Client } = require('pg');
require('dotenv').config();

const taxonomyData = [
  {
    category: "Food & Beverage",
    icon: "🥫",
    subcategories: [
      { name: "Pantry Staples", tags: ["dry goods", "shelf-stable", "bulk"] },
      { name: "Snacks & Sweets", tags: ["snack", "sweet", "kid-friendly"] },
      { name: "Frozen Foods", tags: ["frozen", "quick meal"] },
      { name: "Beverages", tags: ["drink", "caffeinated", "shelf-stable"] },
      { name: "Breakfast Items", tags: ["morning", "sweet", "staple"] },
    ],
  },
  {
    category: "Household Supplies",
    icon: "🧽",
    subcategories: [
      { name: "Cleaning Products", tags: ["cleaning", "chemical", "spray"] },
      { name: "Laundry Supplies", tags: ["laundry", "fabric", "liquid"] },
      { name: "Paper Goods", tags: ["disposable", "paper", "bulk"] },
      { name: "Trash & Storage", tags: ["storage", "disposable", "kitchen"] },
      { name: "Miscellaneous", tags: ["utility", "hardware", "seasonal"] },
    ],
  },
  {
    category: "Hygiene & Personal Care",
    icon: "🧼",
    subcategories: [
      { name: "Oral Care", tags: ["hygiene", "dental", "daily use"] },
      { name: "Skin Care", tags: ["skincare", "sensitive", "daily"] },
      { name: "Bath & Body", tags: ["hygiene", "shower", "scented"] },
      { name: "Hair Care & Styling", tags: ["hair", "styling", "grooming"] },
      { name: "Feminine Hygiene", tags: ["feminine", "hygiene", "monthly"] },
      { name: "General Hygiene", tags: ["hygiene", "daily", "antibacterial"] },
      { name: "Shaving & Grooming", tags: ["grooming", "hygiene", "tools"] },
      { name: "Fragrance & Scents", tags: ["scent", "personal", "luxury"] },
      { name: "Baby & Sensitive Care", tags: ["baby", "sensitive", "gentle"] },
    ],
  },
];

const populateTaxonomyForUser = async (userId, client) => {
  const allTags = new Set();
  taxonomyData.forEach(cat => cat.subcategories.forEach(sub => sub.tags.forEach(tag => allTags.add(tag))));

  for (const tag of allTags) {
    const existingTag = await client.query('SELECT id FROM tags WHERE name = $1 AND user_id = $2', [tag, userId]);
    if (existingTag.rows.length === 0) {
      await client.query('INSERT INTO tags (name, user_id) VALUES ($1, $2)', [tag, userId]);
    }
  }
  console.log(`Tags populated for user ${userId}`);

  for (const categoryData of taxonomyData) {
    let categoryResult = await client.query('SELECT id FROM categories WHERE name = $1 AND user_id = $2', [categoryData.category, userId]);
    let categoryId;
    if (categoryResult.rows.length === 0) {
      categoryResult = await client.query(
        'INSERT INTO categories (name, icon, user_id) VALUES ($1, $2, $3) RETURNING id',
        [categoryData.category, categoryData.icon, userId]
      );
    }
    categoryId = categoryResult.rows[0].id;

    for (const subcategoryData of categoryData.subcategories) {
      const existingSubcategory = await client.query('SELECT id FROM subcategories WHERE name = $1 AND category_id = $2 AND user_id = $3', [subcategoryData.name, categoryId, userId]);
      if (existingSubcategory.rows.length === 0) {
        await client.query(
          'INSERT INTO subcategories (name, category_id, user_id) VALUES ($1, $2, $3)',
          [subcategoryData.name, categoryId, userId]
        );
      }
    }
  }
  console.log(`Categories and subcategories populated for user ${userId}`);
};

const populateForAllUsers = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    const usersResult = await client.query('SELECT id FROM users');
    const userIds = usersResult.rows.map(row => row.id);

    for (const userId of userIds) {
      await populateTaxonomyForUser(userId, client);
    }

    console.log('Taxonomy population completed for all users.');
  } catch (err) {
    console.error('Error populating taxonomy for all users:', err);
  } finally {
    await client.end();
  }
};

// If the script is run directly, populate for all users.
if (require.main === module) {
  populateForAllUsers();
}

module.exports = { populateTaxonomyForUser };
