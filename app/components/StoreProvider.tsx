"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, ItemsByStorageArea, StorageArea, Location, Category, Subcategory, Tag } from "@/app/lib/definitions";

interface StoreContextType {
  itemsByStorageArea: ItemsByStorageArea;
  storageAreas: StorageArea[];
  locations: Location[];
  categories: Category[];
  subcategories: Subcategory[];
  tags: Tag[];
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
    categories: Category[];
    subcategories: Subcategory[];
    tags: Tag[];
  };
}) {
  const [itemsByStorageArea, setItemsByStorageArea] = useState<ItemsByStorageArea>(initialData.itemsByStorageArea);
  const [storageAreas, setStorageAreas] = useState<StorageArea[]>(initialData.storageAreas);
  const [locations, setLocations] = useState<Location[]>(initialData.locations);
  const [categories, setCategories] = useState<Category[]>(initialData.categories);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(initialData.subcategories);
  const [tags, setTags] = useState<Tag[]>(initialData.tags);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(initialData.user);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const refreshData = useCallback(async () => {
    setLoading(true);
    const [itemsRes, storageAreasRes, locationsRes, categoriesRes, subcategoriesRes, tagsRes] = await Promise.all([
      fetch("/api/items"),
      fetch("/api/storage-areas"),
      fetch("/api/locations"),
      fetch("/api/categories"),
      fetch("/api/subcategories"),
      fetch("/api/tags"),
    ]);

    const [itemsData, storageAreasData, locationsData, categoriesData, subcategoriesData, tagsData] = await Promise.all([
      itemsRes.json(),
      storageAreasRes.json(),
      locationsRes.json(),
      categoriesRes.json(),
      subcategoriesRes.json(),
      tagsRes.json(),
    ]);

    setItemsByStorageArea(itemsData);
    setStorageAreas(storageAreasData);
    setLocations(locationsData);
    setCategories(categoriesData);
    setSubcategories(subcategoriesData);
    setTags(tagsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  return (
    <StoreContext.Provider
      value={{
        itemsByStorageArea,
        storageAreas,
        locations,
        categories,
        subcategories,
        tags,
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
