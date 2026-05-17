import { localizePath, type AppCopy } from '../i18n/content';
import { formatTeamName, formatVenueName } from '../i18n/formatters';
import type { WorldCupSiteData, WorldCupHistoryMatch, WorldCupRecentMatch } from '../data/siteData';

type MatchDetailRecord = {
  kind: 'recent' | 'world_cup_history';
  match: WorldCupRecentMatch | WorldCupHistoryMatch;
};

function formatDetailDate(dateIso: string, locale: AppCopy['locale']) {
  if (locale === 'en') return dateIso;
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return dateIso;
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

function findHistoricalMatch(siteData: WorldCupSiteData, matchId: string): MatchDetailRecord | null {
  for (const entry of siteData.teamRecentMatches ?? []) {
    const found = entry.matches?.find((match) => match.match_id === matchId);
    if (found) return { kind: 'recent', match: found };
  }

  for (const entry of siteData.teamWorldCupHistory ?? []) {
    for (const edition of entry.editions ?? []) {
      const found = edition.matches?.find((match) => match.match_id === matchId);
      if (found) return { kind: 'world_cup_history', match: found };
    }
  }

  return null;
}

function formatScore(match: WorldCupRecentMatch | WorldCupHistoryMatch) {
  return `${match.home_score}-${match.away_score}`;
}

export function HistoricalMatchDetailPage({
  matchId,
  siteData,
  copy
}: {
  matchId: string;
  siteData: WorldCupSiteData;
  copy: AppCopy;
}) {
  const record = findHistoricalMatch(siteData, matchId);

  if (!record) {
    return (
      <section className="section page-intro">
        <a className="back-link" href={localizePath('/teams', copy.locale)}>
          {copy.locale === 'zh' ? '返回球队总览' : 'Back to teams'}
        </a>
        <h1 className="page-title">{copy.locale === 'zh' ? '比赛详情' : 'Match detail'}</h1>
        <div className="match-detail-card">
          <p>{copy.locale === 'zh' ? '未找到这场历史比赛记录。' : 'No historical match record was found.'}</p>
        </div>
      </section>
    );
  }

  const match = record.match;
  const home = formatTeamName(match.home_team, copy.locale);
  const away = formatTeamName(match.away_team, copy.locale);
  const venue = match.venue ? formatVenueName(match.venue, copy.locale) : '';
  const location = [match.city, match.country].filter(Boolean).join(', ');

  return (
    <>
      <section className="section page-intro">
        <a className="back-link" href={localizePath('/teams', copy.locale)}>
          {copy.locale === 'zh' ? '返回球队总览' : 'Back to teams'}
        </a>
        <h1 className="page-title">{copy.locale === 'zh' ? '历史比赛详情' : 'Historical match'}</h1>
      </section>

      <section className="section match-detail-card">
        <p className="fixture-card__meta">
          {formatDetailDate(match.date, copy.locale)} · {match.tournament}
        </p>
        <h2 className="match-info-card__versus">
          {home} {copy.locale === 'zh' ? '对' : 'vs'} {away}
        </h2>
        <p className="match-info-card__score" style={{ color: 'var(--finals-lime, #c8f230)' }}>
          {formatScore(match)}
        </p>
        <p className="fixture-card__venue">
          {venue || location || (copy.locale === 'zh' ? '地点待确认' : 'Venue pending')}
        </p>
        <p className="section-note">
          {copy.locale === 'zh'
            ? '说明：该历史比赛页来自免费公开数据聚合，只展示比分与基础信息，不含阵容、事件、技术统计。'
            : 'Note: this historical page is built from free public aggregates, showing only score and basic metadata (no lineups, events, or stats).'}
        </p>
      </section>
    </>
  );
}

