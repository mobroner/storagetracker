"use client";

import { useState } from "react";

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
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  function handleSelect() {
    if (selectedGroupId) {
      onSelect(selectedGroupId);
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-25 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Select a Group</h2>
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
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="mr-2 px-4 py-2 bg-gray-200 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedGroupId}
            className="px-4 py-2 bg-gray-800 text-white rounded-md disabled:bg-gray-400"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
