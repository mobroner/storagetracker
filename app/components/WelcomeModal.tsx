"use client";

import styles from "./Modal.module.css";

interface WelcomeModalProps {
  onClose: () => void;
}

export default function WelcomeModal({ onClose }: WelcomeModalProps) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          <h2>Welcome to your inventory manager!</h2>
          <p>
            Welcome to your inventory manager! To start adding items, you need to create a storage area (like "Freezer" or "Pantry") and then create Locations to organize the items within that storage area (like "Black Basket" or "Bottom Shelf"). A location can be associated with multiple storage areas. If you are on mobile scroll up to find the manage storage areas and locations inputs.
          </p>
          <button onClick={onClose} className={`${styles.button} ${styles.buttonPrimary}`}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
