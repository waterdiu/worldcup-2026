import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const sharedDir = path.resolve(rootDir, '..', '..', 'football-data-platform');

const sharedPublicDir = path.join(sharedDir, 'data', 'public');
const groupsPath = path.join(rootDir, 'src', 'data', 'groups.ts');
const groupFixturesPath = path.join(rootDir, 'src', 'data', 'groupFixtures.ts');
const groupStageMatchesPath = path.join(rootDir, 'src', 'data', 'groupStageMatches.ts');
const bracketPath = path.join(rootDir, 'src', 'data', 'bracket.ts');
const fullSchedulePath = path.join(rootDir, 'src', 'data', 'fullSchedule.ts');
const finalsMatchResultsPath = path.join(rootDir, 'src', 'data', 'finalsMatchResults.ts');
const finalsCoveragePath = path.join(rootDir, 'src', 'data', 'finalsDataCoverage.ts');
const qualifierMatchesPath = path.join(rootDir, 'src', 'data', 'qualifierMatches.ts');

function readJson(filePath) {
  return fs.readFile(filePath, 'utf8').then((value) => JSON.parse(value));
}

function formatTsValue(value) {
  return JSON.stringify(value, null, 2);
}

const zhTeamNameToEnglish = {
  '阿尔及利亚': 'Algeria',
  '阿根廷': 'Argentina',
  '澳大利亚': 'Australia',
  '奥地利': 'Austria',
  '比利时': 'Belgium',
  '波黑': 'Bosnia and Herzegovina',
  '波斯尼亚和黑塞哥维那': 'Bosnia and Herzegovina',
  '巴西': 'Brazil',
  '加拿大': 'Canada',
  '佛得角': 'Cabo Verde',
  '哥伦比亚': 'Colombia',
  '刚果（金）': 'Congo DR',
  '刚果民主共和国': 'Congo DR',
  '克罗地亚': 'Croatia',
  '库拉索': 'Curacao',
  '捷克': 'Czechia',
  '捷克共和国': 'Czechia',
  '厄瓜多尔': 'Ecuador',
  '埃及': 'Egypt',
  '英格兰': 'England',
  '法国': 'France',
  '德国': 'Germany',
  '加纳': 'Ghana',
  '海地': 'Haiti',
  '伊拉克': 'Iraq',
  '伊朗': 'IR Iran',
  '日本': 'Japan',
  '约旦': 'Jordan',
  '韩国': 'Korea Republic',
  '墨西哥': 'Mexico',
  '摩洛哥': 'Morocco',
  '荷兰': 'Netherlands',
  '新西兰': 'New Zealand',
  '挪威': 'Norway',
  '巴拿马': 'Panama',
  '巴拉圭': 'Paraguay',
  '葡萄牙': 'Portugal',
  '卡塔尔': 'Qatar',
  '沙特阿拉伯': 'Saudi Arabia',
  '苏格兰': 'Scotland',
  '塞内加尔': 'Senegal',
  '南非': 'South Africa',
  '西班牙': 'Spain',
  '瑞典': 'Sweden',
  '瑞士': 'Switzerland',
  '突尼斯': 'Tunisia',
  '土耳其': 'Turkiye',
  '乌拉圭': 'Uruguay',
  '美国': 'United States',
  '乌兹别克斯坦': 'Uzbekistan',
  '科特迪瓦': "Cote d'Ivoire"
};

const zhVenueToEnglish = {
  '墨西哥城球场': 'Mexico City Stadium',
  '瓜达拉哈拉球场': 'Estadio Guadalajara',
  '多伦多球场': 'Toronto Stadium',
  '旧金山湾区球场': 'San Francisco Bay Area Stadium',
  '波士顿球场': 'Boston Stadium',
  '纽约新泽西球场': 'New York New Jersey Stadium',
  '洛杉矶球场': 'Los Angeles Stadium',
  '温哥华 BC Place 球场': 'BC Place Vancouver',
  '温哥华球场': 'BC Place Vancouver',
  '费城球场': 'Philadelphia Stadium',
  '休斯敦球场': 'Houston Stadium',
  '达拉斯球场': 'Dallas Stadium',
  '蒙特雷球场': 'Estadio Monterrey',
  '西雅图球场': 'Seattle Stadium',
  '迈阿密球场': 'Miami Stadium',
  '亚特兰大球场': 'Atlanta Stadium',
  '堪萨斯城球场': 'Kansas City Stadium'
};

function stripVenueSuffix(venue) {
  return String(venue || '').replace(/（.*?）/g, '').trim();
}

function toEnglishTeamName(name) {
  return zhTeamNameToEnglish[name] || name;
}

function toEnglishVenueName(venue) {
  const stripped = stripVenueSuffix(venue);
  return zhVenueToEnglish[stripped] || venue;
}

function teamPairKey(homeTeam, awayTeam) {
  return [homeTeam, awayTeam].sort().join('::');
}

function scheduleMatchdayLabel(matchIndexInGroup) {
  if (matchIndexInGroup < 2) return 'Matchday 1';
  if (matchIndexInGroup < 4) return 'Matchday 2';
  return 'Matchday 3';
}

function scheduleRoundLabel(matchIndexInGroup) {
  return matchIndexInGroup < 2 ? 'Opening Round' : 'Group Stage';
}

function normalizeGroupStageMatches(sharedGroupStageMatches, fullSchedule) {
  const sourceByPair = new Map(
    sharedGroupStageMatches.map((match) => [
      `${match.groupId}:${teamPairKey(match.homeTeam, match.awayTeam)}`,
      match
    ])
  );
  const groupIndexById = new Map();

  return fullSchedule
    .filter((match) => match.groupId)
    .map((scheduleMatch) => {
      const groupMatchIndex = groupIndexById.get(scheduleMatch.groupId) ?? 0;
      groupIndexById.set(scheduleMatch.groupId, groupMatchIndex + 1);

      const homeTeam = toEnglishTeamName(scheduleMatch.homeTeam);
      const awayTeam = toEnglishTeamName(scheduleMatch.awayTeam);
      const sourceMatch = sourceByPair.get(`${scheduleMatch.groupId}:${teamPairKey(homeTeam, awayTeam)}`);

      return {
        id: scheduleMatch.id,
        groupId: scheduleMatch.groupId,
        matchdayLabel: scheduleMatchdayLabel(groupMatchIndex),
        roundLabel: scheduleRoundLabel(groupMatchIndex),
        dateLabel: scheduleMatch.dateLabel,
        venue: toEnglishVenueName(scheduleMatch.venue),
        homeTeam,
        awayTeam,
        resultLabel: sourceMatch?.resultLabel ?? '待定',
        predictionStatus: sourceMatch?.predictionStatus ?? scheduleMatch.predictionStatus ?? 'Model-ready display',
        homeWinProbability: sourceMatch?.homeWinProbability ?? 0.34,
        drawProbability: sourceMatch?.drawProbability ?? 0.30,
        awayWinProbability: sourceMatch?.awayWinProbability ?? 0.36
      };
    });
}

function localMatchId(index) {
  return String(index + 1);
}

function isGroupStage(stageValue) {
  return String(stageValue ?? '').trim().toLowerCase() === 'group';
}

function stageLabelFromFixture(fixture) {
  return String(fixture.round || fixture.stage || '').trim();
}

function buildTeamNameMap(teams) {
  return new Map(
    teams.map((team) => [team.team_id, team.name])
  );
}

function toFinalsMatchResults(fixtures, results, teamNameById) {
  const resultByMatchId = new Map(results.map((item) => [item.match_id, item]));

  return fixtures.map((fixture, index) => {
    const result = resultByMatchId.get(fixture.match_id) ?? {};
    const status = String(result.status || fixture.status || 'scheduled').toLowerCase() === 'finished'
      ? 'completed'
      : 'scheduled';

    return {
      id: localMatchId(index),
      stageType: isGroupStage(fixture.stage) ? 'group' : 'knockout',
      stageLabel: stageLabelFromFixture(fixture),
      groupId: fixture.group || undefined,
      dateLabel: String(fixture.date_utc || '').slice(0, 10),
      venue: fixture.venue_name || fixture.venue || '',
      homeTeam: teamNameById.get(fixture.home_team_id) || fixture.home_team_name || fixture.home_team || fixture.homeTeam || '',
      awayTeam: teamNameById.get(fixture.away_team_id) || fixture.away_team_name || fixture.away_team || fixture.awayTeam || '',
      status,
      homeScore: typeof result.score?.home === 'number' ? result.score.home : undefined,
      awayScore: typeof result.score?.away === 'number' ? result.score.away : undefined,
      wentToExtraTime: Boolean(
        typeof result.score?.extra_time_home === 'number' || typeof result.score?.extra_time_away === 'number'
      ) || undefined,
      wentToPenalties: Boolean(
        typeof result.score?.penalties_home === 'number' || typeof result.score?.penalties_away === 'number'
      ) || undefined,
      homePenaltyScore: typeof result.score?.penalties_home === 'number' ? result.score.penalties_home : undefined,
      awayPenaltyScore: typeof result.score?.penalties_away === 'number' ? result.score.penalties_away : undefined,
      goals: [],
      sourceLabel: 'football-data-platform shared finals results',
      updatedAt: String(result.updated_at || fixture.updated_at || '2026-05-15T00:00:00Z').slice(0, 10)
    };
  });
}

function toCoverageSummary(coverageRows) {
  const total = coverageRows.length || 1;
  const scoreCoveragePct = Math.round(
    (coverageRows.filter((row) => row?.result?.status === 'available').length / total) * 100
  );
  const goalEventCoveragePct = Math.round(
    (coverageRows.filter((row) => row?.events?.status === 'available').length / total) * 100
  );
  const issueCount = coverageRows.filter(
    (row) => row?.result?.status !== 'available' || row?.events?.status === 'missing'
  ).length;

  return {
    updatedAt: '2026-05-15',
    sourceLabel: 'football-data-platform shared coverage',
    scoreCoveragePct,
    goalEventCoveragePct,
    issueCount
  };
}

function normalizeEventType(type) {
  const lowered = String(type || '').trim().toLowerCase();
  if (lowered === 'goal') return 'goal';
  if (lowered === 'yellow-card' || lowered === 'yellow card' || lowered === 'card yellow') return 'yellow-card';
  if (lowered === 'red-card' || lowered === 'red card' || lowered === 'card red') return 'red-card';
  return 'substitution';
}

function toQualifierMatches(sharedMatches) {
  return sharedMatches.map((match) => ({
    id: match.match_id || match.id,
    confederationId: match.confederationId,
    confederationName: match.confederationName,
    stage: match.stage,
    dateLabel: match.date_utc ? String(match.date_utc).slice(0, 10) : match.dateLabel,
    venue: match.venue || undefined,
    homeTeam: match.home_team_name || match.homeTeam,
    awayTeam: match.away_team_name || match.awayTeam,
    homeScore: Number(match.score?.home ?? match.homeScore ?? 0),
    awayScore: Number(match.score?.away ?? match.awayScore ?? 0),
    resultNote: match.resultNote || undefined,
    sourceLabel: match.sourceLabel || match.provider || 'football-data-platform shared qualifier matches',
    stats: Array.isArray(match.stats)
      ? match.stats.map((stat) => ({
          label: stat.label,
          home: String(stat.home),
          away: String(stat.away)
        }))
      : undefined,
    events: Array.isArray(match.events)
      ? match.events.map((event) => ({
          minute: String(event.minute ?? ''),
          team: event.team || '',
          type: normalizeEventType(event.type),
          player: event.player || '',
          detail: event.detail || undefined
        }))
      : undefined,
    lineups: Array.isArray(match.lineups)
      ? match.lineups.map((lineup) => ({
          team: lineup.team,
          formation: lineup.formation || undefined,
          starters: Array.isArray(lineup.starters) ? lineup.starters : [],
          substitutes: Array.isArray(lineup.substitutes) ? lineup.substitutes : []
        }))
      : undefined,
    playerRatings: Array.isArray(match.playerRatings) ? match.playerRatings : undefined,
    missingData: Array.isArray(match.missingData) ? match.missingData : []
  }));
}

function buildFinalsMatchResultsModule(rows) {
  return `import type { FinalsMatchResultData } from '../types/tournament';\n\nexport const finalsMatchResults: FinalsMatchResultData[] = ${formatTsValue(rows)};\n`;
}

function buildGroupsModule(rows) {
  return `import type { GroupCardData } from '../types/tournament';\n\nexport const groups: GroupCardData[] = ${formatTsValue(rows)};\n`;
}

function buildGroupFixturesModule(rows) {
  const fixtures = rows.map(({ matchdayLabel, ...fixture }) => fixture);
  return `import type { GroupFixtureData } from '../types/tournament';\n\nexport const groupFixtures: GroupFixtureData[] = ${formatTsValue(fixtures)};\n`;
}

function buildGroupStageMatchesModule(rows) {
  return `import type { GroupStageMatchData } from '../types/tournament';\n\nexport const groupStageMatches: GroupStageMatchData[] = ${formatTsValue(rows)};\n`;
}

function buildBracketModule(rows) {
  return `import type { BracketRoundData } from '../types/tournament';\n\nexport const bracket: BracketRoundData[] = ${formatTsValue(rows)};\n`;
}

function buildFullScheduleModule(rows) {
  return `import type { FullScheduleMatchData } from '../types/tournament';\n\nexport const fullSchedule: FullScheduleMatchData[] = ${formatTsValue(rows)};\n`;
}

function buildFinalsCoverageModule(coverage) {
  return `import type { FinalsDataCoverageData } from '../types/tournament';\n\nexport const finalsDataCoverage: FinalsDataCoverageData = ${formatTsValue(coverage)};\n`;
}

function buildQualifierMatchesModule(rows, importReport) {
  const reports = [
    {
      confederationId: 'shared',
      leagueId: 0,
      season: 2026,
      importedMatches: rows.length,
      errors: [],
      sourceReport: importReport
    }
  ];

  return `import type { QualifierMatchData } from '../types/tournament';\n\nexport const qualifierMatches: QualifierMatchData[] = ${formatTsValue(rows)};\n\nexport const qualifierMissingDataReport = qualifierMatches.map((match) => ({\n  id: match.id,\n  label: \`\${match.homeTeam} \${match.homeScore}-\${match.awayScore} \${match.awayTeam}\`,\n  missingData: match.missingData\n}));\n\nexport const apiFootballQualifierSourceReports: Array<{\n  confederationId: QualifierMatchData['confederationId'] | 'intercontinental' | 'shared';\n  leagueId: number;\n  season: number;\n  importedMatches: number;\n  errors: string[];\n  sourceReport?: unknown;\n}> = ${formatTsValue(reports)};\n`;
}

async function main() {
  const [
    groups,
    groupFixtures,
    groupStageMatches,
    bracket,
    fullSchedule,
    finalsRows,
    coverage,
    qualifierMatches,
    qualifierImportReport
  ] = await Promise.all([
    readJson(path.join(sharedPublicDir, 'worldcup-site-groups.json')),
    readJson(path.join(sharedPublicDir, 'worldcup-site-group-fixtures.json')),
    readJson(path.join(sharedPublicDir, 'worldcup-site-group-stage-matches.json')),
    readJson(path.join(sharedPublicDir, 'worldcup-site-bracket.json')),
    readJson(path.join(sharedPublicDir, 'worldcup-site-full-schedule.json')),
    readJson(path.join(sharedPublicDir, 'worldcup-site-finals-results.json')),
    readJson(path.join(sharedPublicDir, 'worldcup-site-finals-coverage.json')),
    readJson(path.join(sharedPublicDir, 'worldcup-site-qualifier-matches.json')),
    readJson(path.join(sharedDir, 'reports', 'qualifier_matches_import_report.json'))
  ]);

  const qualifiers = toQualifierMatches(qualifierMatches);
  const normalizedGroupStageMatches = normalizeGroupStageMatches(groupStageMatches, fullSchedule);
  const normalizedGroupFixtures = normalizedGroupStageMatches.filter((match) => match.matchdayLabel === 'Matchday 1');

  await Promise.all([
    fs.writeFile(groupsPath, buildGroupsModule(groups), 'utf8'),
    fs.writeFile(groupFixturesPath, buildGroupFixturesModule(normalizedGroupFixtures), 'utf8'),
    fs.writeFile(groupStageMatchesPath, buildGroupStageMatchesModule(normalizedGroupStageMatches), 'utf8'),
    fs.writeFile(bracketPath, buildBracketModule(bracket), 'utf8'),
    fs.writeFile(fullSchedulePath, buildFullScheduleModule(fullSchedule), 'utf8'),
    fs.writeFile(finalsMatchResultsPath, buildFinalsMatchResultsModule(finalsRows), 'utf8'),
    fs.writeFile(finalsCoveragePath, buildFinalsCoverageModule(coverage), 'utf8'),
    fs.writeFile(qualifierMatchesPath, buildQualifierMatchesModule(qualifiers, qualifierImportReport), 'utf8')
  ]);

  console.log(`Synced shared groups: ${groups.length}`);
  console.log(`Synced shared group fixtures: ${normalizedGroupFixtures.length}`);
  console.log(`Synced shared group stage matches: ${normalizedGroupStageMatches.length}`);
  console.log(`Synced shared bracket rounds: ${bracket.length}`);
  console.log(`Synced shared full schedule: ${fullSchedule.length}`);
  console.log(`Synced shared finals results: ${finalsRows.length}`);
  console.log(`Synced shared qualifier matches: ${qualifiers.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
