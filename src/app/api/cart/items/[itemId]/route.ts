// app/api/cart/items/[itemId]/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

const getSupabaseClient = (jwt: string) => {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { global: { headers: { Authorization: `Bearer ${jwt}` } } }
  );
};

export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
  
  const token = authHeader.split(' ')[1];
  const supabase = getSupabaseClient(token);

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: 'Token tidak valid.' }, { status: 401 });
  
  const { itemId } = params;

  // Verifikasi bahwa item yang akan dihapus adalah milik pengguna
  const { data: item, error: itemError } = await supabase
    .from('cart_items')
    .select('id, carts!inner(user_id)')
    .eq('id', itemId)
    .single();

  if (itemError || !item) {
    return NextResponse.json({ error: 'Akses ditolak atau item tidak ditemukan.' }, { status: 403 });
  }

  // ▼▼▼ PERBAIKAN DI SINI ▼▼▼
  // TypeScript menganggap 'carts' sebagai array. Kita akses elemen pertamanya.
  if (item.carts[0].user_id !== user.id) {
    return NextResponse.json({ error: 'Akses ditolak. Anda bukan pemilik item ini.' }, { status: 403 });
  }
  // ▲▲▲ SAMPAI DI SINI ▲▲▲

  // Jika verifikasi berhasil, hapus item
  const { error: deleteError } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId);

  if (deleteError) return NextResponse.json({ error: 'Gagal menghapus item.' }, { status: 500 });

  return NextResponse.json({ message: 'Item berhasil dihapus.' });
}