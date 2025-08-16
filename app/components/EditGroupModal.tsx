"use client";

import { useState } from "react";
import styles from "./Modal.module.css";

interface Group {
  id: string;
  group_name: string;
  storage_area_ids: string[];
}

interface StorageArea {
  id: string;
  name: string;
}

interface EditGroupModalProps {
  group: Group;
  storageAreas: StorageArea[];
  onClose: () => void;
  onSave: (id: string, groupName: string, storageAreaIds: string[]) => void;
}

export default function EditGroupModal({
  group,
  storageAreas,
  onClose,
  onSave,
}: EditGroupModalProps) {
  const [groupName, setGroupName] = useState(group.group_name);
  const [selectedStorageAreaIds, setSelectedStorageAreaIds] = useState(
    group.storage_area_ids.filter((id) => id !== null) || []
  );

  function handleSave() {
    onSave(group.id, groupName, selectedStorageAreaIds);
  }

  function handleCheckboxChange(storageAreaId: string) {
    setSelectedStorageAreaIds((prev) =>
      prev.includes(storageAreaId)
        ? prev.filter((id) => id !== storageAreaId)
        : [...prev, storageAreaId]
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Edit Group</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className={styles.content}>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
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
