import { useMemo, useState } from 'react';
import { localizePath, type AppCopy } from '../i18n/content';
import { formatConfederationName, formatTeamName } from '../i18n/formatters';
import type {
  ConfederationCardData,
  QualifierMatchData
} from '../types/tournament';

interface QualifierConfederationPageProps {
  confederation: ConfederationCardData;
  matches: QualifierMatchData[];
  copy: AppCopy;
}

function formatDate(dateLabel: string, locale: AppCopy['locale']) {
  if (locale === 'en') return dateLabel;
  const [year, month, day] = dateLabel.split('-');
  return `${year} 年 ${Number(month)} 月 ${Number(day)} 日`;
}

function getConfederationMetrics(matches: QualifierMatchData[], confederation: ConfederationCardData) {
  const teams = new Set(matches.flatMap((match) => [match.homeTeam, match.awayTeam]));

  return {
    teamCount: teams.size,
    qualifiedCount: confederation.qualifiedTeams.length,
    matchCount: matches.length,
    goalCount: matches.reduce((count, match) => count + match.homeScore + match.awayScore, 0)
  };
}

export function QualifierConfederationPage({
  confederation,
  matches,
  copy
}: QualifierConfederationPageProps) {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const confederationMatches = useMemo(
    () => matches.filter((match) => match.confederationId === confederation.id),
    [confederation.id, matches]
  );
  const visibleMatches = selectedTeam
    ? confederationMatches.filter((match) => match.homeTeam === selectedTeam || match.awayTeam === selectedTeam)
    : confederationMatches;
  const metrics = getConfederationMetrics(confederationMatches, confederation);

  return (
    <section className="qualifier-subpage qualifier-confederation-page">
      <a className="qualifier-back-link" href={localizePath('/qualifiers', copy.locale)}>
        {copy.locale === 'zh' ? '返回预选赛总览' : 'Back to qualifiers'}
      </a>

      <header className="qualifier-subpage__masthead">
        <h1>
          {copy.locale === 'zh'
            ? `${formatConfederationName(confederation.name, copy.locale)}预选赛`
            : `${formatConfederationName(confederation.name, copy.locale)} Qualifiers`}
        </h1>
      </header>

      <div className="qualifier-metric-grid qualifier-metric-grid--subpage" aria-label={copy.locale === 'zh' ? '洲别预选赛统计' : 'Confederation qualifier metrics'}>
        <article>
          <span>{copy.locale === 'zh' ? '球队总数' : 'Teams'}</span>
          <strong>{metrics.teamCount}</strong>
        </article>
        <article>
          <span>{copy.locale === 'zh' ? '出线球队数' : 'Qualified'}</span>
          <strong>{metrics.qualifiedCount}</strong>
        </article>
        <article>
          <span>{copy.locale === 'zh' ? '比赛场数' : 'Matches'}</span>
          <strong>{metrics.matchCount}</strong>
        </article>
        <article>
          <span>{copy.locale === 'zh' ? '进球总数' : 'Goals'}</span>
          <strong>{metrics.goalCount}</strong>
        </article>
      </div>

      <section className="qualifier-team-filter">
        <div className="qualifier-sec-rule">
          <span>01</span>
          <h2>{copy.locale === 'zh' ? '晋级球队' : 'Qualified Teams'}</h2>
          <span>{selectedTeam ? formatTeamName(selectedTeam, copy.locale) : copy.locale === 'zh' ? '全部比赛' : 'All matches'}</span>
        </div>
        <div className="qualifier-team-filter__list">
          <button
            className={!selectedTeam ? 'is-active' : ''}
            onClick={() => setSelectedTeam(null)}
            type="button"
          >
            {copy.locale === 'zh' ? '全部球队' : 'All teams'}
          </button>
          {confederation.qualifiedTeams.map((team) => (
            <button
              className={selectedTeam === team ? 'is-active' : ''}
              key={team}
              onClick={() => setSelectedTeam(team)}
              type="button"
            >
              {formatTeamName(team, copy.locale)}
            </button>
          ))}
        </div>
      </section>

      <section className="qualifier-confed-match-section">
        <div className="qualifier-sec-rule">
          <span>02</span>
          <h2>{copy.locale === 'zh' ? '比赛列表' : 'Match List'}</h2>
          <span>{visibleMatches.length}</span>
        </div>
        <div className="qualifier-match-list">
          {visibleMatches.length === 0 ? (
            <div className="qualifier-empty-state">
              {copy.locale === 'zh'
                ? '当前晋级球队没有可展示的预选赛比赛记录。'
                : 'No qualifier match records are available for this qualified team.'}
            </div>
          ) : visibleMatches.map((match) => {
            const homeLabel = formatTeamName(match.homeTeam, copy.locale);
            const awayLabel = formatTeamName(match.awayTeam, copy.locale);

            return (
              <a
                className="qualifier-match-row"
                href={localizePath(`/qualifiers/matches/${encodeURIComponent(match.id)}`, copy.locale)}
                key={match.id}
                aria-label={
                  copy.locale === 'zh'
                    ? `打开预选赛详情: ${homeLabel} 对 ${awayLabel}`
                    : `Open qualifier detail: ${match.homeTeam} vs ${match.awayTeam}`
                }
              >
                <span className="qualifier-match-row__date">{formatDate(match.dateLabel, copy.locale)}</span>
                <span className="qualifier-match-row__stage">{match.stage}</span>
                <strong className="qualifier-match-row__score">
                  {homeLabel} {match.homeScore}-{match.awayScore} {awayLabel}
                </strong>
                <span className={match.missingData.length ? 'qualifier-match-row__coverage is-partial' : 'qualifier-match-row__coverage'}>
                  {match.missingData.length
                    ? copy.locale === 'zh'
                      ? `缺 ${match.missingData.length} 项`
                      : `${match.missingData.length} missing`
                    : copy.locale === 'zh'
                      ? '详情完整'
                      : 'Complete'}
                </span>
              </a>
            );
          })}
        </div>
      </section>
    </section>
  );
}
