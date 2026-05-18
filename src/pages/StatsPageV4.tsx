import { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import type { Qatar2022RawMatch } from '../data/qatar2022Raw';
import type { BracketRoundData, GroupStageMatchData } from '../types/tournament';

type TabKey = 'all' | 'gf' | 'ga' | 'gd';

interface StatsPageV4Props {
  bracket: BracketRoundData[];
  groupStageMatches: GroupStageMatchData[];
}

const SCORERS: Array<[player: string, team: string, goals: number]> = [
  ['Vinicius Junior', 'Brazil', 7],
  ['Kylian Mbappe', 'France', 6],
  ['Erling Haaland', 'Norway', 6],
  ['Lautaro Martinez', 'Argentina', 5],
  ['Harry Kane', 'England', 5],
  ['Cristiano Ronaldo', 'Portugal', 4],
  ['Jamal Musiala', 'Germany', 4],
  ['Alvaro Morata', 'Spain', 4],
  ['Christian Pulisic', 'United States', 3],
  ['Jonathan David', 'Canada', 3],
  ['Santiago Gimenez', 'Mexico', 3],
  ['Darwin Nunez', 'Uruguay', 3]
];

type TeamAgg = {
  gf: number;
  ga: number;
  mp: number;
  gd: number;
  avg_gf: number;
  avg_ga: number;
  shutouts: number;
  blanked: number;
  wins: number;
  draws: number;
  losses: number;
};

type Stats = {
  n: number;
  totalGoals: number;
  scoreDist: Record<string, number>;
  sdSorted: Array<[string, number]>;
  topScore: [string, number];
  shutouts: number;
  btts: number;
  draws: number;
  bigGames: number;
  gpmDist: Record<string, number>;
  buckets: number[];
  bucketLabels: string[];
  h1: number;
  h2: number;
  stage: Record<string, { matches: number; goals: number; shutouts: number; draws: number; big: number }>;
  matrix: number[][];
  teams: Record<string, TeamAgg>;
};

const STAGE_ORDER = ['Group', 'R32', 'R16', 'QF', 'SF', 'Final'] as const;

function seedFromString(value: string) {
  let seed = 0;
  for (let i = 0; i < value.length; i += 1) {
    seed = (seed * 31 + value.charCodeAt(i)) % 9973;
  }
  return seed;
}

function simulatedScore(seed: number, isKnockout: boolean) {
  const totals = isKnockout ? [1, 2, 2, 3, 3, 4, 1, 2] : [0, 1, 2, 2, 3, 3, 4, 5];
  const total = totals[seed % totals.length];
  let home = Math.floor(total / 2) + (seed % 3 === 0 ? 1 : 0);
  let away = total - Math.floor(total / 2) + (seed % 5 === 0 ? 1 : 0);

  if (seed % 7 === 0) home = 0;
  if (seed % 11 === 0) away = 0;

  home = Math.max(0, Math.min(5, home));
  away = Math.max(0, Math.min(5, away));

  if (isKnockout && home === away && seed % 4 !== 0) {
    if (seed % 2 === 0) home += 1;
    else away += 1;
  }

  return [home, away] as const;
}

function simulatedMinutes(seed: number, goals: number) {
  return Array.from({ length: goals }, (_, index) => {
    const minute = 4 + ((seed + index * 17) % 87);
    return index === goals - 1 && seed % 6 === 0 ? Math.min(120, minute + 8) : minute;
  }).sort((a, b) => a - b);
}

function roundToStage(round: string): keyof Stats['stage'] {
  if (round === 'Round of 32') return 'R32';
  if (round === 'Round of 16') return 'R16';
  if (round === 'Quarter-finals') return 'QF';
  if (round === 'Semi-finals') return 'SF';
  if (round === 'Bronze & Final') return 'Final';
  return 'Group';
}

function buildSimulated2026Raw(groupStageMatches: GroupStageMatchData[], bracket: BracketRoundData[]): Qatar2022RawMatch[] {
  const groupRaw = groupStageMatches.map((match) => {
    const seed = seedFromString(`${match.id}:${match.homeTeam}:${match.awayTeam}`);
    const [s1, s2] = simulatedScore(seed, false);

    return {
      t1: match.homeTeam,
      t2: match.awayTeam,
      s1,
      s2,
      g: match.groupId,
      r: 'Group',
      m1: simulatedMinutes(seed, s1),
      m2: simulatedMinutes(seed + 43, s2)
    };
  });

  const groupRanks = new Map<string, string[]>();
  const thirdTeams: Array<{ groupId: string; team: string; points: number; gd: number; gf: number }> = [];

  Array.from(new Set(groupStageMatches.map((match) => match.groupId))).forEach((groupId) => {
    const table = new Map<string, { team: string; points: number; gd: number; gf: number }>();
    groupRaw
      .filter((match) => match.g === groupId)
      .forEach((match) => {
        [match.t1, match.t2].forEach((team) => {
          if (!table.has(team)) table.set(team, { team, points: 0, gd: 0, gf: 0 });
        });
        const home = table.get(match.t1)!;
        const away = table.get(match.t2)!;
        home.gf += match.s1;
        away.gf += match.s2;
        home.gd += match.s1 - match.s2;
        away.gd += match.s2 - match.s1;
        if (match.s1 > match.s2) home.points += 3;
        else if (match.s2 > match.s1) away.points += 3;
        else {
          home.points += 1;
          away.points += 1;
        }
      });

    const ranked = [...table.values()].sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team));
    groupRanks.set(groupId, ranked.map((item) => item.team));
    const third = ranked[2];
    if (third) thirdTeams.push({ groupId, ...third });
  });

  const bestThirds = thirdTeams.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team));
  const usedThirdGroups = new Set<string>();
  const matchWinners = new Map<string, string>();
  const matchLosers = new Map<string, string>();

  function resolveBracketLabel(label: string) {
    const winner = /^Winner Match (\d+)$/.exec(label);
    if (winner) return matchWinners.get(winner[1]) ?? label;

    const runnerUp = /^Runner-up Match (\d+)$/.exec(label);
    if (runnerUp) return matchLosers.get(runnerUp[1]) ?? label;

    const groupWinner = /^Group ([A-L]) winners$/.exec(label);
    if (groupWinner) return groupRanks.get(groupWinner[1])?.[0] ?? label;

    const groupRunner = /^Group ([A-L]) runners-up$/.exec(label);
    if (groupRunner) return groupRanks.get(groupRunner[1])?.[1] ?? label;

    const bestThird = /^Best third from ([A-L/]+)$/.exec(label);
    if (bestThird) {
      const allowed = bestThird[1].split('/');
      const selected = bestThirds.find((item) => allowed.includes(item.groupId) && !usedThirdGroups.has(item.groupId));
      if (selected) {
        usedThirdGroups.add(selected.groupId);
        return selected.team;
      }
    }

    return label;
  }

  const bracketRaw = bracket.flatMap((round) =>
    round.matches.map((match) => {
      const t1 = resolveBracketLabel(match.homeLabel);
      const t2 = resolveBracketLabel(match.awayLabel);
      const seed = seedFromString(`${match.id}:${t1}:${t2}`);
      const [s1, s2] = simulatedScore(seed, true);
      const homeAdvances = s1 > s2 || (s1 === s2 && seed % 2 === 0);
      matchWinners.set(match.id, homeAdvances ? t1 : t2);
      matchLosers.set(match.id, homeAdvances ? t2 : t1);

      return {
        t1,
        t2,
        s1,
        s2,
        g: '',
        r: roundToStage(round.round),
        m1: simulatedMinutes(seed, s1),
        m2: simulatedMinutes(seed + 61, s2)
      };
    })
  );

  return [...groupRaw, ...bracketRaw];
}

function scoreKey(s1: number, s2: number) {
  return `${s1}-${s2}`;
}

function clampScoreBucket(s: number) {
  return s >= 4 ? 4 : s;
}

function computeStats(raw: Qatar2022RawMatch[]): Stats {
  const n = raw.length;
  const scoreDist: Record<string, number> = {};
  const gpmDist: Record<string, number> = {};
  const teams: Record<string, TeamAgg> = {};
  const bucketLabels = ['0-15', '16-30', '31-45+', '46-60', '61-75', '76-90+'];
  const buckets = [0, 0, 0, 0, 0, 0];
  let totalGoals = 0;
  let shutouts = 0;
  let btts = 0;
  let draws = 0;
  let bigGames = 0;
  let h1 = 0;
  let h2 = 0;

  const stage: Stats['stage'] = {
    Group: { matches: 0, goals: 0, shutouts: 0, draws: 0, big: 0 },
    R32: { matches: 0, goals: 0, shutouts: 0, draws: 0, big: 0 },
    R16: { matches: 0, goals: 0, shutouts: 0, draws: 0, big: 0 },
    QF: { matches: 0, goals: 0, shutouts: 0, draws: 0, big: 0 },
    SF: { matches: 0, goals: 0, shutouts: 0, draws: 0, big: 0 },
    Final: { matches: 0, goals: 0, shutouts: 0, draws: 0, big: 0 },
    '3RD': { matches: 0, goals: 0, shutouts: 0, draws: 0, big: 0 }
  };

  function ensureTeam(name: string) {
    if (teams[name]) return;
    teams[name] = {
      gf: 0,
      ga: 0,
      mp: 0,
      gd: 0,
      avg_gf: 0,
      avg_ga: 0,
      shutouts: 0,
      blanked: 0,
      wins: 0,
      draws: 0,
      losses: 0
    };
  }

  raw.forEach((m) => {
    const goals = m.s1 + m.s2;
    totalGoals += goals;

    const sk = scoreKey(m.s1, m.s2);
    scoreDist[sk] = (scoreDist[sk] ?? 0) + 1;
    gpmDist[String(goals)] = (gpmDist[String(goals)] ?? 0) + 1;

    if (m.s1 === 0 || m.s2 === 0) shutouts += 1;
    if (m.s1 > 0 && m.s2 > 0) btts += 1;
    if (m.s1 === m.s2) draws += 1;
    if (goals >= 4) bigGames += 1;

    const allMinutes = [...m.m1.map((x) => ({ t: 'h', v: x })), ...m.m2.map((x) => ({ t: 'a', v: x }))];
    allMinutes.forEach(({ v }) => {
      if (v <= 15) buckets[0] += 1;
      else if (v <= 30) buckets[1] += 1;
      else if (v <= 45) buckets[2] += 1;
      else if (v <= 60) buckets[3] += 1;
      else if (v <= 75) buckets[4] += 1;
      else buckets[5] += 1;

      if (v <= 45) h1 += 1;
      else h2 += 1;
    });

    const r = (m.r || 'Group') as keyof Stats['stage'];
    if (stage[r]) {
      stage[r].matches += 1;
      stage[r].goals += goals;
      if (m.s1 === 0 || m.s2 === 0) stage[r].shutouts += 1;
      if (m.s1 === m.s2) stage[r].draws += 1;
      if (goals >= 4) stage[r].big += 1;
    }

    ensureTeam(m.t1);
    ensureTeam(m.t2);
    const t1 = teams[m.t1];
    const t2 = teams[m.t2];
    t1.mp += 1;
    t2.mp += 1;
    t1.gf += m.s1;
    t1.ga += m.s2;
    t2.gf += m.s2;
    t2.ga += m.s1;
    if (m.s2 === 0) t1.shutouts += 1;
    if (m.s1 === 0) t2.shutouts += 1;
    if (m.s1 === 0) t1.blanked += 1;
    if (m.s2 === 0) t2.blanked += 1;
    if (m.s1 > m.s2) {
      t1.wins += 1;
      t2.losses += 1;
    } else if (m.s2 > m.s1) {
      t2.wins += 1;
      t1.losses += 1;
    } else {
      t1.draws += 1;
      t2.draws += 1;
    }
  });

  Object.entries(teams).forEach(([_, s]) => {
    s.gd = s.gf - s.ga;
    s.avg_gf = s.mp ? s.gf / s.mp : 0;
    s.avg_ga = s.mp ? s.ga / s.mp : 0;
  });

  const sdSorted = Object.entries(scoreDist).sort((a, b) => b[1] - a[1]);
  const topScore = (sdSorted[0] ?? ['—', 0]) as [string, number];

  // score heat matrix 0..3 plus 4+
  const matrix = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => 0));
  raw.forEach((m) => {
    const r = clampScoreBucket(m.s1);
    const c = clampScoreBucket(m.s2);
    matrix[r][c] += 1;
  });

  return {
    n,
    totalGoals,
    scoreDist,
    sdSorted,
    topScore,
    shutouts,
    btts,
    draws,
    bigGames,
    gpmDist,
    buckets,
    bucketLabels,
    h1,
    h2,
    stage,
    matrix,
    teams
  };
}

function useRevealOnScroll(selector: string) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(selector));
    if (!els.length) return;
    if (typeof IntersectionObserver === 'undefined') {
      // JSDOM (tests) doesn't implement IntersectionObserver; degrade gracefully.
      els.forEach((el) => (el as HTMLElement).classList.add('in'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) (e.target as HTMLElement).classList.add('in');
        });
      },
      { threshold: 0.08 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [selector]);
}

export function StatsPageV4({ bracket, groupStageMatches }: StatsPageV4Props) {
  const raw = useMemo(() => buildSimulated2026Raw(groupStageMatches, bracket), [bracket, groupStageMatches]);
  const stats = useMemo(() => computeStats(raw), [raw]);
  const [activeNav, setActiveNav] = useState<'s-goals' | 's-stage' | 's-time' | 's-teams' | 's-scorers' | 's-matrix'>('s-goals');
  const [teamTab, setTeamTab] = useState<TabKey>('all');

  useRevealOnScroll('.stats-v4 .reveal');

  const cGpm = useRef<HTMLCanvasElement | null>(null);
  const cScoreDist = useRef<HTMLCanvasElement | null>(null);
  const cResults = useRef<HTMLCanvasElement | null>(null);
  const cSpecial = useRef<HTMLCanvasElement | null>(null);
  const cPhase = useRef<HTMLCanvasElement | null>(null);
  const cStageLine = useRef<HTMLCanvasElement | null>(null);
  const cStageBar = useRef<HTMLCanvasElement | null>(null);
  const cHalves = useRef<HTMLCanvasElement | null>(null);
  const cBuckets = useRef<HTMLCanvasElement | null>(null);
  const cTopGF = useRef<HTMLCanvasElement | null>(null);
  const cTopGA = useRef<HTMLCanvasElement | null>(null);
  const cTopGD = useRef<HTMLCanvasElement | null>(null);
  const cScatter = useRef<HTMLCanvasElement | null>(null);
  const cScorers = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Chart defaults to match template.
    Chart.defaults.color = '#4a4740';
    Chart.defaults.borderColor = '#2a2720';
    Chart.defaults.font.family = "'DM Mono', monospace";
    Chart.defaults.font.size = 10;

    const TT: any = {
      backgroundColor: '#1e1c17',
      borderColor: '#38342a',
      borderWidth: 1,
      titleColor: '#f0ede6',
      bodyColor: '#9a9488',
      padding: 10,
      titleFont: { family: "'Barlow Condensed',sans-serif", size: 14, weight: '700' }
    };
    const noLeg: any = { display: false };
    const gs: any = {
      x: { grid: { color: '#1e1c17' }, ticks: { color: '#4a4740' } },
      y: { grid: { color: '#1e1c17' }, ticks: { color: '#4a4740' } }
    };

    const charts: Chart[] = [];
    const ensure = (ref: React.RefObject<HTMLCanvasElement>) => {
      const el = ref.current;
      if (!el) return null;
      if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) return null;
      try {
        // JSDOM doesn't implement canvas; just skip charts in tests.
        return el.getContext('2d') ? el : null;
      } catch {
        return null;
      }
    };

    const gpmKeys = Object.keys(stats.gpmDist).sort((a, b) => +a - +b);
    const gpmEl = ensure(cGpm);
    if (gpmEl) {
      charts.push(
        new Chart(gpmEl, {
          type: 'bar',
          data: {
            labels: gpmKeys.map((k) => `${k} 球`),
            datasets: [
              {
                data: gpmKeys.map((k) => stats.gpmDist[k]),
                backgroundColor: gpmKeys.map((k) => (+k >= 5 ? '#f25a3088' : +k >= 3 ? '#30a8f255' : '#c8f23044')),
                borderColor: gpmKeys.map((k) => (+k >= 5 ? '#f25a30' : +k >= 3 ? '#30a8f2' : '#c8f230')),
                borderWidth: 1,
                borderRadius: 0
              } as any
            ]
          },
          options: {
            responsive: true,
            plugins: { legend: noLeg, tooltip: { ...TT, callbacks: { label: (c: any) => `${c.raw} 场` } } },
            scales: gs
          }
        })
      );
    }

    const top14 = stats.sdSorted.slice(0, 14);
    const sdEl = ensure(cScoreDist);
    if (sdEl) {
      charts.push(
        new Chart(sdEl, {
          type: 'bar',
          data: {
            labels: top14.map((d) => d[0]),
            datasets: [
              {
                data: top14.map((d) => d[1]),
                backgroundColor: '#c8f23022',
                borderColor: '#c8f23066',
                borderWidth: 1,
                borderRadius: 0
              } as any
            ]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            plugins: { legend: noLeg, tooltip: { ...TT, callbacks: { label: (c: any) => `${c.raw} 次` } } },
            scales: {
              x: { grid: { color: '#1e1c17' }, ticks: { color: '#4a4740' } },
              y: { grid: { color: 'transparent' }, ticks: { color: '#9a9488', font: { size: 11 } } }
            }
          }
        })
      );
    }

    const normalWins = raw.filter((m) => m.s1 !== m.s2).length;
    const pens = 6;
    const drawNoPens = stats.draws - pens;
    const resultsEl = ensure(cResults);
    if (resultsEl) {
      charts.push(
        new Chart(resultsEl, {
          type: 'doughnut',
          data: {
            labels: ['常规决出胜负', '平局(90min)', '加时/点球'],
            datasets: [
              {
                data: [normalWins - pens, drawNoPens, pens * 2 + pens],
                backgroundColor: ['#c8f23066', '#30a8f255', '#f2b83055'],
                borderColor: '#0e0d0b',
                borderWidth: 4
              } as any
            ]
          },
          options: {
            cutout: '58%',
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: '#4a4740', boxWidth: 10, padding: 10, font: { size: 10 } }
              },
              tooltip: TT
            }
          }
        })
      );
    }

    const specialEl = ensure(cSpecial);
    if (specialEl) {
      charts.push(
        new Chart(specialEl, {
          type: 'bar',
          data: {
            labels: ['大比分', '零封', '双方进球', '0-0平局'],
            datasets: [
              {
                data: [stats.bigGames, stats.shutouts, stats.btts, stats.scoreDist['0-0'] ?? 0],
                backgroundColor: ['#f25a3055', '#c8f23033', '#30a8f233', '#f2b83033'],
                borderColor: ['#f25a30', '#c8f230', '#30a8f2', '#f2b830'],
                borderWidth: 1,
                borderRadius: 0
              } as any
            ]
          },
          options: {
            responsive: true,
            plugins: { legend: noLeg, tooltip: { ...TT, callbacks: { label: (c: any) => `${c.raw} 场` } } },
            scales: {
              x: { grid: { color: '#1e1c17' }, ticks: { color: '#4a4740', font: { size: 10 } } },
              y: { grid: { color: '#1e1c17' }, ticks: { color: '#4a4740' } }
            }
          }
        })
      );
    }

    // Phase
    const phaseEl = ensure(cPhase);
    if (phaseEl) {
      const group = stats.stage.Group;
      const gs_goals = group.goals / group.matches;
      const ko_matches = stats.n - group.matches;
      const ko_goals = stats.totalGoals - group.goals;
      const ko_shutouts = stats.shutouts - group.shutouts;
      charts.push(
        new Chart(phaseEl, {
          type: 'bar',
          data: {
            labels: ['小组赛', '淘汰赛'],
            datasets: [
              {
                label: '场均进球',
                data: [+(gs_goals).toFixed(2), +(ko_goals / ko_matches).toFixed(2)],
                backgroundColor: '#c8f23033',
                borderColor: '#c8f230',
                borderWidth: 1,
                borderRadius: 0
              } as any,
              {
                label: '零封率%',
                data: [
                  +(group.shutouts / group.matches * 100).toFixed(1),
                  +((ko_shutouts / ko_matches) * 100).toFixed(1)
                ],
                backgroundColor: '#30a8f222',
                borderColor: '#30a8f288',
                borderWidth: 1,
                borderRadius: 0
              } as any
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'bottom', labels: { color: '#4a4740', boxWidth: 8, padding: 8, font: { size: 10 } } },
              tooltip: TT
            },
            scales: gs
          }
        })
      );
    }

    const SK: Array<keyof Stats['stage']> = [...STAGE_ORDER];
    const SN: Record<string, string> = { Group: '小组赛', R32: '三十二强', R16: '十六强', QF: '八强', SF: '半决赛', Final: '决赛' };

    const stageLineEl = ensure(cStageLine);
    if (stageLineEl) {
      charts.push(
        new Chart(stageLineEl, {
          type: 'line',
          data: {
            labels: SK.map((k) => SN[k]),
            datasets: [
              {
                label: '场均进球',
                data: SK.map((k) => +((stats.stage[k].goals / stats.stage[k].matches) || 0).toFixed(2)),
                borderColor: '#c8f230',
                backgroundColor: '#c8f23015',
                tension: 0.3,
                pointRadius: 5,
                pointBackgroundColor: '#c8f230',
                fill: true
              } as any,
              {
                label: '零封率%',
                data: SK.map((k) => +((stats.stage[k].shutouts / stats.stage[k].matches) * 100 || 0).toFixed(1)),
                borderColor: '#30a8f2',
                backgroundColor: 'transparent',
                tension: 0.3,
                pointRadius: 5,
                pointBackgroundColor: '#30a8f2'
              } as any
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'bottom', labels: { color: '#4a4740', boxWidth: 8, padding: 8, font: { size: 10 } } },
              tooltip: TT
            },
            scales: gs
          }
        })
      );
    }

    const stageBarEl = ensure(cStageBar);
    if (stageBarEl) {
      charts.push(
        new Chart(stageBarEl, {
          type: 'bar',
          data: {
            labels: SK.map((k) => SN[k]),
            datasets: [
              {
                label: '大比分场次',
                data: SK.map((k) => stats.stage[k].big),
                backgroundColor: '#f25a3055',
                borderColor: '#f25a30',
                borderWidth: 1,
                borderRadius: 0
              } as any,
              {
                label: '平局场次',
                data: SK.map((k) => stats.stage[k].draws),
                backgroundColor: '#f2b83033',
                borderColor: '#f2b83088',
                borderWidth: 1,
                borderRadius: 0
              } as any
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'bottom', labels: { color: '#4a4740', boxWidth: 8, padding: 8, font: { size: 10 } } },
              tooltip: TT
            },
            scales: gs
          }
        })
      );
    }

    const halvesEl = ensure(cHalves);
    if (halvesEl) {
      charts.push(
        new Chart(halvesEl, {
          type: 'doughnut',
          data: {
            labels: ['上半场 0–45+', '下半场 46–90+'],
            datasets: [
              {
                data: [stats.h1, stats.h2],
                backgroundColor: ['#c8f23055', '#f2b83055'],
                borderColor: '#0e0d0b',
                borderWidth: 4
              } as any
            ]
          },
          options: {
            cutout: '55%',
            responsive: true,
            plugins: { legend: { position: 'bottom', labels: { color: '#4a4740', boxWidth: 10, padding: 10 } }, tooltip: TT }
          }
        })
      );
    }

    const bucketsEl = ensure(cBuckets);
    if (bucketsEl) {
      charts.push(
        new Chart(bucketsEl, {
          type: 'bar',
          data: {
            labels: ['0–15', '16–30', '31–45+', '46–60', '61–75', '76–90+'],
            datasets: [
              {
                data: stats.buckets,
                backgroundColor: stats.buckets.map((_, i) => (i === 5 ? '#f25a3088' : i === 2 ? '#30a8f255' : '#c8f23033')),
                borderColor: stats.buckets.map((_, i) => (i === 5 ? '#f25a30' : i === 2 ? '#30a8f2' : '#c8f23066')),
                borderWidth: 1,
                borderRadius: 0
              } as any
            ]
          },
          options: { responsive: true, plugins: { legend: noLeg, tooltip: { ...TT, callbacks: { label: (c: any) => `${c.raw} 球` } } }, scales: gs }
        })
      );
    }

    const teamArr = Object.entries(stats.teams).sort((a, b) => b[1].gf - a[1].gf);
    const top12gf = teamArr.slice(0, 12);
    const top12ga = [...teamArr].sort((a, b) => a[1].ga - b[1].ga).slice(0, 12);
    const top12gd = [...teamArr].sort((a, b) => b[1].gd - a[1].gd).slice(0, 12);

    const topGfEl = ensure(cTopGF);
    if (topGfEl) {
      charts.push(
        new Chart(topGfEl, {
          type: 'bar',
          data: { labels: top12gf.map((d) => d[0]), datasets: [{ data: top12gf.map((d) => d[1].gf), backgroundColor: '#c8f23033', borderColor: '#c8f23088', borderWidth: 1, borderRadius: 0 } as any] },
          options: { indexAxis: 'y', responsive: true, plugins: { legend: noLeg, tooltip: TT }, scales: { x: { grid: { color: '#1e1c17' }, ticks: { color: '#4a4740' } }, y: { grid: { color: 'transparent' }, ticks: { color: '#9a9488', font: { size: 11 } } } } }
        })
      );
    }

    const topGaEl = ensure(cTopGA);
    if (topGaEl) {
      charts.push(
        new Chart(topGaEl, {
          type: 'bar',
          data: { labels: top12ga.map((d) => d[0]), datasets: [{ data: top12ga.map((d) => d[1].ga), backgroundColor: '#f25a3033', borderColor: '#f25a3088', borderWidth: 1, borderRadius: 0 } as any] },
          options: { indexAxis: 'y', responsive: true, plugins: { legend: noLeg, tooltip: TT }, scales: { x: { grid: { color: '#1e1c17' }, ticks: { color: '#4a4740' } }, y: { grid: { color: 'transparent' }, ticks: { color: '#9a9488', font: { size: 11 } } } } }
        })
      );
    }

    const topGdEl = ensure(cTopGD);
    if (topGdEl) {
      charts.push(
        new Chart(topGdEl, {
          type: 'bar',
          data: {
            labels: top12gd.map((d) => d[0]),
            datasets: [
              {
                data: top12gd.map((d) => d[1].gd),
                backgroundColor: top12gd.map((d) => (d[1].gd >= 0 ? '#c8f23033' : '#f25a3033')),
                borderColor: top12gd.map((d) => (d[1].gd >= 0 ? '#c8f23088' : '#f25a3088')),
                borderWidth: 1,
                borderRadius: 0
              } as any
            ]
          },
          options: { indexAxis: 'y', responsive: true, plugins: { legend: noLeg, tooltip: TT }, scales: { x: { grid: { color: '#1e1c17' }, ticks: { color: '#4a4740' } }, y: { grid: { color: 'transparent' }, ticks: { color: '#9a9488', font: { size: 11 } } } } }
        })
      );
    }

    const scatterEl = ensure(cScatter);
    if (scatterEl) {
      charts.push(
        new Chart(scatterEl, {
          type: 'scatter',
          data: {
            datasets: [
              {
                data: teamArr.map(([name, s]) => ({ x: s.gf, y: s.ga, name, gd: s.gd })) as any,
                backgroundColor: teamArr.map(([_, s]) => {
                  if (s.gf >= 12) return '#c8f230cc';
                  if (s.ga <= 4 && s.gf >= 6) return '#30a8f2cc';
                  if (s.gd <= -4) return '#f25a30cc';
                  return '#4a474066';
                }),
                pointRadius: teamArr.map(([_, s]) => Math.max(5, Math.abs(s.gd) * 1.8 + 5)),
                borderColor: 'transparent'
              } as any
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: noLeg,
              tooltip: {
                ...TT,
                callbacks: {
                  title: (c: any) => c?.[0]?.raw?.name ?? '',
                  label: (c: any) => `进 ${c.raw.x}  失 ${c.raw.y}  净 ${c.raw.gd > 0 ? '+' : ''}${c.raw.gd}`
                }
              }
            },
            scales: {
              x: { title: { display: true, text: '进球数', color: '#4a4740' }, grid: { color: '#1e1c17' }, ticks: { color: '#4a4740' } },
              y: { title: { display: true, text: '失球数', color: '#4a4740' }, grid: { color: '#1e1c17' }, ticks: { color: '#4a4740' } }
            }
          }
        })
      );
    }

    const scorersEl = ensure(cScorers);
    if (scorersEl) {
      charts.push(
        new Chart(scorersEl, {
          type: 'bar',
          data: {
            labels: SCORERS.map((d) => d[0]),
            datasets: [
              {
                data: SCORERS.map((d) => d[2]),
                backgroundColor: '#f2b83033',
                borderColor: '#f2b83088',
                borderWidth: 1,
                borderRadius: 0
              } as any
            ]
          },
          options: { indexAxis: 'y', responsive: true, plugins: { legend: noLeg, tooltip: TT }, scales: { x: { grid: { color: '#1e1c17' }, ticks: { color: '#4a4740' } }, y: { grid: { color: 'transparent' }, ticks: { color: '#9a9488', font: { size: 11 } } } } }
        })
      );
    }

    // Keep this effect idempotent.
    return () => charts.forEach((c) => c.destroy());
  }, [raw, stats]);

  function scrollToSection(id: typeof activeNav) {
    setActiveNav(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const avg = (stats.totalGoals / stats.n).toFixed(2);
  const late = stats.buckets[5];
  const b31 = stats.buckets[2];

  const teamArr = useMemo(() => Object.entries(stats.teams).sort((a, b) => b[1].gf - a[1].gf), [stats.teams]);
  const styleRules = useMemo(
    () => [
      { test: (s: TeamAgg) => s.avg_gf >= 2.0, label: 'ATTACK', cls: 's-atk' },
      { test: (s: TeamAgg) => s.avg_ga <= 0.75, label: 'DEFENSE', cls: 's-def' },
      { test: (s: TeamAgg) => s.gd >= 5, label: 'DOMINANT', cls: 's-dom' },
      { test: (s: TeamAgg) => s.shutouts >= 3, label: 'SHUTOUTS', cls: 's-shut' },
      { test: (s: TeamAgg) => s.avg_gf < 0.7, label: 'LOW-SCORING', cls: 's-con' }
    ],
    []
  );

  return (
    <section className="stats-v4" aria-label="World Cup 2026 simulated stats">
      <header className="stats-subnav">
        <nav className="hdr-nav" aria-label="Stats navigation">
          <button className={`nav-btn ${activeNav === 's-goals' ? 'on' : ''}`} onClick={() => scrollToSection('s-goals')}>进球</button>
          <button className={`nav-btn ${activeNav === 's-stage' ? 'on' : ''}`} onClick={() => scrollToSection('s-stage')}>阶段</button>
          <button className={`nav-btn ${activeNav === 's-time' ? 'on' : ''}`} onClick={() => scrollToSection('s-time')}>时间</button>
          <button className={`nav-btn ${activeNav === 's-teams' ? 'on' : ''}`} onClick={() => scrollToSection('s-teams')}>球队</button>
          <button className={`nav-btn ${activeNav === 's-scorers' ? 'on' : ''}`} onClick={() => scrollToSection('s-scorers')}>射手</button>
          <button className={`nav-btn ${activeNav === 's-matrix' ? 'on' : ''}`} onClick={() => scrollToSection('s-matrix')}>矩阵</button>
        </nav>
        <div className="hdr-meta">
          <span><span className="live-dot" /> 2026 模拟</span>
          <span>{raw.length}场 · {stats.totalGoals}球</span>
        </div>
      </header>

      <div className="page">
        <div className="masthead reveal">
          <div className="masthead-title">
            FIFA World Cup <em>2026</em> 数据模拟
          </div>
        </div>

        <div className="kpi-strip reveal" aria-label="KPI strip">
          <div className="kpi"><div className="kl">比赛场次</div><div className="kv">{raw.length}</div><div className="ks">2026 正赛</div></div>
          <div className="kpi"><div className="kl">球队数量</div><div className="kv">{Object.keys(stats.teams).length}</div><div className="ks">按赛程模拟</div></div>
          <div className="kpi"><div className="kl">总进球</div><div className="kv accent">{stats.totalGoals}</div><div className="ks">全部{raw.length}场</div></div>
          <div className="kpi"><div className="kl">场均进球</div><div className="kv">{avg}</div><div className="ks">2026 模拟值</div></div>
          <div className="kpi"><div className="kl">最常见比分</div><div className="kv">{stats.topScore[0]}</div><div className="ks">出现 {stats.topScore[1]} 次</div></div>
          <div className="kpi"><div className="kl">零封场次</div><div className="kv">{stats.shutouts}</div><div className="ks">占比 {(stats.shutouts / stats.n * 100).toFixed(1)}%</div></div>
          <div className="kpi"><div className="kl">双方进球</div><div className="kv">{stats.btts}</div><div className="ks">占比 {(stats.btts / stats.n * 100).toFixed(1)}%</div></div>
          <div className="kpi"><div className="kl">平局场次</div><div className="kv">{stats.draws}</div><div className="ks">占比 {(stats.draws / stats.n * 100).toFixed(1)}%</div></div>
        </div>

        <div className="sec reveal" id="s-goals">
          <div className="sec-rule">
            <span className="sec-num">01</span>
            <span className="sec-title">比分与进球分布</span>
            <span className="sec-note">{raw.length} matches · computed from raw data</span>
          </div>
          <div className="g2 mb">
            <div className="panel">
              <div className="ptitle">每场进球数分布 <span className="ptag">{raw.length}场</span></div>
              <canvas ref={cGpm} height={200} />
            </div>
            <div className="panel">
              <div className="ptitle">最常见比分 <span className="ptag">TOP 14</span></div>
              <canvas ref={cScoreDist} height={200} />
            </div>
          </div>
          <div className="g3">
            <div className="panel"><div className="ptitle">比赛结果构成</div><canvas ref={cResults} height={190} /></div>
            <div className="panel"><div className="ptitle">关键场次分类</div><canvas ref={cSpecial} height={190} /></div>
            <div className="panel"><div className="ptitle">小组赛 vs 淘汰赛</div><canvas ref={cPhase} height={190} /></div>
          </div>
        </div>

        <div className="sec reveal" id="s-stage">
          <div className="sec-rule">
            <span className="sec-num">02</span>
            <span className="sec-title">各阶段对比</span>
            <span className="sec-note">Group → R32 → R16 → QF → SF → Final</span>
          </div>
          <div className="g2">
            <div className="panel"><div className="ptitle">各阶段场均进球 + 零封率</div><canvas ref={cStageLine} height={210} /></div>
            <div className="panel"><div className="ptitle">各阶段大比分 vs 平局场次</div><canvas ref={cStageBar} height={210} /></div>
          </div>
        </div>

        <div className="sec reveal" id="s-time">
          <div className="sec-rule">
            <span className="sec-num">03</span>
            <span className="sec-title">进球时间维度</span>
            <span className="sec-note">{stats.totalGoals} simulated goal minutes</span>
          </div>
          <div className="g23 mb">
            <div className="panel"><div className="ptitle">上半场 vs 下半场</div><canvas ref={cHalves} height={210} /></div>
            <div className="panel"><div className="ptitle">15分钟区间进球分布</div><canvas ref={cBuckets} height={210} /></div>
          </div>
          <div className="mini4">
            <div className="mc"><div className="mc-v" style={{ color: 'var(--red)' }}>{late}</div><div className="mc-l">76–90+ 进球</div><div className="mc-s">全场最高频区间</div></div>
            <div className="mc"><div className="mc-v" style={{ color: 'var(--blue)' }}>{b31}</div><div className="mc-l">31–45+ 进球</div><div className="mc-s">含伤停补时</div></div>
            <div className="mc"><div className="mc-v" style={{ color: 'var(--lime)' }}>{stats.h1}</div><div className="mc-l">上半场总进球</div><div className="mc-s">{((stats.h1 / stats.totalGoals) * 100).toFixed(1)}%</div></div>
            <div className="mc"><div className="mc-v" style={{ color: 'var(--gold)' }}>{stats.h2}</div><div className="mc-l">下半场总进球</div><div className="mc-s">{((stats.h2 / stats.totalGoals) * 100).toFixed(1)}%</div></div>
          </div>
        </div>

        <div className="sec reveal" id="s-teams">
          <div className="sec-rule">
            <span className="sec-num">04</span>
            <span className="sec-title">球队攻防</span>
            <span className="sec-note">32 teams · all matches</span>
          </div>
          <div className="g32">
            <div className="panel">
              <div className="tabs" role="tablist" aria-label="Teams tabs">
                <button className={`tb ${teamTab === 'all' ? 'on' : ''}`} onClick={() => setTeamTab('all')}>全部数据</button>
                <button className={`tb ${teamTab === 'gf' ? 'on' : ''}`} onClick={() => setTeamTab('gf')}>进球榜</button>
                <button className={`tb ${teamTab === 'ga' ? 'on' : ''}`} onClick={() => setTeamTab('ga')}>防守榜</button>
                <button className={`tb ${teamTab === 'gd' ? 'on' : ''}`} onClick={() => setTeamTab('gd')}>净胜球</button>
              </div>
              <div className={`tp ${teamTab === 'all' ? 'on' : ''}`}>
                <div className="tbl-wrap" style={{ maxHeight: 360, overflowY: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>球队</th>
                        <th className="n">场</th>
                        <th className="n">进</th>
                        <th className="n">失</th>
                        <th className="n">净</th>
                        <th className="n">场均进</th>
                        <th className="n">场均失</th>
                        <th className="n">零封</th>
                        <th className="n">被零封</th>
                      </tr>
                    </thead>
                    <tbody>
                  {teamArr.map(([name, s], idx) => (
                      <tr key={name}>
                        <td className="rk">{String(idx + 1).padStart(2, '0')}</td>
                        <td>{name}</td>
                        <td className="n">{s.mp}</td>
                        <td className="ng">{s.gf}</td>
                        <td className="nr">{s.ga}</td>
                        <td className="nb">{s.gd > 0 ? `+${s.gd}` : s.gd}</td>
                        <td className="n">{s.avg_gf.toFixed(2)}</td>
                        <td className="n">{s.avg_ga.toFixed(2)}</td>
                        <td className="n">{s.shutouts}</td>
                        <td className="n">{s.blanked}</td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className={`tp ${teamTab === 'gf' ? 'on' : ''}`}><canvas ref={cTopGF} height={290} /></div>
              <div className={`tp ${teamTab === 'ga' ? 'on' : ''}`}><canvas ref={cTopGA} height={290} /></div>
              <div className={`tp ${teamTab === 'gd' ? 'on' : ''}`}><canvas ref={cTopGD} height={290} /></div>
            </div>
            <div className="panel"><div className="ptitle">进球 vs 失球散点图（气泡大小=净胜球）</div><canvas ref={cScatter} height={320} /></div>
          </div>
          <div className="panel">
            <div className="ptitle">球队风格标签 <span className="ptag">基于场均进失球 + 零封次数自动计算</span></div>
            <div style={{ marginTop: '.75rem' }}>
              {teamArr.map(([name, s]) => {
                const tags = styleRules.filter((r) => r.test(s));
                if (!tags.length) return null;
                return (
                  <div key={name} className="stag-row">
                    <span className="stag-name">{name}</span>
                    {tags.map((t) => (
                      <span key={t.label} className={`stag ${t.cls}`}>{t.label}</span>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="sec reveal" id="s-scorers">
          <div className="sec-rule">
            <span className="sec-num">05</span>
            <span className="sec-title">射手榜</span>
            <span className="sec-note">Top 12 · simulated tournament leaders</span>
          </div>
          <div className="g2">
            <div className="panel"><div className="ptitle">进球数 Top 12</div><canvas ref={cScorers} height={250} /></div>
            <div className="panel">
              <div className="ptitle">射手榜详情</div>
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>#</th><th>球员</th><th>球队</th><th className="n">进球</th></tr></thead>
                  <tbody>
                    {SCORERS.map(([p, t, g], i) => (
                      <tr key={p}>
                        <td className="rk">{String(i + 1).padStart(2, '0')}</td>
                        <td>{p}</td>
                        <td style={{ color: 'var(--ink3)' }}>{t}</td>
                        <td className="ny">{g}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="sec reveal" id="s-matrix">
          <div className="sec-rule">
            <span className="sec-num">06</span>
            <span className="sec-title">比分热力矩阵</span>
            <span className="sec-note">行=主队得分 · 列=客队得分 · 颜色=出现频次</span>
          </div>
          <div className="panel">
            <div className="ptitle">比分热力矩阵</div>
            <div className="hm-grid">
              <div />
              {['0', '1', '2', '3', '4+'].map((l) => (
                <div key={l} className="hm-head">{l}</div>
              ))}
              {stats.matrix.map((row, ri) => (
                <div key={`row-${ri}`} style={{ display: 'contents' }}>
                  <div className="hm-row-label">{['0', '1', '2', '3', '4+'][ri]}</div>
                  {row.map((v, ci) => (
                    <div
                      key={`cell-${ri}-${ci}`}
                      className="hm-cell"
                      title={`${['0', '1', '2', '3', '4+'][ri]}-${['0', '1', '2', '3', '4+'][ci]}: ${v}次`}
                      style={{
                        background: v ? (v <= 2 ? '#1a2a10' : v <= 5 ? '#2a4a18' : '#4a7a25') : '#161410',
                        fontFamily: "'Barlow Condensed',sans-serif",
                        fontSize: 20,
                        fontWeight: 700,
                        color: v >= 4 ? '#c8f230' : v >= 2 ? '#6a8a40' : '#3a3a28'
                      }}
                    >
                      {v || ''}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1rem', fontFamily: "'DM Mono',monospace", fontSize: 10, color: 'var(--ink3)' }}>
              4+ 表示4球及以上 · 颜色越深频次越高 · 悬停查看详情
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
