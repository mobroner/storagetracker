"use client";

import { useState } from "react";

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
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Edit Storage Area</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="mr-2 px-4 py-2 bg-gray-200 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-gray-800 text-white rounded-md"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
