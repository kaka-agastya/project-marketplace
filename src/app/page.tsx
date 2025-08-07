// app/page.tsx

'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Fungsi untuk mengambil data produk
  const fetchProducts = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Gagal mengambil data produk');
      const result = await response.json();
      
      // Cek apakah hasilnya dari paginasi atau bukan
      if (result.data) {
        setProducts(result.data);
        setTotalPages(result.totalPages);
      } else {
        setProducts(result);
        setTotalPages(1); // Set 1 halaman jika bukan dari paginasi
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Effect untuk pencarian dan paginasi biasa
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: '8',
    });
    if (searchTerm) {
      params.append('search', searchTerm);
    }
    const url = `/api/products?${params.toString()}`;
    
    const delayDebounceFn = setTimeout(() => fetchProducts(url), 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentPage]);

  // Fungsi baru untuk mencari produk terdekat
  const handleNearbySearch = () => {
    if (!navigator.geolocation) {
      setError('Geolocation tidak didukung oleh browser Anda.');
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const url = `/api/products/nearby?lat=${latitude}&lon=${longitude}`;
      fetchProducts(url);
    }, () => {
      setError('Gagal mendapatkan lokasi. Pastikan Anda memberi izin.');
    });
  };

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Selamat Datang di Marketplace</h1>
        <div className="mt-4 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-lg px-4 py-2 border border-gray-300 rounded-lg"
          />
          {/* ▼▼▼ Tombol Geolocation ▼▼▼ */}
          <button
            onClick={handleNearbySearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            📍 Cari di Sekitar Saya
          </button>
          {/* ▲▲▲ Sampai di sini ▲▲▲ */}
        </div>
      </div>

      {loading && <p className="text-center">Memuat produk...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}
      
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="col-span-full">Produk tidak ditemukan.</p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-4">
              <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50">
                Previous
              </button>
              <span>Halaman {currentPage} dari {totalPages}</span>
              <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}