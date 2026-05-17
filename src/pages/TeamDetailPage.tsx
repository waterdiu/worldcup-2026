import { useState } from 'react';
import { findTeamProfile, type TeamProfileData } from '../data/teamProfiles';
import type { WorldCupTeamRoster } from '../data/siteData';
import { localizePath, type AppCopy } from '../i18n/content';
import { formatConfederationName, formatTeamName, formatVenueName, getTeamDisplay } from '../i18n/formatters';
import type { ConfederationCardData, GroupCardData, GroupStageMatchData } from '../types/tournament';

interface TeamDetailPageProps {
  team: string;
  groups: GroupCardData[];
  confederations: ConfederationCardData[];
  fixtures: GroupStageMatchData[];
  rosters: WorldCupTeamRoster[];
  copy: AppCopy;
}

const hostTeams = new Set(['Canada', 'Mexico', 'United States']);
type PersonStatusKind = 'confirmed' | 'candidate' | 'pending' | 'fitness' | 'suspended' | 'omitted';

function findTeamGroup(team: string, groups: GroupCardData[]) {
  return groups.find((group) => group.teams.some((item) => item.name === team));
}

function findTeamConfederation(team: string, confederations: ConfederationCardData[]) {
  return confederations.find((confederation) => confederation.qualifiedTeams.includes(team));
}

function findTeamFixtures(team: string, fixtures: GroupStageMatchData[]) {
  return fixtures
    .filter((fixture) => fixture.homeTeam === team || fixture.awayTeam === team)
    .sort((first, second) => Date.parse(first.dateLabel) - Date.parse(second.dateLabel));
}

function formatDetailDate(dateLabel: string, locale: AppCopy['locale']): string {
  if (locale === 'en') return dateLabel;
  const date = new Date(dateLabel);
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

function formatMatchday(matchdayLabel: string, locale: AppCopy['locale']): string {
  if (locale === 'en') return matchdayLabel;

  const matchdayNumber = matchdayLabel.match(/\d+/)?.[0];
  return matchdayNumber ? `第 ${matchdayNumber} 轮` : matchdayLabel;
}

function formatPlainTeamName(team: string, locale: AppCopy['locale']): string {
  if (locale === 'en') return team;
  return getTeamDisplay(team).zh;
}

function formatTournamentLabel(record: NonNullable<TeamProfileData['worldCupHistory']>[number], locale: AppCopy['locale']): string {
  if (locale === 'en') return record.tournament;

  const tournament = record.tournament.replace(/^\d{4}\s*/, '');
  return `${tournament}（${record.year}）`;
}

function normalizePersonStatus(status: string, role: string, locale: AppCopy['locale']): { label: string; kind: PersonStatusKind } {
  const source = status.toLowerCase();

  if (source.includes('停赛') || source.includes('suspend')) {
    return { label: locale === 'zh' ? '停赛' : 'Suspended', kind: 'suspended' };
  }

  if (source.includes('伤') || source.includes('injury') || source.includes('fitness')) {
    return { label: locale === 'zh' ? '伤病' : 'Injured', kind: 'fitness' };
  }

  if (source.includes('落选') || source.includes('omitted')) {
    return { label: locale === 'zh' ? '未入选' : 'Omitted', kind: 'omitted' };
  }

  if (source.includes('候选') || source.includes('training') || source.includes('provisional')) {
    return { label: locale === 'zh' ? '候选观察' : 'Provisional', kind: 'candidate' };
  }

  if (source.includes('已任命') || source.includes('已确认') || source.includes('appointed') || source.includes('confirmed')) {
    return {
      label: role === '主教练' || role === 'Head coach' ? (locale === 'zh' ? '已任命' : 'Appointed') : (locale === 'zh' ? '已确认' : 'Confirmed'),
      kind: 'confirmed'
    };
  }

  return { label: locale === 'zh' ? '待确认' : 'Pending', kind: 'pending' };
}

function normalizeTeamKey(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function findRuntimeRoster(team: string, rosters: WorldCupTeamRoster[]) {
  const teamKey = normalizeTeamKey(team);
  return rosters.find((roster) => roster.team_id === teamKey || normalizeTeamKey(roster.team_name) === teamKey);
}

function getQualificationLabel(
  team: string,
  confederationName: string | undefined,
  locale: AppCopy['locale']
): string {
  if (hostTeams.has(team)) {
    return locale === 'zh' ? '东道主自动晋级' : 'Qualified automatically as host';
  }

  const confederationLabel = formatConfederationName(confederationName ?? '', locale);
  return locale === 'zh'
    ? `${confederationLabel} 预选赛晋级`
    : `Qualified through ${confederationName ?? 'regional'} qualifying`;
}

function getQualificationCards(
  team: string,
  group: GroupCardData,
  confederation: ConfederationCardData | undefined,
  profile: TeamProfileData | undefined,
  locale: AppCopy['locale']
) {
  if (profile?.qualificationMatches?.length && locale === 'zh') {
    return profile.qualificationMatches;
  }

  if (hostTeams.has(team)) {
    return [
      {
        title: locale === 'zh' ? '东道主资格确认' : 'Host qualification confirmed',
        result: locale === 'zh' ? '自动晋级' : 'Automatic qualification',
        description:
          locale === 'zh'
            ? `作为联合东道主，${formatTeamName(team, locale)} 没有参加预选赛，直接进入 2026 世界杯正赛。`
            : `${team} qualified automatically as a co-host of the 2026 World Cup.`
      }
    ];
  }

  const confederationLabel = formatConfederationName(confederation?.name ?? '', locale);
  const regionalNote = confederation?.featuredMatches[0] ?? group.drawNote;

  return [
    {
      title: locale === 'zh' ? `${confederationLabel} 预选赛晋级` : 'Regional qualifying route',
      result: locale === 'zh' ? '正赛资格确认' : 'Finals place confirmed',
      description:
        locale === 'zh'
          ? `${formatTeamName(team, locale)} 通过 ${confederationLabel} 赛区取得正赛资格，晋级过程可继续接入逐场预选赛数据。`
          : `${team} qualified through its regional competition.`
    },
    {
      title: locale === 'zh' ? '赛区关键节点' : 'Regional checkpoint',
      result: confederation?.statusLabel ?? group.statusLabel,
      description: locale === 'zh' ? regionalNote : 'Regional notes and match-by-match qualifying records can be connected here.'
    }
  ];
}

function getRecentCards(profile: TeamProfileData | undefined, locale: AppCopy['locale']) {
  if (profile?.recentResults?.length && locale === 'zh') return profile.recentResults;

  return [
    {
      title: locale === 'zh' ? '近期成绩数据位' : 'Recent form data slot',
      result: locale === 'zh' ? '待接入逐场数据' : 'Ready for match-by-match data',
      description:
        locale === 'zh'
          ? '这里用于展示最近正式比赛或友谊赛的比分、对手和表现摘要。'
          : 'This area is prepared for recent competitive or friendly results.'
    }
  ];
}

function getHistoryRecords(
  team: string,
  profile: TeamProfileData | undefined,
  locale: AppCopy['locale']
) {
  if (profile?.historyRecords?.length && locale === 'zh') return profile.historyRecords;

  const participations = profile?.participations ?? 0;
  return [
    {
      title: locale === 'zh' ? '世界杯参赛记录' : 'World Cup appearances',
      result:
        locale === 'zh'
          ? participations > 0
            ? `参赛 ${participations} 次`
            : '首次参赛周期'
          : participations > 0
            ? `${participations} appearances`
            : 'First appearance cycle',
      description:
        locale === 'zh'
          ? `${formatTeamName(team, locale)} 的历史战绩区用于承接历届成绩、最好名次、淘汰赛经历和关键年份。`
          : `${team}'s archive section can host historical finishes, best runs, knockout records, and milestone years.`
    }
  ];
}

function getWorldCupHistorySummary(
  teamTitle: string,
  profile: TeamProfileData | undefined,
  locale: AppCopy['locale']
): string | undefined {
  if (!profile) return undefined;
  if (locale === 'en') return profile.overallWorldCupRecord;

  const base = `${teamTitle}共参加世界杯 ${profile.participations} 次`;
  const record = profile.overallWorldCupRecord ? `，${profile.overallWorldCupRecord}` : '';
  const bestFinish =
    profile.bestFinish === '八强（1970、1986）'
      ? '；最佳成绩是 1970 年和 1986 年两次进入八强'
      : profile.bestFinish
        ? `；最佳成绩是 ${profile.bestFinish}`
        : '';

  return `${base}${record}${bestFinish}。`;
}

function formatRosterStatus(status: string | null | undefined, locale: AppCopy['locale']) {
  if (!status) return locale === 'zh' ? '已确认' : 'Confirmed';
  if (status.toLowerCase() === 'selected') return locale === 'zh' ? '已确认' : 'Confirmed';
  return status;
}

function getPlayerCards(
  runtimeRoster: WorldCupTeamRoster | undefined,
  profile: TeamProfileData | undefined,
  locale: AppCopy['locale']
) {
  if (runtimeRoster?.players.length) {
    return runtimeRoster.players.map((player) => ({
      name: player.name_zh ?? player.display_name ?? player.name,
      position: player.position ?? (locale === 'zh' ? '待确认' : 'Pending'),
      club: player.club ?? '—',
      age: 0,
      status: formatRosterStatus(player.status, locale),
      summary: ''
    }));
  }

  if (profile?.players?.length && locale === 'zh') return profile.players;

  return [
    {
      name: locale === 'zh' ? '最终名单位置' : 'Final squad slot',
      position: locale === 'zh' ? '待官方确认' : 'Pending official confirmation',
      club: locale === 'zh' ? '待官方确认' : 'Pending official confirmation',
      age: 0,
      status: locale === 'zh' ? '名单状态：待官方最终确认' : 'Roster status: pending official confirmation',
      summary:
        locale === 'zh'
          ? 'FIFA 确认最终名单后，这里会展示球员姓名、位置、年龄、俱乐部和角色说明。'
          : 'When FIFA confirms final squads, this card can show name, position, age, club, and role notes.'
    }
  ];
}

export function TeamDetailPage({
  team,
  groups,
  confederations,
  fixtures,
  rosters,
  copy
}: TeamDetailPageProps) {
  const [expandedHistoryYear, setExpandedHistoryYear] = useState<number | null>(null);
  const group = findTeamGroup(team, groups);
  const confederation = findTeamConfederation(team, confederations);
  const profile = findTeamProfile(team);
  const runtimeRoster = findRuntimeRoster(team, rosters);
  const teamFixtures = findTeamFixtures(team, fixtures);

  if (!group) {
    return (
      <section className="section page-intro">
        <a className="back-link" href={localizePath('/teams', copy.locale)}>
          {copy.locale === 'zh' ? '返回球队总览' : 'Back to teams'}
        </a>
        <h1 className="page-title">{formatTeamName(team, copy.locale)}</h1>
        <div className="match-detail-card">
          <p>{copy.locale === 'zh' ? '没有找到这支球队的正赛小组信息。' : 'No group-stage record was found for this team.'}</p>
        </div>
      </section>
    );
  }

  const qualificationLabel = getQualificationLabel(team, confederation?.name, copy.locale);
  const qualificationCards = getQualificationCards(team, group, confederation, profile, copy.locale);
  const recentCards = getRecentCards(profile, copy.locale);
  const historyRecords = getHistoryRecords(team, profile, copy.locale);
  const playerCards = getPlayerCards(runtimeRoster, profile, copy.locale);
  const worldCupHistory = profile?.worldCupHistory;
  const teamDisplay = getTeamDisplay(team);
  const teamTitle = copy.locale === 'zh' ? teamDisplay.zh : team;
  const worldCupHistorySummary = getWorldCupHistorySummary(teamTitle, profile, copy.locale);
  const groupLabel = `${copy.labels.groupPrefix} ${group.id}`;
  const coachName = profile?.coach ?? (copy.locale === 'zh' ? '官方教练组待确认' : 'Official coaching staff');
  const squadStatus = profile?.squadStatus ?? {
    label: copy.locale === 'zh' ? '官方最终名单待公布' : 'Final squad pending',
    note:
      copy.locale === 'zh'
        ? 'FIFA 确认最终名单后，这里会切换成官方参赛球员列表。'
        : 'This section will switch to the official squad list after FIFA confirmation.'
  };
  const squadSourceNote = runtimeRoster
    ? copy.locale === 'zh'
      ? `名单来源：FIFA 官方发布，${runtimeRoster.players.length} 人。${runtimeRoster.published_at ? `发布日期 ${runtimeRoster.published_at}。` : ''}`
      : `Roster source: official FIFA release, ${runtimeRoster.players.length} players. ${runtimeRoster.published_at ? `Published ${runtimeRoster.published_at}.` : ''}`
    : squadStatus.sourceNote;
  const facts = [
    [copy.locale === 'zh' ? '小组' : 'Group', groupLabel],
    [copy.locale === 'zh' ? '赛区' : 'Confederation', formatConfederationName(confederation?.name ?? '', copy.locale)],
    [copy.locale === 'zh' ? '晋级方式' : 'Qualification', qualificationLabel],
    ...(profile
      ? [
          [
            copy.locale === 'zh' ? '世界排名' : 'World Ranking',
            copy.locale === 'zh' ? `世界排名第 ${profile.worldRanking} 位` : `#${profile.worldRanking}`
          ],
          [
            copy.locale === 'zh' ? '世界杯经验' : 'World Cup Experience',
            copy.locale === 'zh' ? `世界杯参赛 ${profile.participations} 次` : `${profile.participations} appearances`
          ]
        ]
      : [])
  ];
  const peopleRows = [
    {
      role: copy.locale === 'zh' ? '主教练' : 'Head coach',
      name: coachName,
      position: copy.locale === 'zh' ? '主教练' : 'Head coach',
      club: copy.locale === 'zh' ? `${teamTitle}国家队` : 'National team',
      age: profile?.coach === 'Javier Aguirre' ? (copy.locale === 'zh' ? '67 岁' : '67') : '—',
      status: copy.locale === 'zh' ? '已任命' : 'Appointed'
    },
    ...playerCards.map((player) => ({
      role: copy.locale === 'zh' ? '球员' : 'Player',
      name: player.name,
      position: player.position,
      club: player.club,
      age: player.age > 0 ? (copy.locale === 'zh' ? `${player.age} 岁` : `${player.age}`) : '—',
      status: player.status
    }))
  ];

  return (
    <>
      <section className="section page-intro">
        <a className="back-link" href={localizePath('/teams', copy.locale)}>
          {copy.locale === 'zh' ? '返回球队总览' : 'Back to teams'}
        </a>
        <div className="team-detail-hero">
          <span className="team-detail-flag" aria-hidden="true">{teamDisplay.flag}</span>
          <h1>{teamTitle}</h1>
        </div>
      </section>

      <div className="team-detail-stack" data-testid="team-detail-stack">
        <section className="section team-detail-section team-detail-section--overview">
          <div className="team-profile-facts team-profile-facts--overview" aria-label={copy.locale === 'zh' ? '球队基本信息' : 'Team overview'}>
            {facts.map(([label, value]) => (
              <span key={label}>
                <strong>{label}</strong>
                {value}
              </span>
            ))}
          </div>
        </section>

        <section className="section team-detail-section">
          <h2 className="section-title">{copy.locale === 'zh' ? '教练和球员介绍' : 'Coach and Players'}</h2>
          <article className="team-people-card">
            <div className="player-table">
              <div className="player-table__head" aria-hidden="true">
                <span>{copy.locale === 'zh' ? '身份' : 'Role'}</span>
                <span>{copy.locale === 'zh' ? '姓名' : 'Name'}</span>
                <span>{copy.locale === 'zh' ? '位置/职责' : 'Position'}</span>
                <span>{copy.locale === 'zh' ? '俱乐部/团队' : 'Club / team'}</span>
                <span>{copy.locale === 'zh' ? '年龄' : 'Age'}</span>
                <span>{copy.locale === 'zh' ? '状态' : 'Status'}</span>
              </div>
              {peopleRows.map((person) => {
                const normalizedStatus = normalizePersonStatus(person.status, person.role, copy.locale);

                return (
                  <article className="player-row" data-testid="team-person-row" key={`${person.role}-${person.name}`}>
                    <span>{person.role}</span>
                    <div className="player-row__name">
                      <h4>{person.name}</h4>
                    </div>
                    <span>{person.position}</span>
                    <span>{person.club}</span>
                    <span>{person.age}</span>
                    <span className={`player-status player-status--${normalizedStatus.kind}`}>{normalizedStatus.label}</span>
                  </article>
                );
              })}
              {squadSourceNote ? <small>{squadSourceNote}</small> : null}
            </div>
          </article>
        </section>

        <section className="section team-detail-section">
          <h2 className="section-title">{copy.locale === 'zh' ? '历史战绩' : 'Historical Record'}</h2>
          {worldCupHistory?.length ? (
            <article className="world-cup-history-card">
              {worldCupHistorySummary ? (
                <p className="world-cup-history-card__summary">{worldCupHistorySummary}</p>
              ) : null}
              <div className="world-cup-history-table">
                <div className="world-cup-history-table__head" aria-hidden="true">
                  <span>{copy.locale === 'zh' ? '赛事' : 'Tournament'}</span>
                  <span>{copy.locale === 'zh' ? '阶段' : 'Stage'}</span>
                  <span>{copy.locale === 'zh' ? '名次' : 'Rank'}</span>
                  <span>{copy.locale === 'zh' ? '战绩' : 'Record'}</span>
                  <span>{copy.locale === 'zh' ? '进失球' : 'Goals'}</span>
                  <span>{copy.locale === 'zh' ? '比赛' : 'Matches'}</span>
                </div>
                {worldCupHistory.map((record) => {
                  const isExpanded = expandedHistoryYear === record.year;

                  return (
                    <article className="world-cup-history-row" key={record.year}>
                      <button
                        type="button"
                        className="world-cup-history-row__toggle"
                        data-testid="world-cup-history-toggle"
                        aria-expanded={isExpanded}
                        aria-label={`${isExpanded ? (copy.locale === 'zh' ? '收起' : 'Collapse') : (copy.locale === 'zh' ? '展开' : 'Expand')} ${record.tournament} ${copy.locale === 'zh' ? '比赛详情' : 'match details'}`}
                        onClick={() => setExpandedHistoryYear(isExpanded ? null : record.year)}
                      >
                        <div className="world-cup-history-row__event">
                          <h3>{formatTournamentLabel(record, copy.locale)}</h3>
                        </div>
                        <span>{record.stage}</span>
                        <span>{record.position}</span>
                        <span>{record.record}</span>
                        <span>{record.goals}</span>
                        <span className="world-cup-history-row__cue">
                          {isExpanded
                            ? copy.locale === 'zh'
                              ? '收起'
                              : 'Collapse'
                            : copy.locale === 'zh'
                              ? '展开比赛'
                              : 'View matches'}
                        </span>
                      </button>
                      {isExpanded ? (
                        <div className="world-cup-history-row__matches">
                          {record.matches.map((match, index) => (
                            <div className="world-cup-match-row" data-testid="world-cup-match-row" key={`${record.year}-${match}`}>
                              <span>{copy.locale === 'zh' ? `比赛 ${index + 1}` : `Match ${index + 1}`}</span>
                              <strong>{match}</strong>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </article>
          ) : (
            <div className="team-history-list">
              {historyRecords.map((record) => (
                <article className="team-history-card" key={record.title}>
                  <p>{record.result}</p>
                  <h3>{record.title}</h3>
                  <span>{record.description}</span>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="section team-detail-section">
          <h2 className="section-title">{copy.locale === 'zh' ? '预选赛与近期比赛' : 'Qualifying and Recent Form'}</h2>
          <article className="recent-results-card" data-testid="recent-results-card">
            <div className="recent-results-card__summary">
              <p>{copy.locale === 'zh' ? '资格情况' : 'Qualification status'}</p>
              <h3>{qualificationLabel}</h3>
              <span>{qualificationCards.map((item) => item.description).join(' ')}</span>
            </div>
            <div className="recent-match-list">
              {recentCards.map((item) => (
                <article className="recent-match-row" data-testid="recent-match-row" key={`${item.title}-${item.result}`}>
                  <span>{item.title}</span>
                  <strong>{item.result}</strong>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </article>
        </section>

        <section className="section team-detail-section">
          <h2 className="section-title">{copy.locale === 'zh' ? '世界杯赛程' : 'World Cup Fixtures'}</h2>
          <div className="fixtures-grid team-fixture-grid">
            {teamFixtures.map((fixture) => {
              const matchupLabel = `${formatTeamName(fixture.homeTeam, copy.locale)} ${copy.locale === 'zh' ? '对' : 'vs'} ${formatTeamName(fixture.awayTeam, copy.locale)}`;
              const plainMatchupLabel = `${formatPlainTeamName(fixture.homeTeam, copy.locale)} ${copy.locale === 'zh' ? '对' : 'vs'} ${formatPlainTeamName(fixture.awayTeam, copy.locale)}`;

              return (
                <a
                  key={fixture.id}
                  className="fixture-card team-match-card team-match-card--link team-match-card--compact"
                  data-testid="team-match-card"
                  href={localizePath(`/matches/${encodeURIComponent(fixture.id)}`, copy.locale)}
                  aria-label={`${copy.locale === 'zh' ? '打开比赛详情' : 'Open match detail'}: ${plainMatchupLabel}`}
                >
                  <p className="fixture-card__meta">
                    {formatMatchday(fixture.matchdayLabel, copy.locale)} · {formatDetailDate(fixture.dateLabel, copy.locale)}
                  </p>
                  <h3>{matchupLabel}</h3>
                  <p className="fixture-card__venue">{formatVenueName(fixture.venue, copy.locale)}</p>
                  <p className="fixture-card__prediction">
                    {copy.locale === 'zh' ? '比赛状态' : 'Match status'} · {fixture.resultLabel ?? fixture.predictionStatus}
                  </p>
                </a>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
