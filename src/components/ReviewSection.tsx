// components/ReviewSection.tsx
'use client';

import { useEffect, useState } from 'react';

type Review = {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
};

export default function ReviewSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    const fetchReviews = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const response = await fetch(`${apiUrl}/api/reviews/product/${productId}`);
        if (!response.ok) throw new Error('Gagal memuat review.');
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [productId]);

  if (loading) return <p>Memuat review...</p>;

  return (
    <div className="mt-10">
      <h3 className="text-2xl font-bold mb-4">Ulasan Produk</h3>
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="p-4 border rounded-lg">
              <div className="flex items-center mb-1">
                <span className="font-semibold">Pengguna</span> {/* Ganti dengan teks generik */}
                <span className="text-yellow-500 ml-2">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
              </div>
              <p className="text-gray-600">{review.comment}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
            </div>
          ))
        ) : (
          <p>Belum ada ulasan untuk produk ini.</p>
        )}
      </div>
    </div>
  );
}