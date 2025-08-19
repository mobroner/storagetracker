import { db } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { getUserId } from '@/app/lib/auth';

const taxonomyData: { [key: string]: string[] } = {
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

async function clearTaxonomyForUser(userId: string) {
  // Begin a transaction to ensure data consistency
  await db.query('BEGIN');
  try {
    // Only clear if data exists for this user
    const existingData = await db.query(
      'SELECT COUNT(*) FROM categories WHERE user_id = $1',
      [userId]
    );
    
    if (existingData.rows[0].count > 0) {
      await db.query('DELETE FROM tags WHERE user_id = $1', [userId]);
      await db.query('DELETE FROM subcategories WHERE user_id = $1', [userId]);
      await db.query('DELETE FROM categories WHERE user_id = $1', [userId]);
      console.log(`Cleared existing taxonomy data for user ${userId}`);
    }
    await db.query('COMMIT');
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
}

async function populateTaxonomyForUser(userId: string) {
  // Begin a transaction to ensure data consistency
  await db.query('BEGIN');
  try {
    // First check if the user exists
    const userExists = await db.query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );

    if (userExists.rows.length === 0) {
      throw new Error('User not found');
    }

    // Check if user already has taxonomy data
    const existingCategories = await db.query(
      'SELECT COUNT(*) FROM categories WHERE user_id = $1',
      [userId]
    );

    // Only proceed if user has no existing categories
    if (parseInt(existingCategories.rows[0].count) === 0) {
      for (const categoryName in taxonomyData) {
        const categoryResult = await db.query(
          'INSERT INTO categories (name, user_id) VALUES ($1, $2) RETURNING id',
          [categoryName, userId]
        );
        const categoryId = categoryResult.rows[0].id;

        const subcategories = taxonomyData[categoryName];
        for (const subcategoryName of subcategories) {
          await db.query(
            'INSERT INTO subcategories (name, category_id, user_id) VALUES ($1, $2, $3)',
            [subcategoryName, categoryId, userId]
          );
        }
      }
      console.log(`Populated new taxonomy data for user ${userId}`);
    } else {
      console.log(`User ${userId} already has taxonomy data`);
    }
    
    await db.query('COMMIT');
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
}

export async function POST(request: Request) {
  let userId;
  
  // Try to get userId from request body (for new registrations)
  try {
    const body = await request.json();
    if (body.userId) {
      userId = body.userId;
    }
  } catch {
    // If parsing fails, continue to try getting userId from session
  }

  // If no userId in request body, try to get it from session
  if (!userId) {
    userId = await getUserId();
  }

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Verify the user exists
  const userExists = await db.query(
    'SELECT id FROM users WHERE id = $1',
    [userId]
  );

  if (userExists.rows.length === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    await clearTaxonomyForUser(userId);
    await populateTaxonomyForUser(userId);
    return NextResponse.json({ message: 'Taxonomy populated successfully' });
  } catch (error) {
    console.error('Error populating taxonomy:', error);
    return NextResponse.json({ error: 'Failed to populate taxonomy' }, { status: 500 });
  }
}
