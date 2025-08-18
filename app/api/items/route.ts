import { db } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { getUserId } from '@/app/lib/auth';

interface ItemFromDB {
  storage_area_name: string;
  location_name: string | null;
  id: number;
  item_name: string;
  quantity: number;
  date_added: string;
  expiry_date: string | null;
}

interface ItemData {
    id: number;
    item_name: string;
    quantity: number;
    date_added: string;
    expiry_date: string | null;
}

interface ItemsByStorageArea {
  [storageAreaName: string]: {
    [locationName: string]: ItemData[];
  };
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await db.query(
    `SELECT
      sa.name as storage_area_name,
      il.location_name,
      i.id,
      i.item_name,
      i.quantity,
      i.date_added,
      i.expiry_date,
      i.storage_area_id,
      i.location_id,
      i.barcode
    FROM items i
    JOIN storage_areas sa ON i.storage_area_id = sa.id
    LEFT JOIN item_locations il ON i.location_id = il.id
    WHERE i.user_id = $1
    ORDER BY
      sa.name,
      CASE
        WHEN il.location_name = 'Not in Storage' THEN 1
        ELSE 0
      END,
      il.location_name,
      i.item_name`,
    [userId]
  );

  const itemsByStorageArea = result.rows.reduce((acc: ItemsByStorageArea, item: ItemFromDB) => {
    const { storage_area_name, location_name, ...itemData } = item;
    if (!acc[storage_area_name]) {
      acc[storage_area_name] = {};
    }
    const effectiveLocationName = location_name || 'Uncategorized';
    if (!acc[storage_area_name][effectiveLocationName]) {
      acc[storage_area_name][effectiveLocationName] = [];
    }
    acc[storage_area_name][effectiveLocationName].push(itemData);
    return acc;
  }, {} as ItemsByStorageArea);

  console.log('API /api/items GET itemsByStorageArea:', JSON.stringify(itemsByStorageArea, null, 2));
  return NextResponse.json(itemsByStorageArea);
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  await db.query(
    `INSERT INTO items (item_name, quantity, date_added, expiry_date, barcode, location_id, user_id, storage_area_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      data.itemName,
      data.quantity,
      data.dateAdded,
      data.expiryDate || null,
      data.barcode || null,
      data.locationId || null,
      userId,
      data.storageAreaId,
    ]
  );
  return new Response(null, { status: 204 });
}

export async function PUT(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  const {
    id,
    itemName,
    quantity,
    dateAdded,
    expiryDate,
    barcode,
    storageAreaId,
    locationId,
  } = data;

  if (itemName) {
    // Full item update
    await db.query(
      `UPDATE items
       SET item_name = $1, quantity = $2, date_added = $3, expiry_date = $4, barcode = $5, storage_area_id = $6, location_id = $7
       WHERE id = $8 AND user_id = $9`,
      [
        itemName,
        quantity,
        dateAdded,
        expiryDate || null,
        barcode || null,
        storageAreaId,
        locationId || null,
        id,
        userId,
      ]
    );
  } else {
    // Quantity-only update
    const currentItem = await db.query(`SELECT location_id, original_location_id FROM items WHERE id = $1`, [id]);
    const { location_id: currentLocationId, original_location_id: originalLocationId } = currentItem.rows[0];

    if (quantity === 0) {
      const notInStorageLocation = await db.query(
        `SELECT id FROM item_locations WHERE location_name = 'Not in Storage' AND user_id = $1`,
        [userId]
      );

      let notInStorageLocationId;
      if (notInStorageLocation.rows.length === 0) {
        const newLocation = await db.query(
          `INSERT INTO item_locations (location_name, user_id) VALUES ('Not in Storage', $1) RETURNING id`,
          [userId]
        );
        notInStorageLocationId = newLocation.rows[0].id;
      } else {
        notInStorageLocationId = notInStorageLocation.rows[0].id;
      }

      await db.query(
        `UPDATE items SET quantity = 0, location_id = $1, original_location_id = $2 WHERE id = $3`,
        [notInStorageLocationId, currentLocationId, id]
      );
    } else {
      if (locationId) {
        await db.query(
          `UPDATE items SET quantity = $1, location_id = $2, original_location_id = NULL WHERE id = $3`,
          [quantity, locationId, id]
        );
      } else if (originalLocationId) {
        await db.query(
          `UPDATE items SET quantity = $1, location_id = $2, original_location_id = NULL WHERE id = $3`,
          [quantity, originalLocationId, id]
        );
      } else {
        await db.query(`UPDATE items SET quantity = $1 WHERE id = $2`, [
          quantity,
          id,
        ]);
      }
    }
  }

  return new Response(null, { status: 204 });
}

export async function DELETE(request: Request) {
  const data = await request.json();
  await db.query(`DELETE FROM items WHERE id = $1`, [data.id]);
  return new Response(null, { status: 204 });
}
