import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFavoritesList } from '../hooks/useFavoritesList';
import { usePredictionsList } from '../hooks/usePredictionsList';
import { useUserProfile } from '../hooks/useUserProfile';
import { localizePath, type AppCopy } from '../i18n/content';
import { formatBracketLabel, formatTeamName, formatVenueName } from '../i18n/formatters';
import { getAuthDisplayName, isSupabaseConfigured, supabase } from '../lib/supabase';
import type { BracketRoundData, FinalsMatchResultData, GroupStageMatchData } from '../types/tournament';
import { formatBeijingMonthDayKickoff } from '../utils/beijingTime';

interface UserCenterPageProps {
  bracket: BracketRoundData[];
  copy: AppCopy;
  finalsMatchResults: FinalsMatchResultData[];
  groupStageMatches: GroupStageMatchData[];
}

interface MatchSummary {
  id: string;
  title: string;
  meta: string;
  homeLabel: string;
  awayLabel: string;
  status: 'scheduled' | 'completed';
  homeScore?: number;
  awayScore?: number;
}

function buildMatchLookup(
  locale: AppCopy['locale'],
  groupStageMatches: GroupStageMatchData[],
  bracket: BracketRoundData[],
  finalsMatchResults: FinalsMatchResultData[]
) {
  const resultById = new Map(finalsMatchResults.map((result) => [result.id, result]));
  const groupMatches = groupStageMatches.map((match) => ({
    id: match.id,
    title: `${formatTeamName(match.homeTeam, locale)} VS ${formatTeamName(match.awayTeam, locale)}`,
    meta: `${locale === 'zh' ? `${match.groupId} 组` : `Group ${match.groupId}`} · ${formatBeijingMonthDayKickoff(match.dateLabel, locale)} · ${formatVenueName(match.venue, locale)}`,
    homeLabel: formatTeamName(match.homeTeam, locale),
    awayLabel: formatTeamName(match.awayTeam, locale),
    status: resultById.get(match.id)?.status ?? 'scheduled',
    homeScore: resultById.get(match.id)?.homeScore,
    awayScore: resultById.get(match.id)?.awayScore
  }));

  const knockoutMatches = bracket.flatMap((round) =>
    round.matches.map((match) => ({
      id: match.id,
      title: `${formatBracketLabel(match.homeLabel, locale)} VS ${formatBracketLabel(match.awayLabel, locale)}`,
      meta: `${formatBracketLabel(round.round, locale)} · ${formatBeijingMonthDayKickoff(match.dateLabel, locale)} · ${formatVenueName(match.venue, locale)}`,
      homeLabel: formatBracketLabel(match.homeLabel, locale),
      awayLabel: formatBracketLabel(match.awayLabel, locale),
      status: resultById.get(match.id)?.status ?? 'scheduled',
      homeScore: resultById.get(match.id)?.homeScore,
      awayScore: resultById.get(match.id)?.awayScore
    }))
  );

  return new Map([...groupMatches, ...knockoutMatches].map((match) => [match.id, match]));
}

function getFallbackMatch(id: string, locale: AppCopy['locale']): MatchSummary {
  return {
    id,
    title: locale === 'zh' ? `比赛 ${id}` : `Match ${id}`,
    meta: locale === 'zh' ? '赛程信息待同步' : 'Match metadata pending sync',
    homeLabel: locale === 'zh' ? '主队' : 'Home',
    awayLabel: locale === 'zh' ? '客队' : 'Away',
    status: 'scheduled'
  };
}

function getWinnerLabel(winner: string, match: MatchSummary, locale: AppCopy['locale']) {
  if (winner === 'home') return locale === 'zh' ? `${match.homeLabel} 胜` : `${match.homeLabel} win`;
  if (winner === 'away') return locale === 'zh' ? `${match.awayLabel} 胜` : `${match.awayLabel} win`;
  return locale === 'zh' ? '平局' : 'Draw';
}

function getFavoriteHref(targetType: string, targetId: string, locale: AppCopy['locale']) {
  if (targetType === 'team') return localizePath(`/teams/${encodeURIComponent(targetId)}`, locale);
  if (targetType === 'city') return localizePath(`/cities/${encodeURIComponent(targetId)}`, locale);
  return localizePath(`/matches/${encodeURIComponent(targetId)}`, locale);
}

function getPredictedScoreLabel(homeScore: number, awayScore: number): string {
  return `${homeScore}-${awayScore}`;
}

function getActualResultLabel(match: MatchSummary, locale: AppCopy['locale']): string {
  if (match.status !== 'completed' || match.homeScore === undefined || match.awayScore === undefined) {
    return locale === 'zh' ? '未赛' : 'Not played';
  }
  return `${match.homeScore}-${match.awayScore}`;
}

function getActualWinner(match: MatchSummary): 'home' | 'draw' | 'away' | null {
  if (match.status !== 'completed' || match.homeScore === undefined || match.awayScore === undefined) return null;
  if (match.homeScore > match.awayScore) return 'home';
  if (match.homeScore < match.awayScore) return 'away';
  return 'draw';
}

function getPredictionCompareLabel(
  prediction: { winner: string; home_score: number; away_score: number },
  match: MatchSummary,
  locale: AppCopy['locale']
): string {
  const actualWinner = getActualWinner(match);
  if (!actualWinner) return locale === 'zh' ? '等待赛果' : 'Awaiting result';
  const winnerHit = prediction.winner === actualWinner;
  const scoreHit = prediction.home_score === match.homeScore && prediction.away_score === match.awayScore;
  if (scoreHit) return locale === 'zh' ? '比分命中' : 'Exact score';
  if (winnerHit) return locale === 'zh' ? '胜负命中' : 'Pick correct';
  return locale === 'zh' ? '未命中' : 'Missed';
}

function getPredictionCompareClass(
  prediction: { winner: string; home_score: number; away_score: number },
  match: MatchSummary
): string {
  const actualWinner = getActualWinner(match);
  if (!actualWinner) return 'is-pending';
  if (prediction.home_score === match.homeScore && prediction.away_score === match.awayScore) return 'is-exact';
  if (prediction.winner === actualWinner) return 'is-hit';
  return 'is-miss';
}

function getPredictionScore(
  prediction: { winner: string; home_score: number; away_score: number },
  match: MatchSummary
) {
  const actualWinner = getActualWinner(match);
  if (!actualWinner) return null;
  if (prediction.home_score === match.homeScore && prediction.away_score === match.awayScore) return 3;
  if (prediction.winner === actualWinner) return 1;
  return 0;
}

export function UserCenterPage({ bracket, copy, finalsMatchResults, groupStageMatches }: UserCenterPageProps) {
  const { user, loading, authMessage, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } = useAuth();
  const [favoriteVersion, setFavoriteVersion] = useState(0);
  const { favorites, loading: favoritesLoading } = useFavoritesList(user, favoriteVersion);
  const { predictions, loading: predictionsLoading } = usePredictionsList(user);
  const { profile, loading: profileLoading, saving: profileSaving, saveProfile } = useUserProfile(user);
  const [displayName, setDisplayName] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const signedIn = Boolean(user);
  const matchLookup = useMemo(
    () => buildMatchLookup(copy.locale, groupStageMatches, bracket, finalsMatchResults),
    [bracket, copy.locale, finalsMatchResults, groupStageMatches]
  );
  const avatarUrl =
    profile?.avatar_url ??
    (typeof user?.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : undefined) ??
    (typeof user?.user_metadata?.picture === 'string' ? user.user_metadata.picture : undefined);
  const predictionScores = predictions.map((prediction) =>
    getPredictionScore(prediction, matchLookup.get(prediction.match_id) ?? getFallbackMatch(prediction.match_id, copy.locale))
  );
  const resolvedPredictions = predictionScores.filter((score) => score !== null);
  const exactPredictionCount = predictionScores.filter((score) => score === 3).length;
  const winnerHitCount = predictionScores.filter((score) => score !== null && score > 0).length;
  const predictionPoints = predictionScores.reduce<number>((total, score) => total + (score ?? 0), 0);
  const favoriteTeams = useMemo(
    () => new Set(favorites.filter((favorite) => favorite.target_type === 'team').map((favorite) => favorite.target_id)),
    [favorites]
  );
  const suggestedTeams = useMemo(
    () =>
      Array.from(new Set(groupStageMatches.flatMap((match) => [match.homeTeam, match.awayTeam])))
        .slice(0, 10)
        .map((team) => ({ id: team, label: formatTeamName(team, copy.locale) })),
    [copy.locale, groupStageMatches]
  );

  useEffect(() => {
    if (!user) {
      setDisplayName('');
      return;
    }
    setDisplayName(profile?.display_name ?? getAuthDisplayName(user));
  }, [profile?.display_name, user]);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveProfile({
      display_name: displayName,
      avatar_url: avatarUrl ?? null
    });
  }

  async function handleEmailAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (authMode === 'register') {
      await signUpWithEmail({ email: authEmail, password: authPassword, displayName: registerName });
      return;
    }
    await signInWithEmail(authEmail, authPassword);
  }

  async function toggleTeamFavorite(teamId: string) {
    if (!user || !supabase) return;
    if (favoriteTeams.has(teamId)) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('target_type', 'team').eq('target_id', teamId);
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, target_type: 'team', target_id: teamId });
    }
    setFavoriteVersion((value) => value + 1);
  }

  const authPanel = (
    <div className="user-auth-panel">
      <div className="user-auth-tabs">
        <button type="button" className={authMode === 'login' ? 'is-active' : undefined} onClick={() => setAuthMode('login')}>
          {copy.locale === 'zh' ? '登录' : 'Login'}
        </button>
        <button type="button" className={authMode === 'register' ? 'is-active' : undefined} onClick={() => setAuthMode('register')}>
          {copy.locale === 'zh' ? '注册' : 'Register'}
        </button>
      </div>
      <p className="user-auth-intro">
        {copy.locale === 'zh' ? '登录后可以同步收藏和预测。' : 'Sign in to sync favorites and predictions.'}
      </p>
      <form className="user-auth-form" onSubmit={handleEmailAuth}>
        {authMode === 'register' ? (
          <label>
            {copy.locale === 'zh' ? '昵称' : 'Display name'}
            <input value={registerName} onChange={(event) => setRegisterName(event.target.value)} required />
          </label>
        ) : null}
        <label>
          Email
          <input type="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} required />
        </label>
        <label>
          {copy.locale === 'zh' ? '密码' : 'Password'}
          <input minLength={6} type="password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} required />
        </label>
        <button type="submit" disabled={loading || !isSupabaseConfigured}>
          {authMode === 'register'
            ? copy.locale === 'zh'
              ? '注册账号'
              : 'Create account'
            : copy.locale === 'zh'
              ? '登录'
              : 'Sign in'}
        </button>
      </form>
      <div className="user-auth-divider">{copy.locale === 'zh' ? '或' : 'OR'}</div>
      <div className="user-auth-actions">
        <button type="button" onClick={signInWithGoogle} disabled={loading || !isSupabaseConfigured}>
          {copy.locale === 'zh' ? '使用 Google 登录' : 'Sign in with Google'}
        </button>
      </div>
      {authMessage ? <p className="user-auth-message">{authMessage}</p> : null}
      {!isSupabaseConfigured ? <span>{copy.locale === 'zh' ? 'Supabase 尚未配置' : 'Supabase is not configured'}</span> : null}
    </div>
  );

  if (!signedIn || !user) {
    return (
      <section className="section user-center-page user-center-page--auth">
        <div className="user-auth-layout">
          <aside className="user-auth-atmos">
            <h1 aria-label={copy.locale === 'zh' ? '我的世界杯' : 'My World Cup'}>
              {copy.locale === 'zh' ? '我的' : 'My'}
              <br />
              <em>{copy.locale === 'zh' ? '世界杯' : 'World Cup'}</em>
            </h1>
            <div className="user-auth-features">
              {(copy.locale === 'zh'
                ? ['收藏感兴趣的比赛，随时追踪赛果', '关注支持的球队，赛前集中查看', '预测比赛胜负与比分，赛后自动核对', '预测积分榜，和其他球迷同场竞技']
                : ['Save matches and track results', 'Follow teams before matchday', 'Predict winners and exact scores', 'Compete on the prediction leaderboard']
              ).map((item, index) => (
                <div className="user-auth-feature" key={item}>
                  <span>{['★', '◎', '?', '↑'][index]}</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </aside>
          <div className="user-auth-form-wrap">{authPanel}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="section user-center-page user-center-page--signed-in">
      <div className="user-page-shell">
        <div className="user-profile-hero" data-num="2026">
          {avatarUrl ? <img className="user-profile-avatar" src={avatarUrl} alt="" /> : <div className="user-profile-avatar">{getAuthDisplayName(user).slice(0, 1).toUpperCase()}</div>}
          <div>
            <strong>{profile?.display_name || getAuthDisplayName(user)}</strong>
            <span>{user?.email}</span>
          </div>
          <form className="user-profile-form user-profile-form--inline" onSubmit={handleProfileSubmit}>
            <label>
              {copy.locale === 'zh' ? '显示昵称' : 'Display name'}
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} disabled={profileLoading} />
            </label>
            <button type="submit" disabled={profileSaving || profileLoading}>
              {profileSaving ? (copy.locale === 'zh' ? '保存中...' : 'Saving...') : copy.locale === 'zh' ? '保存资料' : 'Save profile'}
            </button>
            <button type="button" className="user-profile-form__secondary" onClick={signOut}>
              {copy.locale === 'zh' ? '退出登录' : 'Sign out'}
            </button>
          </form>
        </div>

        <div className="user-score-strip" aria-label={copy.locale === 'zh' ? '我的世界杯数据' : 'My World Cup metrics'}>
          <article><strong className="is-lime">{favorites.length}</strong><span>{copy.locale === 'zh' ? '收藏比赛' : 'Saved'}</span></article>
          <article><strong>{predictions.length}</strong><span>{copy.locale === 'zh' ? '预测场次' : 'Predictions'}</span></article>
          <article><strong>{winnerHitCount}</strong><span>{copy.locale === 'zh' ? '胜负命中' : 'Pick hits'}</span><small>{resolvedPredictions.length ? `${Math.round((winnerHitCount / resolvedPredictions.length) * 100)}%` : '0%'}</small></article>
          <article><strong className="is-gold">{exactPredictionCount}</strong><span>{copy.locale === 'zh' ? '精准比分' : 'Exact score'}</span><small>{copy.locale === 'zh' ? '+3分/个' : '+3 each'}</small></article>
          <article><strong>{predictionPoints}</strong><span>{copy.locale === 'zh' ? '预测积分' : 'Points'}</span></article>
        </div>

        <div className="user-section-rule">
          <span>{copy.locale === 'zh' ? '我关注的球队' : 'Followed Teams'}</span>
          <small>{copy.locale === 'zh' ? '点击球队可关注或取消关注' : 'Click a team to follow or unfollow'}</small>
        </div>
        <div className="user-fav-teams">
          <span>{copy.locale === 'zh' ? '推荐球队' : 'Suggested'}</span>
          <div>
            {suggestedTeams.map((team) => (
              <button
                className={favoriteTeams.has(team.id) ? 'is-on' : undefined}
                type="button"
                key={team.id}
                onClick={() => toggleTeamFavorite(team.id)}
              >
                {team.label}
              </button>
            ))}
          </div>
        </div>

        <div className="user-section-rule">
          <span>{copy.locale === 'zh' ? '我的收藏 & 预测' : 'Favorites & Predictions'}</span>
        </div>
        <div className="user-center-grid">
        <article className="user-center-card">
          <div className="user-center-card__heading">
            <h2>{copy.locale === 'zh' ? '我的收藏' : 'My Favorites'}</h2>
          </div>
          {signedIn && favorites.length > 0 ? (
            <ul className="user-center-list user-center-list--matches">
              {favorites.map((favorite) => {
                const match = matchLookup.get(favorite.target_id) ?? getFallbackMatch(favorite.target_id, copy.locale);
                const isMatchFavorite = favorite.target_type === 'match';
                const favoriteLabel =
                  favorite.target_type === 'team'
                    ? formatTeamName(favorite.target_id, copy.locale)
                    : favorite.target_type === 'city'
                      ? favorite.target_id
                      : match.title;
                return (
                  <li key={favorite.id}>
                    <a className="user-match-card" href={getFavoriteHref(favorite.target_type, favorite.target_id, copy.locale)}>
                      <span className="user-match-card__main">
                        <strong>{favoriteLabel}</strong>
                        <span>{isMatchFavorite ? match.meta : favorite.target_type}</span>
                      </span>
                      {isMatchFavorite ? (
                        <span className="user-match-card__status">
                          {copy.locale === 'zh' ? '实际结果' : 'Result'} <b>{getActualResultLabel(match, copy.locale)}</b>
                        </span>
                      ) : null}
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>
              {favoritesLoading
                ? copy.locale === 'zh'
                  ? '正在读取收藏...'
                  : 'Loading favorites...'
                : copy.locale === 'zh'
                  ? '还没有收藏比赛。进入比赛详情页，点击“收藏比赛”后会显示在这里。'
                  : 'No saved matches yet. Save a match from its detail page to see it here.'}
            </p>
          )}
        </article>

        <article className="user-center-card">
          <div className="user-center-card__heading">
            <h2>{copy.locale === 'zh' ? '我的预测' : 'My Predictions'}</h2>
          </div>
          {signedIn && predictions.length > 0 ? (
            <ul className="user-center-list user-center-list--matches">
              {predictions.map((prediction) => {
                const match = matchLookup.get(prediction.match_id) ?? getFallbackMatch(prediction.match_id, copy.locale);
                return (
                  <li key={prediction.id}>
                    <a className="user-match-card user-match-card--prediction" href={localizePath(`/matches/${encodeURIComponent(match.id)}`, copy.locale)}>
                      <span className="user-match-card__main">
                        <strong>{match.title}</strong>
                        <span>{match.meta}</span>
                      </span>
                      <span className="user-prediction-result">
                        <span>
                          <em>{copy.locale === 'zh' ? '我的预测' : 'My pick'}</em>
                          <b>{getWinnerLabel(prediction.winner, match, copy.locale)} · {getPredictedScoreLabel(prediction.home_score, prediction.away_score)}</b>
                        </span>
                        <span>
                          <em>{copy.locale === 'zh' ? '实际结果' : 'Result'}</em>
                          <b>{getActualResultLabel(match, copy.locale)}</b>
                        </span>
                        <span className={`user-prediction-result__badge ${getPredictionCompareClass(prediction, match)}`}>
                          {getPredictionCompareLabel(prediction, match, copy.locale)}
                        </span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>
              {predictionsLoading
                ? copy.locale === 'zh'
                  ? '正在读取预测...'
                  : 'Loading predictions...'
                : copy.locale === 'zh'
                  ? '还没有预测。进入比赛详情页，填写胜平负和比分后会显示在这里。'
                  : 'No predictions yet. Submit a winner and score from a match detail page to see it here.'}
            </p>
          )}
        </article>
      </div>
      <div className="user-leaderboard">
        <div className="user-leaderboard__head">
          <span>{copy.locale === 'zh' ? '预测积分榜' : 'Prediction Leaderboard'}</span>
          <small>{copy.locale === 'zh' ? '胜负 +1 · 精准比分 +3' : 'Winner +1 · exact score +3'}</small>
        </div>
        <div className="user-leaderboard__row is-me">
          <b>{copy.locale === 'zh' ? '我的积分' : 'My points'}</b>
          <span>{predictionPoints}</span>
          <small>{copy.locale === 'zh' ? `${predictions.length} 场预测` : `${predictions.length} predictions`}</small>
        </div>
      </div>
      </div>
    </section>
  );
}
