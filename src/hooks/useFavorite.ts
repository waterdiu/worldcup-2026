import { useEffect, useState } from 'react';
import { supabase, type AuthUser } from '../lib/supabase';

export type FavoriteTargetType = 'team' | 'match' | 'city';

export interface FavoriteRecord {
  id: string;
  target_type: FavoriteTargetType;
  target_id: string;
  created_at: string;
}

interface FavoriteState {
  favorite: boolean;
  loading: boolean;
  toggleFavorite: () => Promise<void>;
}

export function useFavorite(
  user: AuthUser | null,
  targetType: FavoriteTargetType,
  targetId: string
): FavoriteState {
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(Boolean(user && supabase));

  useEffect(() => {
    if (!user || !supabase) {
      setFavorite(false);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .maybeSingle()
      .then(({ data }) => {
        if (!mounted) return;
        setFavorite(Boolean(data));
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [targetId, targetType, user]);

  async function toggleFavorite(): Promise<void> {
    if (!user || !supabase) return;

    setLoading(true);
    if (favorite) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('target_type', targetType)
        .eq('target_id', targetId);
      if (!error) setFavorite(false);
    } else {
      const { error } = await supabase.from('favorites').insert({
        user_id: user.id,
        target_type: targetType,
        target_id: targetId
      });
      if (!error) setFavorite(true);
    }
    setLoading(false);
  }

  return { favorite, loading, toggleFavorite };
}
