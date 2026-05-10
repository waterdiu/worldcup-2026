import { SectionHeader } from '../components/SectionHeader';
import { formatTeamName } from '../i18n/formatters';
import type { AppCopy } from '../i18n/content';
import type { BracketRoundData, FinalsDataCoverageData, FinalsMatchResultData, GroupCardData, TournamentMeta } from '../types/tournament';

interface StatsPageProps {
  meta: TournamentMeta;
  groups: GroupCardData[];
  results: FinalsMatchResultData[];
  rounds: BracketRoundData[];
  dataCoverage?: FinalsDataCoverageData;
  copy: AppCopy;
}

type TeamStat = {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  cleanSheets: number;
  blanked: number;
};

type GoalsPerMatchBucket = {
  label: string;
  count: number;
};

type ScorerStat = {
  player: string;
  team: string;
  goals: number;
  firstMinute: string;
};

const sourceStatusItems = [
  {
    name: 'Generated schedule scaffold',
    status: '已接入',
    fields: ['104 场赛程', '阶段', '小组', '球队', '场馆'],
    note: '当前统计页的赛前结构数据来自本地生成 scaffold。'
  },
  {
    name: 'openfootball',
    status: '待开赛后接入',
    fields: ['比分', '进球者', '进球时间'],
    note: '优先作为免费赛果和进球事件来源。'
  },
  {
    name: 'football-data.org',
    status: '待验证',
    fields: ['比赛状态', '积分榜', '射手榜基础数据'],
    note: '开赛后用免费权限实测 World Cup 资源覆盖。'
  },
  {
    name: 'API-Football 免费档',
    status: '增强来源',
    fields: ['事件', '阵容', '技术统计', '球员统计'],
    note: '只在免费档覆盖 2026 正赛时启用，不作为 v1 必需依赖。'
  }
];

function isCompleted(match: FinalsMatchResultData) {
  return match.status === 'completed' && typeof match.homeScore === 'number' && typeof match.awayScore === 'number';
}

function formatDecimal(value: number) {
  return value.toFixed(2);
}

function buildTeamStats(groups: GroupCardData[], matches: FinalsMatchResultData[]) {
  const stats = new Map<string, TeamStat>();

  groups.forEach((group) => {
    group.teams.forEach((team) => {
      stats.set(team.name, {
        team: team.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        cleanSheets: 0,
        blanked: 0
      });
    });
  });

  matches.filter(isCompleted).forEach((match) => {
    const home = stats.get(match.homeTeam);
    const away = stats.get(match.awayTeam);
    if (!home || !away) return;

    home.played += 1;
    away.played += 1;
    home.goalsFor += match.homeScore!;
    home.goalsAgainst += match.awayScore!;
    away.goalsFor += match.awayScore!;
    away.goalsAgainst += match.homeScore!;

    if (match.homeScore! > match.awayScore!) {
      home.won += 1;
      away.lost += 1;
    } else if (match.homeScore! < match.awayScore!) {
      away.won += 1;
      home.lost += 1;
    } else {
      home.drawn += 1;
      away.drawn += 1;
    }

    if (match.awayScore === 0) home.cleanSheets += 1;
    if (match.homeScore === 0) away.cleanSheets += 1;
    if (match.homeScore === 0) home.blanked += 1;
    if (match.awayScore === 0) away.blanked += 1;
  });

  return [...stats.values()].sort((a, b) => b.goalsFor - a.goalsFor || a.goalsAgainst - b.goalsAgainst || a.team.localeCompare(b.team));
}

function buildScoreDistribution(matches: FinalsMatchResultData[]) {
  const distribution = new Map<string, number>();

  matches.filter(isCompleted).forEach((match) => {
    const score = `${match.homeScore}-${match.awayScore}`;
    distribution.set(score, (distribution.get(score) ?? 0) + 1);
  });

  return [...distribution.entries()].sort((a, b) => b[1] - a[1]);
}

function buildGoalsPerMatchBuckets(matches: FinalsMatchResultData[]) {
  const buckets: GoalsPerMatchBucket[] = [
    { label: '0 球', count: 0 },
    { label: '1 球', count: 0 },
    { label: '2 球', count: 0 },
    { label: '3 球', count: 0 },
    { label: '4+ 球', count: 0 }
  ];

  matches.filter(isCompleted).forEach((match) => {
    const goals = match.homeScore! + match.awayScore!;
    const bucketIndex = goals >= 4 ? 4 : goals;
    buckets[bucketIndex].count += 1;
  });

  return buckets;
}

function buildGroupGoalRows(groups: GroupCardData[], matches: FinalsMatchResultData[]) {
  return groups.map((group) => {
    const goals = matches
      .filter((match) => match.groupId === group.id && isCompleted(match))
      .reduce((sum, match) => sum + match.homeScore! + match.awayScore!, 0);
    return { id: group.id, goals };
  });
}

function buildScorerStats(matches: FinalsMatchResultData[]) {
  const scorers = new Map<string, ScorerStat>();

  matches.filter(isCompleted).forEach((match) => {
    match.goals.forEach((goal) => {
      const key = `${goal.team}::${goal.player}`;
      const current = scorers.get(key);

      if (current) {
        current.goals += 1;
      } else {
        scorers.set(key, {
          player: goal.player,
          team: goal.team,
          goals: 1,
          firstMinute: goal.minute
        });
      }
    });
  });

  return [...scorers.values()].sort(
    (a, b) => b.goals - a.goals || a.team.localeCompare(b.team) || a.player.localeCompare(b.player)
  );
}

function stageRows(rounds: BracketRoundData[], groupMatchCount: number) {
  return [
    { stage: 'Group Stage', label: '小组赛', matches: groupMatchCount },
    ...rounds.map((round) => ({
      stage: round.round,
      label: round.round,
      matches: round.matches.length
    }))
  ];
}

function EmptyPanel({ children }: { children: string }) {
  return <p className="stats-empty-state">{children}</p>;
}

function barWidth(value: number, maxValue: number) {
  if (!maxValue) return '2%';
  return `${Math.max(8, Math.round((value / maxValue) * 100))}%`;
}

export function StatsPage({ meta, groups, results, rounds, dataCoverage: importedCoverage, copy }: StatsPageProps) {
  const completedMatches = results.filter(isCompleted);
  const totalGoals = completedMatches.reduce((sum, match) => sum + match.homeScore! + match.awayScore!, 0);
  const averageGoals = completedMatches.length ? totalGoals / completedMatches.length : 0;
  const scoreDistribution = buildScoreDistribution(results);
  const mostCommonScore = scoreDistribution[0]?.[0] ?? '待开赛';
  const goalsPerMatchBuckets = buildGoalsPerMatchBuckets(results);
  const maxGoalsPerMatchBucket = Math.max(...goalsPerMatchBuckets.map((bucket) => bucket.count));
  const groupGoalRows = buildGroupGoalRows(groups, results);
  const maxGroupGoals = Math.max(...groupGoalRows.map((group) => group.goals));
  const scorerStats = buildScorerStats(results);
  const teamStats = buildTeamStats(groups, results);
  const displayedTeams = teamStats.slice(0, 12);
  const dataCoverage = Math.round((completedMatches.length / meta.matchCount) * 100);
  const coverage = importedCoverage ?? {
    updatedAt: completedMatches[0]?.updatedAt ?? '待开赛',
    sourceLabel: completedMatches[0]?.sourceLabel ?? 'Generated schedule scaffold',
    scoreCoveragePct: dataCoverage,
    goalEventCoveragePct: completedMatches.length
      ? Math.round((completedMatches.filter((match) => match.goals.length > 0).length / completedMatches.length) * 100)
      : 0,
    issueCount: 0
  };
  const groupMatchCount = results.filter((match) => match.stageType === 'group').length;
  const stageData = stageRows(rounds, groupMatchCount);

  return (
    <section className="section stats-page">
      <SectionHeader
        eyebrow={copy.locale === 'zh' ? 'DATA ANALYSIS' : 'Data Analysis'}
        title={copy.locale === 'zh' ? '统计' : 'Stats'}
        description={
          copy.locale === 'zh'
            ? '基于免费公开数据构建的 2026 世界杯正赛数据统计。赛前展示结构和空态，开赛后会随着比分与进球事件自动生成分析。'
            : 'A free-public-data dashboard for the 2026 World Cup finals. It shows the pre-tournament structure now and will populate from scores and goal events after kick-off.'
        }
      />

      <div className="stats-shell">
        <aside className="stats-side-nav" aria-label={copy.locale === 'zh' ? '统计页面导航' : 'Stats page navigation'}>
          <span>SECTIONS</span>
          <a href="#overview">总览 KPI</a>
          <a href="#goals">进球分析</a>
          <a href="#teams">球队排名</a>
          <a href="#scores">比分分布</a>
          <a href="#stages">阶段对比</a>
          <a href="#index">攻防指数</a>
        </aside>

        <div className="stats-content">
          <section className="stats-section" id="overview">
            <h2>总览 KPI</h2>
            <div className="stats-data-status" aria-label="正赛数据更新状态">
              <span>数据更新 {coverage.updatedAt}</span>
              <span>来源 {coverage.sourceLabel}</span>
              <span>比分覆盖 {coverage.scoreCoveragePct}%</span>
              <span>进球事件覆盖 {coverage.goalEventCoveragePct}%</span>
              <span>待复核 {coverage.issueCount}</span>
            </div>
            <div className="stats-kpi-grid">
              <article>
                <strong>{meta.matchCount}</strong>
                <span>总比赛场数</span>
                <small>{completedMatches.length} 场已完赛</small>
              </article>
              <article>
                <strong>{totalGoals}</strong>
                <span>总进球数</span>
                <small>场均 {formatDecimal(averageGoals)}</small>
              </article>
              <article>
                <strong>{meta.teamCount}</strong>
                <span>参赛队伍</span>
                <small>{meta.groupCount} 组各 4 队</small>
              </article>
              <article>
                <strong>{mostCommonScore}</strong>
                <span>最常见比分</span>
                <small>{completedMatches.length ? `${scoreDistribution[0][1]} 次` : '待开赛'}</small>
              </article>
              <article>
                <strong>{dataCoverage}%</strong>
                <span>比分覆盖率</span>
                <small>免费比分数据</small>
              </article>
            </div>
          </section>

          <section className="stats-section" id="goals">
            <h2>进球分析</h2>
            <div className="stats-panel-grid">
              <article className="stats-panel">
                <h3>每场进球数分布</h3>
                {completedMatches.length ? (
                  <div className="stats-mini-bars">
                    {goalsPerMatchBuckets.map((bucket) => (
                      <div key={bucket.label}>
                        <span>{bucket.label}</span>
                        <strong>{bucket.count}</strong>
                        <i style={{ width: barWidth(bucket.count, maxGoalsPerMatchBucket) }} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyPanel>开赛后根据免费比分数据自动生成 0 球、1 球、2 球、3 球、4+ 球分布。</EmptyPanel>
                )}
              </article>
              <article className="stats-panel">
                <h3>各小组总进球</h3>
                <div className="stats-mini-bars">
                  {groupGoalRows.map((group) => (
                    <div key={group.id}>
                      <span>组 {group.id}</span>
                      <strong>{group.goals}</strong>
                      <i style={{ width: barWidth(group.goals, maxGroupGoals) }} />
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>

          <section className="stats-section" id="teams">
            <h2>球队排名</h2>
            <div className="stats-panel-grid">
              <article className="stats-panel">
                <h3>进球最多 Top 12</h3>
                {scorerStats.length ? (
                  <div className="stats-scorer-list">
                    {scorerStats.slice(0, 12).map((scorer, index) => (
                      <div key={`${scorer.team}-${scorer.player}`}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <strong>{scorer.player}</strong>
                        <small>{formatTeamName(scorer.team, copy.locale)} · {scorer.firstMinute}'</small>
                        <em>{scorer.goals} 球</em>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyPanel>当前正赛待开赛，球队进球榜会在比分数据接入后更新。</EmptyPanel>
                )}
              </article>
              <article className="stats-panel">
                <h3>进球数 vs 失球数</h3>
                <div className="stats-scatter-placeholder" aria-label="进球数 vs 失球数散点图占位">
                  {displayedTeams.slice(0, 10).map((team, index) => (
                    <span
                      key={team.team}
                      style={{
                        left: `${12 + (index % 5) * 18}%`,
                        top: `${18 + Math.floor(index / 5) * 38}%`
                      }}
                      title={formatTeamName(team.team, copy.locale)}
                    />
                  ))}
                </div>
              </article>
            </div>
          </section>

          <section className="stats-section" id="scores">
            <h2>比分分布</h2>
            <div className="stats-panel-grid">
              <article className="stats-panel">
                <h3>最常见比分</h3>
                {scoreDistribution.length ? (
                  <div className="stats-score-list">
                    {scoreDistribution.slice(0, 10).map(([score, count], index) => (
                      <div key={score}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <strong>{score}</strong>
                        <em>{count} 次</em>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyPanel>开赛后根据免费比分数据自动生成 Top 10 比分。</EmptyPanel>
                )}
              </article>
              <article className="stats-panel">
                <h3>比分热力矩阵</h3>
                <div className="stats-score-grid" aria-label="比分热力矩阵">
                  {['0', '1', '2', '3', '4+'].flatMap((home) =>
                    ['0', '1', '2', '3', '4+'].map((away) => {
                      const count = completedMatches.filter((match) => {
                        const homeBucket = match.homeScore! >= 4 ? '4+' : String(match.homeScore);
                        const awayBucket = match.awayScore! >= 4 ? '4+' : String(match.awayScore);
                        return homeBucket === home && awayBucket === away;
                      }).length;

                      return (
                        <span key={`${home}-${away}`} data-active={count > 0 ? 'true' : undefined}>
                          <small>{home}-{away}</small>
                          <strong>{count}</strong>
                        </span>
                      );
                    })
                  )}
                </div>
              </article>
            </div>
          </section>

          <section className="stats-section" id="stages">
            <h2>阶段对比</h2>
            <div className="stats-stage-grid">
              {stageData.map((stage) => (
                <article key={stage.stage}>
                  <span>{stage.label}</span>
                  <strong>{stage.matches}</strong>
                  <small>场比赛 · 进球数据待开赛</small>
                </article>
              ))}
            </div>
          </section>

          <section className="stats-section" id="index">
            <h2>球队攻防指数</h2>
            <div className="stats-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>排名</th>
                    <th>球队</th>
                    <th>赛</th>
                    <th>胜</th>
                    <th>平</th>
                    <th>负</th>
                    <th>进</th>
                    <th>失</th>
                    <th>净</th>
                    <th>场均进</th>
                    <th>场均失</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedTeams.map((team, index) => {
                    const goalDifference = team.goalsFor - team.goalsAgainst;
                    return (
                      <tr key={team.team}>
                        <td>{String(index + 1).padStart(2, '0')}</td>
                        <td>{formatTeamName(team.team, copy.locale)}</td>
                        <td>{team.played}</td>
                        <td>{team.won}</td>
                        <td>{team.drawn}</td>
                        <td>{team.lost}</td>
                        <td>{team.goalsFor}</td>
                        <td>{team.goalsAgainst}</td>
                        <td>{goalDifference > 0 ? `+${goalDifference}` : goalDifference}</td>
                        <td>{team.played ? formatDecimal(team.goalsFor / team.played) : '0.00'}</td>
                        <td>{team.played ? formatDecimal(team.goalsAgainst / team.played) : '0.00'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="stats-footnote">数据源计划：openfootball / football-data.org 免费比分数据优先，API-Football 免费档只作为赛后技术统计增强。</p>
          </section>

          <section className="stats-section" id="sources">
            <h2>数据源状态</h2>
            <div className="stats-source-grid">
              {sourceStatusItems.map((source) => (
                <article key={source.name}>
                  <div>
                    <strong>{source.name}</strong>
                    <span>{source.status}</span>
                  </div>
                  <p>{source.note}</p>
                  <ul>
                    {source.fields.map((field) => (
                      <li key={field}>{field}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
