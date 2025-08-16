"use client";

import { useState } from "react";
import styles from "./Modal.module.css";

interface StorageArea {
  id: string;
  name: string;
}

interface EditStorageAreaModalProps {
  area: StorageArea;
  onClose: () => void;
  onSave: (id: string, name: string) => void;
}

export default function EditStorageAreaModal({
  area,
  onClose,
  onSave,
}: EditStorageAreaModalProps) {
  const [name, setName] = useState(area.name);

  function handleSave() {
    onSave(area.id, name);
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Edit Storage Area</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className={styles.content}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
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
