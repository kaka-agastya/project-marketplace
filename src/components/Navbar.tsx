// components/Navbar.tsx

'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { session, setSession, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    // Hapus sesi dari context dan localStorage
    setSession(null);
    localStorage.removeItem('session');
    // Arahkan kembali ke halaman login
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              Marketplace
            </Link>
          </div>
          <div className="flex items-center">
            {isLoading ? (
              <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : session ? (
              // Jika sudah login
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 text-sm">{session.user.email}</span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              // Jika belum login
              <Link
                href="/login"
                className="px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}