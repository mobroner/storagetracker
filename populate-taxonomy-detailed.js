const { Client } = require('pg');
require('dotenv').config();

const taxonomyData = {
  "Pantry Staples": ["Grains", "Canned goods", "Baking", "Oils & vinegars", "Condiments", "Spices & herbs"],
  "Snacks & Sweets": ["Chips and crackers", "Granola bars", "Cookies", "Candy", "Nuts and dried fruit"],
  "Frozen Foods": ["Frozen vegetables", "Frozen fruits", "Ready meals", "Desserts", "Meat", "Seafood"],
  "Beverages": ["Coffee", "Tea", "Juice", "Soda", "Bottled water", "Alcoholic drinks", "Seltzers"],
  "Breakfast Items": ["Cereal", "Pancake mix", "Syrup and honey", "Nut butters and jams"],
  "Cleaning Products": ["All-purpose cleaners", "Disinfectants", "Glass cleaner", "Floor cleaner", "Sponges and scrubbers"],
  "Laundry Supplies": ["Detergent", "Fabric softener", "Stain remover", "Dryer sheets"],
  "Paper Goods": ["Toilet paper", "Paper towels", "Tissues", "Napkins"],
  "Trash & Storage": ["Trash bags", "Recycling bags", "Ziplock bags", "Foil and plastic wrap"],
  "Miscellaneous": ["Batteries", "Light bulbs", "Air fresheners", "Pest control"],
  "Oral Care": ["Toothpaste", "Toothbrushes", "Mouthwash", "Floss"],
  "Skin Care": ["Cleanser", "Moisturizer", "Sunscreen", "Acne treatments"],
  "Bath & Body": ["Soap and body wash", "Shampoo", "Conditioner", "Lotions"],
  "Hair Care & Styling": ["Hair gel and spray", "Dry shampoo", "Combs and brushes"],
  "Feminine Hygiene": ["Pads and tampons", "Wipes"],
  "General Hygiene": ["Deodorant", "Hand soap and sanitizer", "Wet wipes", "Cotton swabs"],
  "Shaving & Grooming": ["Razors", "Shaving cream", "Aftershave", "Nail care"],
  "Fragrance & Scents": ["Perfume and cologne", "Body spray", "Essential oils"],
  "Baby & Sensitive Care": ["Diapers", "Baby wipes", "Baby shampoo", "Rash cream"]
};

const clearTaxonomyForUser = async (userId, client) => {
  await client.query('DELETE FROM tags WHERE user_id = $1', [userId]);
  await client.query('DELETE FROM subcategories WHERE user_id = $1', [userId]);
  await client.query('DELETE FROM categories WHERE user_id = $1', [userId]);
  console.log(`Cleared existing taxonomy data for user ${userId}`);
};

const populateTaxonomyForUser = async (userId, client) => {
  for (const categoryName in taxonomyData) {
    const categoryResult = await client.query(
      'INSERT INTO categories (name, user_id) VALUES ($1, $2) RETURNING id',
      [categoryName, userId]
    );
    const categoryId = categoryResult.rows[0].id;

    const subcategories = taxonomyData[categoryName];
    for (const subcategoryName of subcategories) {
      await client.query(
        'INSERT INTO subcategories (name, category_id, user_id) VALUES ($1, $2, $3)',
        [subcategoryName, categoryId, userId]
      );
    }
  }
  console.log(`Populated new taxonomy data for user ${userId}`);
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
      await clearTaxonomyForUser(userId, client);
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

module.exports = { populateTaxonomyForUser, clearTaxonomyForUser };
