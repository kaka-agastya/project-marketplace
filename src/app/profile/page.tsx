// app/profile/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard'; // Kita pakai ulang komponen ProductCard

// Tipe data untuk produk
type Product = {
  id: number;
  name: string;
  price: number;
  image_url?: string | null;
};

export default function ProfilePage() {
  const { session, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Lindungi halaman
  useEffect(() => {
    if (!isAuthLoading && !session) {
      router.push('/login');
    }
  }, [session, isAuthLoading, router]);

  // 2. Ambil data produk milik pengguna
  useEffect(() => {
    if (session) {
      const fetchUserProducts = async () => {
        const token = session.access_token;
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
          const response = await fetch(`${apiUrl}/api/users/me/products`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!response.ok) throw new Error('Gagal mengambil data produk Anda.');
          const data = await response.json();
          setProducts(data);
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setLoading(false);
        }
      };
      fetchUserProducts();
    }
  }, [session]); // Jalankan ketika sesi tersedia

  if (isAuthLoading || loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-500">Error: {error}</p>;
  }
  
  if (!session) {
    return null; // Jangan tampilkan apa-apa saat dialihkan
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Profil Saya</h1>
      <p className="text-gray-600 mb-8">Berikut adalah barang yang Anda jual.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p className="col-span-full">Anda belum menjual barang apa pun.</p>
        )}
      </div>
    </div>
  );
}