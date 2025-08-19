"use client";

import { useState } from "react";
import { useStore } from "./StoreProvider";
import EditLocationModal from "./EditLocationModal";
import stylesDefault from "./Management.module.css";
import stylesFrontPage from "./FrontPageManagement.module.css";
import { Location } from "@/app/lib/definitions";

interface ManageLocationsProps {
  variant?: 'default' | 'front-page';
}

export default function ManageLocations({ variant = 'default' }: ManageLocationsProps) {
  const styles = variant === 'front-page' ? stylesFrontPage : stylesDefault;
  const { storageAreas, locations, refreshData } = useStore();
  const [newLocationName, setNewLocationName] = useState("");
  const [selectedStorageAreas, setSelectedStorageAreas] = useState<string[]>([]);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  async function addLocation(e: React.FormEvent) {
    e.preventDefault();
    if (newLocationName.trim() === "") return;
    await fetch("/api/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locationName: newLocationName,
        storageAreaIds: selectedStorageAreas,
      }),
    });
    setNewLocationName("");
    setSelectedStorageAreas([]);
    refreshData();
  }

  function handleStorageAreaChange(storageAreaId: string) {
    setSelectedStorageAreas((prev) =>
      prev.includes(storageAreaId)
        ? prev.filter((id) => id !== storageAreaId)
        : [...prev, storageAreaId]
    );
  }

  async function deleteLocation(id: string) {
    if (!confirm("Are you sure you want to delete this location?")) return;
    await fetch("/api/locations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    refreshData();
  }

  const getStorageAreaNames = (storageAreaIds: string[] | undefined) => {
    if (!storageAreaIds) {
      return '';
    }
    return storageAreaIds.map(id => storageAreas.find(sa => sa.id === id)?.name).filter(Boolean).join(', ');
  };

  return (
    <div className={styles.container}>
      {variant === 'front-page' ? (
        <h2 className={styles.title}>Manage Locations</h2>
      ) : (
        <h1 className={styles.title}>Manage Locations</h1>
      )}
      <form className={styles.addForm} onSubmit={addLocation}>
        <input
          type="text"
          value={newLocationName}
          onChange={(e) => setNewLocationName(e.target.value)}
          placeholder={variant === 'front-page' ? "New location name" : "Enter location name..."}
          className={styles.input}
          required
        />
        <button type="submit" className={styles.addButton}>
          {variant === 'front-page' ? "Add" : "Add Location"}
        </button>
      </form>
      {variant === 'front-page' ? (
        <>
          <div className={styles.checkboxContainer}>
            <p>Select Storage Areas:</p>
            {storageAreas.map((area) => (
              <label key={area.id} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  value={area.id}
                  checked={selectedStorageAreas.includes(area.id)}
                  onChange={() => handleStorageAreaChange(area.id)}
                />
                {area.name}
              </label>
            ))}
          </div>
          <ul className={styles.list}>
            {locations.map((location) => (
              <li key={location.id} className={styles.listItem}>
                <div>
                  <span className={styles.listItemName}>{location.location_name}</span>
                  <div className="text-sm text-gray-500">{getStorageAreaNames(location.storage_area_ids)}</div>
                </div>
                <button
                  onClick={() => setEditingLocation(location)}
                  className={styles.editButton}
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className={styles.list}>
          <div className={styles.card}>
            <h2 className={styles.categoryTitle}>Storage Areas</h2>
            <div className={styles.checkboxContainer}>
              {storageAreas.map((area) => (
                <label key={area.id} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    value={area.id}
                    checked={selectedStorageAreas.includes(area.id)}
                    onChange={() => handleStorageAreaChange(area.id)}
                  />
                  {area.name}
                </label>
              ))}
            </div>
          </div>
          <div className={styles.card}>
            <h2 className={styles.categoryTitle}>Locations</h2>
            <ul className={styles.itemList}>
              {locations.map((location) => (
                <li key={location.id} className={styles.listItem}>
                  <span className={styles.listItemName}>
                    {location.location_name}
                  </span>
                  <div className={styles.buttonContainer}>
                    <button
                      onClick={() => setEditingLocation(location)}
                      className={styles.editButton}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteLocation(location.id)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {editingLocation && (
        <EditLocationModal
          location={editingLocation}
          storageAreas={storageAreas}
          onClose={() => setEditingLocation(null)}
          onSave={async (id, locationName, storageAreaIds) => {
            await fetch("/api/locations", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id, locationName, storageAreaIds }),
            });
            setEditingLocation(null);
            refreshData();
          }}
        />
      )}
    </div>
  );
}
