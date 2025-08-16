'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from './StoreProvider';
import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      logout();
      router.push('/login');
    } catch (error) {
      console.error('Failed to logout', error);
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link href="/">
          <img
            src="/logo.png"
            alt="Storage Tracker Logo"
            className={styles.logoImage}
          />
        </Link>
      </div>
      {user && (
        <>
          <div className={styles.nav}>
            <span className={styles.welcome}>Welcome, {user.name}</span>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={styles.menuButton}
              >
                Manage
              </button>
              {showMenu && (
                <div className={styles.mobileMenu}>
                  <Link href="/manage/storage-areas">
                    Storage Areas
                  </Link>
                  <Link href="/manage/groups">
                    Groups
                  </Link>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className={styles.logoutButton}
            >
              Logout
            </button>
          </div>
          <div className={styles.mobileMenuButton}>
            <button onClick={() => setShowMobileMenu(!showMobileMenu)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            </button>
          </div>
        </>
      )}
      {showMobileMenu && user && (
        <div className={styles.mobileMenu}>
          <span className="block mb-2">Welcome, {user.name}</span>
          <Link href="/manage/storage-areas">
            Storage Areas
          </Link>
          <Link href="/manage/groups">
            Groups
          </Link>
          <button
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
