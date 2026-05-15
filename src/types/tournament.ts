export type GroupStatus = 'draw-complete';

export interface TournamentMeta {
  name: string;
  year: number;
  hosts: string[];
  hostCities: number;
  hostCityNames: string[];
  startDate: string;
  finalDate: string;
  teamCount: number;
  groupCount: number;
  matchCount: number;
  status: string;
  openingMatchLabel: string;
  drawDateLabel: string;
}

export interface ConfederationCardData {
  id: 'afc' | 'caf' | 'concacaf' | 'conmebol' | 'ofc' | 'uefa';
  name: string;
  slotSummary: string;
  statusLabel: string;
  qualifiedTeams: string[];
  remainingPlaces: string;
  featuredMatches: string[];
}

export interface QualificationRouteData {
  team: string;
  pathLabel: string;
  note: string;
}

export interface QualifierDetailData {
  confederationId: ConfederationCardData['id'];
  title: string;
  stageSummary: string[];
  resultsSummary: string[];
  routes: QualificationRouteData[];
}

export interface GroupTeamData {
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface GroupCardData {
  id: string;
  status: GroupStatus;
  statusLabel: string;
  drawNote: string;
  teams: GroupTeamData[];
}

export interface BracketMatchData {
  id: string;
  dateLabel: string;
  homeLabel: string;
  awayLabel: string;
  venue: string;
  predictionStatus: string;
}

export interface BracketRoundData {
  round: string;
  matches: BracketMatchData[];
}

export interface GroupFixtureData {
  id: string;
  groupId: string;
  roundLabel: string;
  dateLabel: string;
  venue: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  resultLabel?: string;
  homeWinProbability: number;
  drawProbability: number;
  awayWinProbability: number;
  predictionStatus: string;
}

export interface FullScheduleMatchData {
  id: string;
  stageLabel: string;
  groupId?: string;
  dateLabel: string;
  beijingTimeLabel: string;
  city: string;
  venue: string;
  homeTeam: string;
  awayTeam: string;
  title: string;
  predictionStatus: string;
}

export interface DailyHeroData {
  generatedAt: string;
  referenceDate: string;
  date: string;
  matchId: string;
  title: string;
  homeTeam: string;
  awayTeam: string;
  kickoff: string;
  venue: string;
  poster: string;
  fallbackPoster: string;
  posterSource: 'manual' | 'template';
  reason: string;
}

export interface GroupStageMatchData extends GroupFixtureData {
  matchdayLabel: string;
}

export type FinalsMatchStatus = 'scheduled' | 'completed';

export interface FinalsGoalEventData {
  minute: string;
  team: string;
  player: string;
  ownGoal?: boolean;
  penalty?: boolean;
}

export interface FinalsMatchResultData {
  id: string;
  stageType: 'group' | 'knockout';
  stageLabel: string;
  groupId?: string;
  dateLabel: string;
  venue: string;
  homeTeam: string;
  awayTeam: string;
  status: FinalsMatchStatus;
  homeScore?: number;
  awayScore?: number;
  wentToExtraTime?: boolean;
  wentToPenalties?: boolean;
  homePenaltyScore?: number;
  awayPenaltyScore?: number;
  goals: FinalsGoalEventData[];
  sourceLabel: string;
  updatedAt: string;
}

export interface FinalsDataCoverageData {
  updatedAt: string;
  sourceLabel: string;
  scoreCoveragePct: number;
  goalEventCoveragePct: number;
  issueCount: number;
}

export interface MatchStatData {
  label: string;
  home: string;
  away: string;
}

export interface MatchEventData {
  minute: string;
  team: string;
  type: 'goal' | 'yellow-card' | 'red-card' | 'substitution';
  player: string;
  detail?: string;
}

export interface MatchLineupPlayerData {
  number: number;
  name: string;
  position: string;
  rating?: number;
}

export interface MatchLineupData {
  team: string;
  formation?: string;
  starters: MatchLineupPlayerData[];
  substitutes: MatchLineupPlayerData[];
}

export interface PlayerRatingData {
  team: string;
  player: string;
  rating: number;
}

export interface QualifierMatchData {
  id: string;
  confederationId: ConfederationCardData['id'];
  confederationName: string;
  stage: string;
  dateLabel: string;
  venue?: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  resultNote?: string;
  sourceLabel: string;
  stats?: MatchStatData[];
  events?: MatchEventData[];
  lineups?: MatchLineupData[];
  playerRatings?: PlayerRatingData[];
  missingData: string[];
}
