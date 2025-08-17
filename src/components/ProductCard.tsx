// components/ProductCard.tsx

import Link from 'next/link';

type Product = {
  id: number;
  name: string;
  price: number;
  image_url?: string | null;
  className?: string; // Pastikan ini ada
};

// 1. Tambahkan 'className' ke dalam definisi props
export default function ProductCard({ product, className }: { product: Product, className?: string }) {
  return (
    // 2. Terapkan 'className' yang diterima ke elemen Link
    <Link 
      href={`/product/${product.id}`} 
      className={`block card-doodle hover:shadow-xl transition-shadow duration-200 overflow-hidden ${className}`}
    >
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400">Gambar Produk</span>
        )}
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold truncate">{product.name}</h2>
        <p className="text-gray-800 mt-2 font-bold">
          Rp {product.price.toLocaleString('id-ID')}
        </p>
      </div>
    </Link>
  );
}