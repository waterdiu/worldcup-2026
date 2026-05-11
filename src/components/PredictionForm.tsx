import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePrediction } from '../hooks/usePrediction';
import type { Locale } from '../i18n/content';

interface PredictionFormProps {
  matchId: string;
  homeLabel: string;
  awayLabel: string;
  locale: Locale;
  compact?: boolean;
}

export function PredictionForm({ matchId, homeLabel, awayLabel, locale, compact = false }: PredictionFormProps) {
  const { user } = useAuth();
  const { prediction, loading, savePrediction } = usePrediction(user, matchId);
  const [winner, setWinner] = useState('draw');
  const [homeScore, setHomeScore] = useState(1);
  const [awayScore, setAwayScore] = useState(1);

  useEffect(() => {
    if (!prediction) return;
    setWinner(prediction.winner);
    setHomeScore(prediction.home_score);
    setAwayScore(prediction.away_score);
  }, [prediction]);

  if (!user) {
    const content = (
      <>
        <span>{locale === 'zh' ? '我的预测' : 'My Prediction'}</span>
        <p>{locale === 'zh' ? '登录后可以预测胜负和比分。' : 'Sign in to predict the winner and score.'}</p>
      </>
    );

    return compact ? (
      <div className="match-info-card__fact prediction-card prediction-card--compact">
        {content}
      </div>
    ) : (
      <article className="match-detail-card prediction-card">
        <h3>{locale === 'zh' ? '我的预测' : 'My Prediction'}</h3>
        <p>{locale === 'zh' ? '登录后可以预测胜负和比分。' : 'Sign in to predict the winner and score.'}</p>
      </article>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await savePrediction({ winner, homeScore, awayScore });
  }

  const form = (
    <form className="prediction-form" onSubmit={handleSubmit}>
      <label>
        {locale === 'zh' ? '胜负选择' : 'Winner'}
        <select value={winner} onChange={(event) => setWinner(event.target.value)}>
          <option value="home">{homeLabel}</option>
          <option value="draw">{locale === 'zh' ? '平局' : 'Draw'}</option>
          <option value="away">{awayLabel}</option>
        </select>
      </label>
      <div className="prediction-form__scores">
        <label>
          {homeLabel}
          <input
            min="0"
            type="number"
            value={homeScore}
            onChange={(event) => setHomeScore(Number(event.target.value))}
          />
        </label>
        <label>
          {awayLabel}
          <input
            min="0"
            type="number"
            value={awayScore}
            onChange={(event) => setAwayScore(Number(event.target.value))}
          />
        </label>
      </div>
      <button type="submit" disabled={loading}>
        {prediction
          ? locale === 'zh'
            ? '更新预测'
            : 'Update prediction'
          : locale === 'zh'
            ? '保存预测'
            : 'Save prediction'}
      </button>
    </form>
  );

  return compact ? (
    <div className="match-info-card__fact prediction-card prediction-card--compact">
      <span>{locale === 'zh' ? '我的预测' : 'My Prediction'}</span>
      {form}
    </div>
  ) : (
    <article className="match-detail-card prediction-card">
      <h3>{locale === 'zh' ? '我的预测' : 'My Prediction'}</h3>
      {form}
    </article>
  );
}
