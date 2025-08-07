// hooks/useAuthForm.ts
import { supabase } from '@/app/lib/supabaseClient';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export function useAuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const handleRegister = async () => {
    setMessage('Mendaftarkan...');
    try {
      const response = await fetch(`/api/products`, {
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
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login gagal');

      localStorage.setItem('session', JSON.stringify(data.session));
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
      redirectTo: window.location.origin, // Arahkan kembali ke halaman utama setelah login
    },
  });
};


  // Kembalikan semua state dan fungsi yang dibutuhkan oleh UI
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