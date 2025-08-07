// app/api/products/[id]/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Fungsi helper untuk membuat Supabase client
// Bisa dengan token pengguna (untuk aksi aman) atau tanpa (untuk aksi publik)
const getSupabaseClient = (jwt?: string) => {
  const options = jwt ? { global: { headers: { Authorization: `Bearer ${jwt}` } } } : {};
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    options
  );
};

// GET (mengambil satu produk)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseClient();
  const { id } = params;
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT (memperbarui produk)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  const supabase = getSupabaseClient(token);

  // Verifikasi pengguna
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Token tidak valid.' }, { status: 401 });
  }

  // Ambil data produk untuk cek kepemilikan
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('user_id')
    .eq('id', id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: 'Produk tidak ditemukan.' }, { status: 404 });
  }

  if (product.user_id !== user.id) {
    return NextResponse.json({ error: 'Akses ditolak. Anda bukan pemilik produk ini.' }, { status: 403 });
  }

  // Jika pemiliknya benar, lanjutkan update
  try {
    const { name, description, price } = await request.json();
    if (!name || !price) {
      return NextResponse.json({ error: 'Nama dan harga tidak boleh kosong.' }, { status: 400 });
    }

    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({ name, description, price })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ message: 'Produk berhasil diperbarui.', product: updatedProduct });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memperbarui produk: ' + error.message }, { status: 500 });
  }
}

// DELETE (menghapus produk)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  const supabase = getSupabaseClient(token);

  // Verifikasi pengguna
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Token tidak valid.' }, { status: 401 });
  }

  // Ambil data produk untuk cek kepemilikan
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('user_id')
    .eq('id', id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: 'Produk tidak ditemukan.' }, { status: 404 });
  }

  if (product.user_id !== user.id) {
    return NextResponse.json({ error: 'Akses ditolak. Anda bukan pemilik produk ini.' }, { status: 403 });
  }

  // Jika pemiliknya benar, lanjutkan hapus
  try {
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ message: 'Produk berhasil dihapus.' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal menghapus produk: ' + error.message }, { status: 500 });
  }
}