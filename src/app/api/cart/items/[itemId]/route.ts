// app/api/cart/items/[itemId]/route.ts

import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

const getSupabaseClient = (jwt: string) => {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { global: { headers: { Authorization: `Bearer ${jwt}` } } }
  );
};

export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } } // ✅ cara yang direkomendasikan oleh Next.js
) {
  const { itemId } = params;
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const supabase = getSupabaseClient(token);

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "Token tidak valid." }, { status: 401 });
  }

  // Verifikasi kepemilikan dengan query yang lebih langsung dan aman
  const { data: cartData, error: cartError } = await supabase
    .from('carts')
    .select('cart_items!inner(id)') // Pilih item di dalam keranjang
    .eq('user_id', user.id)         // Pastikan keranjangnya milik user
    .eq('cart_items.id', itemId)    // Pastikan item yang dimaksud ada di keranjang itu
    .single();

  if (cartError || !cartData) {
    return NextResponse.json({ error: "Akses ditolak atau item tidak ditemukan." }, { status: 403 });
  }

  // Jika verifikasi berhasil, hapus item
  const { error: deleteError } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", itemId);

  if (deleteError) {
    return NextResponse.json({ error: "Gagal menghapus item." }, { status: 500 });
  }

  return NextResponse.json({ message: "Item berhasil dihapus." });
}