'use client'

import { useState } from 'react'
import styles from './EditModal.module.css'
import { Category } from '@/app/lib/definitions'

interface EditCategoryModalProps {
  category: Category
  onClose: () => void
  onSave: (name: string) => Promise<void>
}

export default function EditCategoryModal({ category, onClose, onSave }: EditCategoryModalProps) {
  const [name, setName] = useState(category.name)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || name.trim() === category.name) return
    await onSave(name.trim())
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.title}>Edit Category</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter category name"
            required
          />
        </div>
        <div className={styles.footer}>
          <button
            onClick={onClose}
            className={`${styles.button} ${styles.cancelButton}`}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(name)}
            className={`${styles.button} ${styles.saveButton}`}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
