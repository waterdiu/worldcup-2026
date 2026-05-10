import type { QualifierMatchData } from '../types/tournament';
import { apiFootballQualifierMatches, apiFootballQualifierSourceReports } from './apiFootballQualifierMatches';

const unavailable = ['阵容', '比赛统计', '换人', '红黄牌', '球员赛后评分'];
const noRatings = ['球员赛后评分'];

const manualQualifierMatches: QualifierMatchData[] = [
  {
    id: 'afc-uae-iraq-2025-11-13',
    confederationId: 'afc',
    confederationName: '亚足联',
    stage: '亚洲区第五阶段首回合',
    dateLabel: '2025-11-13',
    venue: 'Mohammed bin Zayed Stadium',
    homeTeam: 'United Arab Emirates',
    awayTeam: 'Iraq',
    homeScore: 1,
    awayScore: 1,
    resultNote: '伊拉克两回合总比分晋级洲际附加赛路径',
    sourceLabel: 'FIFA match centre / public result feeds',
    stats: [
      { label: '控球率', home: '48%', away: '52%' },
      { label: '射门', home: '9', away: '11' },
      { label: '射正', home: '3', away: '4' },
      { label: '角球', home: '4', away: '5' },
      { label: '黄牌', home: '2', away: '3' }
    ],
    events: [
      { minute: '18', team: 'Iraq', type: 'goal', player: 'Ali Al-Hamadi', detail: '伊拉克反击首开纪录' },
      { minute: '76', team: 'United Arab Emirates', type: 'goal', player: 'Caio Canedo', detail: '阿联酋扳平比分' },
      { minute: '82', team: 'Iraq', type: 'substitution', player: 'Mohannad Ali', detail: '锋线换人保持压迫' }
    ],
    lineups: [
      {
        team: 'United Arab Emirates',
        formation: '4-2-3-1',
        starters: [
          { number: 17, name: 'Khalid Eisa', position: 'GK' },
          { number: 11, name: 'Caio Canedo', position: 'FW' }
        ],
        substitutes: [{ number: 7, name: 'Ali Mabkhout', position: 'FW' }]
      },
      {
        team: 'Iraq',
        formation: '4-3-3',
        starters: [
          { number: 12, name: 'Jalal Hassan', position: 'GK' },
          { number: 18, name: 'Ali Al-Hamadi', position: 'FW' }
        ],
        substitutes: [{ number: 10, name: 'Mohannad Ali', position: 'FW' }]
      }
    ],
    missingData: noRatings
  },
  {
    id: 'afc-iraq-uae-2025-11-18',
    confederationId: 'afc',
    confederationName: '亚足联',
    stage: '亚洲区第五阶段次回合',
    dateLabel: '2025-11-18',
    homeTeam: 'Iraq',
    awayTeam: 'United Arab Emirates',
    homeScore: 2,
    awayScore: 1,
    sourceLabel: 'FIFA match centre / public result feeds',
    events: [
      { minute: '53', team: 'United Arab Emirates', type: 'goal', player: 'Caio Canedo' },
      { minute: '66', team: 'Iraq', type: 'goal', player: 'Mohannad Ali' },
      { minute: '90+17', team: 'Iraq', type: 'goal', player: 'Amir Al-Ammari', detail: '点球' }
    ],
    missingData: ['阵容', '比赛统计', '换人', '红黄牌', '球员赛后评分']
  },
  {
    id: 'caf-nigeria-congo-dr-2025-11-16',
    confederationId: 'caf',
    confederationName: '非足联',
    stage: '非洲区附加赛决赛',
    dateLabel: '2025-11-16',
    homeTeam: 'Nigeria',
    awayTeam: 'Congo DR',
    homeScore: 1,
    awayScore: 1,
    resultNote: '刚果（金）点球大战晋级洲际附加赛',
    sourceLabel: 'CAF / public result feeds',
    events: [
      { minute: '3', team: 'Nigeria', type: 'goal', player: 'Frank Onyeka' },
      { minute: '32', team: 'Congo DR', type: 'goal', player: 'Meschack Elia' }
    ],
    missingData: ['完整阵容', '比赛统计', '换人', '红黄牌', '球员赛后评分']
  },
  {
    id: 'caf-cameroon-congo-dr-2025-11-13',
    confederationId: 'caf',
    confederationName: '非足联',
    stage: '非洲区附加赛半决赛',
    dateLabel: '2025-11-13',
    homeTeam: 'Cameroon',
    awayTeam: 'Congo DR',
    homeScore: 0,
    awayScore: 1,
    sourceLabel: 'CAF / public result feeds',
    events: [{ minute: '90+1', team: 'Congo DR', type: 'goal', player: 'Chancel Mbemba' }],
    missingData: unavailable
  },
  {
    id: 'concacaf-curacao-jamaica-2025-11-18',
    confederationId: 'concacaf',
    confederationName: '中北美及加勒比地区足联',
    stage: '中北美区第三阶段',
    dateLabel: '2025-11-18',
    homeTeam: 'Curacao',
    awayTeam: 'Jamaica',
    homeScore: 0,
    awayScore: 0,
    resultNote: '库拉索锁定世界杯正赛资格',
    sourceLabel: 'CONCACAF / public result feeds',
    missingData: unavailable
  },
  {
    id: 'concacaf-panama-el-salvador-2025-11-18',
    confederationId: 'concacaf',
    confederationName: '中北美及加勒比地区足联',
    stage: '中北美区第三阶段',
    dateLabel: '2025-11-18',
    homeTeam: 'Panama',
    awayTeam: 'El Salvador',
    homeScore: 3,
    awayScore: 0,
    resultNote: '巴拿马锁定世界杯正赛资格',
    sourceLabel: 'CONCACAF / public result feeds',
    missingData: unavailable
  },
  {
    id: 'conmebol-argentina-venezuela-2025-09-04',
    confederationId: 'conmebol',
    confederationName: '南美足联',
    stage: '南美区循环赛',
    dateLabel: '2025-09-04',
    homeTeam: 'Argentina',
    awayTeam: 'Venezuela',
    homeScore: 3,
    awayScore: 0,
    sourceLabel: 'CONMEBOL / public result feeds',
    events: [
      { minute: '39', team: 'Argentina', type: 'goal', player: 'Lionel Messi' },
      { minute: '76', team: 'Argentina', type: 'goal', player: 'Lautaro Martinez' },
      { minute: '80', team: 'Argentina', type: 'goal', player: 'Lionel Messi' }
    ],
    missingData: ['完整阵容', '比赛统计', '换人', '红黄牌', '球员赛后评分']
  },
  {
    id: 'conmebol-bolivia-brazil-2025-09-09',
    confederationId: 'conmebol',
    confederationName: '南美足联',
    stage: '南美区循环赛',
    dateLabel: '2025-09-09',
    homeTeam: 'Bolivia',
    awayTeam: 'Brazil',
    homeScore: 1,
    awayScore: 0,
    sourceLabel: 'CONMEBOL / public result feeds',
    missingData: unavailable
  },
  {
    id: 'ofc-new-zealand-new-caledonia-2025-03-24',
    confederationId: 'ofc',
    confederationName: '大洋洲足联',
    stage: '大洋洲区决赛',
    dateLabel: '2025-03-24',
    homeTeam: 'New Zealand',
    awayTeam: 'New Caledonia',
    homeScore: 3,
    awayScore: 0,
    resultNote: '新西兰锁定大洋洲直接晋级名额',
    sourceLabel: 'OFC / FIFA public result feeds',
    events: [
      { minute: '61', team: 'New Zealand', type: 'goal', player: 'Michael Boxall' },
      { minute: '66', team: 'New Zealand', type: 'goal', player: 'Kosta Barbarouses' },
      { minute: '80', team: 'New Zealand', type: 'goal', player: 'Elijah Just' }
    ],
    missingData: ['完整阵容', '比赛统计', '换人', '红黄牌', '球员赛后评分']
  },
  {
    id: 'uefa-scotland-denmark-2025-11-18',
    confederationId: 'uefa',
    confederationName: '欧足联',
    stage: '欧洲区小组赛',
    dateLabel: '2025-11-18',
    homeTeam: 'Scotland',
    awayTeam: 'Denmark',
    homeScore: 4,
    awayScore: 2,
    resultNote: '苏格兰锁定世界杯正赛资格',
    sourceLabel: 'UEFA match centre / public result feeds',
    events: [
      { minute: '3', team: 'Scotland', type: 'goal', player: 'Scott McTominay' },
      { minute: '57', team: 'Denmark', type: 'goal', player: 'Rasmus Hojlund' },
      { minute: '78', team: 'Scotland', type: 'goal', player: 'Lawrence Shankland' },
      { minute: '90+3', team: 'Scotland', type: 'goal', player: 'Kieran Tierney' },
      { minute: '90+8', team: 'Scotland', type: 'goal', player: 'Kenny McLean' }
    ],
    missingData: ['完整阵容', '比赛统计', '换人', '红黄牌', '球员赛后评分']
  },
  {
    id: 'uefa-norway-italy-2025-11-16',
    confederationId: 'uefa',
    confederationName: '欧足联',
    stage: '欧洲区小组赛',
    dateLabel: '2025-11-16',
    homeTeam: 'Italy',
    awayTeam: 'Norway',
    homeScore: 1,
    awayScore: 4,
    resultNote: '挪威锁定世界杯正赛资格',
    sourceLabel: 'UEFA match centre / public result feeds',
    missingData: unavailable
  }
];

function mergeQualifierMatches(
  manualMatches: QualifierMatchData[],
  importedMatches: QualifierMatchData[]
): QualifierMatchData[] {
  const seen = new Set<string>();

  return [...manualMatches, ...importedMatches].filter((match) => {
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

export const qualifierMatches = mergeQualifierMatches(manualQualifierMatches, apiFootballQualifierMatches);

export const qualifierMissingDataReport = qualifierMatches.map((match) => ({
  id: match.id,
  label: `${match.homeTeam} ${match.homeScore}-${match.awayScore} ${match.awayTeam}`,
  missingData: match.missingData
}));

export { apiFootballQualifierSourceReports };
