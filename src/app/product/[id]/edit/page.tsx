// app/product/[id]/edit/page.tsx

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProductEditForm from '@/components/ProductEditForm'; // <-- Kita akan buat form khusus edit

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  user_id: string;
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { session, isLoading: isAuthLoading } = useAuth();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const response = await fetch(`${apiUrl}/api/products/${id}`);
        if (!response.ok) throw new Error('Produk tidak ditemukan');
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Redirect jika tidak login atau bukan pemilik
  useEffect(() => {
    if (!isAuthLoading && !loading) {
      if (!session) {
        router.push('/login');
      } else if (product && session.user.id !== product.user_id) {
        alert('Akses ditolak!');
        router.push(`/product/${id}`);
      }
    }
  }, [session, product, isAuthLoading, loading, router, id]);

  if (loading || isAuthLoading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;
  if (!product || session?.user?.id !== product.user_id) return null;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Edit Produk</h1>
      <ProductEditForm product={product} />
    </div>
  );
}