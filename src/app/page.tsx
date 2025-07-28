// app/page.tsx

'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard'; // <-- IMPORT

type Product = {
  id: number;
  name: string;
  price: number;
  image_url?: string | null;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Gunakan URL dari .env.local jika ada, atau default
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const response = await fetch(`${apiUrl}/api/products`);
        if (!response.ok) throw new Error('Gagal mengambil data');
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <p className="text-center mt-10">Memuat produk...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Selamat Datang di Marketplace</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            // Gunakan komponen ProductCard di sini
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p>Belum ada produk yang tersedia.</p>
        )}
      </div>
    </main>
  );
}