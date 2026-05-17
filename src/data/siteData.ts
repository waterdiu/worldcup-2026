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

export type WorldCupSiteData = {
  source: WorldCupSiteDataSource;
  generatedAt?: string;
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
  teamStaff: []
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
  teamStaff: WorldCupTeamStaff[]
): WorldCupSiteData {
  const datasets = bundle.datasets ?? {};

  return {
    source: 'runtime',
    generatedAt: bundle.generated_at,
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
    teamStaff
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

  let rosters: WorldCupTeamRoster[] = [];
  let teamStaff: WorldCupTeamStaff[] = [];
  const rosterEntry = selectRuntimeEntry(
    manifest.runtime_contract?.core?.rosters?.path,
    manifest.runtime_contract?.core?.rosters?.url,
    './core/rosters.json'
  );

  try {
    const rosterUrl = new URL(rosterEntry, manifestAbsoluteUrl.replace(/\/[^/]*$/, '/')).toString();
    const rosterResponse = await fetch(rosterUrl, { cache: 'no-store', signal });
    if (rosterResponse.ok) {
      rosters = await rosterResponse.json() as WorldCupTeamRoster[];
    }
  } catch {
    rosters = [];
  }

  const teamStaffEntry = selectRuntimeEntry(
    manifest.runtime_contract?.core?.team_staff?.path,
    manifest.runtime_contract?.core?.team_staff?.url,
    './core/team-staff.json'
  );

  try {
    const teamStaffUrl = new URL(teamStaffEntry, manifestAbsoluteUrl.replace(/\/[^/]*$/, '/')).toString();
    const teamStaffResponse = await fetch(teamStaffUrl, { cache: 'no-store', signal });
    if (teamStaffResponse.ok) {
      teamStaff = await teamStaffResponse.json() as WorldCupTeamStaff[];
    }
  } catch {
    teamStaff = [];
  }

  return toSiteData(await bundleResponse.json() as RuntimeSiteBundle, rosters, teamStaff);
}
