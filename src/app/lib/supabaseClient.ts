// lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';

// Ambil variabel dari environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Buat dan ekspor klien supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);