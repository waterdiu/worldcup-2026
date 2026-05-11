import { useEffect, useState } from 'react';
import { supabase, type AuthUser } from '../lib/supabase';

interface UserProfile {
  email?: string | null;
  display_name: string | null;
  avatar_url: string | null;
  status?: string | null;
}

interface UserProfileState {
  profile: UserProfile | null;
  loading: boolean;
  saving: boolean;
  saveProfile: (profile: UserProfile) => Promise<void>;
}

export function useUserProfile(user: AuthUser | null): UserProfileState {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(Boolean(user && supabase));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !supabase) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    supabase
      .from('profiles')
      .select('email,display_name,avatar_url,status')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!mounted) return;
        const existingProfile = (data as UserProfile | null) ?? null;
        setProfile(existingProfile);
        setLoading(false);
        if (!existingProfile) {
          void saveDefaultProfile(user);
        }
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  async function saveDefaultProfile(currentUser: AuthUser): Promise<void> {
    if (!supabase) return;
    const displayName = currentUser.user_metadata?.name ?? currentUser.user_metadata?.full_name;
    await supabase.from('profiles').upsert({
      id: currentUser.id,
      email: currentUser.email ?? null,
      display_name: typeof displayName === 'string' ? displayName : null,
      avatar_url:
        typeof currentUser.user_metadata?.avatar_url === 'string'
          ? currentUser.user_metadata.avatar_url
          : typeof currentUser.user_metadata?.picture === 'string'
            ? currentUser.user_metadata.picture
            : null,
      status: 'pending'
    });
  }

  async function saveProfile(nextProfile: UserProfile): Promise<void> {
    if (!user || !supabase) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email ?? null,
      display_name: nextProfile.display_name?.trim() || null,
      avatar_url: nextProfile.avatar_url,
      status: profile?.status ?? 'pending'
    });

    if (error && error.message.includes('email')) {
      const { error: fallbackError } = await supabase.from('profiles').upsert({
        id: user.id,
        display_name: nextProfile.display_name?.trim() || null,
        avatar_url: nextProfile.avatar_url
      });
      if (!fallbackError) {
        setProfile(nextProfile);
      }
    } else if (!error) {
      setProfile(nextProfile);
    }

    setSaving(false);
  }

  return { profile, loading, saving, saveProfile };
}
