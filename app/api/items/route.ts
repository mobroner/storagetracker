import { db } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { getUserId } from '@/app/lib/auth';
import { Item } from '@/app/lib/definitions';

interface ItemsByStorageArea {
  [storageAreaName: string]: {
    [locationName: string]: Item[];
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
      i.barcode,
      i.category_id,
      i.subcategory_id,
      i.tag_ids
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

  const itemsByStorageArea = result.rows.reduce((acc: ItemsByStorageArea, item: any) => {
    const { storage_area_name, location_name, ...itemData } = item;
    if (!acc[storage_area_name]) {
      acc[storage_area_name] = {};
    }
    const effectiveLocationName = location_name || 'Uncategorized';
    if (!acc[storage_area_name][effectiveLocationName]) {
      acc[storage_area_name][effectiveLocationName] = [];
    }
    acc[storage_area_name][effectiveLocationName].push({
      ...itemData,
      id: String(itemData.id),
    });
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
    `INSERT INTO items (item_name, quantity, date_added, expiry_date, barcode, location_id, user_id, storage_area_id, category_id, subcategory_id, tag_ids)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      data.itemName,
      data.quantity,
      data.dateAdded,
      data.expiryDate || null,
      data.barcode || null,
      data.locationId || null,
      userId,
      data.storageAreaId,
      data.categoryId || null,
      data.subcategoryId || null,
      data.tagIds || null,
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
    categoryId,
    subcategoryId,
    tagIds,
  } = data;

  if (itemName) {
    // Full item update
    await db.query(
      `UPDATE items
       SET item_name = $1, quantity = $2, date_added = $3, expiry_date = $4, barcode = $5, storage_area_id = $6, location_id = $7, category_id = $8, subcategory_id = $9, tag_ids = $10
       WHERE id = $11 AND user_id = $12`,
      [
        itemName,
        quantity,
        dateAdded,
        expiryDate || null,
        barcode || null,
        storageAreaId,
        locationId || null,
        categoryId || null,
        subcategoryId || null,
        tagIds || null,
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
