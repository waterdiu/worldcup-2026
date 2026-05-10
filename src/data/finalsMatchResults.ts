import { bracket } from './bracket';
import { groupStageMatches } from './groupStageMatches';
import type { FinalsMatchResultData } from '../types/tournament';

const scaffoldSource = 'Generated schedule scaffold';
const scaffoldUpdatedAt = '2026-05-10';

export const finalsMatchResults: FinalsMatchResultData[] = [
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
