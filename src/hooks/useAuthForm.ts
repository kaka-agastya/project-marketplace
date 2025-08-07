// hooks/useAuthForm.ts
import { supabase } from '@/app/lib/supabaseClient'; // Ganti path jika perlu
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const router = useRouter();

  const handleRegister = async () => {
    setMessage('Mendaftarkan...');
    try {
        // BUG FIX: Seharusnya memanggil /api/auth/register
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Registrasi gagal');
        setMessage('Registrasi berhasil! Silakan login.');
    } catch (error) {
        setMessage((error as Error).message);
    }
  };

  const handleLogin = async () => {
    setMessage('Logging in...');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login gagal');

      // ▼▼▼ PERBAIKAN DI SINI ▼▼▼
      // 1. Beritahu Supabase client di frontend tentang sesi baru ini.
      // Ini akan memicu listener onAuthStateChange di AuthContext kita.
      await supabase.auth.setSession(data.session);
      // ▲▲▲ SAMPAI DI SINI ▲▲▲
      
      setMessage('Login berhasil! Mengarahkan ke halaman utama...');
      router.push('/');
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  return {
    email,
    password,
    message,
    setEmail,
    setPassword,
    handleLogin,
    handleRegister,
    handleGoogleLogin,
  };
}