"use client";

import AddItemForm from "./components/AddItemForm";
import InventoryList from "./components/InventoryList";
import ManageGroups from "./components/ManageGroups";
import ManageStorageAreas from "./components/ManageStorageAreas";
import { useStore } from "./components/StoreProvider";
import styles from "./page.module.css";

export default function Home() {
  const { itemsByStorageArea } = useStore();

  return (
    <main className={styles.container}>
      <div className={styles.grid}>
        <div>
          <AddItemForm />
          <InventoryList itemsByStorageArea={itemsByStorageArea} />
        </div>
        <div>
          <ManageStorageAreas />
          <ManageGroups />
        </div>
      </div>
    </main>
  );
}
