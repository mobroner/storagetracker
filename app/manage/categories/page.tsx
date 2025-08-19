'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/app/components/StoreProvider'
import styles from '@/app/components/Management.module.css'
import inventoryStyles from '@/app/components/InventoryList.module.css'

import { Category, Subcategory } from '@/app/lib/definitions'
import EditCategoryModal from '@/app/components/EditCategoryModal'

export default function ManageCategoriesPage() {
  const { categories, subcategories, refreshData } = useStore()
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({})

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }))
  }
  
  useEffect(() => {
    refreshData()
  }, [refreshData])

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

    const response = await fetch('/api/categories', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: editingCategory.id,
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

    const response = await fetch('/api/categories', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: category.id }),
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
            {sortedCategories.map((category) => {
              const categorySubcategories = subcategories.filter(sc => sc.category_id === category.id)
              
              return (
                <div key={category.id} className={inventoryStyles.storageArea}>
                  <h3
                    className={`${inventoryStyles.storageAreaHeader} ${openCategories[category.id] ? inventoryStyles.open : ''}`}
                    onClick={() => toggleCategory(category.id)}
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                    {category.name}
                    <div className={styles.buttonContainer} style={{ marginLeft: 'auto' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEdit(category); }} 
                        className={styles.editButton}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(category); }} 
                        className={styles.deleteButton}
                      >
                        Delete
                      </button>
                    </div>
                  </h3>
                  {openCategories[category.id] && (
                    <ul className={styles.itemList} style={{ paddingLeft: '2rem' }}>
                      {categorySubcategories.map(subcategory => (
                        <li key={subcategory.id} className={styles.listItem}>
                          <span className={styles.listItemName}>{subcategory.name}</span>
                          {/* Add subcategory edit/delete buttons here if needed */}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
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
