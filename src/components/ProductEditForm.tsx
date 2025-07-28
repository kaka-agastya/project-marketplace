// components/ProductEditForm.tsx

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
};

export default function ProductEditForm({ product }: { product: Product }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  
  const { session } = useAuth();
  const router = useRouter();
  
  // Isi form dengan data produk saat komponen pertama kali dimuat
  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || '');
      setPrice(product.price.toString());
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('Memperbarui data...');

    const token = session?.access_token;
    if (!token) {
      setMessage('Error: Sesi tidak valid.');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description, price: parseFloat(price) }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal memperbarui produk.');
      
      setMessage('Produk berhasil diperbarui!');
      setTimeout(() => router.push(`/product/${product.id}`), 1500);
      
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  return (
    <div className="p-8 border rounded-lg shadow-md bg-white">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ... Bagian input sama seperti ProductForm ... */}
        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Produk</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>
        {/* Description Input */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>
        {/* Price Input */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Harga (Rp)</label>
          <input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>
        
        <div>
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            Simpan Perubahan
          </button>
        </div>
      </form>
      {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
    </div>
  );
}