'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from './StoreProvider';
import Link from 'next/link';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useStore();
  const [showMenu, setShowMenu] = useState(false);

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
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">
        <Link href="/" className="text-white">
          Storage Tracker
        </Link>
      </div>
      {user && (
        <div className="flex items-center">
          <span className="mr-4">Welcome, {user.name}</span>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Manage
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <Link
                  href="/manage/storage-areas"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Storage Areas
                </Link>
                <Link
                  href="/manage/groups"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Groups
                </Link>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
