"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { User, ItemsByStorageArea, StorageArea, Location } from "@/app/lib/definitions";

interface StoreContextType {
  itemsByStorageArea: ItemsByStorageArea;
  storageAreas: StorageArea[];
  locations: Location[];
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
    locations: Location[];
    user: User | null;
  };
}) {
  const [itemsByStorageArea, setItemsByStorageArea] = useState<ItemsByStorageArea>(initialData.itemsByStorageArea);
  const [storageAreas, setStorageAreas] = useState<StorageArea[]>(initialData.storageAreas);
  const [locations, setLocations] = useState<Location[]>(initialData.locations);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(initialData.user);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const refreshData = async () => {
    setLoading(true);
    const [itemsRes, storageAreasRes, locationsRes] = await Promise.all([
      fetch("/api/items"),
      fetch("/api/storage-areas"),
      fetch("/api/locations"),
    ]);

    const [itemsData, storageAreasData, locationsData] = await Promise.all([
      itemsRes.json(),
      storageAreasRes.json(),
      locationsRes.json(),
    ]);

    setItemsByStorageArea(itemsData);
    setStorageAreas(storageAreasData);
    setLocations(locationsData);
    setLoading(false);
  };

  return (
    <StoreContext.Provider
      value={{
        itemsByStorageArea,
        storageAreas,
        locations,
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
