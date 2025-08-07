// app/api/cart/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const getSupabaseClient = (jwt: string) => {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { global: { headers: { Authorization: `Bearer ${jwt}` } } }
  );
};

const getOrCreateCart = async (supabase: any, userId: string) => {
  let { data: cart } = await supabase.from('carts').select('id').eq('user_id', userId).single();
  if (!cart) {
    const { data: newCart } = await supabase.from('carts').insert({ user_id: userId }).select('id').single();
    cart = newCart;
  }
  return cart;
};

// GET (melihat isi keranjang)
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
  const token = authHeader.split(' ')[1];
  const supabase = getSupabaseClient(token);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Token tidak valid.' }, { status: 401 });

  const cart = await getOrCreateCart(supabase, user.id);
  const { data, error } = await supabase.from('cart_items').select(`id, quantity, products ( id, name, price, image_url )`).eq('cart_id', cart.id);
  
  if (error) return NextResponse.json({ error: 'Gagal mengambil isi keranjang.' }, { status: 500 });
  return NextResponse.json(data);
}

// POST (menambah item ke keranjang)
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
  const token = authHeader.split(' ')[1];
  const supabase = getSupabaseClient(token);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Token tidak valid.' }, { status: 401 });

  const { product_id, quantity } = await request.json();
  if (!product_id || !quantity) return NextResponse.json({ error: 'Product ID dan quantity harus diisi' }, { status: 400 });

  const cart = await getOrCreateCart(supabase, user.id);
  
  const { data: existingItem } = await supabase.from('cart_items').select('*').eq('cart_id', cart.id).eq('product_id', product_id).single();

  let result;
  if (existingItem) {
    const { data, error } = await supabase.from('cart_items').update({ quantity: existingItem.quantity + quantity }).eq('id', existingItem.id).select().single();
    if (error) return NextResponse.json({ error: 'Gagal memperbarui item.' }, { status: 500 });
    result = data;
  } else {
    const { data, error } = await supabase.from('cart_items').insert({ cart_id: cart.id, product_id, quantity }).select().single();
    if (error) return NextResponse.json({ error: 'Gagal menambah item baru.' }, { status: 500 });
    result = data;
  }

  return NextResponse.json({ message: 'Item berhasil ditambahkan', item: result }, { status: 201 });
}