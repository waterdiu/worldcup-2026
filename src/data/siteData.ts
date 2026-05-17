import type {
  BracketRoundData,
  FinalsDataCoverageData,
  FinalsMatchResultData,
  FullScheduleMatchData,
  GroupCardData,
  GroupFixtureData,
  GroupStageMatchData,
  QualifierMatchData
} from '../types/tournament';
import { bracket } from './bracket';
import { finalsDataCoverage } from './finalsDataCoverage';
import { finalsMatchResults } from './finalsMatchResults';
import { fullSchedule } from './fullSchedule';
import { groupFixtures } from './groupFixtures';
import { groupStageMatches } from './groupStageMatches';
import { groups } from './groups';
import { apiFootballQualifierSourceReports, qualifierMatches, qualifierMissingDataReport } from './qualifierMatches';

export type QualifierSourceReport = {
  confederationId: QualifierMatchData['confederationId'] | 'intercontinental' | 'shared';
  leagueId: number;
  season: number;
  importedMatches: number;
  errors: string[];
  sourceReport?: unknown;
};

export type QualifierMissingDataReport = Array<{
  id: string;
  label: string;
  missingData: string[];
}>;

export type WorldCupSiteDataSource = 'runtime' | 'fallback';

export type WorldCupRosterPlayer = {
  player_id?: string;
  name: string;
  display_name?: string | null;
  name_zh?: string | null;
  position?: string | null;
  shirt_number?: number | null;
  club?: string | null;
  status?: string | null;
};

export type WorldCupTeamRoster = {
  competition_id?: string;
  season_id?: string;
  team_id: string;
  team_name: string;
  roster_type?: string;
  source_status?: string;
  confidence?: string;
  published_at?: string;
  updated_at?: string;
  source_url?: string;
  players: WorldCupRosterPlayer[];
};

export type WorldCupTeamStaff = {
  competition_id?: string;
  season_id?: string;
  team_id: string;
  team_name: string;
  staff_id?: string;
  name: string;
  display_name?: string | null;
  name_zh?: string | null;
  role: string;
  role_zh?: string | null;
  status?: string | null;
  nationality?: string | null;
  date_of_birth?: string | null;
  age?: number | null;
  appointed_at?: string | null;
  contract_until?: string | null;
  source_status?: string | null;
  source_url?: string | null;
  updated_at?: string | null;
};

export type WorldCupRecentMatch = {
  match_id: string;
  date: string;
  team_id: string;
  team_name: string;
  home_team: string;
  away_team: string;
  opponent_name: string;
  home_away: 'home' | 'away' | 'neutral';
  home_score: number;
  away_score: number;
  score_for: number;
  score_against: number;
  result: 'win' | 'draw' | 'loss';
  tournament: string;
  competition_group?: string | null;
  competition_weight?: number | null;
  city?: string | null;
  country?: string | null;
  venue?: string | null;
  neutral?: boolean | null;
};

export type WorldCupTeamRecentMatches = {
  team_id: string;
  team_name: string;
  source?: string | null;
  source_status?: string | null;
  match_count: number;
  latest_match_date?: string | null;
  form_summary?: {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goals_for: number;
    goals_against: number;
    goal_difference: number;
  } | null;
  matches: WorldCupRecentMatch[];
};

export type WorldCupHistoryMatch = {
  match_id: string;
  date: string;
  team_id: string;
  team_name: string;
  home_team: string;
  away_team: string;
  opponent_name: string;
  home_away: 'home' | 'away' | 'neutral';
  home_score: number;
  away_score: number;
  score_for: number;
  score_against: number;
  result: 'win' | 'draw' | 'loss';
  result_basis?: string | null;
  tournament: string;
  competition_group?: string | null;
  competition_weight?: number | null;
  round?: string | null;
  group?: string | null;
  city?: string | null;
  country?: string | null;
  venue?: string | null;
  neutral?: boolean | null;
};

export type WorldCupTeamWorldCupHistory = {
  team_id: string;
  team_name: string;
  competition_id?: string | null;
  source_status?: string | null;
  source?: string | null;
  summary?: {
    appearances: number;
    completed_appearances?: number;
    current_qualified?: boolean;
    best_finish?: string | null;
    matches_played: number;
    won: number;
    drawn: number;
    lost: number;
    goals_for: number;
    goals_against: number;
  } | null;
  editions: Array<{
    year: number;
    matches_played: number;
    won: number;
    drawn: number;
    lost: number;
    goals_for: number;
    goals_against: number;
    goal_difference?: number;
    matches: WorldCupHistoryMatch[];
  }>;
};

export type WorldCupSiteData = {
  source: WorldCupSiteDataSource;
  generatedAt?: string;
  runtimeWarnings?: string[];
  groups: GroupCardData[];
  groupFixtures: GroupFixtureData[];
  groupStageMatches: GroupStageMatchData[];
  bracket: BracketRoundData[];
  fullSchedule: FullScheduleMatchData[];
  finalsMatchResults: FinalsMatchResultData[];
  finalsDataCoverage: FinalsDataCoverageData;
  qualifierMatches: QualifierMatchData[];
  qualifierMissingDataReport: QualifierMissingDataReport;
  apiFootballQualifierSourceReports: QualifierSourceReport[];
  rosters: WorldCupTeamRoster[];
  teamStaff: WorldCupTeamStaff[];
  teamRecentMatches: WorldCupTeamRecentMatches[];
  teamWorldCupHistory: WorldCupTeamWorldCupHistory[];
};

type RuntimeSiteBundle = {
  generated_at?: string;
  datasets?: {
    groups?: GroupCardData[];
    group_fixtures?: GroupFixtureData[];
    group_stage_matches?: GroupStageMatchData[];
    bracket?: BracketRoundData[];
    full_schedule?: FullScheduleMatchData[];
    finals_results?: FinalsMatchResultData[];
    finals_coverage?: FinalsDataCoverageData;
    qualifier_matches?: QualifierMatchData[];
    qualifier_missing_data?: QualifierMissingDataReport;
    qualifier_source_reports?: QualifierSourceReport[];
  };
};

export const fallbackWorldCupSiteData: WorldCupSiteData = {
  source: 'fallback',
  groups,
  groupFixtures,
  groupStageMatches,
  bracket,
  fullSchedule,
  finalsMatchResults,
  finalsDataCoverage,
  qualifierMatches,
  qualifierMissingDataReport,
  apiFootballQualifierSourceReports,
  rosters: [],
  teamStaff: [],
  teamRecentMatches: [],
  teamWorldCupHistory: [],
  runtimeWarnings: []
};

function normalizeApiBase(base: string) {
  return base.replace(/\/+$/, '');
}

function runtimeApiBase() {
  const configuredBase = import.meta.env.VITE_WORLDCUP_DATA_API_BASE;
  if (configuredBase) {
    return normalizeApiBase(configuredBase);
  }

  return import.meta.env.PROD
    ? 'https://waterdiu.github.io/football-data-platform/api/worldcup/2026'
    : '/api/worldcup/2026';
}

function selectRuntimeEntry(relativeUrl: string | undefined, absoluteUrl: string | undefined, fallback: string) {
  if (import.meta.env.PROD) return absoluteUrl ?? relativeUrl ?? fallback;
  return relativeUrl ?? absoluteUrl ?? fallback;
}

function requireDataset<T>(value: T | undefined, label: string): T {
  if (value === undefined || value === null) {
    throw new Error(`Missing runtime World Cup dataset: ${label}`);
  }
  return value;
}

function toSiteData(
  bundle: RuntimeSiteBundle,
  rosters: WorldCupTeamRoster[],
  teamStaff: WorldCupTeamStaff[],
  teamRecentMatches: WorldCupTeamRecentMatches[],
  teamWorldCupHistory: WorldCupTeamWorldCupHistory[],
  runtimeWarnings: string[]
): WorldCupSiteData {
  const datasets = bundle.datasets ?? {};

  return {
    source: 'runtime',
    generatedAt: bundle.generated_at,
    runtimeWarnings,
    groups: requireDataset(datasets.groups, 'groups'),
    groupFixtures: requireDataset(datasets.group_fixtures, 'group_fixtures'),
    groupStageMatches: requireDataset(datasets.group_stage_matches, 'group_stage_matches'),
    bracket: requireDataset(datasets.bracket, 'bracket'),
    fullSchedule: requireDataset(datasets.full_schedule, 'full_schedule'),
    finalsMatchResults: requireDataset(datasets.finals_results, 'finals_results'),
    finalsDataCoverage: requireDataset(datasets.finals_coverage, 'finals_coverage'),
    qualifierMatches: requireDataset(datasets.qualifier_matches, 'qualifier_matches'),
    qualifierMissingDataReport: datasets.qualifier_missing_data ?? [],
    apiFootballQualifierSourceReports: datasets.qualifier_source_reports ?? [],
    rosters,
    teamStaff,
    teamRecentMatches,
    teamWorldCupHistory
  };
}

export async function loadRuntimeWorldCupSiteData(signal?: AbortSignal): Promise<WorldCupSiteData> {
  const manifestUrl = `${runtimeApiBase()}/manifest.json`;
  const manifestAbsoluteUrl = new URL(manifestUrl, window.location.href).toString();
  const manifestResponse = await fetch(manifestAbsoluteUrl, { cache: 'no-store', signal });
  if (!manifestResponse.ok) {
    throw new Error(`Failed to load World Cup API manifest: ${manifestResponse.status}`);
  }

  const manifest = await manifestResponse.json() as {
    runtime_contract?: {
      preferred_site_entrypoint?: string;
      preferred_site_url?: string;
      core?: {
        rosters?: {
          path?: string;
          url?: string;
        };
        team_staff?: {
          path?: string;
          url?: string;
        };
      };
    };
  };
  const siteEntry = selectRuntimeEntry(
    manifest.runtime_contract?.preferred_site_entrypoint,
    manifest.runtime_contract?.preferred_site_url,
    './site/bundle.json'
  );
  const bundleUrl = new URL(siteEntry, manifestAbsoluteUrl.replace(/\/[^/]*$/, '/')).toString();
  const bundleResponse = await fetch(bundleUrl, { cache: 'no-store', signal });
  if (!bundleResponse.ok) {
    throw new Error(`Failed to load World Cup site data bundle: ${bundleResponse.status}`);
  }

  const warnings: string[] = [];
  let rosters: WorldCupTeamRoster[] = [];
  let teamStaff: WorldCupTeamStaff[] = [];
  let teamRecentMatches: WorldCupTeamRecentMatches[] = [];
  let teamWorldCupHistory: WorldCupTeamWorldCupHistory[] = [];
  const rosterEntry = selectRuntimeEntry(
    manifest.runtime_contract?.core?.rosters?.path,
    manifest.runtime_contract?.core?.rosters?.url,
    './core/rosters.json'
  );
  const teamStaffEntry = selectRuntimeEntry(
    manifest.runtime_contract?.core?.team_staff?.path,
    manifest.runtime_contract?.core?.team_staff?.url,
    './core/team-staff.json'
  );

  const baseUrl = manifestAbsoluteUrl.replace(/\/[^/]*$/, '/');
  const rosterUrl = new URL(rosterEntry, baseUrl).toString();
  const teamStaffUrl = new URL(teamStaffEntry, baseUrl).toString();
  const recentUrl = new URL(
    selectRuntimeEntry(
      (manifest.runtime_contract?.core as any)?.team_recent_matches?.path,
      (manifest.runtime_contract?.core as any)?.team_recent_matches?.url,
      './core/team-recent-matches.json'
    ),
    baseUrl
  ).toString();
  const historyUrl = new URL(
    selectRuntimeEntry(
      (manifest.runtime_contract?.core as any)?.team_world_cup_history?.path,
      (manifest.runtime_contract?.core as any)?.team_world_cup_history?.url,
      './core/team-world-cup-history.json'
    ),
    baseUrl
  ).toString();

  const [rosterRes, staffRes, recentRes, historyRes] = await Promise.allSettled([
    fetch(rosterUrl, { cache: 'no-store', signal }),
    fetch(teamStaffUrl, { cache: 'no-store', signal }),
    fetch(recentUrl, { cache: 'no-store', signal }),
    fetch(historyUrl, { cache: 'no-store', signal })
  ]);

  if (rosterRes.status === 'fulfilled' && rosterRes.value.ok) {
    try {
      rosters = await rosterRes.value.json() as WorldCupTeamRoster[];
    } catch {
      warnings.push('Failed to parse runtime core rosters.json');
      rosters = [];
    }
  } else if (rosterRes.status === 'fulfilled') {
    warnings.push(`Failed to load runtime core rosters.json (${rosterRes.value.status})`);
  }

  if (staffRes.status === 'fulfilled' && staffRes.value.ok) {
    try {
      teamStaff = await staffRes.value.json() as WorldCupTeamStaff[];
    } catch {
      warnings.push('Failed to parse runtime core team-staff.json');
      teamStaff = [];
    }
  } else if (staffRes.status === 'fulfilled') {
    warnings.push(`Failed to load runtime core team-staff.json (${staffRes.value.status})`);
  }

  if (recentRes.status === 'fulfilled' && recentRes.value.ok) {
    try {
      teamRecentMatches = await recentRes.value.json() as WorldCupTeamRecentMatches[];
    } catch {
      warnings.push('Failed to parse runtime core team-recent-matches.json');
      teamRecentMatches = [];
    }
  } else if (recentRes.status === 'rejected') {
    warnings.push('Failed to load runtime core team-recent-matches.json');
  } else {
    warnings.push(`Failed to load runtime core team-recent-matches.json (${recentRes.value.status})`);
  }

  if (historyRes.status === 'fulfilled' && historyRes.value.ok) {
    try {
      teamWorldCupHistory = await historyRes.value.json() as WorldCupTeamWorldCupHistory[];
    } catch {
      warnings.push('Failed to parse runtime core team-world-cup-history.json');
      teamWorldCupHistory = [];
    }
  } else if (historyRes.status === 'rejected') {
    warnings.push('Failed to load runtime core team-world-cup-history.json');
  } else {
    warnings.push(`Failed to load runtime core team-world-cup-history.json (${historyRes.value.status})`);
  }

  if (!import.meta.env.PROD) {
    // Dev-only: helps diagnose silent dataset fetch failures.
    console.info('[worldcup-runtime] core datasets', {
      rosters: rosters.length,
      teamStaff: teamStaff.length,
      teamRecentMatches: teamRecentMatches.length,
      teamWorldCupHistory: teamWorldCupHistory.length,
      warnings
    });
  }

  return toSiteData(
    await bundleResponse.json() as RuntimeSiteBundle,
    rosters,
    teamStaff,
    teamRecentMatches,
    teamWorldCupHistory,
    warnings
  );
}
