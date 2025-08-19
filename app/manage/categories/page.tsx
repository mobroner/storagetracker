'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/app/components/StoreProvider'
import styles from '@/app/components/Management.module.css'
import formStyles from '@/app/components/AddItemForm.module.css'
import { Category } from '@/app/lib/definitions'
import EditCategoryModal from '@/app/components/EditCategoryModal'

export default function ManageCategoriesPage() {
  const { categories, refreshData } = useStore()
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  
  useEffect(() => {
    refreshData()
  }, [])

  // Sort categories alphabetically
  const sortedCategories = [...categories].sort((a, b) => 
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  )

  const handleSaveNew = async (name: string) => {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name.trim()
      }),
    })

    if (response.ok) {
      refreshData()
    }
  }
  
  const handleEdit = (category: Category) => {
    setEditingCategory(category)
  }

  const handleSaveEdit = async (name: string) => {
    if (!editingCategory || name === editingCategory.name) return

    const response = await fetch(`/api/categories/${editingCategory.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name.trim()
      }),
    })

    if (response.ok) {
      setEditingCategory(null)
      refreshData()
    }
  }

  const handleDelete = async (category: Category) => {
    if (!confirm('Are you sure you want to delete this category? This will also delete all subcategories.')) return

    const response = await fetch(`/api/categories/${category.id}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      refreshData()
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Manage Categories</h1>
      
      <div className={styles.addForm}>
        <form onSubmit={async (e) => {
          e.preventDefault()
          if (!newCategoryName.trim()) return
          await handleSaveNew(newCategoryName)
          setNewCategoryName('')
        }} className={styles.addFormContainer}>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className={styles.input}
            placeholder="Enter new category name"
            required
          />
          <button type="submit" className={styles.addButton}>
            Add Category
          </button>
        </form>
      </div>

      <div className={styles.list}>
        <div className={styles.card}>
          <ul className={styles.itemList}>
            {sortedCategories.map((category) => (
              <li key={category.id} className={styles.listItem}>
                <span className={styles.listItemName}>{category.name}</span>
                <div className={styles.buttonContainer}>
                  <button 
                    onClick={() => handleEdit(category)} 
                    className={styles.editButton}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(category)} 
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  )
}