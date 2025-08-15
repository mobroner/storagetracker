import { db } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { getUserId } from '@/app/lib/auth';
import { NextRequest } from 'next/server';

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await db.query(
    `SELECT
      ig.id,
      ig.group_name,
      array_agg(sa.id) as storage_area_ids
    FROM item_groups ig
    LEFT JOIN storage_area_groups sag ON ig.id = sag.group_id
    LEFT JOIN storage_areas sa ON sag.storage_area_id = sa.id
    WHERE ig.user_id = $1
    GROUP BY ig.id, ig.group_name
    ORDER BY ig.group_name`,
    [userId]
  );
  console.log('API /api/groups GET result.rows:', result.rows);
  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  const groupResult = await db.query(
    `INSERT INTO item_groups (group_name, user_id) VALUES ($1, $2) RETURNING id`,
    [data.groupName, userId]
  );
  const groupId = groupResult.rows[0].id;
  for (const storageAreaId of data.storageAreaIds) {
    await db.query(
      `INSERT INTO storage_area_groups (storage_area_id, group_id) VALUES ($1, $2)`,
      [Number(storageAreaId), groupId]
    );
  }
  return new Response(null, { status: 204 });
}

export async function PUT(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  const { id, groupName, storageAreaIds } = data;

  await db.query(
    `UPDATE item_groups SET group_name = $1 WHERE id = $2 AND user_id = $3`,
    [groupName, id, userId]
  );

  await db.query(`DELETE FROM storage_area_groups WHERE group_id = $1`, [id]);

  for (const storageAreaId of storageAreaIds) {
    await db.query(
      `INSERT INTO storage_area_groups (storage_area_id, group_id) VALUES ($1, $2)`,
      [Number(storageAreaId), id]
    );
  }

  return new Response(null, { status: 204 });
}

export async function DELETE(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  const { id } = data;

  await db.query(`DELETE FROM storage_area_groups WHERE group_id = $1`, [id]);
  await db.query(`DELETE FROM item_groups WHERE id = $1 AND user_id = $2`, [id, userId]);

  return new Response(null, { status: 204 });
}
