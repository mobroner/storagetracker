import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { getUserId } from '@/app/lib/auth';

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const categories = await db.query('SELECT * FROM categories WHERE user_id = $1', [userId]);
    return NextResponse.json(categories.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, icon } = await request.json();
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  try {
    const newCategory = await db.query(
      'INSERT INTO categories (name, icon, user_id) VALUES ($1, $2, $3) RETURNING *',
      [name, icon, userId]
    );
    return NextResponse.json(newCategory.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
