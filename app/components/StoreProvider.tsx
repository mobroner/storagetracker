"use client";

import { createContext, useContext, useState } from "react";
import { User, ItemsByStorageArea, StorageArea, Group } from "@/app/lib/definitions";

interface StoreContextType {
  itemsByStorageArea: ItemsByStorageArea;
  storageAreas: StorageArea[];
  groups: Group[];
  loading: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  refreshData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}

export function StoreProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData: {
    itemsByStorageArea: ItemsByStorageArea;
    storageAreas: StorageArea[];
    groups: Group[];
    user: User | null;
  };
}) {
  const [itemsByStorageArea, setItemsByStorageArea] = useState<ItemsByStorageArea>(initialData.itemsByStorageArea);
  const [storageAreas, setStorageAreas] = useState<StorageArea[]>(initialData.storageAreas);
  const [groups, setGroups] = useState<Group[]>(initialData.groups);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(initialData.user);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const refreshData = async () => {
    setLoading(true);
    const [itemsRes, storageAreasRes, groupsRes] = await Promise.all([
      fetch("/api/items"),
      fetch("/api/storage-areas"),
      fetch("/api/groups"),
    ]);

    const [itemsData, storageAreasData, groupsData] = await Promise.all([
      itemsRes.json(),
      storageAreasRes.json(),
      groupsRes.json(),
    ]);

    setItemsByStorageArea(itemsData);
    setStorageAreas(storageAreasData);
    setGroups(groupsData);
    setLoading(false);
  };

  return (
    <StoreContext.Provider
      value={{
        itemsByStorageArea,
        storageAreas,
        groups,
        loading,
        user,
        login,
        logout,
        refreshData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
