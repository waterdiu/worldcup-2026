import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outputFile = path.join(rootDir, 'src', 'data', 'finalsMatchResults.ts');
const defaultInputFile = path.join(rootDir, 'data', 'finals-results.local.json');
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const inputArg = args.find((arg) => !arg.startsWith('--'));
const inputFile = inputArg ? path.resolve(rootDir, inputArg) : defaultInputFile;

function assertNumber(value, label) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number.`);
  }
}

function normalizeImportPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Import payload must be a JSON object.');
  }

  if (typeof payload.sourceLabel !== 'string' || payload.sourceLabel.trim().length === 0) {
    throw new Error('sourceLabel is required.');
  }

  if (typeof payload.updatedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(payload.updatedAt)) {
    throw new Error('updatedAt must use YYYY-MM-DD.');
  }

  if (!Array.isArray(payload.matches)) {
    throw new Error('matches must be an array.');
  }

  return payload.matches.map((match, index) => {
    if (!match || typeof match !== 'object') {
      throw new Error(`matches[${index}] must be an object.`);
    }

    if (typeof match.id !== 'string' || match.id.trim().length === 0) {
      throw new Error(`matches[${index}].id is required.`);
    }

    if (match.status !== 'scheduled' && match.status !== 'completed') {
      throw new Error(`matches[${index}].status must be scheduled or completed.`);
    }

    if (match.status === 'completed') {
      assertNumber(match.homeScore, `matches[${index}].homeScore`);
      assertNumber(match.awayScore, `matches[${index}].awayScore`);
    }

    if (!Array.isArray(match.goals)) {
      throw new Error(`matches[${index}].goals must be an array.`);
    }

    match.goals.forEach((goal, goalIndex) => {
      ['minute', 'team', 'player'].forEach((field) => {
        if (typeof goal[field] !== 'string' || goal[field].trim().length === 0) {
          throw new Error(`matches[${index}].goals[${goalIndex}].${field} is required.`);
        }
      });
    });

    return match;
  });
}

function jsLiteral(value) {
  return JSON.stringify(value, null, 2)
    .replace(/"([^"]+)":/g, '$1:');
}

function buildSource(importPayload) {
  const overrides = normalizeImportPayload(importPayload);
  const overrideLiteral = jsLiteral(overrides);
  const sourceLabelLiteral = JSON.stringify(importPayload.sourceLabel);
  const updatedAtLiteral = JSON.stringify(importPayload.updatedAt);

  return `import { bracket } from './bracket';
import { groupStageMatches } from './groupStageMatches';
import type { FinalsMatchResultData } from '../types/tournament';

const scaffoldSource = 'Generated schedule scaffold';
const scaffoldUpdatedAt = '2026-05-10';
const importedSource = ${sourceLabelLiteral};
const importedUpdatedAt = ${updatedAtLiteral};
const importedResults: Array<{
  id: string;
  status: 'scheduled' | 'completed';
  homeScore?: number;
  awayScore?: number;
  wentToExtraTime?: boolean;
  wentToPenalties?: boolean;
  homePenaltyScore?: number;
  awayPenaltyScore?: number;
  goals: FinalsMatchResultData['goals'];
}> = ${overrideLiteral};

function applyImport(match: FinalsMatchResultData): FinalsMatchResultData {
  const imported = importedResults.find((item) => item.id === match.id);
  if (!imported) return match;

  return {
    ...match,
    status: imported.status,
    homeScore: imported.homeScore,
    awayScore: imported.awayScore,
    wentToExtraTime: imported.wentToExtraTime,
    wentToPenalties: imported.wentToPenalties,
    homePenaltyScore: imported.homePenaltyScore,
    awayPenaltyScore: imported.awayPenaltyScore,
    goals: imported.goals,
    sourceLabel: importedSource,
    updatedAt: importedUpdatedAt
  };
}

const scaffold: FinalsMatchResultData[] = [
  ...groupStageMatches.map((match) => ({
    id: match.id,
    stageType: 'group' as const,
    stageLabel: match.roundLabel,
    groupId: match.groupId,
    dateLabel: match.dateLabel,
    venue: match.venue,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    status: 'scheduled' as const,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    goals: [],
    sourceLabel: scaffoldSource,
    updatedAt: scaffoldUpdatedAt
  })),
  ...bracket.flatMap((round) =>
    round.matches.map((match) => ({
      id: match.id,
      stageType: 'knockout' as const,
      stageLabel: round.round,
      dateLabel: match.dateLabel,
      venue: match.venue,
      homeTeam: match.homeLabel,
      awayTeam: match.awayLabel,
      status: 'scheduled' as const,
      goals: [],
      sourceLabel: scaffoldSource,
      updatedAt: scaffoldUpdatedAt
    }))
  )
];

export const finalsMatchResults: FinalsMatchResultData[] = scaffold.map(applyImport);
`;
}

const payload = JSON.parse(await fs.readFile(inputFile, 'utf8'));
const source = buildSource(payload);

if (dryRun) {
  const importedCount = normalizeImportPayload(payload).length;
  console.log(`Validated ${importedCount} imported finals result(s) from ${path.relative(rootDir, inputFile)}`);
} else {
  await fs.writeFile(outputFile, source);
  console.log(`Imported finals results from ${path.relative(rootDir, inputFile)} into ${path.relative(rootDir, outputFile)}`);
}
