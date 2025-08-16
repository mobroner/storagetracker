"use client";

import { useState } from "react";
import { useStore } from "./StoreProvider";
import EditGroupModal from "./EditGroupModal";
import styles from "./ManageGroups.module.css";
import { Group } from "@/app/lib/definitions";

export default function ManageGroups() {
  const { storageAreas, groups, refreshData } = useStore();
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedStorageAreas, setSelectedStorageAreas] = useState<string[]>([]);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

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
            <div className={styles.groupInfo}>
              <span>{group.group_name}</span>
              <span className={styles.storageAreas}>
                {group.storage_area_ids
                  .map(
                    (id) =>
                      storageAreas.find((area) => area.id === id)?.name || ""
                  )
                  .join(", ")}
              </span>
            </div>
            <button onClick={() => setEditingGroup(group)} className={styles.editButton}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
              </svg>
            </button>
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
