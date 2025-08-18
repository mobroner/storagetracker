"use client";

import { useState } from "react";
import { useStore } from "./StoreProvider";
import SelectLocationModal from "./SelectLocationModal";
import { Item, ItemsByStorageArea, Location } from "@/app/lib/definitions";
import styles from "./InventoryList.module.css";

interface InventoryListProps {
  itemsByStorageArea: ItemsByStorageArea;
  handleEditItem: (item: Item) => void;
  modalLocations: Location[];
  setModalLocations: (locations: Location[]) => void;
  setSelectedStorageArea: (id: string) => void;
}

export default function InventoryList({
  itemsByStorageArea,
  handleEditItem,
  modalLocations,
  setModalLocations,
  setSelectedStorageArea,
}: InventoryListProps) {
  const { locations, categories, subcategories, refreshData } = useStore();
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>(
    Object.keys(itemsByStorageArea).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as { [key: string]: boolean })
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  async function updateQuantity(id: string, newQuantity: number) {
    const allItems: Item[] = Object.values(itemsByStorageArea)
      .flatMap((storageArea) => Object.values(storageArea).flat())
      .flat();
    const item = allItems.find((item: Item) => item.id === id);

    if (item && item.quantity === 0 && newQuantity > 0) {
      setSelectedItemId(id);
      setSelectedStorageArea(item.storage_area_id);
      const filtered = locations.filter(
        (location) =>
          location.storage_area_ids &&
          location.storage_area_ids.includes(item.storage_area_id)
      );
      setModalLocations(filtered);
      setShowModal(true);
    } else if (newQuantity >= 0) {
      await fetch("/api/items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, quantity: newQuantity }),
      });
      refreshData();
    }
  }

  async function handleSelectLocation(locationId: string) {
    if (selectedItemId) {
      await fetch("/api/items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedItemId, quantity: 1, locationId }),
      });
      setShowModal(false);
      setSelectedItemId(null);
      refreshData();
    }
  }

  async function deleteItem(id: string) {
    await fetch("/api/items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    refreshData();
  }

  return (
    <div className={styles.card}>
      {showModal && (
        <SelectLocationModal
          locations={modalLocations}
          onClose={() => setShowModal(false)}
          onSelect={handleSelectLocation}
        />
      )}
      {Object.entries(itemsByStorageArea).map(([storageArea, locations]) => {
        const hasItemsInStorageArea = Object.values(locations).some((items: Item[]) => items.length > 0);

        if (!hasItemsInStorageArea) {
          return null;
        }

        return (
          <div key={storageArea} className={styles.storageArea}>
            <h3
              className={`${styles.storageAreaHeader} ${openSections[storageArea] ? styles.open : ''}`}
              onClick={() => toggleSection(storageArea)}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
              {storageArea}
            </h3>
            {openSections[storageArea] &&
              Object.entries(locations).map(([locationName, items]) => {
                if (!Array.isArray(items) || items.length === 0) {
                  return null;
                }
                return (
                  <div key={locationName} className={styles.location}>
                    <h4 className={styles.locationTitle}>{locationName === 'null' ? 'Uncategorized' : locationName}</h4>
                    <div className={styles.itemList}>
                      <div className={`${styles.itemRow} ${styles.itemHeader}`}>
                        <div className={styles.itemCell}>Item</div>
                        <div className={styles.itemCell}>Category</div>
                        <div className={styles.itemCell}>Subcategory</div>
                        <div className={styles.itemCell}>Quantity</div>
                        <div className={styles.itemCell}>Added</div>
                        <div className={styles.itemCell}>Expires</div>
                        <div className={styles.itemCell}>Actions</div>
                      </div>
                      {items.map((item: Item) => {
                        const category = categories.find(c => c.id === item.category_id)?.name;
                        const subcategory = subcategories.find(s => s.id === item.subcategory_id)?.name;

                        return (
                          <div key={item.id} className={styles.itemRow}>
                            <div className={styles.itemCell} data-label="Item">{item.item_name}</div>
                            <div className={styles.itemCell} data-label="Category">{category || "N/A"}</div>
                            <div className={styles.itemCell} data-label="Subcategory">{subcategory || "N/A"}</div>
                            <div className={styles.itemCell} data-label="Quantity">
                              <div className={styles.quantityContainer}>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className={styles.quantityButton}
                                >
                                  -
                                </button>
                                <span className={styles.quantity}>{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className={styles.quantityButton}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className={styles.itemCell} data-label="Added">{new Date(item.date_added).toLocaleDateString()}</div>
                            <div className={styles.itemCell} data-label="Expires">{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : "N/A"}</div>
                            <div className={styles.itemCell} data-label="Actions">
                              <div className={styles.actionsContainer}>
                                <button
                                  onClick={() => handleEditItem(item)}
                                  className={styles.actionButton}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                </button>
                                <button
                                  onClick={() => deleteItem(item.id)}
                                  className={`${styles.actionButton} ${styles.deleteButton}`}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
  );
}
