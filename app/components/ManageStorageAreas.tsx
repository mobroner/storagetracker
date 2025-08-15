"use client";

import { useState } from "react";
import { useStore } from "./StoreProvider";
import EditStorageAreaModal from "./EditStorageAreaModal";
import styles from "./ManageStorageAreas.module.css";

export default function ManageStorageAreas() {
  const { storageAreas, refreshData } = useStore();
  const [newStorageArea, setNewStorageArea] = useState("");
  const [editingStorageArea, setEditingStorageArea] = useState(null);

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
            {area.name}
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
