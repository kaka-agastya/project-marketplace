// app/cart/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type CartItem = {
  id: number;
  quantity: number;
  products: {
    id: number;
    name: string;
    price: number;
    image_url: string | null;
  };
};

export default function CartPage() {
  const { session, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCartItems = async () => {
    if (!session) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      if (!response.ok) throw new Error('Gagal mengambil data keranjang.');
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      if (session) {
        fetchCartItems();
      } else {
        router.push('/login');
      }
    }
  }, [session, isAuthLoading, router]);

  const handleRemoveItem = async (itemId: number) => {
    if (!session) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      if (!response.ok) throw new Error('Gagal menghapus item.');
      // Refresh daftar item setelah berhasil dihapus
      fetchCartItems();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const totalPrice = items.reduce((total, item) => total + item.products.price * item.quantity, 0);

  if (isAuthLoading || loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Keranjang Belanja Anda</h1>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center p-4 border rounded-lg">
                <img src={item.products.image_url || '/placeholder.svg'} alt={item.products.name} className="w-20 h-20 object-cover rounded-md mr-4"/>
                <div className="flex-grow">
                  <Link href={`/product/${item.products.id}`} className="font-semibold hover:underline">{item.products.name}</Link>
                  <p className="text-sm text-gray-600">Jumlah: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">Rp {(item.products.price * item.quantity).toLocaleString('id-ID')}</p>
                  <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 text-sm hover:underline">Hapus</button>
                </div>
              </div>
            ))}
          </div>
          <div className="md:col-span-1">
            <div className="p-6 border rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Ringkasan</h2>
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
              </div>
              <button className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700">
                Lanjut ke Pembayaran
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p>Keranjang Anda kosong.</p>
      )}
    </div>
  );
}