"use client";

import { useRouter } from "next/navigation";
import { useState, forwardRef } from "react";
import { useStore } from "./StoreProvider";
import styles from "./AddItemForm.module.css";
import { Location, Subcategory } from "@/app/lib/definitions";

interface AddItemFormProps {
  filteredLocations: Location[];
  selectedStorageArea: string;
  setSelectedStorageArea: (id: string) => void;
  filteredSubcategories: Subcategory[];
  setSelectedCategory: (id: string) => void;
}

const AddItemForm = forwardRef<HTMLDivElement, AddItemFormProps>(
  (
    {
      filteredLocations,
      selectedStorageArea,
      setSelectedStorageArea,
      filteredSubcategories,
      setSelectedCategory,
    },
    ref
  ) => {
    const router = useRouter();
    const { storageAreas, categories, refreshData } = useStore();
    const [formData, setFormData] = useState({
      itemName: "",
      quantity: "1",
      dateAdded: "",
      expiryDate: "",
      storageAreaId: "",
      locationId: "",
      categoryId: "",
      subcategoryId: "",
    });

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();

      const submissionData = {
        ...formData,
        quantity: parseInt(formData.quantity, 10),
      };

      await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      setFormData({
        itemName: "",
        quantity: "1",
        dateAdded: "",
        expiryDate: "",
        storageAreaId: "",
        locationId: "",
        categoryId: "",
        subcategoryId: "",
      });
      setSelectedStorageArea("");
      router.refresh();
      refreshData();
    }

    function handleChange(
      event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) {
      const { name, value } = event.target;
      setFormData((prev) => {
        const newFormData = { ...prev, [name]: value };
        if (name === "categoryId") {
          newFormData.subcategoryId = "";
        }
        return newFormData;
      });
    }

    return (
      <div className={styles.card} ref={ref}>
        <h2 className={styles.title}>Add New Item</h2>
        <p className={styles.description}>
          Add an item to your inventory.
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label htmlFor="itemName" className={styles.label}>
              Item Name
            </label>
            <input
              type="text"
              name="itemName"
              id="itemName"
              className={styles.input}
              placeholder="e.g., Frozen Corn"
              required
              value={formData.itemName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="quantity" className={styles.label}>
              Quantity
            </label>
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
            <label htmlFor="dateAdded" className={styles.label}>
              Date Put in Storage
            </label>
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
            <label htmlFor="expiryDate" className={styles.label}>
              Expiration Date (Optional)
            </label>
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
            <label htmlFor="storageAreaId" className={styles.label}>
              Storage Area
            </label>
            <select
              id="storageAreaId"
              name="storageAreaId"
              className={styles.select}
              required
              value={formData.storageAreaId}
              onChange={(e) => {
                handleChange(e);
                setSelectedStorageArea(e.target.value);
              }}
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
            <label htmlFor="locationId" className={styles.label}>
              Location (Optional)
            </label>
            <select
              id="locationId"
              name="locationId"
              className={styles.select}
              disabled={!selectedStorageArea}
              value={formData.locationId}
              onChange={handleChange}
            >
              <option value="">Select a location</option>
              {filteredLocations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.location_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="categoryId" className={styles.label}>
              Category (Optional)
            </label>
            <select
              id="categoryId"
              name="categoryId"
              className={styles.select}
              value={formData.categoryId}
              onChange={(e) => {
                handleChange(e);
                setSelectedCategory(e.target.value);
              }}
            >
              <option value="">Select a category</option>
              {[...categories]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label htmlFor="subcategoryId" className={styles.label}>
              Subcategory (Optional)
            </label>
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
                .map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
            </select>
          </div>
          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.button}>
              Add Item
            </button>
          </div>
        </form>
      </div>
    );
  }
);

AddItemForm.displayName = "AddItemForm";
export default AddItemForm;
