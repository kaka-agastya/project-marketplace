// app/api/products/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Fungsi untuk membuat Supabase client
const getSupabaseClient = (jwt?: string) => {
  const options = jwt ? { global: { headers: { Authorization: `Bearer ${jwt}` } } } : {};
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    options
  );
};

// GET (semua produk, dengan search & paginasi)
export async function GET(request: Request) {
  const supabase = getSupabaseClient();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '8', 10);
  
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from('products').select('*', { count: 'exact' });
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  return NextResponse.json({
    data,
    total: count,
    totalPages: Math.ceil(count! / limit),
    currentPage: page,
  });
}

// POST (buat produk baru)
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
  const token = authHeader.split(' ')[1];

  const supabase = getSupabaseClient(token);
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: 'Token tidak valid.' }, { status: 401 });

  const { name, description, price, image_url, latitude, longitude } = await request.json();
  if (!name || !price) return NextResponse.json({ error: 'Nama dan harga produk harus diisi' }, { status: 400 });

  const productData: any = { name, description, price, image_url, user_id: user.id };
  if (latitude && longitude) {
    productData.location = `POINT(${longitude} ${latitude})`;
  }

  const { data, error } = await supabase.from('products').insert([productData]).select().single();

  if (error) return NextResponse.json({ error: 'Gagal membuat produk: ' + error.message }, { status: 500 });
  return NextResponse.json({ message: 'Produk berhasil dibuat', product: data }, { status: 201 });
}