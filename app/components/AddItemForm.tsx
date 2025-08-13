"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useStore } from "./StoreProvider";

interface StorageArea {
  id: string;
  name: string;
}

interface Group {
  id: string;
  group_name: string;
  storage_area_ids: string[];
}

interface AddItemFormProps {
  storageAreas: StorageArea[];
  groups: Group[];
}

export default function AddItemForm({ storageAreas, groups }: AddItemFormProps) {
  const router = useRouter();
  const { refreshData } = useStore();
  const [selectedStorageArea, setSelectedStorageArea] = useState<string>('');

  const filteredGroups = useMemo(() => {
    if (!selectedStorageArea) {
      return [];
    }
    return groups.filter(group =>
      Array.isArray(group.storage_area_ids) && group.storage_area_ids.includes(selectedStorageArea)
    );
  }, [selectedStorageArea, groups]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemName: data["item-name"],
        quantity: data.quantity,
        dateAdded: data["date-put-in-storage"],
        expiryDate: data["expiration-date"],
        barcode: data.barcode,
        storageAreaId: data["storage-area"],
        groupId: data.group,
      }),
    });

    router.refresh();
    refreshData();
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Add New Item</h2>
      <p className="mb-4 text-gray-600">Add a new food item to your freezer inventory.</p>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="item-name" className="block text-sm font-medium text-gray-700">
            Item Name
          </label>
          <input
            type="text"
            name="item-name"
            id="item-name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
            placeholder="e.g., Frozen Corn"
            required
          />
        </div>
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
            Quantity
          </label>
          <input
            type="number"
            name="quantity"
            id="quantity"
            defaultValue="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="date-put-in-storage" className="block text-sm font-medium text-gray-700">
            Date Put in Storage
          </label>
          <input
            type="date"
            name="date-put-in-storage"
            id="date-put-in-storage"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="expiration-date" className="block text-sm font-medium text-gray-700">
            Expiration Date (Optional)
          </label>
          <input
            type="date"
            name="expiration-date"
            id="expiration-date"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="barcode" className="block text-sm font-medium text-gray-700">
            Barcode (Optional)
          </label>
          <input
            type="text"
            name="barcode"
            id="barcode"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
            placeholder="e.g., 01234567890"
          />
        </div>
        <div>
          <label htmlFor="storage-area" className="block text-sm font-medium text-gray-700">
            Storage Area
          </label>
          <select
            id="storage-area"
            name="storage-area"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
            required
            value={selectedStorageArea}
            onChange={(e) => setSelectedStorageArea(e.target.value)}
          >
            <option value="">Select a storage area</option>
            {storageAreas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="group" className="block text-sm font-medium text-gray-700">
            Group (Optional)
          </label>
          <select
            id="group"
            name="group"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
            disabled={!selectedStorageArea}
          >
            <option value="">Select a group</option>
            {filteredGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.group_name}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-gray-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Add Item
          </button>
        </div>
      </form>
    </div>
  );
}
