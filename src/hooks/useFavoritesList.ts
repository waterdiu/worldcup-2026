import { useEffect, useState } from 'react';
import { supabase, type AuthUser } from '../lib/supabase';
import type { FavoriteRecord } from './useFavorite';

interface FavoritesListState {
  favorites: FavoriteRecord[];
  loading: boolean;
}

export function useFavoritesList(user: AuthUser | null): FavoritesListState {
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);
  const [loading, setLoading] = useState(Boolean(user && supabase));

  useEffect(() => {
    if (!user || !supabase) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    supabase
      .from('favorites')
      .select('id,target_type,target_id,created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!mounted) return;
        setFavorites((data ?? []) as FavoriteRecord[]);
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  return { favorites, loading };
}
