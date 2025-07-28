// app/sell/page.tsx

'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ProductForm from '@/components/ProductForm'; // <-- Kita akan buat ini selanjutnya

export default function SellPage() {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Jika pengecekan sesi selesai dan tidak ada sesi (user tidak login)
    if (!isLoading && !session) {
      // Alihkan ke halaman login
      router.push('/login');
    }
  }, [session, isLoading, router]);

  // Tampilkan loading state saat sesi sedang diperiksa
  if (isLoading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  // Jika user sudah login, tampilkan halaman beserta form
  if (session) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Jual Barang Anda</h1>
        <ProductForm />
      </div>
    );
  }

  // Tampilkan null jika dialihkan, untuk menghindari flash content
  return null;
}