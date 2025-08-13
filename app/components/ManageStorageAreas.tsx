"use client";

import { useState } from "react";
import { useStore } from "@/app/components/StoreProvider";
import EditStorageAreaModal from "./EditStorageAreaModal";

interface StorageArea {
  id: string;
  name: string;
}

interface ManageStorageAreasProps {
  showEdit?: boolean;
}

export default function ManageStorageAreas({ showEdit = true }: ManageStorageAreasProps) {
  const { storageAreas, refreshData } = useStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState<StorageArea | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("storage-area-name") as string;

    await fetch("/api/storage-areas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    refreshData();
    event.currentTarget.reset();
  }

  function handleEditClick(area: StorageArea) {
    setSelectedArea(area);
    setShowEditModal(true);
  }

  async function handleSave(id: string, name: string) {
    await fetch("/api/storage-areas", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name }),
    });

    setShowEditModal(false);
    setSelectedArea(null);
    refreshData();
  }

  async function handleDelete(id: string) {
    if (window.confirm("Are you sure you want to delete this storage area?")) {
      await fetch("/api/storage-areas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      refreshData();
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Manage Storage Areas</h2>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          name="storage-area-name"
          placeholder="New storage area"
          className="flex-grow mr-2 p-2 border border-gray-300 rounded-md"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-gray-800 text-white rounded-md"
        >
          Add
        </button>
      </form>
      <ul className="mt-4">
        {storageAreas.map((area: StorageArea) => (
          <li key={area.id} className="py-2 border-b flex justify-between items-center">
            <span>{area.name}</span>
            {showEdit && (
              <div className="flex">
                <button
                  onClick={() => handleEditClick(area)}
                  className="px-3 py-1 bg-gray-200 text-sm rounded-md mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(area.id)}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded-md"
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {showEditModal && selectedArea && (
        <EditStorageAreaModal
          area={selectedArea}
          onClose={() => setShowEditModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
