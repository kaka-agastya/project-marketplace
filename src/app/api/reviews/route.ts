// app/api/reviews/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const getSupabaseClient = (jwt: string) => {
   return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { global: { headers: { Authorization: `Bearer ${jwt}` } } }
  );
};

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
  const token = authHeader.split(' ')[1];
  const supabase = getSupabaseClient(token);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Token tidak valid.' }, { status: 401 });

  const { product_id, rating, comment } = await request.json();
  if (!product_id || !rating) return NextResponse.json({ error: 'Product ID dan rating harus diisi.' }, { status: 400 });

  try {
    const { data, error } = await supabase.from('reviews').insert({ product_id, rating, comment, user_id: user.id }).select().single();
    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Anda sudah pernah memberi review untuk produk ini.' }, { status: 409 });
      throw error;
    }
    return NextResponse.json({ message: 'Review berhasil dikirim', review: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal mengirim review.' }, { status: 500 });
  }
}