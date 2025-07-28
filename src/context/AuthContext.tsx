// context/AuthContext.tsx

'use client';

import { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { Session } from '@supabase/supabase-js';

// Tipe data untuk context kita
type AuthContextType = {
  session: Session | null;
  setSession: (session: Session | null) => void;
  isLoading: boolean;
};

// Membuat context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Membuat Provider
export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Coba ambil sesi dari localStorage saat aplikasi pertama kali dimuat
    const savedSession = localStorage.getItem('session');
    if (savedSession) {
      setSession(JSON.parse(savedSession));
    }
    setIsLoading(false);
  }, []);

  const value = {
    session,
    setSession,
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