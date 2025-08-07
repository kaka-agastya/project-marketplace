// app/api/users/me/products/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const getSupabaseClient = (jwt: string) => {
    return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { global: { headers: { Authorization: `Bearer ${jwt}` } } }
  );
};

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
  const token = authHeader.split(' ')[1];
  const supabase = getSupabaseClient(token);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Token tidak valid.' }, { status: 401 });

  const { data, error } = await supabase.from('products').select('*').eq('user_id', user.id);

  if (error) return NextResponse.json({ error: 'Gagal mengambil produk pengguna.' }, { status: 500 });
  return NextResponse.json(data);
}