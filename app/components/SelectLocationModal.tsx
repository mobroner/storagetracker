"use client";

import { useState } from "react";
import styles from "./Modal.module.css";

interface Location {
  id: string;
  location_name: string;
}

interface SelectLocationModalProps {
  locations: Location[];
  onClose: () => void;
  onSelect: (locationId: string) => void;
}

export default function SelectLocationModal({
  locations,
  onClose,
  onSelect,
}: SelectLocationModalProps) {
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");

  function handleSelect() {
    if (selectedLocationId) {
      onSelect(selectedLocationId);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Select a Location</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className={styles.content}>
          <select
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select a location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.location_name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.footer}>
          <button
            onClick={onClose}
            className={`${styles.button} ${styles.cancelButton}`}
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedLocationId}
            className={`${styles.button} ${styles.saveButton}`}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
