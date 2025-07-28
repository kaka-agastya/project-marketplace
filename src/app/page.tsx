// frontend/app/page.tsx

'use client'; // Wajib ada untuk menggunakan hooks seperti useState dan useEffect

import { useState, useEffect } from 'react';

// Definisikan tipe data untuk produk agar sesuai dengan database
type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Ambil data dari API backend kita
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
        if (!response.ok) {
          throw new Error('Gagal mengambil data dari server');
        }
        const data: Product[] = await response.json();
        setProducts(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Array kosong berarti efek ini hanya berjalan sekali saat komponen dimuat

  if (loading) return <p className="text-center mt-10">Memuat produk...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Selamat Datang di Marketplace</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="border rounded-lg p-4 shadow-lg">
              <div className="w-full h-48 bg-gray-200 mb-4 rounded">
                 {/* Anda bisa menambahkan tag <img> di sini jika ada image_url */}
              </div>
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p className="text-gray-700 mt-2">Rp {product.price.toLocaleString('id-ID')}</p>
            </div>
          ))
        ) : (
          <p>Belum ada produk yang tersedia.</p>
        )}
      </div>
    </main>
  );
}