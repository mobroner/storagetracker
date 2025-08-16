"use client";

import { useState } from "react";
import { useStore } from "./StoreProvider";
import EditStorageAreaModal from "./EditStorageAreaModal";
import styles from "./ManageStorageAreas.module.css";
import { StorageArea } from "@/app/lib/definitions";

export default function ManageStorageAreas() {
  const { storageAreas, refreshData } = useStore();
  const [newStorageArea, setNewStorageArea] = useState("");
  const [editingStorageArea, setEditingStorageArea] = useState<StorageArea | null>(null);

  async function addStorageArea() {
    if (newStorageArea.trim() === "") return;
    await fetch("/api/storage-areas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newStorageArea }),
    });
    setNewStorageArea("");
    refreshData();
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Manage Storage Areas</h2>
      <div className={styles.form}>
        <input
          type="text"
          value={newStorageArea}
          onChange={(e) => setNewStorageArea(e.target.value)}
          placeholder="New storage area"
          className={styles.input}
        />
        <button onClick={addStorageArea} className={styles.button}>
          Add
        </button>
      </div>
      <ul className={styles.list}>
        {storageAreas.map((area) => (
          <li key={area.id} className={styles.listItem}>
            <span>{area.name}</span>
            <button onClick={() => setEditingStorageArea(area)} className={styles.editButton}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
      {editingStorageArea && (
        <EditStorageAreaModal
          area={editingStorageArea}
          onClose={() => setEditingStorageArea(null)}
          onSave={async (id, name) => {
            await fetch("/api/storage-areas", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id, name }),
            });
            setEditingStorageArea(null);
            refreshData();
          }}
        />
      )}
    </div>
  );
}
