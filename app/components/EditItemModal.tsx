"use client";

import { useState, useEffect } from "react";
import { useStore } from "./StoreProvider";
import styles from "./AddItemForm.module.css";
import modalStyles from "./EditModal.module.css";
import { Item, Location, Subcategory, Category, StorageArea } from "@/app/lib/definitions";

interface EditItemModalProps {
  item: Item;
  onClose: () => void;
  onSave: () => void;
}

export default function EditItemModal({ item, onClose, onSave }: EditItemModalProps) {
  const { storageAreas, locations, categories, subcategories } = useStore();
  const [formData, setFormData] = useState({
    itemName: item.item_name,
    quantity: String(item.quantity),
    dateAdded: new Date(item.date_added).toISOString().split("T")[0],
    expiryDate: item.expiry_date ? new Date(item.expiry_date).toISOString().split("T")[0] : "",
    storageAreaId: String(item.storage_area_id),
    locationId: item.location_id ? String(item.location_id) : "",
    categoryId: item.category_id ? String(item.category_id) : "",
    subcategoryId: item.subcategory_id ? String(item.subcategory_id) : "",
  });

  // Memoized filtered arrays
  const filteredLocations = formData.storageAreaId
    ? locations.filter(
        (location) =>
          location.storage_area_ids &&
          location.storage_area_ids.includes(formData.storageAreaId)
      )
    : [];

  const filteredSubcategories = formData.categoryId
    ? subcategories.filter(
        (subcategory) => String(subcategory.category_id) === formData.categoryId
      )
    : [];

  // Initial validation and data loading
  useEffect(() => {
    const validateInitialData = () => {
      const updates: Partial<typeof formData> = {};
      let needsUpdate = false;

      // Validate location
      if (formData.locationId && formData.storageAreaId) {
        const hasValidLocation = locations.some(
          (loc) => 
            String(loc.id) === formData.locationId && 
            loc.storage_area_ids?.includes(formData.storageAreaId)
        );
        if (!hasValidLocation) {
          updates.locationId = "";
          needsUpdate = true;
        }
      }

      // Validate subcategory
      if (formData.subcategoryId && formData.categoryId) {
        const hasValidSubcategory = subcategories.some(
          (sub) => 
            String(sub.id) === formData.subcategoryId && 
            String(sub.category_id) === formData.categoryId
        );
        if (!hasValidSubcategory) {
          updates.subcategoryId = "";
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        setFormData(prev => ({ ...prev, ...updates }));
      }
    };

    validateInitialData();
  }, [
    formData.locationId,
    formData.storageAreaId,
    formData.categoryId,
    formData.subcategoryId,
    locations,
    subcategories
  ]);

  // Validate relationships when parent IDs change
  useEffect(() => {
    if (formData.storageAreaId) {
      const hasValidLocation = locations.some(
        (loc) => 
          String(loc.id) === formData.locationId && 
          loc.storage_area_ids?.includes(formData.storageAreaId)
      );
      if (formData.locationId && !hasValidLocation) {
        setFormData((prev) => ({ ...prev, locationId: "" }));
      }
    }
  }, [formData.storageAreaId, formData.locationId, locations]);

  useEffect(() => {
    if (formData.categoryId) {
      const hasValidSubcategory = subcategories.some(
        (sub) => 
          String(sub.id) === formData.subcategoryId && 
          String(sub.category_id) === formData.categoryId
      );
      if (formData.subcategoryId && !hasValidSubcategory) {
        setFormData((prev) => ({ ...prev, subcategoryId: "" }));
      }
    }
  }, [formData.categoryId, formData.subcategoryId, subcategories]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submissionData = {
      id: item.id,
      itemName: formData.itemName,
      quantity: parseInt(formData.quantity, 10),
      dateAdded: formData.dateAdded,
      expiryDate: formData.expiryDate || null,
      storageAreaId: parseInt(formData.storageAreaId, 10),
      locationId: formData.locationId ? parseInt(formData.locationId, 10) : null,
      categoryId: formData.categoryId ? parseInt(formData.categoryId, 10) : null,
      subcategoryId: formData.subcategoryId ? parseInt(formData.subcategoryId, 10) : null,
    };

    await fetch("/api/items", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submissionData),
    });

    onSave();
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value };
      
      // Reset dependent fields when parent field changes
      if (name === "categoryId") {
        // Always reset subcategory when category changes
        newFormData.subcategoryId = "";
        // Ensure proper string type for categoryId
        newFormData.categoryId = value ? String(value) : "";
      } else if (name === "storageAreaId") {
        // Always reset location when storage area changes
        newFormData.locationId = "";
      }
      
      return newFormData;
    });
  }

  return (
    <div className={modalStyles.modalOverlay}>
      <div className={modalStyles.modal}>
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.title}>Edit Item</h2>
          <button onClick={onClose} className={modalStyles.closeButton}>&times;</button>
        </div>
        <div className={modalStyles.modalBody}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div>
              <label htmlFor="itemName" className={styles.label}>Item Name</label>
              <input
                type="text"
                name="itemName"
                id="itemName"
                className={styles.input}
                required
                value={formData.itemName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="quantity" className={styles.label}>Quantity</label>
              <input
                type="number"
                name="quantity"
                id="quantity"
                className={styles.input}
                required
                value={formData.quantity}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="dateAdded" className={styles.label}>Date Put in Storage</label>
              <input
                type="date"
                name="dateAdded"
                id="dateAdded"
                className={styles.input}
                required
                value={formData.dateAdded}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="expiryDate" className={styles.label}>Expiration Date (Optional)</label>
              <input
                type="date"
                name="expiryDate"
                id="expiryDate"
                className={styles.input}
                value={formData.expiryDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="storageAreaId" className={styles.label}>Storage Area</label>
              <select
                id="storageAreaId"
                name="storageAreaId"
                className={styles.select}
                required
                value={formData.storageAreaId}
                onChange={handleChange}
              >
                <option value="">Select a storage area</option>
                {storageAreas.map((area: StorageArea) => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="locationId" className={styles.label}>Location (Optional)</label>
              <select
                id="locationId"
                name="locationId"
                className={styles.select}
                disabled={!formData.storageAreaId}
                value={formData.locationId}
                onChange={handleChange}
              >
                <option value="">Select a location</option>
                {filteredLocations.map((location: Location) => (
                  <option key={location.id} value={location.id}>{location.location_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="categoryId" className={styles.label}>Category (Optional)</label>
              <select
                id="categoryId"
                name="categoryId"
                className={styles.select}
                value={formData.categoryId}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                {[...categories]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((category: Category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
              </select>
            </div>
            <div>
              <label htmlFor="subcategoryId" className={styles.label}>Subcategory (Optional)</label>
              <select
                id="subcategoryId"
                name="subcategoryId"
                className={styles.select}
                disabled={!formData.categoryId}
                value={formData.subcategoryId}
                onChange={handleChange}
              >
                <option value="">Select a subcategory</option>
                {filteredSubcategories
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((subcategory: Subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
                  ))}
              </select>
            </div>
            <div className={styles.buttonContainer}>
              <button type="submit" className={styles.button}>Update Item</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
