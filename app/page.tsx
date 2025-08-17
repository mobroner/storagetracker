"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import AddItemForm from "./components/AddItemForm";
import InventoryList from "./components/InventoryList";
import ManageGroups from "./components/ManageGroups";
import ManageStorageAreas from "./components/ManageStorageAreas";
import { useStore } from "./components/StoreProvider";
import styles from "./page.module.css";
import { Item, Group } from "./lib/definitions";

// An extra comment to force a re-save
export default function Home() {
  const { itemsByStorageArea, groups } = useStore();
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [selectedStorageArea, setSelectedStorageArea] = useState<string>('');
  const [modalGroups, setModalGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const addItemFormRef = useRef<HTMLDivElement>(null);

  const notInStorageGroup = useMemo(
    () => groups.find((group) => group.group_name === "Not in Storage"),
    [groups]
  );

  useEffect(() => {
    if (!selectedStorageArea) {
      setFilteredGroups(groups.filter((group) => group.group_name !== "Not in Storage"));
    } else {
      setFilteredGroups(
        groups.filter(
          (group) =>
            group.group_name !== "Not in Storage" &&
            Array.isArray(group.storage_area_ids) &&
            group.storage_area_ids.map(String).includes(selectedStorageArea)
        )
      );
    }
  }, [selectedStorageArea, groups]);

  function handleEditItem(item: Item) {
    setEditingItem(item);
    addItemFormRef.current?.scrollIntoView({ behavior: "smooth" });
  }

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
            handleEditItem={handleEditItem}
            modalGroups={modalGroups}
            setModalGroups={setModalGroups}
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
