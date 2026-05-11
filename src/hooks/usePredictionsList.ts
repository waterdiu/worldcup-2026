import { useEffect, useState } from 'react';
import { supabase, type AuthUser } from '../lib/supabase';
import type { PredictionRecord } from './usePrediction';

interface PredictionsListState {
  predictions: PredictionRecord[];
  loading: boolean;
}

export function usePredictionsList(user: AuthUser | null): PredictionsListState {
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
  const [loading, setLoading] = useState(Boolean(user && supabase));

  useEffect(() => {
    if (!user || !supabase) {
      setPredictions([]);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    supabase
      .from('predictions')
      .select('id,match_id,winner,home_score,away_score,updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .then(({ data }) => {
        if (!mounted) return;
        setPredictions((data ?? []) as PredictionRecord[]);
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  return { predictions, loading };
}
