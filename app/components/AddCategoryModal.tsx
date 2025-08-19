'use client'

import { useState } from 'react'
import styles from './Modal.module.css'
import formStyles from './AddItemForm.module.css'

interface AddCategoryModalProps {
  onClose: () => void
  onAdd: (name: string) => Promise<void>
}

export default function AddCategoryModal({ onClose, onAdd }: AddCategoryModalProps) {
  const [name, setName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    await onAdd(name.trim())
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.title}>Add New Category</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={formStyles.formGroup}>
            <label htmlFor="newCategoryName" className={formStyles.label}>
              Category Name
            </label>
            <input
              type="text"
              id="newCategoryName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={formStyles.input}
              placeholder="Enter category name"
              required
            />
          </div>

          <div className={formStyles.actions}>
            <button 
              type="button" 
              onClick={onClose}
              className={formStyles.cancelButton}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={formStyles.submitButton}
            >
              Add Category
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
