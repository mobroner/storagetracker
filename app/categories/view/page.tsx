"use client";

import { useState, useMemo, useEffect } from "react";
import { useStore } from "../../components/StoreProvider";
import styles from "./page.module.css";
import { Item } from "../../lib/definitions";

export default function CategoryView() {
  const { categories, subcategories, itemsByStorageArea, storageAreas, locations, refreshData } = useStore();
  
  useEffect(() => {
    // Ensure we have fresh data when the component mounts
    refreshData();
  }, []);

  // Create maps for category and subcategory lookups
  const { categoryMap, subcategoryMap } = useMemo(() => {
    const catMap = new Map();
    const subcatMap = new Map();

    categories.forEach(cat => {
      const idString = String(cat.id);
      catMap.set(idString, cat.name);
    });

    subcategories.forEach(subcat => {
      const idString = String(subcat.id);
      subcatMap.set(idString, subcat.name);
    });

    return { categoryMap: catMap, subcategoryMap: subcatMap };
  }, [categories, subcategories]);

  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const newSections: { [key: string]: boolean } = {};
    categories.forEach(category => {
      newSections[category.id] = true;
    });
    setOpenSections(newSections);
  }, [categories]);

  const toggleSection = (categoryId: string) => {
    setOpenSections(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const getLocationName = (item: Item) => {
    const storageArea = storageAreas.find(sa => sa.id === item.storage_area_id);
    if (!storageArea) {
      console.log('Storage area not found for ID:', item.storage_area_id);
      console.log('Available storage areas:', storageAreas);
      return 'Unknown Storage';
    }
    
    const location = item.location_id ? locations.find(l => l.id === item.location_id) : null;
    if (item.location_id && !location) {
      console.log('Location not found for ID:', item.location_id);
      console.log('Available locations:', locations);
    }

    return location ? `${storageArea.name} - ${location.location_name}` : storageArea.name;
  };

  const organizedItems = useMemo(() => {
    const allItems: Item[] = [];
    Object.values(itemsByStorageArea).forEach(locationItems => {
      Object.values(locationItems).forEach(items => {
        allItems.push(...items);
      });
    });

    console.log('Total items found:', allItems.length);
    console.log('Items detail:', allItems.map(item => ({
      name: item.item_name,
      category_id: item.category_id,
      subcategory_id: item.subcategory_id
    })));
    
    const organized: Record<string, Record<string, Item[]>> = {};

    // Initialize an 'uncategorized' category
    organized['uncategorized'] = { 'none': [] };

    allItems.forEach(item => {
      if (!item.category_id) {
        // Items without a category go to uncategorized
        organized['uncategorized']['none'].push(item);
        return;
      }
      
      if (!organized[item.category_id]) {
        organized[item.category_id] = {};
      }

      const subcategoryKey = item.subcategory_id || 'uncategorized';
      
      if (!organized[item.category_id][subcategoryKey]) {
        organized[item.category_id][subcategoryKey] = [];
      }

      organized[item.category_id][subcategoryKey].push(item);
    });

    console.log('Organized structure:', organized);
    return organized;
  }, [itemsByStorageArea]);

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');

  // Get available subcategories for the selected category
  const availableSubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    return subcategories.filter(sub => String(sub.category_id) === selectedCategory);
  }, [selectedCategory, subcategories]);

  // Filter the organized items based on selection
  const filteredItems = useMemo(() => {
    if (!selectedCategory) return organizedItems;
    
    const filtered: typeof organizedItems = {};
    if (selectedCategory in organizedItems) {
      filtered[selectedCategory] = {};
      
      if (selectedSubcategory) {
        if (selectedSubcategory in organizedItems[selectedCategory]) {
          filtered[selectedCategory][selectedSubcategory] = organizedItems[selectedCategory][selectedSubcategory];
        }
      } else {
        filtered[selectedCategory] = organizedItems[selectedCategory];
      }
    }
    return filtered;
  }, [organizedItems, selectedCategory, selectedSubcategory]);

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Inventory by Category</h1>
      
      <div className={styles.filterCard}>
        <h2>Filter Items</h2>
        <div className={styles.filterControls}>
          <div className={styles.filterGroup}>
            <label htmlFor="category-select">Category:</label>
            <select 
              id="category-select"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedSubcategory(''); // Reset subcategory when category changes
              }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="subcategory-select">Subcategory:</label>
            <select
              id="subcategory-select"
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              disabled={!selectedCategory}
            >
              <option value="">All Subcategories</option>
              {availableSubcategories.map(subcat => (
                <option key={subcat.id} value={String(subcat.id)}>
                  {subcat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.categoryList}>
        {Object.keys(filteredItems).length === 0 ? (
          <div className={styles.noItems}>
            <h3>No items found</h3>
          </div>
        ) : (
          Object.entries(filteredItems).map(([categoryId, subcategoryGroups]) => {
            let categoryName;
            if (categoryId === 'uncategorized') {
              categoryName = 'Uncategorized Items';
            } else {
              // categoryId is already a string from Object.entries()
              const name = categoryMap.get(categoryId);
              categoryName = name || `Category ${categoryId}`;
              console.log(`Looking up category ${categoryId}, found name: ${name}`);
            }

            return (
              <div key={categoryId} className={styles.categorySection}>
                <h3
                  className={`${styles.categoryHeader} ${openSections[categoryId] ? styles.open : ''}`}
                  onClick={() => toggleSection(categoryId)}
                >
                  {categoryName}
                </h3>
                {openSections[categoryId] && (
                  <div className={styles.subcategories}>
                    {Object.entries(subcategoryGroups).map(([subcategoryId, items]) => {
                      const title = subcategoryId === 'uncategorized' 
                        ? 'Uncategorized' 
                        : subcategoryMap.get(subcategoryId) || `Subcategory ${subcategoryId}`;
                      console.log(`Subcategory ${subcategoryId} has name:`, title);

                      return (
                        <div key={subcategoryId} className={styles.subcategoryGroup}>
                          <h4 className={styles.subcategoryTitle}>{title}</h4>
                          <div className={styles.itemList}>
                            <div className={`${styles.itemRow} ${styles.itemHeader}`}>
                              <div className={styles.itemCell}>Item</div>
                              <div className={styles.itemCell}>Location</div>
                              <div className={styles.itemCell}>Quantity</div>
                              <div className={styles.itemCell}>Added</div>
                              <div className={styles.itemCell}>Expires</div>
                            </div>
                            {items.map(item => (
                              <div key={item.id} className={styles.itemRow}>
                                <div className={styles.itemCell}>{item.item_name}</div>
                                <div className={styles.itemCell}>{getLocationName(item)}</div>
                                <div className={styles.itemCell}>{item.quantity}</div>
                                <div className={styles.itemCell}>
                                  {new Date(item.date_added).toLocaleDateString()}
                                </div>
                                <div className={styles.itemCell}>
                                  {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : "N/A"}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
