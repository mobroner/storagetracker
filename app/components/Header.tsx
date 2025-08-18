'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from './StoreProvider';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      logout();
      router.push('/login');
    } catch (error) {
      console.error('Failed to logout', error);
    }
  }

  async function handlePopulateTaxonomy() {
    try {
      const response = await fetch('/api/populate-taxonomy', { method: 'POST' });
      if (response.ok) {
        alert('Taxonomy populated successfully!');
        toggleMenu();
      } else {
        const data = await response.json();
        alert(`Failed to populate taxonomy: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to populate taxonomy', error);
      alert('An error occurred while populating taxonomy.');
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={styles.header}>
      {isClient && user && (
        <div className={styles.menuButton} onClick={toggleMenu}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </div>
      )}
      <div className={styles.logo}>
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Storage Tracker Logo"
            width={156}
            height={78}
            className={styles.logoImage}
            unoptimized
          />
        </Link>
      </div>
      {isClient && isMenuOpen && (
        <div className={styles.overlay} onClick={toggleMenu}></div>
      )}
      {isClient && (
        <div className={`${styles.sidebar} ${isMenuOpen ? styles.open : ''}`}>
          <div className={styles.sidebarHeader}>
            <span>Welcome, {user?.name}</span>
          </div>
        <nav className={styles.sidebarNav}>
          <Link href="/" onClick={toggleMenu} className={styles.navHeaderLink}>
            Inventory List
          </Link>
          <div className={styles.navSection}>
            <h4 className={styles.navHeader}>Manage</h4>
            <Link href="/manage/storage-areas" onClick={toggleMenu} className={styles.subLink}>
              Storage Areas
            </Link>
            <Link href="/manage/locations" onClick={toggleMenu} className={styles.subLink}>
              Locations
            </Link>
          </div>
          <button onClick={handlePopulateTaxonomy} className={styles.logoutButton}>
            Populate Taxonomy
          </button>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </nav>
        </div>
      )}
    </header>
  );
}
