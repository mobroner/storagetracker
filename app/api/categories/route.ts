import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/app/lib/db';
import { getUserId } from '@/app/lib/auth';

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await db.query('SELECT * FROM categories WHERE user_id = $1', [userId]);
    const categories = result.rows.map(row => ({
      ...row,
      id: String(row.id)
    }));
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

export async function PUT(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, name } = await request.json();
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  try {
    const result = await db.query(
      'UPDATE categories SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [name, id, userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();

  try {
    // Start a transaction since we need to delete multiple related records
    await db.query('BEGIN');

    // Delete any subcategories first (will cascade to items)
    await db.query(
      'DELETE FROM subcategories WHERE category_id = $1 AND EXISTS (SELECT 1 FROM categories WHERE id = $1 AND user_id = $2)',
      [id, userId]
    );

    // Then delete the category itself
    const result = await db.query(
      'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    await db.query('COMMIT');

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
