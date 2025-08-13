"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface StoreContextType {
  itemsByStorageArea: any;
  storageAreas: any[];
  groups: any[];
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
    itemsByStorageArea: any;
    storageAreas: any[];
    groups: any[];
    user: User | null;
  };
}) {
  const [itemsByStorageArea, setItemsByStorageArea] = useState(initialData.itemsByStorageArea);
  const [storageAreas, setStorageAreas] = useState(initialData.storageAreas);
  const [groups, setGroups] = useState(initialData.groups);
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
