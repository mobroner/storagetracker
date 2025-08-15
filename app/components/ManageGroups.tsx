"use client";

import { useState } from "react";
import { useStore } from "./StoreProvider";
import EditGroupModal from "./EditGroupModal";
import styles from "./ManageGroups.module.css";

export default function ManageGroups() {
  const { storageAreas, groups, refreshData } = useStore();
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedStorageAreas, setSelectedStorageAreas] = useState<string[]>([]);
  const [editingGroup, setEditingGroup] = useState(null);

  async function addGroup() {
    if (newGroupName.trim() === "") return;
    await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupName: newGroupName,
        storageAreaIds: selectedStorageAreas,
      }),
    });
    setNewGroupName("");
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
      <h2 className={styles.title}>Manage Groups</h2>
      <div className={styles.form}>
        <input
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="New group name"
          className={styles.input}
        />
        <button onClick={addGroup} className={styles.button}>
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
        {groups.map((group) => (
          <li key={group.id} className={styles.listItem}>
            <span>{group.group_name}</span>
            <span>
              {group.storage_area_ids
                .map(
                  (id) =>
                    storageAreas.find((area) => area.id === id)?.name || ""
                )
                .join(", ")}
            </span>
          </li>
        ))}
      </ul>
      {editingGroup && (
        <EditGroupModal
          group={editingGroup}
          storageAreas={storageAreas}
          onClose={() => setEditingGroup(null)}
          onSave={async (id, groupName, storageAreaIds) => {
            await fetch("/api/groups", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id, groupName, storageAreaIds }),
            });
            setEditingGroup(null);
            refreshData();
          }}
        />
      )}
    </div>
  );
}
