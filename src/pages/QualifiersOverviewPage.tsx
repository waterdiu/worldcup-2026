import { useMemo, useState } from 'react';
import { localizePath, type AppCopy } from '../i18n/content';
import { formatConfederationName, formatTeamName } from '../i18n/formatters';
import type { ConfederationCardData, QualifierMatchData } from '../types/tournament';

type CoverageFilter = 'all' | 'has-details' | 'missing-details';

type SourceReport = {
  confederationId: QualifierMatchData['confederationId'] | 'intercontinental';
  leagueId: number;
  season: number;
  importedMatches: number;
  errors: string[];
};

interface QualifiersOverviewPageProps {
  confederations: ConfederationCardData[];
  matches: QualifierMatchData[];
  sourceReports: SourceReport[];
  copy: AppCopy;
}

function groupMatchesByConfederation(matches: QualifierMatchData[]) {
  return matches.reduce<Record<string, QualifierMatchData[]>>((groups, match) => {
    groups[match.confederationId] = groups[match.confederationId] ?? [];
    groups[match.confederationId].push(match);
    return groups;
  }, {});
}

function formatMatchDate(dateLabel: string, locale: AppCopy['locale']) {
  if (locale === 'en') return dateLabel;
  const [year, month, day] = dateLabel.split('-');
  return `${year} 年 ${Number(month)} 月 ${Number(day)} 日`;
}

function formatMissingSummary(matches: QualifierMatchData[], locale: AppCopy['locale']) {
  const totalMissing = matches.reduce((count, match) => count + match.missingData.length, 0);
  return locale === 'zh'
    ? `${matches.length} 场已导入比赛中，共 ${totalMissing} 项详情数据缺失。`
    : `${totalMissing} detail fields are missing across ${matches.length} imported matches.`;
}

function hasImportedDetails(match: QualifierMatchData) {
  return Boolean(match.events?.length || match.lineups?.length || match.stats?.length || match.playerRatings?.length);
}

function formatReportMatchLabel(match: QualifierMatchData) {
  return `${match.homeTeam} ${match.homeScore}-${match.awayScore} ${match.awayTeam}`;
}

function sourceLabel(report: SourceReport, locale: AppCopy['locale']) {
  if (report.confederationId === 'intercontinental') {
    return locale === 'zh' ? '洲际附加赛' : 'Intercontinental Play-offs';
  }

  const labels: Record<QualifierMatchData['confederationId'], string> = {
    afc: locale === 'zh' ? '亚洲区' : 'AFC',
    caf: locale === 'zh' ? '非洲区' : 'CAF',
    concacaf: locale === 'zh' ? '中北美区' : 'CONCACAF',
    conmebol: locale === 'zh' ? '南美区' : 'CONMEBOL',
    ofc: locale === 'zh' ? '大洋洲区' : 'OFC',
    uefa: locale === 'zh' ? '欧洲区' : 'UEFA'
  };

  return labels[report.confederationId];
}

export function QualifiersOverviewPage({
  confederations,
  matches,
  sourceReports,
  copy
}: QualifiersOverviewPageProps) {
  const [query, setQuery] = useState('');
  const [coverageFilter, setCoverageFilter] = useState<CoverageFilter>('all');

  const detailedMatchesCount = matches.filter(hasImportedDetails).length;
  const completeMatchesCount = matches.filter((match) => match.missingData.length === 0).length;
  const missingReportMatches = useMemo(
    () => matches.filter((match) => match.missingData.length > 0),
    [matches]
  );
  const filteredMatches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return matches.filter((match) => {
      const hasDetails = hasImportedDetails(match);
      const matchesCoverage =
        coverageFilter === 'all' ||
        (coverageFilter === 'has-details' && hasDetails) ||
        (coverageFilter === 'missing-details' && match.missingData.length > 0);
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [
          match.homeTeam,
          match.awayTeam,
          formatTeamName(match.homeTeam, copy.locale),
          formatTeamName(match.awayTeam, copy.locale),
          match.stage,
          match.dateLabel,
          match.venue ?? ''
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCoverage && matchesQuery;
    });
  }, [copy.locale, coverageFilter, matches, query]);
  const groupedMatches = groupMatchesByConfederation(filteredMatches);

  return (
    <section className="section qualifier-match-board">
      <div className="qualifier-hero">
        <span>{copy.locale === 'zh' ? '预选赛中心' : 'Qualifiers'}</span>
        <h1>{copy.locale === 'zh' ? '世界杯预选赛比赛记录' : 'World Cup Qualifier Match Records'}</h1>
        <p>
          {copy.locale === 'zh'
            ? '按大洲整理已完赛预选赛记录。每场比赛可进入详情页查看比分、事件、阵容、统计、评分和缺失数据。'
            : 'Completed qualifier records grouped by confederation, with match detail pages for scores, events, lineups, stats, ratings, and missing data.'}
        </p>
      </div>

      <article className="qualifier-coverage-card">
        <h3>{copy.locale === 'zh' ? '数据缺失统计' : 'Missing Data Summary'}</h3>
        <p>{formatMissingSummary(matches, copy.locale)}</p>
        <p>
          {copy.locale === 'zh'
            ? '公开来源可以稳定拿到赛程和比分；逐场球员评分、完整阵容和技术统计在部分预选赛中没有公开稳定来源。'
            : 'Public sources cover scores reliably; player ratings, complete lineups, and detailed stats are not consistently available for every qualifier.'}
        </p>
      </article>

      <div className="qualifier-metric-grid" aria-label={copy.locale === 'zh' ? '预选赛数据覆盖' : 'Qualifier data coverage'}>
        <article>
          <span>{copy.locale === 'zh' ? '已导入比赛' : 'Imported matches'}</span>
          <strong>{matches.length}</strong>
        </article>
        <article>
          <span>{copy.locale === 'zh' ? '已有详情' : 'With details'}</span>
          <strong>{detailedMatchesCount}</strong>
        </article>
        <article>
          <span>{copy.locale === 'zh' ? '字段完整' : 'Complete fields'}</span>
          <strong>{completeMatchesCount}</strong>
        </article>
        <article>
          <span>{copy.locale === 'zh' ? '当前筛选' : 'Filtered'}</span>
          <strong>{filteredMatches.length}</strong>
        </article>
      </div>

      <section className="qualifier-control-panel" aria-label={copy.locale === 'zh' ? '筛选预选赛比赛' : 'Filter qualifier matches'}>
        <label>
          <span>{copy.locale === 'zh' ? '搜索球队 / 阶段 / 日期' : 'Search team / stage / date'}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.locale === 'zh' ? '例如：England、伊拉克、2025-11' : 'e.g. England, Iraq, 2025-11'}
          />
        </label>
        <label>
          <span>{copy.locale === 'zh' ? '详情覆盖' : 'Detail coverage'}</span>
          <select
            value={coverageFilter}
            onChange={(event) => setCoverageFilter(event.target.value as CoverageFilter)}
          >
            <option value="all">{copy.locale === 'zh' ? '全部比赛' : 'All matches'}</option>
            <option value="has-details">{copy.locale === 'zh' ? '已有事件/阵容/统计' : 'Has events / lineups / stats'}</option>
            <option value="missing-details">{copy.locale === 'zh' ? '仍有缺失数据' : 'Still missing data'}</option>
          </select>
        </label>
      </section>

      {sourceReports.length ? (
        <section className="qualifier-source-grid" aria-label={copy.locale === 'zh' ? 'API 数据源状态' : 'API source status'}>
          {sourceReports.map((report) => {
            const isBlocked = report.errors.length > 0;

            return (
              <article className={isBlocked ? 'is-blocked' : ''} key={`${report.leagueId}-${report.season}`}>
                <span>{sourceLabel(report, copy.locale)}</span>
                <strong>{report.importedMatches}</strong>
                <small>
                  API-Football league {report.leagueId} · season {report.season}
                </small>
                {isBlocked ? (
                  <p>{copy.locale === 'zh' ? '免费档未开放该赛季' : 'Season blocked on free plan'}</p>
                ) : (
                  <p>{copy.locale === 'zh' ? '已接入免费档' : 'Connected through free tier'}</p>
                )}
              </article>
            );
          })}
        </section>
      ) : null}

      <section className="qualifier-missing-report" aria-label={copy.locale === 'zh' ? '预选赛缺失数据报告' : 'Qualifier missing data report'}>
        <div className="qualifier-missing-report__header">
          <div>
            <h3>{copy.locale === 'zh' ? '缺失数据报告' : 'Missing Data Report'}</h3>
            <p>
              {copy.locale === 'zh'
                ? '下面列出当前已导入比赛中仍缺少的字段，后续补 API 或手工数据时可以逐场核对。'
                : 'Matches below still have unavailable fields and can be used as the checklist for later API or manual backfill.'}
            </p>
          </div>
          <strong>{missingReportMatches.length}</strong>
        </div>
        <div className="qualifier-missing-report__list">
          {missingReportMatches.map((match) => (
            <a
              className="qualifier-missing-report__row"
              href={localizePath(`/qualifiers/matches/${encodeURIComponent(match.id)}`, copy.locale)}
              key={match.id}
            >
              <span>{formatMatchDate(match.dateLabel, copy.locale)}</span>
              <strong>{formatReportMatchLabel(match)}</strong>
              <small>{match.sourceLabel}</small>
              <div>
                {match.missingData.map((item) => (
                  <em key={item}>{item}</em>
                ))}
              </div>
            </a>
          ))}
        </div>
      </section>

      {confederations.map((confederation) => {
        const confederationMatches = groupedMatches[confederation.id] ?? [];
        if (confederationMatches.length === 0) return null;

        return (
          <section className="qualifier-confederation-block" key={confederation.id}>
            <h3>{formatConfederationName(confederation.name)}</h3>
            <div className="qualifier-match-list">
              {confederationMatches.map((match) => {
                const homeLabel = formatTeamName(match.homeTeam);
                const awayLabel = formatTeamName(match.awayTeam);
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
                    <span className="qualifier-match-row__date">{formatMatchDate(match.dateLabel, copy.locale)}</span>
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
        );
      })}
    </section>
  );
}
