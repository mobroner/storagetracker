import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/app/lib/db';
import { getUserId } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');

  try {
    let result;
    if (categoryId) {
      result = await db.query('SELECT * FROM subcategories WHERE user_id = $1 AND category_id = $2', [userId, categoryId]);
    } else {
      result = await db.query('SELECT * FROM subcategories WHERE user_id = $1', [userId]);
    }
    const subcategories = result.rows.map(row => ({
      ...row,
      id: String(row.id),
      category_id: String(row.category_id)
    }));
    return NextResponse.json(subcategories);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
      `UPDATE subcategories 
       SET name = $1 
       WHERE id = $2 
       AND EXISTS (
         SELECT 1 FROM categories c 
         WHERE c.id = subcategories.category_id 
         AND c.user_id = $3
       ) 
       RETURNING *`,
      [name, id, userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating subcategory:', error);
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
    await db.query('BEGIN');

    // Delete the subcategory (will cascade to items)
    const result = await db.query(
      `DELETE FROM subcategories 
       WHERE id = $1 
       AND EXISTS (
         SELECT 1 FROM categories c 
         WHERE c.id = subcategories.category_id 
         AND c.user_id = $2
       ) 
       RETURNING *`,
      [id, userId]
    );

    await db.query('COMMIT');

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error deleting subcategory:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
