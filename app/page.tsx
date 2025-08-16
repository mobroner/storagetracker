"use client";

import { useState, useMemo, useRef } from "react";
import AddItemForm from "./components/AddItemForm";
import InventoryList from "./components/InventoryList";
import ManageGroups from "./components/ManageGroups";
import ManageStorageAreas from "./components/ManageStorageAreas";
import { useStore } from "./components/StoreProvider";
import styles from "./page.module.css";
import { Item } from "./lib/definitions";

export default function Home() {
  const { itemsByStorageArea, groups } = useStore();
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [selectedStorageArea, setSelectedStorageArea] = useState<string>('');
  const addItemFormRef = useRef<HTMLDivElement>(null);

  const filteredGroups = useMemo(() => {
    if (!selectedStorageArea) {
      return [];
    }
    return groups.filter(
      (group) =>
        Array.isArray(group.storage_area_ids) &&
        group.storage_area_ids.map(String).includes(selectedStorageArea)
    );
  }, [selectedStorageArea, groups]);

  return (
    <main className={styles.container}>
      <div className={styles.grid}>
        <div>
          <AddItemForm
            editingItem={editingItem}
            setEditingItem={setEditingItem}
            filteredGroups={filteredGroups}
            selectedStorageArea={selectedStorageArea}
            setSelectedStorageArea={setSelectedStorageArea}
            ref={addItemFormRef}
          />
          <InventoryList
            itemsByStorageArea={itemsByStorageArea}
            setEditingItem={setEditingItem}
            filteredGroups={filteredGroups}
            setSelectedStorageArea={setSelectedStorageArea}
            addItemFormRef={addItemFormRef}
          />
        </div>
        <div>
          <ManageStorageAreas />
          <ManageGroups />
        </div>
      </div>
    </main>
  );
}
