"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useStore } from "./StoreProvider";
import styles from "./AddItemForm.module.css";
import { Item, Group } from "@/app/lib/definitions";

interface AddItemFormProps {
  editingItem: Item | null;
  setEditingItem: (item: Item | null) => void;
  filteredGroups: Group[];
  selectedStorageArea: string;
  setSelectedStorageArea: (id: string) => void;
}

export default function AddItemForm({
  editingItem,
  setEditingItem,
  filteredGroups,
  selectedStorageArea,
  setSelectedStorageArea,
}: AddItemFormProps) {
  const router = useRouter();
  const { storageAreas, refreshData } = useStore();
  const [formData, setFormData] = useState({
    itemName: "",
    quantity: "1",
    dateAdded: "",
    expiryDate: "",
    barcode: "",
    storageAreaId: "",
    groupId: "",
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        itemName: editingItem.item_name,
        quantity: String(editingItem.quantity),
        dateAdded: new Date(editingItem.date_added).toISOString().split("T")[0],
        expiryDate: editingItem.expiry_date
          ? new Date(editingItem.expiry_date).toISOString().split("T")[0]
          : "",
        barcode: editingItem.barcode || "",
        storageAreaId: editingItem.storage_area_id,
        groupId: editingItem.group_id || "",
      });
      setSelectedStorageArea(editingItem.storage_area_id);
    }
  }, [editingItem]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const method = editingItem ? "PUT" : "POST";
    const body = editingItem
      ? JSON.stringify({ ...formData, id: editingItem.id })
      : JSON.stringify(formData);

    await fetch("/api/items", {
      method,
      headers: { "Content-Type": "application/json" },
      body,
    });

    setEditingItem(null);
    setFormData({
      itemName: "",
      quantity: "1",
      dateAdded: "",
      expiryDate: "",
      barcode: "",
      storageAreaId: "",
      groupId: "",
    });
    router.refresh();
    refreshData();
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>
        {editingItem ? "Edit Item" : "Add New Item"}
      </h2>
      <p className={styles.description}>
        {editingItem
          ? "Update the details of your item."
          : "Add a new food item to your freezer inventory."}
      </p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          <label htmlFor="itemName" className={styles.label}>
            Item Name
          </label>
          <input
            type="text"
            name="itemName"
            id="itemName"
            className={styles.input}
            placeholder="e.g., Frozen Corn"
            required
            value={formData.itemName}
            onChange={handleChange}
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
            className={styles.input}
            required
            value={formData.quantity}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="dateAdded" className={styles.label}>
            Date Put in Storage
          </label>
          <input
            type="date"
            name="dateAdded"
            id="dateAdded"
            className={styles.input}
            required
            value={formData.dateAdded}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="expiryDate" className={styles.label}>
            Expiration Date (Optional)
          </label>
          <input
            type="date"
            name="expiryDate"
            id="expiryDate"
            className={styles.input}
            value={formData.expiryDate}
            onChange={handleChange}
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
            value={formData.barcode}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="storageAreaId" className={styles.label}>
            Storage Area
          </label>
          <select
            id="storageAreaId"
            name="storageAreaId"
            className={styles.select}
            required
            value={formData.storageAreaId}
            onChange={(e) => {
              handleChange(e);
              setSelectedStorageArea(e.target.value);
            }}
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
          <label htmlFor="groupId" className={styles.label}>
            Group (Optional)
          </label>
          <select
            id="groupId"
            name="groupId"
            className={styles.select}
            disabled={!selectedStorageArea}
            value={formData.groupId}
            onChange={handleChange}
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
          <button type="submit" className={styles.button}>
            {editingItem ? "Update Item" : "Add Item"}
          </button>
        </div>
      </form>
    </div>
  );
}
