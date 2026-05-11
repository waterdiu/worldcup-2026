import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

export type AuthUser = Pick<User, 'id' | 'email' | 'user_metadata'>;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

export function getAuthDisplayName(user: AuthUser | null): string {
  if (!user) return '';
  const name = user.user_metadata?.name ?? user.user_metadata?.full_name;
  return typeof name === 'string' && name.trim() ? name : user.email ?? 'World Cup user';
}
