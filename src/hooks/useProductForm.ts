// hooks/useProductForm.ts

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabaseClient'; // <-- IMPORT KLIEN BARU

export function useProductForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState<File | null>(null); // <-- State untuk file
  const [message, setMessage] = useState('');
  
  const { session } = useAuth();
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('Memproses...');

    const token = session?.access_token;
    if (!token) {
      setMessage('Error: Anda harus login.');
      return;
    }

    let imageUrl = '';

    // 1. Unggah gambar jika ada file yang dipilih
    if (file) {
      setMessage('Mengunggah gambar...');
      const filePath = `public/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        setMessage('Gagal mengunggah gambar: ' + uploadError.message);
        return;
      }
      
      // 2. Dapatkan URL publik dari gambar yang baru diunggah
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);
      
      imageUrl = data.publicUrl;
    }

    // 3. Kirim data produk (termasuk URL gambar) ke backend API
    setMessage('Menyimpan data produk...');
    try {
      const response = await fetch(`${apiUrl}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          image_url: imageUrl, // <-- Sertakan URL gambar
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal menambahkan produk.');

      setMessage('Produk berhasil ditambahkan!');
      setTimeout(() => router.push('/'), 2000);

    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  return {
    name, setName,
    description, setDescription,
    price, setPrice,
    setFile, // <-- Ekspor setFile
    message,
    handleSubmit,
  };
}