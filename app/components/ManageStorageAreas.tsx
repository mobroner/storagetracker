"use client";

import { useState } from "react";
import { useStore } from "./StoreProvider";
import EditStorageAreaModal from "./EditStorageAreaModal";
import stylesDefault from "./Management.module.css";
import stylesFrontPage from "./FrontPageManagement.module.css";
import { StorageArea } from "@/app/lib/definitions";

interface ManageStorageAreasProps {
  variant?: 'default' | 'front-page';
}

export default function ManageStorageAreas({ variant = 'default' }: ManageStorageAreasProps) {
  const styles = variant === 'front-page' ? stylesFrontPage : stylesDefault;
  const { storageAreas, refreshData } = useStore();
  const [newStorageArea, setNewStorageArea] = useState("");
  const [editingStorageArea, setEditingStorageArea] = useState<StorageArea | null>(null);

  async function addStorageArea(e: React.FormEvent) {
    e.preventDefault();
    if (newStorageArea.trim() === "") return;
    await fetch("/api/storage-areas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newStorageArea }),
    });
    setNewStorageArea("");
    refreshData();
  }

  async function deleteStorageArea(id: string) {
    if (!confirm("Are you sure you want to delete this storage area?")) return;
    await fetch("/api/storage-areas", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    refreshData();
  }

  return (
    <div className={styles.container}>
      {variant === 'front-page' ? (
        <h2 className={styles.title}>Manage Storage Areas</h2>
      ) : (
        <h1 className={styles.title}>Manage Storage Areas</h1>
      )}
      <form className={styles.addForm} onSubmit={addStorageArea}>
        <input
          type="text"
          value={newStorageArea}
          onChange={(e) => setNewStorageArea(e.target.value)}
          placeholder={variant === 'front-page' ? "New storage area" : "Enter storage area name..."}
          className={styles.input}
          required
        />
        <button type="submit" className={styles.addButton}>
          {variant === 'front-page' ? "Add" : "Add Storage Area"}
        </button>
      </form>
      {variant === 'front-page' ? (
        <ul className={styles.list}>
          {storageAreas.map((area) => (
            <li key={area.id} className={styles.listItem}>
              <span className={styles.listItemName}>{area.name}</span>
              <button
                onClick={() => setEditingStorageArea(area)}
                className={styles.editButton}
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.list}>
          <div className={styles.card}>
            <ul className={styles.itemList}>
              {storageAreas.map((area) => (
                <li key={area.id} className={styles.listItem}>
                  <span className={styles.listItemName}>{area.name}</span>
                  <div className={styles.buttonContainer}>
                    <button
                      onClick={() => setEditingStorageArea(area)}
                      className={styles.editButton}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteStorageArea(area.id)}
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
