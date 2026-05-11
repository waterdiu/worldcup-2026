import { useEffect, useState } from 'react';
import { supabase, type AuthUser } from '../lib/supabase';

interface AdminStatus {
  isAdmin: boolean;
  loading: boolean;
}

export function useAdminStatus(user: AuthUser | null): AdminStatus {
  const [isAdmin, setIsAdmin] = useState(false);
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
        setIsAdmin(Boolean(data));
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  return { isAdmin, loading };
}
