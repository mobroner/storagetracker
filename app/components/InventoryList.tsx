"use client";

import { useState } from "react";
import { useStore } from "./StoreProvider";
import SelectGroupModal from "./SelectGroupModal";
import { Item, ItemsByStorageArea } from "@/app/lib/definitions";

interface InventoryListProps {
  itemsByStorageArea: ItemsByStorageArea;
}

export default function InventoryList({ itemsByStorageArea }: InventoryListProps) {
  const { groups, refreshData } = useStore();
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>(
    Object.keys(itemsByStorageArea).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as { [key: string]: boolean })
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  async function updateQuantity(itemId: string, newQuantity: number) {
    const allItems: Item[] = Object.values(itemsByStorageArea).flatMap((groups) => Object.values(groups).flat());
    const item = allItems.find((item: Item) => item.id === itemId);

    if (item && item.quantity === 0 && newQuantity > 0) {
      setSelectedItemId(itemId);
      setShowModal(true);
    } else if (newQuantity >= 0) {
      await fetch("/api/items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      });
      refreshData();
    }
  }

  async function handleSelectGroup(groupId: string) {
    if (selectedItemId) {
      await fetch("/api/items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: selectedItemId, quantity: 1, groupId }),
      });
      setShowModal(false);
      setSelectedItemId(null);
      refreshData();
    }
  }

  async function deleteItem(itemId: string) {
    await fetch("/api/items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    refreshData();
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      {showModal && (
        <SelectGroupModal
          groups={groups}
          onClose={() => setShowModal(false)}
          onSelect={handleSelectGroup}
        />
      )}
      {Object.entries(itemsByStorageArea).map(([storageArea, groups]) => {
        const hasItemsInStorageArea = Object.values(groups).some((items: Item[]) => items.length > 0);

        if (!hasItemsInStorageArea) {
          return null;
        }

        return (
          <div key={storageArea} className="mb-8 border-2 border-gray-300 rounded-lg p-4">
            <h3
              className="text-xl font-bold mb-4 cursor-pointer text-gray-700 flex items-center"
              onClick={() => toggleSection(storageArea)}
            >
              <svg
                className={`w-6 h-6 mr-2 transform transition-transform ${
                  openSections[storageArea] ? 'rotate-90' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
              {storageArea}
            </h3>
            {openSections[storageArea] &&
              Object.entries(groups).map(([groupName, items]) => {
                if (!Array.isArray(items) || items.length === 0) {
                  return null;
                }
                return (
                  <div key={groupName} className="mb-8">
                    <h4 className="text-lg font-bold mb-4 text-gray-600">{groupName === 'null' ? 'Uncategorized' : groupName}</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white rounded-lg">
                        <thead className="bg-yellow-50">
                          <tr>
                            <th className="py-2 px-4 border-b text-left">Item</th>
                            <th className="py-2 px-4 border-b text-center">Quantity</th>
                            <th className="py-2 px-4 border-b text-center">Added Date</th>
                            <th className="py-2 px-4 border-b text-center">Expires</th>
                            <th className="py-2 px-4 border-b text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item: Item) => (
                            <tr key={item.id}>
                              <td className="py-2 px-4 border-b">{item.item_name}</td>
                              <td className="py-2 px-4 border-b">
                                <div className="flex items-center justify-center">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="px-2 py-1 bg-gray-200 rounded-l-md"
                                  >
                                    -
                                  </button>
                                  <span className="px-4">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="px-2 py-1 bg-gray-200 rounded-r-md"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="py-2 px-4 border-b text-center">{new Date(item.date_added).toLocaleDateString()}</td>
                              <td className="py-2 px-4 border-b text-center">{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : "N/A"}</td>
                              <td className="py-2 px-4 border-b text-center">
                                <button className="text-gray-500 hover:text-gray-700 mr-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                </button>
                                <button
                                  onClick={() => deleteItem(item.id)}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
  );
}
