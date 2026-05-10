import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cacheDir = path.join(rootDir, 'data', 'api-football-cache');
const outputFile = path.join(rootDir, 'src', 'data', 'apiFootballQualifierMatches.ts');

const API_BASE_URL = 'https://v3.football.api-sports.io';
const FINISHED_STATUSES = new Set(['FT', 'AET', 'PEN']);

const SOURCES = [
  { confederationId: 'afc', confederationName: '亚足联', leagueId: 30, season: 2026 },
  { confederationId: 'concacaf', confederationName: '中北美及加勒比地区足联', leagueId: 31, season: 2026 },
  { confederationId: 'uefa', confederationName: '欧足联', leagueId: 32, season: 2024 },
  { confederationId: 'ofc', confederationName: '大洋洲足联', leagueId: 33, season: 2026 },
  { confederationId: 'conmebol', confederationName: '南美足联', leagueId: 34, season: 2026 },
  { confederationId: 'caf', confederationName: '非足联', leagueId: 29, season: 2023 },
  { confederationId: 'intercontinental', confederationName: '洲际附加赛', leagueId: 37, season: 2026 }
];

const EVENT_TYPE_MAP = new Map([
  ['Goal:Normal Goal', 'goal'],
  ['Goal:Own Goal', 'goal'],
  ['Goal:Penalty', 'goal'],
  ['Card:Yellow Card', 'yellow-card'],
  ['Card:Red Card', 'red-card'],
  ['Card:Second Yellow card', 'red-card'],
  ['subst:Substitution 1', 'substitution'],
  ['subst:Substitution 2', 'substitution'],
  ['subst:Substitution 3', 'substitution'],
  ['subst:Substitution 4', 'substitution'],
  ['subst:Substitution 5', 'substitution'],
  ['subst:Substitution 6', 'substitution']
]);

const STAT_LABELS = new Map([
  ['Ball Possession', '控球率'],
  ['Total Shots', '射门'],
  ['Shots on Goal', '射正'],
  ['Corner Kicks', '角球'],
  ['Yellow Cards', '黄牌'],
  ['Red Cards', '红牌'],
  ['Fouls', '犯规'],
  ['Offsides', '越位'],
  ['Goalkeeper Saves', '门将扑救'],
  ['Total passes', '传球'],
  ['Passes accurate', '成功传球'],
  ['Passes %', '传球成功率']
]);

function parseArgs() {
  const args = new Map();

  for (const item of process.argv.slice(2)) {
    const [key, value = 'true'] = item.replace(/^--/, '').split('=');
    args.set(key, value);
  }

  return {
    detailLimit: Number(args.get('detail-limit') ?? 20),
    force: args.has('force'),
    fixturesOnly: args.has('fixtures-only')
  };
}

async function readEnvKey() {
  const envPath = path.join(rootDir, '.env.local');
  const envText = existsSync(envPath) ? await readFile(envPath, 'utf8') : '';
  const fromFile = envText.match(/^API_FOOTBALL_KEY=(.+)$/m)?.[1]?.trim();
  const key = process.env.API_FOOTBALL_KEY ?? fromFile;

  if (!key) {
    throw new Error('Missing API_FOOTBALL_KEY. Add it to .env.local or the process environment.');
  }

  return key;
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function fetchJson(key, endpoint, cacheName, force = false) {
  await mkdir(cacheDir, { recursive: true });

  const cachePath = path.join(cacheDir, cacheName);
  if (!force && existsSync(cachePath)) {
    return {
      json: await readJson(cachePath),
      fromCache: true
    };
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'x-apisports-key': key
    }
  });

  if (!response.ok) {
    const error = new Error(`API-Football request failed: ${response.status} ${response.statusText}`);
    error.status = response.status;
    throw error;
  }

  const json = await response.json();
  await writeFile(cachePath, JSON.stringify(json, null, 2));
  return {
    json,
    fromCache: false
  };
}

function toDateLabel(dateValue) {
  return String(dateValue).slice(0, 10);
}

function formatMinute(time) {
  if (!time) {
    return '';
  }

  return time.extra ? `${time.elapsed}+${time.extra}` : String(time.elapsed);
}

function normalizeEvent(event) {
  const key = `${event.type}:${event.detail}`;
  const type = EVENT_TYPE_MAP.get(key) ?? (event.type === 'subst' ? 'substitution' : undefined);

  if (!type || !event.player?.name) {
    return null;
  }

  const assist = event.assist?.name ? `助攻/相关球员: ${event.assist.name}` : undefined;
  const comments = event.comments ? `说明: ${event.comments}` : undefined;

  return {
    minute: formatMinute(event.time),
    team: event.team.name,
    type,
    player: event.player.name,
    detail: [event.detail, assist, comments].filter(Boolean).join(' · ')
  };
}

function normalizeLineup(lineup) {
  const normalizePlayer = ({ player }) => ({
    number: Number(player.number ?? 0),
    name: player.name,
    position: player.pos ?? ''
  });

  return {
    team: lineup.team.name,
    formation: lineup.formation ?? undefined,
    starters: lineup.startXI.map(normalizePlayer),
    substitutes: lineup.substitutes.map(normalizePlayer)
  };
}

function normalizeStats(statistics) {
  if (statistics.length < 2) {
    return undefined;
  }

  const [home, away] = statistics;
  const awayByType = new Map(away.statistics.map((item) => [item.type, item.value]));

  return home.statistics
    .filter((item) => STAT_LABELS.has(item.type))
    .map((item) => ({
      label: STAT_LABELS.get(item.type),
      home: item.value == null ? '-' : String(item.value),
      away: awayByType.get(item.type) == null ? '-' : String(awayByType.get(item.type))
    }));
}

function calculateMissingData({ events, lineups, stats }) {
  const missing = [];
  const hasSubstitution = events.some((event) => event.type === 'substitution');
  const hasCard = events.some((event) => event.type === 'yellow-card' || event.type === 'red-card');

  if (lineups.length < 2) {
    missing.push('阵容');
  }

  if (!stats?.length) {
    missing.push('比赛统计');
  }

  if (!hasSubstitution) {
    missing.push('换人');
  }

  if (!hasCard) {
    missing.push('红黄牌');
  }

  missing.push('球员赛后评分');
  return missing;
}

function normalizeFixture(source, fixture, detail) {
  const events = detail.events.response.map(normalizeEvent).filter(Boolean);
  const lineups = detail.lineups.response.map(normalizeLineup);
  const stats = normalizeStats(detail.statistics.response);

  return {
    id: `api-football-${fixture.fixture.id}`,
    confederationId: source.confederationId === 'intercontinental' ? 'concacaf' : source.confederationId,
    confederationName: source.confederationName,
    stage: fixture.league.round,
    dateLabel: toDateLabel(fixture.fixture.date),
    venue: fixture.fixture.venue?.name ?? undefined,
    homeTeam: fixture.teams.home.name,
    awayTeam: fixture.teams.away.name,
    homeScore: Number(fixture.goals.home ?? 0),
    awayScore: Number(fixture.goals.away ?? 0),
    sourceLabel: `API-Football league ${source.leagueId}, season ${source.season}, fixture ${fixture.fixture.id}`,
    stats,
    events: events.length ? events : undefined,
    lineups: lineups.length ? lineups : undefined,
    playerRatings: undefined,
    missingData: calculateMissingData({ events, lineups, stats })
  };
}

function normalizeFixtureWithoutDetail(source, fixture) {
  return {
    id: `api-football-${fixture.fixture.id}`,
    confederationId: source.confederationId === 'intercontinental' ? 'concacaf' : source.confederationId,
    confederationName: source.confederationName,
    stage: fixture.league.round,
    dateLabel: toDateLabel(fixture.fixture.date),
    venue: fixture.fixture.venue?.name ?? undefined,
    homeTeam: fixture.teams.home.name,
    awayTeam: fixture.teams.away.name,
    homeScore: Number(fixture.goals.home ?? 0),
    awayScore: Number(fixture.goals.away ?? 0),
    sourceLabel: `API-Football league ${source.leagueId}, season ${source.season}, fixture ${fixture.fixture.id}`,
    missingData: ['阵容', '比赛统计', '换人', '红黄牌', '球员赛后评分']
  };
}

function uniqueMatches(matches) {
  const seen = new Set();

  return matches.filter((match) => {
    const key = [
      match.confederationId,
      match.dateLabel,
      match.homeTeam.toLowerCase(),
      match.awayTeam.toLowerCase()
    ].join('|');

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function formatTs(matches, reports) {
  return `import type { QualifierMatchData } from '../types/tournament';

export const apiFootballQualifierMatches: QualifierMatchData[] = ${JSON.stringify(matches, null, 2)};

export const apiFootballQualifierSourceReports: Array<{
  confederationId: QualifierMatchData['confederationId'] | 'intercontinental';
  leagueId: number;
  season: number;
  importedMatches: number;
  errors: string[];
}> = ${JSON.stringify(reports, null, 2)};
`;
}

async function main() {
  const options = parseArgs();
  const key = await readEnvKey();
  const imported = [];
  const reports = [];
  let detailRequests = 0;
  let detailStopReason = '';

  for (const source of SOURCES) {
    const { json: fixturesJson } = await fetchJson(
      key,
      `/fixtures?league=${source.leagueId}&season=${source.season}`,
      `fixtures-${source.leagueId}-${source.season}.json`,
      options.force
    );
    const errors = Object.values(fixturesJson.errors ?? {}).filter(Boolean).map(String);
    const fixtures = (fixturesJson.response ?? []).filter((fixture) =>
      FINISHED_STATUSES.has(fixture.fixture.status.short)
    );

    for (const fixture of fixtures) {
      if (options.fixturesOnly || detailStopReason || detailRequests >= options.detailLimit) {
        imported.push(normalizeFixtureWithoutDetail(source, fixture));
        continue;
      }

      const fixtureId = fixture.fixture.id;
      let eventsResponse;
      let lineupsResponse;
      let statisticsResponse;

      try {
        eventsResponse = await fetchJson(
          key,
          `/fixtures/events?fixture=${fixtureId}`,
          `events-${fixtureId}.json`,
          options.force
        );
        lineupsResponse = await fetchJson(
          key,
          `/fixtures/lineups?fixture=${fixtureId}`,
          `lineups-${fixtureId}.json`,
          options.force
        );
        statisticsResponse = await fetchJson(
          key,
          `/fixtures/statistics?fixture=${fixtureId}`,
          `statistics-${fixtureId}.json`,
          options.force
        );
      } catch (error) {
        if (error.status === 429) {
          detailStopReason = 'API-Football rate limit reached while fetching match details.';
          imported.push(normalizeFixtureWithoutDetail(source, fixture));
          continue;
        }

        throw error;
      }

      const detail = {
        events: eventsResponse.json,
        lineups: lineupsResponse.json,
        statistics: statisticsResponse.json
      };
      detailRequests += [eventsResponse, lineupsResponse, statisticsResponse].filter((item) => !item.fromCache).length;
      imported.push(normalizeFixture(source, fixture, detail));
    }

    reports.push({
      confederationId: source.confederationId,
      leagueId: source.leagueId,
      season: source.season,
      importedMatches: fixtures.length,
      errors
    });
  }

  const matches = uniqueMatches(imported).sort((a, b) => a.dateLabel.localeCompare(b.dateLabel));
  await writeFile(outputFile, formatTs(matches, reports));

  console.log(
    JSON.stringify(
      {
        outputFile,
        importedMatches: matches.length,
        detailRequests,
        detailStopReason,
        reports
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
