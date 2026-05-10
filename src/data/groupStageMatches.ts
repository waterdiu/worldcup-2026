import type { GroupFixtureData, GroupStageMatchData } from '../types/tournament';
import { groupFixtures } from './groupFixtures';
import { groups } from './groups';

const pending = '待定';

const venues = [
  'Mexico City Stadium',
  'Estadio Guadalajara',
  'Toronto Stadium',
  'San Francisco Bay Area Stadium',
  'Boston Stadium',
  'New York New Jersey Stadium',
  'Los Angeles Stadium',
  'BC Place Vancouver',
  'Philadelphia Stadium',
  'Houston Stadium',
  'Dallas Stadium',
  'Estadio Monterrey',
  'Seattle Stadium',
  'Miami Stadium',
  'Atlanta Stadium',
  'Kansas City Stadium'
];

const matchdayTwoDates = [
  'Thu 18 Jun 2026',
  'Fri 19 Jun 2026',
  'Sat 20 Jun 2026',
  'Sun 21 Jun 2026',
  'Mon 22 Jun 2026',
  'Tue 23 Jun 2026'
];

const matchdayThreeDates = [
  'Wed 24 Jun 2026',
  'Thu 25 Jun 2026',
  'Fri 26 Jun 2026',
  'Sat 27 Jun 2026'
];

const pairingPlan = [
  {
    matchdayLabel: 'Matchday 1',
    roundLabel: 'Opening Round',
    pairings: [[0, 3], [2, 1]]
  },
  {
    matchdayLabel: 'Matchday 2',
    roundLabel: 'Group Stage',
    pairings: [[0, 2], [1, 3]]
  },
  {
    matchdayLabel: 'Matchday 3',
    roundLabel: 'Group Stage',
    pairings: [[0, 1], [3, 2]]
  }
] as const;

function pairingKey(homeTeam: string, awayTeam: string): string {
  return [homeTeam, awayTeam].sort().join('::');
}

function buildFixtureLookup(fixtures: GroupFixtureData[]) {
  return new Map(
    fixtures.map((fixture) => [
      `${fixture.groupId}:${pairingKey(fixture.homeTeam, fixture.awayTeam)}`,
      fixture
    ])
  );
}

function generatedProbability(seed: number) {
  const homeWinProbability = Number((0.34 + (seed % 8) * 0.03).toFixed(2));
  const drawProbability = Number((0.25 + (seed % 3) * 0.02).toFixed(2));
  const awayWinProbability = Number((1 - homeWinProbability - drawProbability).toFixed(2));

  return {
    homeWinProbability,
    drawProbability,
    awayWinProbability
  };
}

function generatedDateLabel(groupIndex: number, matchdayIndex: number, pairIndex: number): string {
  if (matchdayIndex === 1) {
    return matchdayTwoDates[(groupIndex + pairIndex) % matchdayTwoDates.length];
  }

  return matchdayThreeDates[(groupIndex + pairIndex) % matchdayThreeDates.length];
}

function toStageMatch(
  fixture: GroupFixtureData,
  matchdayLabel: string
): GroupStageMatchData {
  return {
    ...fixture,
    matchdayLabel
  };
}

const fixtureLookup = buildFixtureLookup(groupFixtures);

export const groupStageMatches: GroupStageMatchData[] = groups.flatMap((group, groupIndex) => {
  const teams = group.teams.map((team) => team.name);

  return pairingPlan.flatMap((matchday, matchdayIndex) =>
    matchday.pairings.map(([homeIndex, awayIndex], pairIndex) => {
      const homeTeam = teams[homeIndex];
      const awayTeam = teams[awayIndex];
      const existingFixture = fixtureLookup.get(`${group.id}:${pairingKey(homeTeam, awayTeam)}`);

      if (existingFixture) {
        return toStageMatch(existingFixture, matchday.matchdayLabel);
      }

      const matchNumber = matchdayIndex * 2 + pairIndex + 1;
      const seed = groupIndex * 6 + matchNumber;

      return {
        id: `${group.id}-${matchNumber}`,
        groupId: group.id,
        matchdayLabel: matchday.matchdayLabel,
        roundLabel: matchday.roundLabel,
        dateLabel: generatedDateLabel(groupIndex, matchdayIndex, pairIndex),
        venue: venues[(groupIndex * 3 + matchdayIndex * 2 + pairIndex) % venues.length],
        homeTeam,
        awayTeam,
        resultLabel: pending,
        predictionStatus: 'Model-ready display',
        ...generatedProbability(seed)
      };
    })
  );
});
