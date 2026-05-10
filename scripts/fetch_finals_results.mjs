import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const defaultOutputFile = path.join(rootDir, 'data', 'finals-results.local.json');
const defaultReportFile = path.join(rootDir, 'data', 'finals-results-fetch-report.json');
const defaultCoverageFile = path.join(rootDir, 'data', 'finals-results-coverage-report.json');
const defaultMissingDataFile = path.join(rootDir, 'data', 'finals-results-missing-data-report.json');
const defaultCoverageTsFile = path.join(rootDir, 'src', 'data', 'finalsDataCoverage.ts');
const defaultSourceUrl = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';
const defaultFootballDataUrl = 'https://api.football-data.org/v4/competitions/WC/matches?season=2026';
const defaultTotalMatches = 104;

export function formatDateForTimezone(date, timeZone = 'Asia/Shanghai') {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const partMap = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${partMap.year}-${partMap.month}-${partMap.day}`;
}

function todayIsoDate() {
  return formatDateForTimezone(new Date(), process.env.TZ || 'Asia/Shanghai');
}

function readArgValue(args, name) {
  const prefix = `${name}=`;
  const inline = args.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);

  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function teamName(value) {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    return value.name || value.key || value.code || value.title || '';
  }
  return '';
}

function scorePair(match) {
  if (Array.isArray(match?.score?.ft) && match.score.ft.length >= 2) {
    return match.score.ft;
  }

  if (Array.isArray(match?.score?.fulltime) && match.score.fulltime.length >= 2) {
    return match.score.fulltime;
  }

  if (typeof match?.score1 === 'number' && typeof match?.score2 === 'number') {
    return [match.score1, match.score2];
  }

  if (typeof match?.homeScore === 'number' && typeof match?.awayScore === 'number') {
    return [match.homeScore, match.awayScore];
  }

  return undefined;
}

function footballDataScorePair(match) {
  const fullTime = match?.score?.fullTime;
  const homeScore = fullTime?.home;
  const awayScore = fullTime?.away;

  if (Number.isFinite(homeScore) && Number.isFinite(awayScore)) {
    return [homeScore, awayScore];
  }

  return undefined;
}

function teamPairKey(homeTeam, awayTeam) {
  return `${homeTeam}::${awayTeam}`;
}

function lookupMatchIdByTeamPair(matchIdByTeamPair, homeTeam, awayTeam) {
  if (!matchIdByTeamPair) return undefined;

  return (
    matchIdByTeamPair[teamPairKey(homeTeam, awayTeam)] ??
    matchIdByTeamPair[teamPairKey(awayTeam, homeTeam)]
  );
}

function addTeamPairMatch(map, homeTeam, awayTeam, id) {
  map[teamPairKey(homeTeam, awayTeam)] = id;
  map[teamPairKey(awayTeam, homeTeam)] = id;
}

function parseGroupsSource(source) {
  const groups = [];
  const groupPattern = /id: '([^']+)'[\s\S]*?teams: standingsShell\((\[[^\n]+\])\)/g;
  let match;

  while ((match = groupPattern.exec(source))) {
    groups.push({
      id: match[1],
      teams: Function(`return ${match[2]};`)()
    });
  }

  return groups;
}

function parseFixtureSource(source) {
  const fixtures = [];
  const fixturePattern = /\{ id: '([^']+)', groupId: '([^']+)'[\s\S]*?homeTeam: (['"])(.*?)\3, awayTeam: (['"])(.*?)\5,/g;
  let match;

  while ((match = fixturePattern.exec(source))) {
    fixtures.push({
      id: match[1],
      groupId: match[2],
      homeTeam: match[4],
      awayTeam: match[6]
    });
  }

  return fixtures;
}

export async function buildDefaultMatchIdByTeamPair() {
  const groupsSource = await fs.readFile(path.join(rootDir, 'src', 'data', 'groups.ts'), 'utf8');
  const fixturesSource = await fs.readFile(path.join(rootDir, 'src', 'data', 'groupFixtures.ts'), 'utf8');
  const groups = parseGroupsSource(groupsSource);
  const fixtures = parseFixtureSource(fixturesSource);
  const map = {};
  const existingPairKeys = new Set();
  const pairingPlan = [
    [[0, 3], [2, 1]],
    [[0, 2], [1, 3]],
    [[0, 1], [3, 2]]
  ];

  fixtures.forEach((fixture) => {
    addTeamPairMatch(map, fixture.homeTeam, fixture.awayTeam, fixture.id);
    existingPairKeys.add(`${fixture.groupId}:${teamPairKey(...[fixture.homeTeam, fixture.awayTeam].sort())}`);
  });

  groups.forEach((group) => {
    pairingPlan.forEach((pairings, matchdayIndex) => {
      pairings.forEach(([homeIndex, awayIndex], pairIndex) => {
        const homeTeam = group.teams[homeIndex];
        const awayTeam = group.teams[awayIndex];
        const pairKey = `${group.id}:${teamPairKey(...[homeTeam, awayTeam].sort())}`;

        if (existingPairKeys.has(pairKey)) return;

        const matchNumber = matchdayIndex * 2 + pairIndex + 1;
        addTeamPairMatch(map, homeTeam, awayTeam, `${group.id}-${matchNumber}`);
      });
    });
  });

  return map;
}

function normalizeMinute(goal) {
  const minute = goal?.minute ?? goal?.min ?? goal?.time;
  const offset = goal?.offset ?? goal?.stoppage;

  if (typeof minute === 'number' && typeof offset === 'number' && offset > 0) {
    return `${minute}+${offset}`;
  }

  if (typeof minute === 'number' || typeof minute === 'string') {
    return String(minute);
  }

  return '';
}

function normalizeGoal(goal, team) {
  const player = goal?.name || goal?.player || goal?.scorer;
  const minute = normalizeMinute(goal);

  if (!player || !minute || !team) return undefined;

  return {
    minute,
    team,
    player
  };
}

function normalizeGoals(match, homeTeam, awayTeam) {
  const homeGoals = Array.isArray(match.goals1)
    ? match.goals1.map((goal) => normalizeGoal(goal, homeTeam)).filter(Boolean)
    : [];
  const awayGoals = Array.isArray(match.goals2)
    ? match.goals2.map((goal) => normalizeGoal(goal, awayTeam)).filter(Boolean)
    : [];

  return [...homeGoals, ...awayGoals];
}

function flattenOpenFootballMatches(payload) {
  if (!payload || typeof payload !== 'object') return [];

  if (Array.isArray(payload.matches)) return payload.matches;

  if (Array.isArray(payload.rounds)) {
    return payload.rounds.flatMap((round) => (Array.isArray(round.matches) ? round.matches : []));
  }

  return [];
}

export function transformOpenFootballPayload(payload, options = {}) {
  const updatedAt = options.updatedAt || todayIsoDate();
  const sourceMatches = flattenOpenFootballMatches(payload);
  const matches = [];
  const skipped = [];

  sourceMatches.forEach((match, index) => {
    const homeTeam = teamName(match?.team1 ?? match?.homeTeam ?? match?.home);
    const awayTeam = teamName(match?.team2 ?? match?.awayTeam ?? match?.away);
    const id =
      lookupMatchIdByTeamPair(options.matchIdByTeamPair, homeTeam, awayTeam) ??
      match?.num ??
      match?.id ??
      match?.matchday;
    const scores = scorePair(match);

    if (!id || !homeTeam || !awayTeam || !scores) {
      skipped.push({ index, reason: 'missing id, teams, or final score' });
      return;
    }

    const [homeScore, awayScore] = scores;
    if (!Number.isFinite(homeScore) || !Number.isFinite(awayScore)) {
      skipped.push({ index, reason: 'final score is not numeric' });
      return;
    }

    matches.push({
      id: String(id),
      status: 'completed',
      homeScore,
      awayScore,
      goals: normalizeGoals(match, homeTeam, awayTeam)
    });
  });

  return {
    sourceLabel: 'openfootball worldcup.json',
    updatedAt,
    matches,
    report: {
      sourceMatches: sourceMatches.length,
      importedMatches: matches.length,
      skippedMatches: skipped.length,
      skipped
    }
  };
}

export function transformFootballDataPayload(payload, options = {}) {
  const updatedAt = options.updatedAt || todayIsoDate();
  const sourceMatches = Array.isArray(payload?.matches) ? payload.matches : [];
  const matches = [];
  const skipped = [];

  sourceMatches.forEach((match, index) => {
    const homeTeam = teamName(match?.homeTeam);
    const awayTeam = teamName(match?.awayTeam);
    const id =
      options.matchIdByFootballDataId?.[String(match?.id)] ??
      match?.matchNumber ??
      lookupMatchIdByTeamPair(options.matchIdByTeamPair, homeTeam, awayTeam);
    const scores = footballDataScorePair(match);

    if (match?.status !== 'FINISHED') {
      skipped.push({ index, reason: 'match is not finished' });
      return;
    }

    if (!id || !homeTeam || !awayTeam || !scores) {
      skipped.push({ index, reason: 'missing local match id, teams, or final score' });
      return;
    }

    matches.push({
      id: String(id),
      status: 'completed',
      homeScore: scores[0],
      awayScore: scores[1],
      goals: []
    });
  });

  return {
    sourceLabel: 'football-data.org',
    updatedAt,
    matches,
    report: {
      sourceMatches: sourceMatches.length,
      importedMatches: matches.length,
      skippedMatches: skipped.length,
      skipped
    }
  };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'worldcup-2026-site-fetcher',
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(`Fetch failed with HTTP ${response.status} for ${url}`);
  }

  return response.json();
}

async function readJsonIfProvided(filePath) {
  if (!filePath) return undefined;

  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

function stripReport(payload) {
  const { report: _report, ...importPayload } = payload;
  return importPayload;
}

function quoteTsString(value) {
  return JSON.stringify(value);
}

export function buildCoverageSource(merged) {
  return `import type { FinalsDataCoverageData } from '../types/tournament';

export const finalsDataCoverage: FinalsDataCoverageData = {
  updatedAt: ${quoteTsString(merged.importPayload.updatedAt)},
  sourceLabel: ${quoteTsString(merged.importPayload.sourceLabel)},
  scoreCoveragePct: ${merged.coverageReport.scoreCoveragePct},
  goalEventCoveragePct: ${merged.coverageReport.goalEventCoveragePct},
  issueCount: ${merged.coverageReport.issueCount}
};
`;
}

function scoreKey(match) {
  return `${match.homeScore}-${match.awayScore}`;
}

function latestDate(values) {
  return values.filter(Boolean).sort().at(-1) || todayIsoDate();
}

function sourceLabel(values) {
  return [...new Set(values.filter(Boolean))].join(' + ') || 'Free finals result sources';
}

function isCompletedImportMatch(match) {
  return match?.status === 'completed' && Number.isFinite(match.homeScore) && Number.isFinite(match.awayScore);
}

function buildQualityReports(matches, issues, totalMatches) {
  const completedMatches = matches.filter(isCompletedImportMatch);
  const matchesWithGoalEvents = completedMatches.filter((match) => match.goals.length > 0);
  const missingItems = [...issues];

  completedMatches.forEach((match) => {
    const expectedGoalCount = match.homeScore + match.awayScore;

    if (expectedGoalCount > 0 && match.goals.length === 0) {
      missingItems.push({
        matchId: match.id,
        type: 'goals_missing',
        severity: 'warning',
        message: 'Score is available but goal events are missing.'
      });
    } else if (match.goals.length !== expectedGoalCount) {
      missingItems.push({
        matchId: match.id,
        type: 'goal_count_mismatch',
        severity: 'review',
        message: `Score implies ${expectedGoalCount} goals but ${match.goals.length} goal event(s) were imported.`
      });
    }
  });

  return {
    coverageReport: {
      totalMatches,
      completedMatches: completedMatches.length,
      scoreCoveragePct: Math.round((completedMatches.length / totalMatches) * 100),
      matchesWithGoalEvents: matchesWithGoalEvents.length,
      goalEventCoveragePct: completedMatches.length
        ? Math.round((matchesWithGoalEvents.length / completedMatches.length) * 100)
        : 0,
      issueCount: missingItems.length
    },
    missingDataReport: {
      generatedAt: new Date().toISOString(),
      items: missingItems
    }
  };
}

export function mergeSourcePayloads(payloads, options = {}) {
  const totalMatches = options.totalMatches || defaultTotalMatches;
  const byId = new Map();
  const issues = [];

  payloads.forEach((payload) => {
    if (!payload || !Array.isArray(payload.matches)) return;

    payload.matches.forEach((match) => {
      if (!isCompletedImportMatch(match)) return;

      const existing = byId.get(match.id);
      if (!existing) {
        byId.set(match.id, { ...match, goals: Array.isArray(match.goals) ? match.goals : [] });
        return;
      }

      if (scoreKey(existing) !== scoreKey(match)) {
        issues.push({
          matchId: match.id,
          type: 'score_conflict',
          severity: 'review',
          message: `${payload.sourceLabel} reports ${scoreKey(match)} but higher-priority source reports ${scoreKey(existing)}.`
        });
      }

      if (!existing.goals.length && Array.isArray(match.goals) && match.goals.length) {
        byId.set(match.id, {
          ...existing,
          goals: match.goals
        });
      }
    });
  });

  const matches = [...byId.values()].sort((a, b) => Number(a.id) - Number(b.id));
  const { coverageReport, missingDataReport } = buildQualityReports(matches, issues, totalMatches);

  return {
    importPayload: {
      sourceLabel: sourceLabel(payloads.map((payload) => payload?.sourceLabel)),
      updatedAt: latestDate(payloads.map((payload) => payload?.updatedAt)),
      matches
    },
    coverageReport,
    missingDataReport
  };
}

function runImportScript() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/import_finals_results.mjs'], {
      cwd: rootDir,
      stdio: 'inherit'
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`import_finals_results.mjs exited with code ${code}`));
      }
    });
  });
}

export async function fetchFinalsResults(options = {}) {
  const sourceUrl = options.sourceUrl || defaultSourceUrl;
  const footballDataUrl = options.footballDataSourceUrl || process.env.FOOTBALL_DATA_URL || defaultFootballDataUrl;
  const footballDataToken = options.footballDataToken || process.env.FOOTBALL_DATA_API_KEY;
  const outputFile = options.outputFile || defaultOutputFile;
  const reportFile = options.reportFile || defaultReportFile;
  const coverageFile = options.coverageFile || defaultCoverageFile;
  const missingDataFile = options.missingDataFile || defaultMissingDataFile;
  const coverageTsFile = options.coverageTsFile || defaultCoverageTsFile;
  const defaultMatchIdByTeamPair = await buildDefaultMatchIdByTeamPair();
  const providedMatchIdByTeamPair = options.matchIdByTeamPair ?? (await readJsonIfProvided(options.matchMapFile));
  const matchIdByTeamPair = {
    ...defaultMatchIdByTeamPair,
    ...(providedMatchIdByTeamPair ?? {})
  };
  const sourcePayloads = [];
  const sourceReports = [];

  try {
    const openFootballPayload = transformOpenFootballPayload(await fetchJson(sourceUrl), {
      updatedAt: options.updatedAt,
      matchIdByTeamPair
    });
    sourcePayloads.push(openFootballPayload);
    sourceReports.push({
      sourceLabel: openFootballPayload.sourceLabel,
      status: 'ok',
      ...openFootballPayload.report
    });
  } catch (error) {
    sourceReports.push({
      sourceLabel: 'openfootball worldcup.json',
      status: 'failed',
      error: error.message
    });
  }

  if (footballDataToken || options.footballDataSourceUrl) {
    try {
      const footballDataPayload = transformFootballDataPayload(
        await fetchJson(footballDataUrl, {
          headers: footballDataToken ? { 'X-Auth-Token': footballDataToken } : {}
        }),
        {
          updatedAt: options.updatedAt,
          matchIdByTeamPair
        }
      );
      sourcePayloads.push(footballDataPayload);
      sourceReports.push({
        sourceLabel: footballDataPayload.sourceLabel,
        status: 'ok',
        ...footballDataPayload.report
      });
    } catch (error) {
      sourceReports.push({
        sourceLabel: 'football-data.org',
        status: 'failed',
        error: error.message
      });
    }
  } else {
    sourceReports.push({
      sourceLabel: 'football-data.org',
      status: 'skipped',
      reason: 'FOOTBALL_DATA_API_KEY is not configured.'
    });
  }

  if (!sourcePayloads.length) {
    throw new Error('All finals result sources failed.');
  }

  const merged = mergeSourcePayloads(sourcePayloads, {
    totalMatches: options.totalMatches || defaultTotalMatches
  });
  const report = {
    sourceUrl,
    footballDataUrl: footballDataToken || options.footballDataSourceUrl ? footballDataUrl : undefined,
    fetchedAt: new Date().toISOString(),
    sources: sourceReports,
    coverage: merged.coverageReport,
    missingData: {
      issueCount: merged.missingDataReport.items.length
    }
  };

  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(reportFile, `${JSON.stringify(report, null, 2)}\n`);
  await fs.writeFile(coverageFile, `${JSON.stringify(merged.coverageReport, null, 2)}\n`);
  await fs.writeFile(missingDataFile, `${JSON.stringify(merged.missingDataReport, null, 2)}\n`);

  if (!merged.importPayload.matches.length && !options.allowEmpty) {
    throw new Error(`No completed finals results were imported. Report written to ${path.relative(rootDir, reportFile)}.`);
  }

  await fs.writeFile(outputFile, `${JSON.stringify(stripReport(merged.importPayload), null, 2)}\n`);
  await fs.writeFile(coverageTsFile, buildCoverageSource(merged));

  if (options.importResults !== false) {
    await runImportScript();
  }

  return {
    outputFile,
    reportFile,
    coverageFile,
    missingDataFile,
    coverageTsFile,
    report
  };
}

async function main() {
  const args = process.argv.slice(2);
  const sourceUrl = readArgValue(args, '--source') || process.env.FINALS_RESULTS_URL || defaultSourceUrl;
  const footballDataSourceUrl = readArgValue(args, '--football-data-source') || process.env.FOOTBALL_DATA_URL;
  const footballDataToken = readArgValue(args, '--football-data-token') || process.env.FOOTBALL_DATA_API_KEY;
  const matchMapFile = readArgValue(args, '--match-map')
    ? path.resolve(rootDir, readArgValue(args, '--match-map'))
    : undefined;
  const outputFile = readArgValue(args, '--output')
    ? path.resolve(rootDir, readArgValue(args, '--output'))
    : defaultOutputFile;
  const reportFile = readArgValue(args, '--report')
    ? path.resolve(rootDir, readArgValue(args, '--report'))
    : defaultReportFile;
  const coverageFile = readArgValue(args, '--coverage')
    ? path.resolve(rootDir, readArgValue(args, '--coverage'))
    : defaultCoverageFile;
  const missingDataFile = readArgValue(args, '--missing-data')
    ? path.resolve(rootDir, readArgValue(args, '--missing-data'))
    : defaultMissingDataFile;
  const coverageTsFile = readArgValue(args, '--coverage-ts')
    ? path.resolve(rootDir, readArgValue(args, '--coverage-ts'))
    : defaultCoverageTsFile;

  const result = await fetchFinalsResults({
    sourceUrl,
    footballDataSourceUrl,
    footballDataToken,
    matchMapFile,
    outputFile,
    reportFile,
    coverageFile,
    missingDataFile,
    coverageTsFile,
    allowEmpty: args.includes('--allow-empty'),
    importResults: !args.includes('--no-import')
  });

  console.log(`Fetched finals results into ${path.relative(rootDir, result.outputFile)}`);
  console.log(`Fetch report written to ${path.relative(rootDir, result.reportFile)}`);
  console.log(`Coverage report written to ${path.relative(rootDir, result.coverageFile)}`);
  console.log(`Missing-data report written to ${path.relative(rootDir, result.missingDataFile)}`);
  console.log(`Stats coverage module written to ${path.relative(rootDir, result.coverageTsFile)}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
