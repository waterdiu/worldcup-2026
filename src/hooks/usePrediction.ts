import { useEffect, useState } from 'react';
import { supabase, type AuthUser } from '../lib/supabase';

export interface PredictionRecord {
  id: string;
  match_id: string;
  winner: string;
  home_score: number;
  away_score: number;
  updated_at: string;
}

interface PredictionState {
  prediction: PredictionRecord | null;
  loading: boolean;
  savePrediction: (input: {
    winner: string;
    homeScore: number;
    awayScore: number;
  }) => Promise<void>;
}

export function usePrediction(user: AuthUser | null, matchId: string): PredictionState {
  const [prediction, setPrediction] = useState<PredictionRecord | null>(null);
  const [loading, setLoading] = useState(Boolean(user && supabase));

  useEffect(() => {
    if (!user || !supabase) {
      setPrediction(null);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    supabase
      .from('predictions')
      .select('id,match_id,winner,home_score,away_score,updated_at')
      .eq('user_id', user.id)
      .eq('match_id', matchId)
      .maybeSingle()
      .then(({ data }) => {
        if (!mounted) return;
        setPrediction((data as PredictionRecord | null) ?? null);
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [matchId, user]);

  async function savePrediction(input: {
    winner: string;
    homeScore: number;
    awayScore: number;
  }): Promise<void> {
    if (!user || !supabase) return;

    setLoading(true);
    const payload = {
      user_id: user.id,
      match_id: matchId,
      winner: input.winner,
      home_score: input.homeScore,
      away_score: input.awayScore,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('predictions')
      .upsert(payload, { onConflict: 'user_id,match_id' })
      .select('id,match_id,winner,home_score,away_score,updated_at')
      .single();

    if (!error) {
      setPrediction(data as PredictionRecord);
    }
    setLoading(false);
  }

  return { prediction, loading, savePrediction };
}
