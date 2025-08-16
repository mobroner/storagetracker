"use client";

import { useState } from "react";
import styles from "./Modal.module.css";

interface Group {
  id: string;
  group_name: string;
}

interface SelectGroupModalProps {
  groups: Group[];
  onClose: () => void;
  onSelect: (groupId: string) => void;
}

export default function SelectGroupModal({
  groups,
  onClose,
  onSelect,
}: SelectGroupModalProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  function handleSelect() {
    if (selectedGroupId) {
      onSelect(selectedGroupId);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Select a Group</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className={styles.content}>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select a group</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.group_name}
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
            disabled={!selectedGroupId}
            className={`${styles.button} ${styles.saveButton}`}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
