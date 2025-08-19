import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { getUserId } from '@/app/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
      [params.id, userId]
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await request.json();
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
      [name, params.id, userId]
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
