'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href="/" className={pathname === '/' ? styles.active : ''}>
          Home
        </Link>
        <Link href="/manage/locations" className={pathname === '/manage/locations' ? styles.active : ''}>
          Manage Locations
        </Link>
        <Link href="/manage/storage-areas" className={pathname === '/manage/storage-areas' ? styles.active : ''}>
          Manage Storage Areas
        </Link>
        <Link href="/manage/categories" className={pathname === '/manage/categories' ? styles.active : ''}>
          Manage Categories
        </Link>
        <Link href="/manage/subcategories" className={pathname === '/manage/subcategories' ? styles.active : ''}>
          Manage Subcategories
        </Link>
      </nav>
    </header>
  );
}
