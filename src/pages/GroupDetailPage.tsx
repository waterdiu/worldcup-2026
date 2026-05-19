import { useState } from 'react';
import { localizePath, type AppCopy } from '../i18n/content';
import { formatTeamName, formatVenueName } from '../i18n/formatters';
import type { GroupCardData, GroupStageMatchData } from '../types/tournament';
import { formatBeijingMonthDayKickoff } from '../utils/beijingTime';

interface GroupDetailPageProps {
  group: GroupCardData;
  matches: GroupStageMatchData[];
  copy: AppCopy;
}

function formatMatchDate(dateLabel: string, locale: AppCopy['locale']): string {
  return formatBeijingMonthDayKickoff(dateLabel, locale);
}

function formatMatchday(matchdayLabel: string, locale: AppCopy['locale']): string {
  if (locale === 'en') return matchdayLabel;
  return matchdayLabel
    .replace('Matchday 1', '第 1 轮')
    .replace('Matchday 2', '第 2 轮')
    .replace('Matchday 3', '第 3 轮');
}

function formatStageLabel(match: GroupStageMatchData, locale: AppCopy['locale']): string {
  if (locale === 'en') return `${match.roundLabel} · Group ${match.groupId}`;
  return `小组赛 · ${match.groupId} 组 · ${formatMatchday(match.matchdayLabel, locale)}`;
}

function buildMatchFocus(match: GroupStageMatchData, locale: AppCopy['locale']): string[] {
  if (locale === 'en') {
    return [
      `${match.homeTeam} and ${match.awayTeam} both enter with a clean group table.`,
      'The result will shape the direct-qualification race and the best-third comparison.',
      'This card is structured for future lineup, live-event, and model data feeds.'
    ];
  }

  return [
    `${formatTeamName(match.homeTeam, locale)} 和 ${formatTeamName(match.awayTeam, locale)} 都从 0 分起步，这场会直接影响小组排序。`,
    '胜者会在前二名竞争里先占主动，平局则会让后两轮的净胜球和直接对话更关键。',
    '这里先保留赛前看点、阵容、事件时间线和技术统计接口位，后续可以接实时数据源。'
  ];
}

export function GroupDetailPage({ group, matches, copy }: GroupDetailPageProps) {
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const sortedMatches = [...matches].sort((a, b) => {
    const dateDiff = new Date(a.dateLabel).getTime() - new Date(b.dateLabel).getTime();
    if (dateDiff !== 0) return dateDiff;
    return a.id.localeCompare(b.id);
  });

  return (
    <>
      <section className="section page-intro">
        <a className="back-link" href={localizePath('/groups', copy.locale)}>
          {copy.locale === 'zh' ? '返回上一个页面' : 'Back to groups'}
        </a>
        <h1 className="page-title">
          {copy.locale === 'zh' ? `${group.id} 组比赛` : `Group ${group.id} Matches`}
        </h1>
      </section>

      <section className="section group-detail-layout">
        <article className="group-detail-summary">
          <p>{copy.locale === 'zh' ? '小组积分表' : 'Group table'}</p>
          <div className="group-card__table">
            <div className="group-card__row group-card__row--head">
              <span>#</span>
              <span>{copy.locale === 'zh' ? '球队' : 'Team'}</span>
              <span>{copy.locale === 'zh' ? '胜' : 'W'}</span>
              <span>{copy.locale === 'zh' ? '平' : 'D'}</span>
              <span>{copy.locale === 'zh' ? '负' : 'L'}</span>
              <span>{copy.locale === 'zh' ? '进' : 'GF'}</span>
              <span>{copy.locale === 'zh' ? '失' : 'GA'}</span>
              <span>{copy.locale === 'zh' ? '分' : 'Pts'}</span>
            </div>
          </div>
          <ul className="group-card__list">
            {group.teams.map((team, index) => (
              <li key={`${group.id}-${team.name}`}>
                <span>{index + 1}</span>
                <span>
                  <a
                    className="group-team-link"
                    href={localizePath(`/teams/${encodeURIComponent(team.name)}`, copy.locale)}
                  >
                    {formatTeamName(team.name, copy.locale)}
                  </a>
                </span>
                <span>{team.won}</span>
                <span>{team.drawn}</span>
                <span>{team.lost}</span>
                <span>{team.goalsFor}</span>
                <span>{team.goalsAgainst}</span>
                <span>{team.points}</span>
              </li>
            ))}
          </ul>
        </article>

        <div className="group-match-list">
          {sortedMatches.map((match) => {
            const isExpanded = expandedMatchId === match.id;

            return (
              <article key={match.id} className="fixture-card group-match-card" data-testid="group-match-card">
                <div className="group-match-card__summary">
                  <div>
                    <p className="fixture-card__meta">
                      {formatMatchday(match.matchdayLabel, copy.locale)} · {copy.labels.matchPrefix} {match.id}
                    </p>
                    <h3>
                      {formatTeamName(match.homeTeam, copy.locale)} {copy.locale === 'zh' ? '对' : 'vs'}{' '}
                      {formatTeamName(match.awayTeam, copy.locale)}
                    </h3>
                  </div>
                  <button
                    className="group-match-card__toggle"
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                  >
                    {isExpanded
                      ? copy.locale === 'zh'
                        ? '收起比赛详情'
                        : 'Collapse match details'
                      : copy.locale === 'zh'
                        ? '展开比赛详情'
                        : 'Expand match details'}
                  </button>
                </div>
                <div className="group-match-card__meta">
                  <span>{formatMatchDate(match.dateLabel, copy.locale)}</span>
                  <span>{formatVenueName(match.venue, copy.locale)}</span>
                  <span>{match.resultLabel ?? (copy.locale === 'zh' ? '待定' : 'TBA')}</span>
                </div>
                {isExpanded && (
                  <div className="group-match-card__details">
                    <section className="match-detail-panel match-detail-panel--info">
                      <h4>{copy.locale === 'zh' ? '比赛信息' : 'Match information'}</h4>
                      <div className="match-detail-facts">
                        <span>{formatStageLabel(match, copy.locale)}</span>
                        <span>{formatMatchDate(match.dateLabel, copy.locale)}</span>
                        <span>{formatVenueName(match.venue, copy.locale)}</span>
                        <span>{copy.locale === 'zh' ? '状态：赛前' : 'Status: pre-match'}</span>
                      </div>
                    </section>

                    <section className="match-detail-panel">
                      <h4>{copy.locale === 'zh' ? '赛前看点' : 'Pre-match focus'}</h4>
                      <ul className="match-detail-list">
                        {buildMatchFocus(match, copy.locale).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </section>

                    <div className="match-detail-grid">
                      <section className="match-detail-panel">
                        <h4>{copy.locale === 'zh' ? '小组影响' : 'Group impact'}</h4>
                        <p className="group-match-card__note">
                          {copy.locale === 'zh'
                            ? `${group.id} 组前两名直接晋级，成绩最好的小组第三也可能进入 32 强。本场结果会影响积分、净胜球和末轮压力。`
                            : `The top two in Group ${group.id} advance directly, while strong third-place teams can also reach the Round of 32. This result affects points, goal difference, and final-match pressure.`}
                        </p>
                      </section>

                      <section className="match-detail-panel">
                        <h4>{copy.locale === 'zh' ? '统计面板预留' : 'Stats panel placeholder'}</h4>
                        <div className="match-stat-shell">
                          <span>{copy.locale === 'zh' ? '控球率' : 'Possession'}</span>
                          <span>{copy.locale === 'zh' ? '射门' : 'Shots'}</span>
                          <span>{copy.locale === 'zh' ? '射正' : 'Shots on target'}</span>
                          <span>{copy.locale === 'zh' ? '角球' : 'Corners'}</span>
                          <span>xG</span>
                          <span>{copy.locale === 'zh' ? '犯规' : 'Fouls'}</span>
                        </div>
                      </section>
                    </div>

                    <div className="match-detail-grid">
                      <section className="match-detail-panel">
                        <h4>{copy.locale === 'zh' ? '阵容与名单' : 'Lineups and squads'}</h4>
                        <p className="group-match-card__note">
                          {copy.locale === 'zh'
                            ? '首发阵容将在赛前公布。这里预留首发、替补、主教练和伤停名单展示位。'
                            : 'Starting lineups will be published before kickoff. This area is reserved for starters, substitutes, coaches, and availability notes.'}
                        </p>
                      </section>

                      <section className="match-detail-panel">
                        <h4>{copy.locale === 'zh' ? '事件时间线' : 'Event timeline'}</h4>
                        <ol className="match-timeline-shell">
                          <li>{copy.locale === 'zh' ? '赛前：阵容公布' : 'Pre-match: lineups released'}</li>
                          <li>{copy.locale === 'zh' ? '开球：比赛开始' : 'Kickoff: match starts'}</li>
                          <li>{copy.locale === 'zh' ? '赛中：进球、换人、黄牌、VAR' : 'Live: goals, substitutions, cards, VAR'}</li>
                        </ol>
                      </section>
                    </div>

                    <section className="match-detail-panel match-detail-panel--prediction">
                      <h4>{copy.locale === 'zh' ? '胜平负展示' : 'Win-draw-win display'}</h4>
                      <p className="fixture-card__odds">
                        {copy.labels.home} {Math.round(match.homeWinProbability * 100)}% · {copy.labels.draw}{' '}
                        {Math.round(match.drawProbability * 100)}% · {copy.labels.away}{' '}
                        {Math.round(match.awayWinProbability * 100)}%
                      </p>
                      <p className="fixture-card__prediction">{copy.labels.predictionReserved}</p>
                    </section>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
