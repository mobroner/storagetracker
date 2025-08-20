"use client";

import { useState } from "react";
import styles from "./EditModal.module.css";

interface Location {
  id: string;
  location_name: string;
  storage_area_ids: string[];
}

interface StorageArea {
  id: string;
  name: string;
}

interface EditLocationModalProps {
  location: Location;
  storageAreas: StorageArea[];
  onClose: () => void;
  onSave: (id: string, locationName: string, storageAreaIds: string[]) => void;
}

export default function EditLocationModal({
  location,
  storageAreas,
  onClose,
  onSave,
}: EditLocationModalProps) {
  const [locationName, setLocationName] = useState(location.location_name);
  const [selectedStorageAreaIds, setSelectedStorageAreaIds] = useState(
    location.storage_area_ids.filter((id) => id !== null) || []
  );

  function handleSave() {
    onSave(location.id, locationName, selectedStorageAreaIds);
  }

  function handleCheckboxChange(storageAreaId: string) {
    setSelectedStorageAreaIds((prev) =>
      prev.includes(storageAreaId)
        ? prev.filter((id) => id !== storageAreaId)
        : [...prev, storageAreaId]
    );
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.title}>Edit Location</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className={styles.modalBody}>
          <input
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <div className="mt-4">
            <p className="font-medium">Select Storage Areas:</p>
            <div className="flex flex-wrap">
              {storageAreas.map((area) => (
                <label key={area.id} className="mr-4">
                  <input
                    type="checkbox"
                    value={area.id}
                    checked={selectedStorageAreaIds.includes(area.id)}
                    onChange={() => handleCheckboxChange(area.id)}
                    className="mr-2"
                  />
                  {area.name}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.footer}>
          <button
            onClick={onClose}
            className={`${styles.button} ${styles.cancelButton}`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`${styles.button} ${styles.saveButton}`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
