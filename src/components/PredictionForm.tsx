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

  const winnerOptions = [
    { value: 'home', label: locale === 'zh' ? '胜' : 'Home', title: homeLabel },
    { value: 'draw', label: locale === 'zh' ? '平' : 'Draw', title: locale === 'zh' ? '平局' : 'Draw' },
    { value: 'away', label: locale === 'zh' ? '负' : 'Away', title: awayLabel }
  ];

  const form = (
    <form className={`prediction-form${compact ? ' prediction-form--compact' : ''}`} onSubmit={handleSubmit}>
      <div className="prediction-form__winner">
        <span>{locale === 'zh' ? '胜负选择' : 'Winner'}</span>
        <div className="prediction-form__winner-buttons" role="group" aria-label={locale === 'zh' ? '胜负选择' : 'Winner'}>
          {winnerOptions.map((option) => (
            <button
              aria-pressed={winner === option.value}
              className={winner === option.value ? 'is-selected' : undefined}
              key={option.value}
              title={option.title}
              type="button"
              onClick={() => setWinner(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="prediction-form__scoreline">
        <span>{locale === 'zh' ? '比分预测' : 'Score'}</span>
        <div className="prediction-form__scores">
          <label>
            <span>{homeLabel}</span>
            <input
              aria-label={homeLabel}
              min="0"
              type="number"
              value={homeScore}
              onChange={(event) => setHomeScore(Number(event.target.value))}
            />
          </label>
          <label>
            <span>{awayLabel}</span>
            <input
              aria-label={awayLabel}
              min="0"
              type="number"
              value={awayScore}
              onChange={(event) => setAwayScore(Number(event.target.value))}
            />
          </label>
        </div>
      </div>
      <button className="prediction-form__submit" type="submit" disabled={loading}>
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
