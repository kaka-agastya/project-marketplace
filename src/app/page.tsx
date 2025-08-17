// app/page.tsx

'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type'; // <-- 2. Import SplitType

gsap.registerPlugin(ScrollTrigger);

type Product = {
  id: number;
  name: string;
  price: number;
  image_url?: string | null;
};

export default function Home() {
  const titleRef = useRef(null);
  const productGridRef = useRef(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const mainRef = useRef(null);
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

  // ▼▼▼ GANTI useEffect ANIMASI DENGAN INI ▼▼▼
  useEffect(() => {
    // Jalankan animasi hanya jika loading selesai dan ada produk
    if (!loading && products.length > 0) {
      // Konteks ScrollTrigger untuk cleanup otomatis
      const ctx = gsap.context(() => {
        // Targetkan semua elemen dengan class 'product-card'
        gsap.utils.toArray('.product-card').forEach((card: any) => {
          gsap.fromTo(card, 
            { y: 50, opacity: 0 }, // Mulai dari bawah dan transparan
            {
              y: 0,
              opacity: 1,
              duration: 0.7,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: card, // Pemicu animasi adalah kartu itu sendiri
                start: 'top 90%', // Mulai saat 90% bagian atas kartu masuk layar
                toggleActions: 'play none none none', // Hanya jalankan sekali saat masuk
                once: true,
              }
            }
          );
        });
      }, mainRef); // Lingkup context ke elemen utama

      return () => ctx.revert(); // Cleanup saat komponen unmount
    }
  }, [loading, products]);
  // ▲▲▲ SAMPAI DI SINI ▲▲▲
  // ▲▲▲ SAMPAI DI SINI ▲▲▲

  useLayoutEffect(() => {
        // Pastikan elemen sudah ada
        if (titleRef.current) {
            // Gunakan SplitType untuk memecah teks menjadi karakter
            const text = new SplitType(titleRef.current, { types: 'chars' });
            
            // Animasikan setiap karakter
            gsap.from(text.chars, {
                opacity: 0,
                y: 20,
                rotateX: -90,
                stagger: 0.02,
                duration: 0.8,
                ease: 'power3.out',
            });
        }
    }, []); // Jalankan sekali saat komponen dimua

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
    <main ref={mainRef} className="p-8">
      <div className="mb-8">
        {/* ▼▼▼ 5. Terapkan ref ke judul ▼▼▼ */}
                <h1 ref={titleRef} className="text-3xl font-bold">
                    Selamat Datang di Marketplace
                </h1>
                {/* ▲▲▲ SAMPAI DI SINI ▲▲▲ */}
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
                <ProductCard key={product.id} product={product} className='product-card' />
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