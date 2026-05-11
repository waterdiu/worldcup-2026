import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface AdminProfileRecord {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface AdminFavoriteRecord {
  id: string;
  user_id: string;
  target_type: string;
  target_id: string;
  created_at: string;
}

export interface AdminPredictionRecord {
  id: string;
  user_id: string;
  match_id: string;
  winner: string;
  home_score: number;
  away_score: number;
  updated_at: string;
}

export interface AdminPagePermissionRecord {
  path: string;
  label: string;
  require_login: boolean;
  admin_only: boolean;
  updated_at: string;
}

interface AdminDashboardState {
  profiles: AdminProfileRecord[];
  favorites: AdminFavoriteRecord[];
  predictions: AdminPredictionRecord[];
  pagePermissions: AdminPagePermissionRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  savePagePermission: (permission: AdminPagePermissionRecord) => Promise<void>;
}

export function useAdminDashboard(enabled: boolean): AdminDashboardState {
  const [profiles, setProfiles] = useState<AdminProfileRecord[]>([]);
  const [favorites, setFavorites] = useState<AdminFavoriteRecord[]>([]);
  const [predictions, setPredictions] = useState<AdminPredictionRecord[]>([]);
  const [pagePermissions, setPagePermissions] = useState<AdminPagePermissionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled || !supabase) return;

    setLoading(true);
    setError(null);
    const [profilesResult, favoritesResult, predictionsResult, pagePermissionsResult] = await Promise.all([
      supabase.from('profiles').select('id,email,display_name,avatar_url,created_at').order('created_at', { ascending: false }),
      supabase.from('favorites').select('id,user_id,target_type,target_id,created_at').order('created_at', { ascending: false }),
      supabase.from('predictions').select('id,user_id,match_id,winner,home_score,away_score,updated_at').order('updated_at', { ascending: false }),
      supabase.from('page_permissions').select('path,label,require_login,admin_only,updated_at').order('path', { ascending: true })
    ]);

    const firstError =
      profilesResult.error ?? favoritesResult.error ?? predictionsResult.error ?? pagePermissionsResult.error;

    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    setProfiles((profilesResult.data ?? []) as AdminProfileRecord[]);
    setFavorites((favoritesResult.data ?? []) as AdminFavoriteRecord[]);
    setPredictions((predictionsResult.data ?? []) as AdminPredictionRecord[]);
    setPagePermissions((pagePermissionsResult.data ?? []) as AdminPagePermissionRecord[]);
    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function savePagePermission(permission: AdminPagePermissionRecord): Promise<void> {
    if (!supabase) return;

    const { error: saveError } = await supabase.from('page_permissions').upsert({
      path: permission.path,
      label: permission.label,
      require_login: permission.require_login,
      admin_only: permission.admin_only,
      updated_at: new Date().toISOString()
    });

    if (saveError) {
      setError(saveError.message);
      return;
    }

    await refresh();
  }

  return {
    profiles,
    favorites,
    predictions,
    pagePermissions,
    loading,
    error,
    refresh,
    savePagePermission
  };
}
