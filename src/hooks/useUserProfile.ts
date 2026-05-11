import { useEffect, useState } from 'react';
import { supabase, type AuthUser } from '../lib/supabase';

interface UserProfile {
  display_name: string | null;
  avatar_url: string | null;
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
      .select('display_name,avatar_url')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!mounted) return;
        setProfile((data as UserProfile | null) ?? null);
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  async function saveProfile(nextProfile: UserProfile): Promise<void> {
    if (!user || !supabase) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      display_name: nextProfile.display_name?.trim() || null,
      avatar_url: nextProfile.avatar_url
    });

    if (!error) {
      setProfile(nextProfile);
    }

    setSaving(false);
  }

  return { profile, loading, saving, saveProfile };
}
