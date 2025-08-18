"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import AddItemForm from "./components/AddItemForm";
import InventoryList from "./components/InventoryList";
import ManageLocations from "./components/ManageLocations";
import ManageStorageAreas from "./components/ManageStorageAreas";
import EditItemModal from "./components/EditItemModal";
import { useStore } from "./components/StoreProvider";
import styles from "./page.module.css";
import { Item, Location, Subcategory } from "./lib/definitions";

// An extra comment to force a re-save
export default function Home() {
  const { itemsByStorageArea, locations, subcategories, refreshData } = useStore();
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [selectedStorageArea, setSelectedStorageArea] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [modalLocations, setModalLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
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

  useEffect(() => {
    if (selectedCategory) {
      setFilteredSubcategories(
        subcategories.filter(
          (subcategory) => String(subcategory.category_id) === selectedCategory
        )
      );
    } else {
      setFilteredSubcategories([]);
    }
  }, [selectedCategory, subcategories]);

  function handleEditItem(item: Item) {
    setEditingItem(item);
  }

  return (
    <main className={styles.container}>
      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={() => {
            setEditingItem(null);
            refreshData();
          }}
        />
      )}
      <div className={styles.grid}>
        <div>
          <AddItemForm
            filteredLocations={filteredLocations}
            selectedStorageArea={selectedStorageArea}
            setSelectedStorageArea={setSelectedStorageArea}
            filteredSubcategories={filteredSubcategories}
            setSelectedCategory={setSelectedCategory}
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
