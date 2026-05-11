import { useEffect, useState } from 'react';
import { supabase, type AuthUser } from '../lib/supabase';

interface AdminStatus {
  isAdmin: boolean;
  loading: boolean;
}

const ADMIN_STATUS_CACHE_KEY = 'worldcup2026:is-admin';

function readCachedAdminStatus(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(ADMIN_STATUS_CACHE_KEY) === 'true';
}

function writeCachedAdminStatus(isAdmin: boolean): void {
  if (typeof window === 'undefined') return;
  if (isAdmin) {
    window.localStorage.setItem(ADMIN_STATUS_CACHE_KEY, 'true');
    return;
  }
  window.localStorage.removeItem(ADMIN_STATUS_CACHE_KEY);
}

export function useAdminStatus(user: AuthUser | null): AdminStatus {
  const [isAdmin, setIsAdmin] = useState(readCachedAdminStatus);
  const [loading, setLoading] = useState(Boolean(user && supabase));

  useEffect(() => {
    if (!user || !supabase) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()
      .then(({ data }) => {
        if (!mounted) return;
        const nextIsAdmin = Boolean(data);
        setIsAdmin(nextIsAdmin);
        writeCachedAdminStatus(nextIsAdmin);
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  return { isAdmin, loading };
}
