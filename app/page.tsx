"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import AddItemForm from "./components/AddItemForm";
import InventoryList from "./components/InventoryList";
import ManageLocations from "./components/ManageLocations";
import ManageStorageAreas from "./components/ManageStorageAreas";
import { useStore } from "./components/StoreProvider";
import styles from "./page.module.css";
import { Item, Location } from "./lib/definitions";

// An extra comment to force a re-save
export default function Home() {
  const { itemsByStorageArea, locations } = useStore();
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [selectedStorageArea, setSelectedStorageArea] = useState<string>('');
  const [modalLocations, setModalLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const addItemFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingItem && selectedStorageArea === editingItem.storage_area_id) {
      return;
    }

    if (!selectedStorageArea) {
      setFilteredLocations(locations.filter((location) => location.location_name !== "Not in Storage"));
    } else {
      setFilteredLocations(
        locations.filter(
          (location) =>
            location.location_name !== "Not in Storage" &&
            Array.isArray(location.storage_area_ids) &&
            location.storage_area_ids.map(String).includes(selectedStorageArea)
        )
      );
    }
  }, [selectedStorageArea, locations, editingItem]);

  function handleEditItem(item: Item) {
    const storageAreaId = item.storage_area_id;
    setSelectedStorageArea(storageAreaId);
    setFilteredLocations(
      locations.filter((location) => {
        const isCorrectLocation =
          location.storage_area_ids &&
          Array.isArray(location.storage_area_ids) &&
          location.storage_area_ids.map(String).includes(storageAreaId);
        return location.location_name !== "Not in Storage" && isCorrectLocation;
      })
    );
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
            filteredLocations={filteredLocations}
            selectedStorageArea={selectedStorageArea}
            setSelectedStorageArea={setSelectedStorageArea}
            ref={addItemFormRef}
          />
          <InventoryList
            itemsByStorageArea={itemsByStorageArea}
            handleEditItem={handleEditItem}
            modalLocations={modalLocations}
            setModalLocations={setModalLocations}
            setSelectedStorageArea={setSelectedStorageArea}
          />
        </div>
        <div>
          <ManageStorageAreas />
          <ManageLocations />
        </div>
      </div>
    </main>
  );
}
