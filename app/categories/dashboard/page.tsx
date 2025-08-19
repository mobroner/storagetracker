"use client";

import { useEffect, useState } from "react";
import { useStore } from "../../components/StoreProvider";
import styles from "./page.module.css";
import { Item } from "../../lib/definitions";

interface CategoryStats {
  [key: string]: number;
}

export default function Dashboard() {
  const { itemsByStorageArea, categories } = useStore();
  const [totalItems, setTotalItems] = useState(0);
  const [lowStockItems, setLowStockItems] = useState<Item[]>([]);
  const [expiringItems, setExpiringItems] = useState<Item[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryStats>({});

  useEffect(() => {
    // Get all items
    const allItems = Object.values(itemsByStorageArea).flatMap(locations =>
      Object.values(locations).flatMap(items => items)
    );

    // Calculate total items
    const total = allItems.reduce((sum, item) => sum + item.quantity, 0);
    setTotalItems(total);

    // Find items low in stock (less than or equal to 5)
    const lowStock = allItems.filter(item => item.quantity <= 5);
    setLowStockItems(lowStock);

    // Find items expiring in the next 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiring = allItems.filter(item => {
      if (!item.expiry_date) return false;
      const expiryDate = new Date(item.expiry_date);
      return expiryDate <= thirtyDaysFromNow && expiryDate >= new Date();
    });
    setExpiringItems(expiring);

    // Calculate category breakdown
    const breakdown = allItems.reduce((acc: CategoryStats, item) => {
      const categoryId = item.category_id || "uncategorized";
      acc[categoryId] = (acc[categoryId] || 0) + item.quantity;
      return acc;
    }, {});
    setCategoryBreakdown(breakdown);
  }, [itemsByStorageArea]);

  return (
    <div className={styles.container}>
      <h1>Storage Summary</h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h2>Total Items</h2>
          <p className={styles.statNumber}>{totalItems}</p>
        </div>

        <div className={styles.statCard}>
          <h2>Low Stock Items</h2>
          <p className={styles.statNumber}>{lowStockItems.length}</p>
          <div className={styles.itemList}>
            {lowStockItems.map(item => (
              <div key={item.id} className={styles.itemRow}>
                <span>{item.item_name}</span>
                <span>Qty: {item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.statCard}>
          <h2>Expiring Soon</h2>
          <p className={styles.statNumber}>{expiringItems.length}</p>
          <div className={styles.itemList}>
            {expiringItems.map(item => (
              <div key={item.id} className={styles.itemRow}>
                <span>{item.item_name}</span>
                <span>
                  {item.expiry_date && new Date(item.expiry_date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.statCard}>
          <h2>Category Breakdown</h2>
          <div className={styles.categoryList}>
            {Object.entries(categoryBreakdown).map(([categoryId, count]) => {
              const category = categories.find(c => c.id === categoryId);
              const name = category ? category.name : "Uncategorized";
              return (
                <div key={categoryId} className={styles.categoryRow}>
                  <span>{name}</span>
                  <span>{count} items</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
