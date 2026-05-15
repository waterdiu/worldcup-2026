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
  const drawMatches = completedMatches.filter((match) => match.homeScore === match.awayScore).length;
  const cleanSheetMatches = completedMatches.filter((match) => match.homeScore === 0 || match.awayScore === 0).length;
  const bothTeamsScoreMatches = completedMatches.filter((match) => (match.homeScore ?? 0) > 0 && (match.awayScore ?? 0) > 0).length;
  const bigScoreMatches = completedMatches.filter((match) => (match.homeScore ?? 0) + (match.awayScore ?? 0) >= 4).length;
  const scoreDistribution = buildScoreDistribution(results);
  const mostCommonScore = scoreDistribution[0]?.[0] ?? '待开赛';
  const goalsPerMatchBuckets = buildGoalsPerMatchBuckets(results);
  const maxGoalsPerMatchBucket = Math.max(...goalsPerMatchBuckets.map((bucket) => bucket.count));
  const groupGoalRows = buildGroupGoalRows(groups, results);
  const maxGroupGoals = Math.max(...groupGoalRows.map((group) => group.goals));
  const scorerStats = buildScorerStats(results);
  const teamStats = buildTeamStats(groups, results);
  const displayedTeams = teamStats.slice(0, 12);
  const scoreCoveragePct = Math.round((completedMatches.length / meta.matchCount) * 100);
  const coverage = importedCoverage ?? {
    updatedAt: completedMatches[0]?.updatedAt ?? '待开赛',
    sourceLabel: completedMatches[0]?.sourceLabel ?? 'Generated schedule scaffold',
    scoreCoveragePct,
    goalEventCoveragePct: completedMatches.length
      ? Math.round((completedMatches.filter((match) => match.goals.length > 0).length / completedMatches.length) * 100)
      : 0,
    issueCount: 0
  };
  const groupMatchCount = results.filter((match) => match.stageType === 'group').length;
  const stageData = stageRows(rounds, groupMatchCount);

  return (
    <section className="claude-stats" aria-label={copy.locale === 'zh' ? '统计' : 'Stats'}>
      <div className="claude-page">
        <div className="claude-source-line mono">
          {copy.locale === 'zh'
            ? `数据更新 ${coverage.updatedAt} · 来源 ${coverage.sourceLabel} · 比分覆盖 ${coverage.scoreCoveragePct}% · 进球事件覆盖 ${coverage.goalEventCoveragePct}% · 待复核 ${coverage.issueCount}`
            : `Updated ${coverage.updatedAt} · Source ${coverage.sourceLabel} · Score coverage ${coverage.scoreCoveragePct}% · Goal events ${coverage.goalEventCoveragePct}% · Issues ${coverage.issueCount}`}
        </div>

        <h1 className="claude-title">{copy.locale === 'zh' ? '统计' : 'Stats'}</h1>
        <p className="claude-deck mono">{copy.locale === 'zh' ? '正赛数据分析' : 'Finals data analysis'}</p>
        <h2 className="claude-subtitle mono">{copy.locale === 'zh' ? '总览 KPI' : 'KPI'}</h2>

        <div className="kpi-row" aria-label={copy.locale === 'zh' ? '总览 KPI' : 'KPI'}>
          <div className="kpi">
            <div className="kv">{meta.matchCount}</div>
            <div className="kl">比赛总场次</div>
            <div className="ks">{completedMatches.length} 场已完赛</div>
          </div>
          <div className="kpi">
            <div className="kv">{totalGoals}</div>
            <div className="kl">总进球数</div>
            <div className="ks">场均 {formatDecimal(averageGoals)}</div>
          </div>
          <div className="kpi">
            <div className="kv">{meta.teamCount}</div>
            <div className="kl">参赛队伍</div>
            <div className="ks">{meta.groupCount} 组</div>
          </div>
          <div className="kpi">
            <div className="kv">{mostCommonScore}</div>
            <div className="kl">最常见比分</div>
            <div className="ks">{completedMatches.length ? `${scoreDistribution[0]?.[1] ?? 0} 次` : '待开赛'}</div>
          </div>
          <div className="kpi">
            <div className="kv">{cleanSheetMatches}</div>
            <div className="kl">零封场次</div>
            <div className="ks">{completedMatches.length ? `占比 ${formatDecimal((cleanSheetMatches / completedMatches.length) * 100)}%` : '待开赛'}</div>
          </div>
          <div className="kpi">
            <div className="kv">{drawMatches}</div>
            <div className="kl">平局场次</div>
            <div className="ks">{completedMatches.length ? `占比 ${formatDecimal((drawMatches / completedMatches.length) * 100)}%` : '待开赛'}</div>
          </div>
          <div className="kpi">
            <div className="kv">{bigScoreMatches}</div>
            <div className="kl">大比分场次</div>
            <div className="ks">总进球 ≥ 4</div>
          </div>
          <div className="kpi">
            <div className="kv">{bothTeamsScoreMatches}</div>
            <div className="kl">互进球场次</div>
            <div className="ks">{completedMatches.length ? `占比 ${formatDecimal((bothTeamsScoreMatches / completedMatches.length) * 100)}%` : '待开赛'}</div>
          </div>
        </div>

        <div className="sec" id="s-goals">
          <div className="sec-head">
            <h2 className="sec-title">比分与进球分布</h2>
            <div className="sec-note mono">{completedMatches.length} matches · {totalGoals} goals</div>
          </div>
          <div className="g2 mb1">
            <div className="panel">
              <div className="ptitle">每场进球数分布</div>
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
                <EmptyPanel>开赛后自动生成。</EmptyPanel>
              )}
            </div>
            <div className="panel">
              <div className="ptitle">各小组总进球</div>
              <div className="stats-mini-bars">
                {groupGoalRows.map((group) => (
                  <div key={group.id}>
                    <span>组 {group.id}</span>
                    <strong>{group.goals}</strong>
                    <i style={{ width: barWidth(group.goals, maxGroupGoals) }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="sec" id="s-scores">
          <div className="sec-head">
            <h2 className="sec-title">比分分布</h2>
            <div className="sec-note mono">Top scores · heat matrix</div>
          </div>
          <div className="g2">
            <div className="panel">
              <div className="ptitle">最常见比分 Top 10</div>
              {scoreDistribution.length ? (
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>比分</th>
                      <th className="n">次数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoreDistribution.slice(0, 10).map(([score, count], index) => (
                      <tr key={score}>
                        <td className="rk">{String(index + 1).padStart(2, '0')}</td>
                        <td>{score}</td>
                        <td className="ng">{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyPanel>开赛后自动生成。</EmptyPanel>
              )}
            </div>
            <div className="panel">
              <div className="ptitle">比分热力矩阵</div>
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
            </div>
          </div>
        </div>

        <div className="sec" id="s-stage">
          <div className="sec-head">
            <h2 className="sec-title">阶段对比</h2>
            <div className="sec-note mono">Group → Knockout</div>
          </div>
          <div className="stats-stage-grid">
            {stageData.map((stage) => (
              <article key={stage.stage}>
                <span>{stage.label}</span>
                <strong>{stage.matches}</strong>
                <small>matches</small>
              </article>
            ))}
          </div>
        </div>

        <div className="sec" id="s-teams">
          <div className="sec-head">
            <h2 className="sec-title">球队攻防</h2>
            <div className="sec-note mono">{meta.teamCount} teams</div>
          </div>
          <div className="panel">
            <h3 className="claude-panel-title">球队攻防指数</h3>
            <div className="ptitle">Top 12</div>
            <div className="stats-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>rk</th>
                    <th>team</th>
                    <th className="n">mp</th>
                    <th className="n">w</th>
                    <th className="n">d</th>
                    <th className="n">l</th>
                    <th className="n">gf</th>
                    <th className="n">ga</th>
                    <th className="n">gd</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedTeams.map((team, index) => {
                    const goalDifference = team.goalsFor - team.goalsAgainst;
                    return (
                      <tr key={team.team}>
                        <td className="rk">{String(index + 1).padStart(2, '0')}</td>
                        <td>{formatTeamName(team.team, copy.locale)}</td>
                        <td className="n">{team.played}</td>
                        <td className="n">{team.won}</td>
                        <td className="n">{team.drawn}</td>
                        <td className="n">{team.lost}</td>
                        <td className="ng">{team.goalsFor}</td>
                        <td className="nr">{team.goalsAgainst}</td>
                        <td className="nb">{goalDifference > 0 ? `+${goalDifference}` : goalDifference}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="g2" style={{ marginTop: '16px' }}>
            <div className="panel">
              <div className="ptitle">射手榜 Top 12</div>
              {scorerStats.length ? (
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>player</th>
                      <th>team</th>
                      <th className="n">g</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scorerStats.slice(0, 12).map((scorer, index) => (
                      <tr key={`${scorer.team}-${scorer.player}`}>
                        <td className="rk">{String(index + 1).padStart(2, '0')}</td>
                        <td>{scorer.player}</td>
                        <td>{formatTeamName(scorer.team, copy.locale)}</td>
                        <td className="ng">{scorer.goals}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyPanel>开赛后自动生成。</EmptyPanel>
              )}
            </div>
            <div className="panel">
              <div className="ptitle">数据覆盖</div>
              <div className="claude-chip-row">
                <span className="claude-chip">score {coverage.scoreCoveragePct}%</span>
                <span className="claude-chip">goals {coverage.goalEventCoveragePct}%</span>
                <span className="claude-chip">updated {coverage.updatedAt}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sec" id="s-sources">
          <div className="sec-head">
            <h2 className="sec-title">数据源状态</h2>
            <div className="sec-note mono">free-tier only</div>
          </div>
          <div className="claude-source-grid">
            {sourceStatusItems.map((source) => (
              <div className="panel" key={source.name}>
                <div className="ptitle">{source.name}</div>
                <div className="sec-note mono">{source.status}</div>
                <div className="claude-chip-row">
                  {source.fields.map((field) => (
                    <span className="claude-chip" key={field}>{field}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
