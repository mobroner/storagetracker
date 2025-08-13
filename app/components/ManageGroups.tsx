"use client";

import { useState } from "react";
import { useStore } from "@/app/components/StoreProvider";
import EditGroupModal from "./EditGroupModal";

interface StorageArea {
  id: string;
  name: string;
}

interface Group {
  id: string;
  group_name: string;
  storage_area_ids: string[];
}

interface ManageGroupsProps {
  showEdit?: boolean;
}

export default function ManageGroups({ showEdit = true }: ManageGroupsProps) {
  const { groups, storageAreas, refreshData } = useStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const groupName = formData.get("group-name") as string;
    const storageAreaIds = formData.getAll("storage-area-ids") as string[];

    await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupName, storageAreaIds }),
    });

    refreshData();
    event.currentTarget.reset();
  }

  function handleEditClick(group: Group) {
    setSelectedGroup(group);
    setShowEditModal(true);
  }

  async function handleSave(id: string, groupName: string, storageAreaIds: string[]) {
    await fetch("/api/groups", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, groupName, storageAreaIds }),
    });

    setShowEditModal(false);
    setSelectedGroup(null);
    refreshData();
  }

  async function handleDelete(id: string) {
    if (window.confirm("Are you sure you want to delete this group?")) {
      await fetch("/api/groups", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      refreshData();
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Manage Groups</h2>
      <form onSubmit={handleSubmit}>
        <div className="flex">
          <input
            type="text"
            name="group-name"
            placeholder="New group name"
            className="flex-grow mr-2 p-2 border border-gray-300 rounded-md"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gray-800 text-white rounded-md"
          >
            Add
          </button>
        </div>
        <div className="mt-4">
          <p className="font-medium">Select Storage Areas:</p>
          <div className="flex flex-wrap">
            {storageAreas.map((area: StorageArea) => (
              <label key={area.id} className="mr-4">
                <input
                  type="checkbox"
                  name="storage-area-ids"
                  value={area.id}
                  className="mr-2"
                />
                {area.name}
              </label>
            ))}
          </div>
        </div>
      </form>
      <ul className="mt-4">
        {groups.map((group: Group) => (
          <li key={group.id} className="py-2 border-b">
            <div className="flex justify-between items-center">
              <span>{group.group_name}</span>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-4">
                  {group.storage_area_ids &&
                    group.storage_area_ids
                      .map(id => storageAreas.find(sa => sa.id === id)?.name)
                      .filter(Boolean)
                      .join(', ')}
                </span>
                {showEdit && (
                  <div className="flex">
                    <button
                      onClick={() => handleEditClick(group)}
                      className="px-3 py-1 bg-gray-200 text-sm rounded-md mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(group.id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded-md"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      {showEditModal && selectedGroup && (
        <EditGroupModal
          group={selectedGroup}
          storageAreas={storageAreas}
          onClose={() => setShowEditModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
