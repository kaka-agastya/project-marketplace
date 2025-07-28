// hooks/useProductForm.ts

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export function useProductForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  
  const { session } = useAuth();
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('Mengirim data...');

    // Ambil token dari sesi
    const token = session?.access_token;
    if (!token) {
      setMessage('Error: Anda harus login untuk menjual barang.');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // <-- Kirim token di sini
        },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price), // Ubah harga menjadi angka
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menambahkan produk.');
      }

      setMessage('Produk berhasil ditambahkan! Mengarahkan ke halaman utama...');
      setTimeout(() => {
        router.push('/');
      }, 2000); // Tunggu 2 detik sebelum redirect

    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  return {
    name,
    setName,
    description,
    setDescription,
    price,
    setPrice,
    message,
    handleSubmit,
  };
}