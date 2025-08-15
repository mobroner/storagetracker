"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useStore } from "./StoreProvider";
import styles from "./AddItemForm.module.css";

export default function AddItemForm() {
  const router = useRouter();
  const { storageAreas, groups, refreshData } = useStore();
  const [selectedStorageArea, setSelectedStorageArea] = useState<string>('');

  const filteredGroups = useMemo(() => {
    if (!selectedStorageArea) {
      return [];
    }
    return groups.filter(group =>
      Array.isArray(group.storage_area_ids) && group.storage_area_ids.map(String).includes(selectedStorageArea)
    );
  }, [selectedStorageArea, groups]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemName: data["item-name"],
        quantity: data.quantity,
        dateAdded: data["date-put-in-storage"],
        expiryDate: data["expiration-date"],
        barcode: data.barcode,
        storageAreaId: data["storage-area"],
        groupId: data.group,
      }),
    });

    router.refresh();
    refreshData();
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Add New Item</h2>
      <p className={styles.description}>Add a new food item to your freezer inventory.</p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          <label htmlFor="item-name" className={styles.label}>
            Item Name
          </label>
          <input
            type="text"
            name="item-name"
            id="item-name"
            className={styles.input}
            placeholder="e.g., Frozen Corn"
            required
          />
        </div>
        <div>
          <label htmlFor="quantity" className={styles.label}>
            Quantity
          </label>
          <input
            type="number"
            name="quantity"
            id="quantity"
            defaultValue="1"
            className={styles.input}
            required
          />
        </div>
        <div>
          <label htmlFor="date-put-in-storage" className={styles.label}>
            Date Put in Storage
          </label>
          <input
            type="date"
            name="date-put-in-storage"
            id="date-put-in-storage"
            className={styles.input}
            required
          />
        </div>
        <div>
          <label htmlFor="expiration-date" className={styles.label}>
            Expiration Date (Optional)
          </label>
          <input
            type="date"
            name="expiration-date"
            id="expiration-date"
            className={styles.input}
          />
        </div>
        <div>
          <label htmlFor="barcode" className={styles.label}>
            Barcode (Optional)
          </label>
          <input
            type="text"
            name="barcode"
            id="barcode"
            className={styles.input}
            placeholder="e.g., 01234567890"
          />
        </div>
        <div>
          <label htmlFor="storage-area" className={styles.label}>
            Storage Area
          </label>
          <select
            id="storage-area"
            name="storage-area"
            className={styles.select}
            required
            value={selectedStorageArea}
            onChange={(e) => setSelectedStorageArea(e.target.value)}
          >
            <option value="">Select a storage area</option>
            {storageAreas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="group" className={styles.label}>
            Group (Optional)
          </label>
          <select
            id="group"
            name="group"
            className={styles.select}
            disabled={!selectedStorageArea}
          >
            <option value="">Select a group</option>
            {filteredGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.group_name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.buttonContainer}>
          <button
            type="submit"
            className={styles.button}
          >
            Add Item
          </button>
        </div>
      </form>
    </div>
  );
}
