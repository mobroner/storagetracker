import { useState, useEffect } from 'react';
import styles from './Modal.module.css';
import formStyles from './ModalForm.module.css';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Subcategory {
  id?: string;
  name: string;
  description?: string;
  categoryId: string;
}

interface EditSubcategoryModalProps {
  subcategory?: Subcategory | null;
  categories: Category[];
  onSave: (subcategory: Subcategory) => void;
  onClose: () => void;
}

export default function EditSubcategoryModal({ 
  subcategory, 
  categories,
  onSave, 
  onClose 
}: EditSubcategoryModalProps) {
  const [formData, setFormData] = useState<Subcategory>({
    name: '',
    description: '',
    categoryId: categories[0]?.id || ''
  });

  useEffect(() => {
    if (subcategory) {
      setFormData({
        name: subcategory.name,
        description: subcategory.description || '',
        categoryId: subcategory.categoryId
      });
    }
  }, [subcategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>{subcategory ? 'Edit Subcategory' : 'Add New Subcategory'}</h2>
        <form onSubmit={handleSubmit} className={formStyles.form}>
          <div className={formStyles.formGroup}>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={formStyles.input}
            />
          </div>
          <div className={formStyles.formGroup}>
            <label htmlFor="categoryId">Category:</label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className={formStyles.input}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className={formStyles.formGroup}>
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={formStyles.input}
            />
          </div>
          <div className={formStyles.buttonGroup}>
            <button type="submit" className={formStyles.submitButton}>
              {subcategory ? 'Save Changes' : 'Add Subcategory'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={formStyles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
