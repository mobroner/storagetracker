'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/app/components/StoreProvider'
import styles from '@/app/components/Management.module.css'
import { Subcategory } from '@/app/lib/definitions'

export default function ManageSubcategoriesPage() {
  const { categories, subcategories, refreshData } = useStore()
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [newSubcategoryName, setNewSubcategoryName] = useState<string>('')
  
  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Group subcategories by category
  const subcategoriesByCategory = subcategories.reduce((acc: { [key: string]: Subcategory[] }, subcategory) => {
    const categoryId = String(subcategory.category_id)
    if (!acc[categoryId]) {
      acc[categoryId] = []
    }
    acc[categoryId].push(subcategory)
    return acc
  }, {})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategory || !newSubcategoryName.trim()) return

    const response = await fetch('/api/subcategories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newSubcategoryName.trim(),
        category_id: selectedCategory
      }),
    })

    if (response.ok) {
      setNewSubcategoryName('')
      refreshData()
    }
  }

  const handleEdit = async (subcategory: Subcategory) => {
    const newName = prompt('Enter new name:', subcategory.name)
    if (!newName || newName === subcategory.name) return

    const response = await fetch('/api/subcategories', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: subcategory.id,
        name: newName.trim(),
      }),
    })

    if (response.ok) {
      refreshData()
    }
  }

  const handleDelete = async (subcategory: Subcategory) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return

    const response = await fetch('/api/subcategories', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: subcategory.id }),
    })

    if (response.ok) {
      refreshData()
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Manage Subcategories</h1>
      
      <form className={styles.addForm} onSubmit={handleSubmit}>
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={styles.input}
          required
        >
          <option value="">Select a category...</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <input 
          type="text" 
          value={newSubcategoryName}
          onChange={(e) => setNewSubcategoryName(e.target.value)}
          className={styles.input}
          placeholder="Enter subcategory name..." 
          required
        />
        <button type="submit" className={styles.addButton}>
          Add Subcategory
        </button>
      </form>

      <div className={styles.list}>
        {categories.map((category) => (
          <div key={category.id} className={styles.card}>
            <h2 className={styles.categoryTitle}>{category.name}</h2>
            <ul className={styles.itemList}>
              {subcategoriesByCategory[String(category.id)]?.map((subcategory) => (
                <li key={subcategory.id} className={styles.listItem}>
                  <span className={styles.listItemName}>{subcategory.name}</span>
                  <div className={styles.buttonContainer}>
                    <button 
                      onClick={() => handleEdit(subcategory)} 
                      className={styles.editButton}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(subcategory)} 
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
