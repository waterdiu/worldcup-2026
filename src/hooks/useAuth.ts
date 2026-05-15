import { useEffect, useState } from 'react';
import { stripAppBasePath } from '../i18n/content';
import { supabase, type AuthUser } from '../lib/supabase';

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  authMessage: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (input: { email: string; password: string; displayName: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

export function buildOAuthRedirectUrl(): string {
  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const appPath = stripAppBasePath(window.location.pathname);
  const path = normalizedBase && normalizedBase !== '/'
    ? `${normalizedBase}${appPath === '/' ? '/' : appPath}`
    : appPath;

  return new URL(path, window.location.origin).toString();
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }

    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  async function signInWithGoogle(): Promise<void> {
    if (!supabase) return;
    setAuthMessage(null);
    const redirectTo = buildOAuthRedirectUrl();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    });
  }

  async function signInWithEmail(email: string, password: string): Promise<void> {
    if (!supabase) return;
    setLoading(true);
    setAuthMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthMessage(error.message);
    }
    setLoading(false);
  }

  async function signUpWithEmail(input: { email: string; password: string; displayName: string }): Promise<void> {
    if (!supabase) return;
    setLoading(true);
    setAuthMessage(null);
    const { error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          name: input.displayName,
          full_name: input.displayName
        }
      }
    });
    setAuthMessage(
      error
        ? error.message
        : '注册已提交。如果 Supabase 开启了邮箱验证，请先点击邮件里的确认链接。'
    );
    setLoading(false);
  }

  async function signOut(): Promise<void> {
    if (!supabase) return;
    await supabase.auth.signOut();
    window.localStorage.removeItem('worldcup2026:is-admin');
    setUser(null);
  }

  return { user, loading, authMessage, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut };
}
