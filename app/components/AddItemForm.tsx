"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, forwardRef } from "react";
import { useStore } from "./StoreProvider";
import styles from "./AddItemForm.module.css";
import { Item, Location } from "@/app/lib/definitions";

// An extra comment to force a re-save
interface AddItemFormProps {
  editingItem: Item | null;
  setEditingItem: (item: Item | null) => void;
  filteredLocations: Location[];
  selectedStorageArea: string;
  setSelectedStorageArea: (id: string) => void;
}

const AddItemForm = forwardRef<HTMLDivElement, AddItemFormProps>(
  (
    {
      editingItem,
      setEditingItem,
      filteredLocations,
      selectedStorageArea,
      setSelectedStorageArea,
    },
    ref
  ) => {
    const router = useRouter();
    const { storageAreas, categories, subcategories, refreshData } = useStore();
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

    useEffect(() => {
      if (editingItem) {
        const isValidLocation =
          editingItem.location_id &&
          filteredLocations.some((location) => location.id === editingItem.location_id);

        setFormData({
          itemName: editingItem.item_name,
          quantity: String(editingItem.quantity),
          dateAdded: new Date(editingItem.date_added)
            .toISOString()
            .split("T")[0],
          expiryDate: editingItem.expiry_date
            ? new Date(editingItem.expiry_date).toISOString().split("T")[0]
            : "",
          storageAreaId: editingItem.storage_area_id,
          locationId: isValidLocation ? editingItem.location_id || "" : "",
          categoryId: editingItem.category_id || "",
          subcategoryId: editingItem.subcategory_id || "",
        });
      }
    }, [editingItem, filteredLocations]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();

      const submissionData = {
        ...formData,
        quantity: parseInt(formData.quantity, 10),
      };

      const method = editingItem ? "PUT" : "POST";
      const body = editingItem
        ? JSON.stringify({ ...submissionData, id: editingItem.id })
        : JSON.stringify(submissionData);

      await fetch("/api/items", {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });

      setEditingItem(null);
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
        <h2 className={styles.title}>
          {editingItem ? "Edit Item" : "Add New Item"}
        </h2>
        <p className={styles.description}>
          {editingItem
            ? "Update the details of your item."
            : "Add a new food item to your freezer inventory."}
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
              onChange={handleChange}
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
              {subcategories
                .filter((subcategory) => String(subcategory.category_id) === formData.categoryId)
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
              {editingItem ? "Update Item" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    );
  }
);

AddItemForm.displayName = "AddItemForm";
export default AddItemForm;
