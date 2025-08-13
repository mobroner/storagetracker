"use client";

import AddItemForm from "./components/AddItemForm";
import InventoryList from "./components/InventoryList";
import ManageGroups from "./components/ManageGroups";
import ManageStorageAreas from "./components/ManageStorageAreas";
import { useStore } from "./components/StoreProvider";

export default function Home() {
  const { itemsByStorageArea, storageAreas, groups } = useStore();

  return (
    <main className="container mx-auto p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <AddItemForm storageAreas={storageAreas} groups={groups} />
          <InventoryList itemsByStorageArea={itemsByStorageArea} />
        </div>
        <div>
          <ManageStorageAreas showEdit={false} />
          <ManageGroups showEdit={false} />
        </div>
      </div>
    </main>
  );
}
