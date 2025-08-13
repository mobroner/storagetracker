"use client";

import { useState } from "react";

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
    group.storage_area_ids || []
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
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Edit Group</h2>
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
