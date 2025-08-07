// context/AuthContext.tsx

'use client';

import { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/app/lib/supabaseClient'; // Pastikan path ini benar

// ▼▼▼ UBAH BAGIAN INI ▼▼▼
// Tipe data untuk context kita (hapus setSession)
type AuthContextType = {
  session: Session | null;
  isLoading: boolean;
};
// ▲▲▲ SAMPAI DI SINI ▲▲▲

// Membuat context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Membuat Provider
export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ambil sesi yang mungkin sudah ada saat komponen dimuat
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Buat listener untuk memantau perubahan status auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Hentikan listener saat komponen tidak lagi digunakan (cleanup)
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Objek value sekarang sudah cocok dengan tipenya
  const value = {
    session,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Membuat custom hook untuk kemudahan penggunaan
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}