// components/Navbar.tsx

'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabaseClient'; // <-- 1. IMPORT SUPABASE CLIENT

export default function Navbar() {
  const { session, isLoading } = useAuth(); // setSession sudah tidak ada, jadi kita hapus
  const router = useRouter();

  // ▼▼▼ UBAH FUNGSI INI ▼▼▼
  const handleLogout = async () => {
    // 2. Panggil fungsi signOut() dari Supabase
    await supabase.auth.signOut();
    // Arahkan ke halaman login setelah berhasil logout
    router.push('/login');
  };
  // ▲▲▲ SAMPAI DI SINI ▲▲▲

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              Marketplace
            </Link>
            {session && (
              <Link href="/sell" className="text-gray-600 hover:text-indigo-600">
                Jual Barang
              </Link>
            )}
          </div>
          <div className="flex items-center">
            {isLoading ? (
              <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <Link href="/cart" className="text-gray-600 hover:text-indigo-600">
                  Keranjang
                </Link>
                <Link href="/profile" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                  {session.user.email}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            ) : (
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