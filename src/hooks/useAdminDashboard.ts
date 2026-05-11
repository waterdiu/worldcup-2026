import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface AdminProfileRecord {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  status: string | null;
  created_at: string;
}

export interface AdminRoleRecord {
  user_id: string;
  role: string;
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

export interface AdminUserPagePermissionRecord {
  id: string;
  user_id: string;
  path: string;
  can_access: boolean;
  requires_approval: boolean;
  updated_at: string;
}

interface AdminDashboardState {
  profiles: AdminProfileRecord[];
  roles: AdminRoleRecord[];
  favorites: AdminFavoriteRecord[];
  predictions: AdminPredictionRecord[];
  pagePermissions: AdminPagePermissionRecord[];
  userPagePermissions: AdminUserPagePermissionRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  saveProfile: (profile: AdminProfileRecord) => Promise<void>;
  saveRole: (userId: string, role: string | null) => Promise<void>;
  savePagePermission: (permission: AdminPagePermissionRecord) => Promise<void>;
  saveUserPagePermission: (permission: Omit<AdminUserPagePermissionRecord, 'id' | 'updated_at'>) => Promise<void>;
}

export function useAdminDashboard(enabled: boolean): AdminDashboardState {
  const [profiles, setProfiles] = useState<AdminProfileRecord[]>([]);
  const [roles, setRoles] = useState<AdminRoleRecord[]>([]);
  const [favorites, setFavorites] = useState<AdminFavoriteRecord[]>([]);
  const [predictions, setPredictions] = useState<AdminPredictionRecord[]>([]);
  const [pagePermissions, setPagePermissions] = useState<AdminPagePermissionRecord[]>([]);
  const [userPagePermissions, setUserPagePermissions] = useState<AdminUserPagePermissionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled || !supabase) return;

    setLoading(true);
    setError(null);
    const [profilesResult, rolesResult, favoritesResult, predictionsResult, pagePermissionsResult, userPagePermissionsResult] = await Promise.all([
      supabase.from('profiles').select('id,email,display_name,avatar_url,status,created_at').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('user_id,role'),
      supabase.from('favorites').select('id,user_id,target_type,target_id,created_at').order('created_at', { ascending: false }),
      supabase.from('predictions').select('id,user_id,match_id,winner,home_score,away_score,updated_at').order('updated_at', { ascending: false }),
      supabase.from('page_permissions').select('path,label,require_login,admin_only,updated_at').order('path', { ascending: true }),
      supabase.from('user_page_permissions').select('id,user_id,path,can_access,requires_approval,updated_at').order('updated_at', { ascending: false })
    ]);

    const firstError =
      profilesResult.error ??
      rolesResult.error ??
      favoritesResult.error ??
      predictionsResult.error ??
      pagePermissionsResult.error ??
      userPagePermissionsResult.error;

    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    setProfiles((profilesResult.data ?? []) as AdminProfileRecord[]);
    setRoles((rolesResult.data ?? []) as AdminRoleRecord[]);
    setFavorites((favoritesResult.data ?? []) as AdminFavoriteRecord[]);
    setPredictions((predictionsResult.data ?? []) as AdminPredictionRecord[]);
    setPagePermissions((pagePermissionsResult.data ?? []) as AdminPagePermissionRecord[]);
    setUserPagePermissions((userPagePermissionsResult.data ?? []) as AdminUserPagePermissionRecord[]);
    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function saveProfile(profile: AdminProfileRecord): Promise<void> {
    if (!supabase) return;
    const { error: saveError } = await supabase
      .from('profiles')
      .update({
        email: profile.email,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        status: profile.status ?? 'pending'
      })
      .eq('id', profile.id);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    await refresh();
  }

  async function saveRole(userId: string, role: string | null): Promise<void> {
    if (!supabase) return;
    const result = role
      ? await supabase.from('user_roles').upsert({ user_id: userId, role })
      : await supabase.from('user_roles').delete().eq('user_id', userId);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    await refresh();
  }

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

  async function saveUserPagePermission(
    permission: Omit<AdminUserPagePermissionRecord, 'id' | 'updated_at'>
  ): Promise<void> {
    if (!supabase) return;
    const { error: saveError } = await supabase.from('user_page_permissions').upsert(
      {
        user_id: permission.user_id,
        path: permission.path,
        can_access: permission.can_access,
        requires_approval: permission.requires_approval,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id,path' }
    );

    if (saveError) {
      setError(saveError.message);
      return;
    }

    await refresh();
  }

  return {
    profiles,
    roles,
    favorites,
    predictions,
    pagePermissions,
    userPagePermissions,
    loading,
    error,
    refresh,
    saveProfile,
    saveRole,
    savePagePermission,
    saveUserPagePermission
  };
}
