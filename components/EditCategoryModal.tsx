import { useState, useEffect } from 'react';
import styles from './Modal.module.css';
import formStyles from './ModalForm.module.css';

interface Category {
  id?: string;
  name: string;
  description?: string;
}

interface EditCategoryModalProps {
  category?: Category | null;
  onSave: (category: Category) => void;
  onClose: () => void;
}

export default function EditCategoryModal({ category, onSave, onClose }: EditCategoryModalProps) {
  const [formData, setFormData] = useState<Category>({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || ''
      });
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>{category ? 'Edit Category' : 'Add New Category'}</h2>
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
              {category ? 'Save Changes' : 'Add Category'}
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
