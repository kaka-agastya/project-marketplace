// app/product/[id]/page.tsx

"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url?: string | null;
  user_id: string;
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useAuth();
  const id = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fungsi untuk menghapus produk
  const handleDelete = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      return;
    }

    const token = session?.access_token;
    if (!token) {
      setError("Anda harus login untuk menghapus produk.");
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${apiUrl}/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal menghapus produk.");
      }

      alert("Produk berhasil dihapus!");
      router.push("/"); // Arahkan ke halaman utama
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    if (!id) return; // Jangan fetch jika id belum tersedia

    const fetchProduct = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const response = await fetch(`${apiUrl}/api/products/${id}`);
        if (!response.ok) {
          throw new Error("Produk tidak ditemukan");
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]); // Jalankan ulang jika id berubah

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error)
    return <p className="text-center mt-10 text-red-500">Error: {error}</p>;
  if (!product) return null;

  const isOwner = session?.user?.id === product.user_id;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="w-full h-80 bg-gray-200 flex items-center justify-center rounded-lg overflow-hidden">
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
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-3xl font-light text-indigo-600 mb-6">
            Rp {product.price.toLocaleString("id-ID")}
          </p>
          <p className="text-gray-700 leading-relaxed">
            {product.description || "Tidak ada deskripsi untuk produk ini."}
          </p>
          <button className="mt-8 w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700">
            Tambah ke Keranjang
          </button>
          {isOwner && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold">Aksi Pemilik</h3>
              <div className="flex space-x-4 mt-2">
                <Link
                  href={`/product/${product.id}/edit`}
                  className="flex-1 text-center bg-yellow-500 text-white py-2 rounded-lg font-semibold hover:bg-yellow-600"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700"
                >
                  Hapus
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
