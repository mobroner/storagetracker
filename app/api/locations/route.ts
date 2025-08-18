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
      il.id,
      il.location_name,
      array_agg(sa.id) as storage_area_ids
    FROM item_locations il
    LEFT JOIN storage_area_locations sal ON il.id = sal.location_id
    LEFT JOIN storage_areas sa ON sal.storage_area_id = sa.id
    WHERE il.user_id = $1
    GROUP BY il.id, il.location_name
    ORDER BY
      CASE
        WHEN il.location_name = 'Not in Storage' THEN 1
        ELSE 0
      END,
      il.location_name`,
    [userId]
  );
  console.log('API /api/locations GET result.rows:', JSON.stringify(result.rows, null, 2));
  return NextResponse.json(result.rows, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  const locationResult = await db.query(
    `INSERT INTO item_locations (location_name, user_id) VALUES ($1, $2) RETURNING id`,
    [data.locationName, userId]
  );
  const locationId = locationResult.rows[0].id;
  for (const storageAreaId of data.storageAreaIds) {
    await db.query(
      `INSERT INTO storage_area_locations (storage_area_id, location_id) VALUES ($1, $2)`,
      [storageAreaId, locationId]
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
  const { id, locationName, storageAreaIds } = data;

  await db.query(
    `UPDATE item_locations SET location_name = $1 WHERE id = $2 AND user_id = $3`,
    [locationName, id, userId]
  );

  await db.query(`DELETE FROM storage_area_locations WHERE location_id = $1`, [id]);

  for (const storageAreaId of storageAreaIds) {
    await db.query(
      `INSERT INTO storage_area_locations (storage_area_id, location_id) VALUES ($1, $2)`,
      [storageAreaId, id]
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

  await db.query(`DELETE FROM storage_area_locations WHERE location_id = $1`, [id]);
  await db.query(`DELETE FROM item_locations WHERE id = $1 AND user_id = $2`, [id, userId]);

  return new Response(null, { status: 204 });
}
