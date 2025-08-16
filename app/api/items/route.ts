import { db } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { getUserId } from '@/app/lib/auth';

interface ItemFromDB {
  storage_area_name: string;
  group_name: string | null;
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
    [groupName: string]: ItemData[];
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
      ig.group_name,
      i.id,
      i.item_name,
      i.quantity,
      i.date_added,
      i.expiry_date,
      i.storage_area_id,
      i.group_id,
      i.barcode
    FROM items i
    JOIN storage_areas sa ON i.storage_area_id = sa.id
    LEFT JOIN item_groups ig ON i.group_id = ig.id
    WHERE i.user_id = $1
    ORDER BY
      sa.name,
      CASE
        WHEN ig.group_name = 'Not in Storage' THEN 1
        ELSE 0
      END,
      ig.group_name,
      i.item_name`,
    [userId]
  );

  const itemsByStorageArea = result.rows.reduce((acc: ItemsByStorageArea, item: ItemFromDB) => {
    const { storage_area_name, group_name, ...itemData } = item;
    if (!acc[storage_area_name]) {
      acc[storage_area_name] = {};
    }
    const effectiveGroupName = group_name || 'Ungrouped';
    if (!acc[storage_area_name][effectiveGroupName]) {
      acc[storage_area_name][effectiveGroupName] = [];
    }
    acc[storage_area_name][effectiveGroupName].push(itemData);
    return acc;
  }, {} as ItemsByStorageArea);

  return NextResponse.json(itemsByStorageArea);
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  await db.query(
    `INSERT INTO items (item_name, quantity, date_added, expiry_date, barcode, group_id, user_id, storage_area_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      data.itemName,
      data.quantity,
      data.dateAdded,
      data.expiryDate || null,
      data.barcode || null,
      data.groupId || null,
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
    groupId,
  } = data;

  if (itemName) {
    // Full item update
    await db.query(
      `UPDATE items
       SET item_name = $1, quantity = $2, date_added = $3, expiry_date = $4, barcode = $5, storage_area_id = $6, group_id = $7
       WHERE id = $8 AND user_id = $9`,
      [
        itemName,
        quantity,
        dateAdded,
        expiryDate || null,
        barcode || null,
        storageAreaId,
        groupId || null,
        id,
        userId,
      ]
    );
  } else {
    // Quantity-only update
    const currentItem = await db.query(`SELECT group_id, original_group_id FROM items WHERE id = $1`, [id]);
    const { group_id: currentGroupId, original_group_id: originalGroupId } = currentItem.rows[0];

    if (quantity === 0) {
      const notInStorageGroup = await db.query(
        `SELECT id FROM item_groups WHERE group_name = 'Not in Storage' AND user_id = $1`,
        [userId]
      );

      let notInStorageGroupId;
      if (notInStorageGroup.rows.length === 0) {
        const newGroup = await db.query(
          `INSERT INTO item_groups (group_name, user_id) VALUES ('Not in Storage', $1) RETURNING id`,
          [userId]
        );
        notInStorageGroupId = newGroup.rows[0].id;
      } else {
        notInStorageGroupId = notInStorageGroup.rows[0].id;
      }

      await db.query(
        `UPDATE items SET quantity = 0, group_id = $1, original_group_id = $2 WHERE id = $3`,
        [notInStorageGroupId, currentGroupId, id]
      );
    } else {
      if (groupId) {
        await db.query(
          `UPDATE items SET quantity = $1, group_id = $2, original_group_id = NULL WHERE id = $3`,
          [quantity, groupId, id]
        );
      } else if (originalGroupId) {
        await db.query(
          `UPDATE items SET quantity = $1, group_id = $2, original_group_id = NULL WHERE id = $3`,
          [quantity, originalGroupId, id]
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
