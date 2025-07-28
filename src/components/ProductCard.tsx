// components/ProductCard.tsx

import Link from 'next/link';

// Definisikan tipe data untuk properti produk
type Product = {
  id: number;
  name: string;
  price: number;
  image_url?: string | null;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.id}`} className="block border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover" // object-cover agar gambar pas
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