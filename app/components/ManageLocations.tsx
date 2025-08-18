"use client";

import { useState } from "react";
import { useStore } from "./StoreProvider";
import EditLocationModal from "./EditLocationModal";
import styles from "./ManageLocations.module.css";
import { Location } from "@/app/lib/definitions";

export default function ManageLocations() {
  const { storageAreas, locations, refreshData } = useStore();
  const [newLocationName, setNewLocationName] = useState("");
  const [selectedStorageAreas, setSelectedStorageAreas] = useState<string[]>([]);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  async function addLocation() {
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

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Manage Locations</h2>
      <div className={styles.form}>
        <input
          type="text"
          value={newLocationName}
          onChange={(e) => setNewLocationName(e.target.value)}
          placeholder="New location name"
          className={styles.input}
        />
        <button onClick={addLocation} className={styles.button}>
          Add
        </button>
      </div>
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
            <div className={styles.locationInfo}>
              <div>{location.location_name}</div>
              <div className={styles.storageAreas}>
                {location.storage_area_ids
                  .map(
                    (id) =>
                      storageAreas.find((area) => area.id === id)?.name || ""
                  )
                  .join(", ")}
              </div>
            </div>
            <button onClick={() => setEditingLocation(location)} className={styles.editButton}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
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
