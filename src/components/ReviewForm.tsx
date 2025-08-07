// components/ReviewForm.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function ReviewForm({ productId, onReviewSubmit }: { productId: string, onReviewSubmit: () => void }) {
  const { session } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setMessage('Rating tidak boleh kosong.');
      return;
    }
    const token = session?.access_token;
    if (!token) {
      setMessage('Anda harus login untuk memberi ulasan.');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: productId, rating, comment })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal mengirim review.');
      setMessage('Review berhasil dikirim!');
      setRating(0);
      setComment('');
      onReviewSubmit(); // Memuat ulang daftar review
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  if (!session) return <p>Silakan <a href="/login" className="underline">login</a> untuk memberi ulasan.</p>;

  return (
    <form onSubmit={handleSubmit} className="mt-6 p-4 border rounded-lg">
      <h4 className="font-semibold mb-2">Tulis Ulasan Anda</h4>
      <div className="flex items-center mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} onClick={() => setRating(star)} className={`cursor-pointer text-2xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
        ))}
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tulis komentar Anda..." className="w-full p-2 border rounded-md" rows={3}></textarea>
      <button type="submit" className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg">Kirim</button>
      {message && <p className="text-sm mt-2">{message}</p>}
    </form>
  );
}