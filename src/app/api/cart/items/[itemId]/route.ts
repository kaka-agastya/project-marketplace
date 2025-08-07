// app/api/cart/items/[itemId]/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const getSupabaseClient = (jwt: string) => {
    return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { global: { headers: { Authorization: `Bearer ${jwt}` } } }
  );
};

export async function DELETE(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
  const token = authHeader.split(' ')[1];
  const supabase = getSupabaseClient(token);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Token tidak valid.' }, { status: 401 });
  
  const { itemId } = params;

  // Verifikasi bahwa item yang akan dihapus adalah milik pengguna
  const { data: item } = await supabase.from('cart_items').select('*, carts(user_id)').eq('id', itemId).single();
  if (!item || (item as any).carts.user_id !== user.id) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
  if (error) return NextResponse.json({ error: 'Gagal menghapus item.' }, { status: 500 });

  return NextResponse.json({ message: 'Item berhasil dihapus.' });
}