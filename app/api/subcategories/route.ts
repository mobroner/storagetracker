import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { getUserId } from '@/app/lib/auth';

export async function GET(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');

  try {
    let subcategories;
    if (categoryId) {
      subcategories = await db.query('SELECT * FROM subcategories WHERE user_id = $1 AND category_id = $2', [userId, categoryId]);
    } else {
      subcategories = await db.query('SELECT * FROM subcategories WHERE user_id = $1', [userId]);
    }
    return NextResponse.json(subcategories.rows);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, category_id } = await request.json();
  if (!name || !category_id) {
    return NextResponse.json({ error: 'Name and category_id are required' }, { status: 400 });
  }

  try {
    const newSubcategory = await db.query(
      'INSERT INTO subcategories (name, category_id, user_id) VALUES ($1, $2, $3) RETURNING *',
      [name, category_id, userId]
    );
    return NextResponse.json(newSubcategory.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating subcategory:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
