import type { GroupCardData } from '../types/tournament';

const standingsShell = (teams: string[]) =>
  teams.map((name) => ({
    name,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0
  }));

export const groups: GroupCardData[] = [
  {
    id: 'A',
    status: 'draw-complete',
    statusLabel: 'Draw complete',
    drawNote: 'Final draw completed on 5 December 2025',
    teams: standingsShell(['Mexico', 'Czechia', 'Korea Republic', 'South Africa'])
  },
  {
    id: 'B',
    status: 'draw-complete',
    statusLabel: 'Draw complete',
    drawNote: 'Final draw completed on 5 December 2025',
    teams: standingsShell(['Canada', 'Bosnia and Herzegovina', 'Qatar', 'Switzerland'])
  },
  {
    id: 'C',
    status: 'draw-complete',
    statusLabel: 'Draw complete',
    drawNote: 'Final draw completed on 5 December 2025',
    teams: standingsShell(['Brazil', 'Haiti', 'Morocco', 'Scotland'])
  },
  {
    id: 'D',
    status: 'draw-complete',
    statusLabel: 'Draw complete',
    drawNote: 'Final draw completed on 5 December 2025',
    teams: standingsShell(['United States', 'Australia', 'Paraguay', 'Turkiye'])
  },
  {
    id: 'E',
    status: 'draw-complete',
    statusLabel: 'Draw complete',
    drawNote: 'Final draw completed on 5 December 2025',
    teams: standingsShell(['Curacao', "Cote d'Ivoire", 'Ecuador', 'Germany'])
  },
  {
    id: 'F',
    status: 'draw-complete',
    statusLabel: 'Draw complete',
    drawNote: 'Final draw completed on 5 December 2025',
    teams: standingsShell(['Japan', 'Netherlands', 'Sweden', 'Tunisia'])
  },
  {
    id: 'G',
    status: 'draw-complete',
    statusLabel: 'Draw complete',
    drawNote: 'Final draw completed on 5 December 2025',
    teams: standingsShell(['Belgium', 'Egypt', 'IR Iran', 'New Zealand'])
  },
  {
    id: 'H',
    status: 'draw-complete',
    statusLabel: 'Draw complete',
    drawNote: 'Final draw completed on 5 December 2025',
    teams: standingsShell(['Cabo Verde', 'Saudi Arabia', 'Spain', 'Uruguay'])
  },
  {
    id: 'I',
    status: 'draw-complete',
    statusLabel: 'Draw complete',
    drawNote: 'Final draw completed on 5 December 2025',
    teams: standingsShell(['France', 'Iraq', 'Norway', 'Senegal'])
  },
  {
    id: 'J',
    status: 'draw-complete',
    statusLabel: 'Draw complete',
    drawNote: 'Final draw completed on 5 December 2025',
    teams: standingsShell(['Algeria', 'Argentina', 'Austria', 'Jordan'])
  },
  {
    id: 'K',
    status: 'draw-complete',
    statusLabel: 'Draw complete',
    drawNote: 'Final draw completed on 5 December 2025',
    teams: standingsShell(['Colombia', 'Congo DR', 'Portugal', 'Uzbekistan'])
  },
  {
    id: 'L',
    status: 'draw-complete',
    statusLabel: 'Draw complete',
    drawNote: 'Final draw completed on 5 December 2025',
    teams: standingsShell(['Croatia', 'England', 'Ghana', 'Panama'])
  }
];
