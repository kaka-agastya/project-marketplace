// app/api/auth/login/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // Gunakan service key karena ini adalah aksi di server
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  if (!email || !password) {
    return NextResponse.json({ error: 'Email dan password harus diisi' }, { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  
  return NextResponse.json({ message: 'Login berhasil', session: data.session });
}