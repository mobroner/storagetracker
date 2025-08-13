import { db } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { getUserId } from '@/app/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await db.query(`SELECT * FROM storage_areas WHERE user_id = $1 ORDER BY name`, [userId]);
  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  await db.query(
    `INSERT INTO storage_areas (name, user_id) VALUES ($1, $2)`,
    [data.name, userId]
  );
  return new Response(null, { status: 204 });
}

export async function PUT(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  const { id, name } = data;

  await db.query(
    `UPDATE storage_areas SET name = $1 WHERE id = $2 AND user_id = $3`,
    [name, id, userId]
  );

  return new Response(null, { status: 204 });
}

export async function DELETE(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  const { id } = data;

  await db.query(`DELETE FROM storage_area_groups WHERE storage_area_id = $1`, [id]);
  await db.query(`DELETE FROM storage_areas WHERE id = $1 AND user_id = $2`, [id, userId]);

  return new Response(null, { status: 204 });
}
