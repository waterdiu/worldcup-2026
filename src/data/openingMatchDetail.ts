import type { Locale } from '../i18n/content';

type LocalizedText = Record<Locale, string>;

export interface OpeningLineupPlayer {
  number: number;
  role: LocalizedText;
  name: string;
  club: string;
  x: number;
  y: number;
}

export interface OpeningLineup {
  team: string;
  formation: string;
  players: OpeningLineupPlayer[];
}

export interface OpeningPrediction {
  probabilities: {
    homeWin: number;
    draw: number;
    awayWin: number;
  };
  predictedScore: string;
  totalGoals: LocalizedText;
  expectedGoals: string;
  summary: LocalizedText;
}

export interface OpeningStatRow {
  label: LocalizedText;
  home: string;
  away: string;
}

export interface OpeningMatchEvent {
  minute: string;
  type: LocalizedText;
  team: string;
  player: string;
  detail: LocalizedText;
}

export interface OpeningMatchDetailData {
  id: string;
  kickoffLocal: LocalizedText;
  venueDetail: LocalizedText;
  weather: LocalizedText;
  refereeCrew: {
    role: LocalizedText;
    name: string;
  }[];
  lineups: OpeningLineup[];
  prediction: OpeningPrediction;
  postMatchStats: OpeningStatRow[];
  matchEvents: OpeningMatchEvent[];
}

export const openingMatchDetail: OpeningMatchDetailData = {
  id: '1',
  kickoffLocal: {
    zh: '当地 2026年6月11日 15:00 / 北京时间 2026年6月12日 03:00',
    en: '11 Jun 2026 · 15:00 Mexico City / 12 Jun 2026 · 03:00 Beijing'
  },
  venueDetail: {
    zh: '墨西哥城阿兹特克球场（Estadio Azteca）',
    en: 'Estadio Azteca · Mexico City'
  },
  weather: {
    zh: '22°C · 微风 · 草皮偏快',
    en: '22°C · light wind · quick pitch'
  },
  refereeCrew: [
    { role: { zh: '主裁判', en: 'Referee' }, name: 'Sample Referee' },
    { role: { zh: '第一助理裁判', en: 'Assistant referee 1' }, name: 'Sample Assistant 1' },
    { role: { zh: '第二助理裁判', en: 'Assistant referee 2' }, name: 'Sample Assistant 2' },
    { role: { zh: 'VAR', en: 'VAR' }, name: 'Sample VAR' }
  ],
  lineups: [
    {
      team: 'Mexico',
      formation: '4-3-3',
      players: [
        { number: 1, role: { zh: '门将', en: 'GK' }, name: 'Luis Malagon', club: 'Club America', x: 8, y: 50 },
        { number: 2, role: { zh: '右后卫', en: 'RB' }, name: 'Jorge Sanchez', club: 'Cruz Azul', x: 22, y: 78 },
        { number: 3, role: { zh: '中卫', en: 'CB' }, name: 'Cesar Montes', club: 'Lokomotiv Moscow', x: 22, y: 58 },
        { number: 5, role: { zh: '中卫', en: 'CB' }, name: 'Johan Vasquez', club: 'Genoa', x: 22, y: 42 },
        { number: 23, role: { zh: '左后卫', en: 'LB' }, name: 'Jesus Gallardo', club: 'Toluca', x: 22, y: 22 },
        { number: 4, role: { zh: '后腰', en: 'DM' }, name: 'Edson Alvarez', club: 'West Ham United', x: 38, y: 50 },
        { number: 18, role: { zh: '中场', en: 'CM' }, name: 'Luis Chavez', club: 'Dynamo Moscow', x: 46, y: 66 },
        { number: 8, role: { zh: '中场', en: 'CM' }, name: 'Orbelin Pineda', club: 'AEK Athens', x: 46, y: 34 },
        { number: 22, role: { zh: '右边锋', en: 'RW' }, name: 'Hirving Lozano', club: 'San Diego FC', x: 62, y: 78 },
        { number: 11, role: { zh: '中锋', en: 'ST' }, name: 'Santiago Gimenez', club: 'AC Milan', x: 68, y: 50 },
        { number: 9, role: { zh: '左边锋', en: 'LW' }, name: 'Julian Quinones', club: 'Al Qadsiah', x: 62, y: 22 }
      ]
    },
    {
      team: 'South Africa',
      formation: '4-2-3-1',
      players: [
        { number: 1, role: { zh: '门将', en: 'GK' }, name: 'Ronwen Williams', club: 'Mamelodi Sundowns', x: 92, y: 50 },
        { number: 20, role: { zh: '右后卫', en: 'RB' }, name: 'Khuliso Mudau', club: 'Mamelodi Sundowns', x: 78, y: 22 },
        { number: 14, role: { zh: '中卫', en: 'CB' }, name: 'Mothobi Mvala', club: 'Mamelodi Sundowns', x: 78, y: 42 },
        { number: 5, role: { zh: '中卫', en: 'CB' }, name: 'Siyanda Xulu', club: 'SuperSport United', x: 78, y: 58 },
        { number: 6, role: { zh: '左后卫', en: 'LB' }, name: 'Aubrey Modiba', club: 'Mamelodi Sundowns', x: 78, y: 78 },
        { number: 4, role: { zh: '后腰', en: 'DM' }, name: 'Teboho Mokoena', club: 'Mamelodi Sundowns', x: 64, y: 42 },
        { number: 13, role: { zh: '后腰', en: 'DM' }, name: 'Sphephelo Sithole', club: 'Gil Vicente', x: 64, y: 58 },
        { number: 11, role: { zh: '右边锋', en: 'RW' }, name: 'Thapelo Morena', club: 'Mamelodi Sundowns', x: 52, y: 22 },
        { number: 10, role: { zh: '前腰', en: 'AM' }, name: 'Themba Zwane', club: 'Mamelodi Sundowns', x: 52, y: 50 },
        { number: 19, role: { zh: '左边锋', en: 'LW' }, name: 'Percy Tau', club: 'Qatar SC', x: 52, y: 78 },
        { number: 9, role: { zh: '中锋', en: 'ST' }, name: 'Lyle Foster', club: 'Burnley', x: 38, y: 50 }
      ]
    }
  ],
  prediction: {
    probabilities: {
      homeWin: 0.52,
      draw: 0.27,
      awayWin: 0.21
    },
    predictedScore: '2-1',
    totalGoals: {
      zh: '总进球 3 球',
      en: 'Total goals: 3'
    },
    expectedGoals: '1.72 : 0.94',
    summary: {
      zh: '墨西哥主场优势和边路推进更明显，预测会主动控球并制造更多射门；南非的主要机会来自快速反击和定位球。',
      en: 'Mexico project stronger through host advantage and wide progression, while South Africa’s best chances come from transitions and set pieces.'
    }
  },
  postMatchStats: [
    { label: { zh: '控球率', en: 'Possession' }, home: '57%', away: '43%' },
    { label: { zh: '射门', en: 'Shots' }, home: '15', away: '9' },
    { label: { zh: '射正', en: 'Shots on target' }, home: '6', away: '3' },
    { label: { zh: '角球', en: 'Corners' }, home: '6', away: '4' },
    { label: { zh: '犯规', en: 'Fouls' }, home: '12', away: '14' },
    { label: { zh: '传球成功率', en: 'Pass accuracy' }, home: '86%', away: '80%' },
    { label: { zh: 'xG', en: 'xG' }, home: '1.72', away: '0.94' }
  ],
  matchEvents: [
    {
      minute: '18’',
      type: { zh: '首开纪录', en: 'Opening goal' },
      team: 'Mexico',
      player: 'Santiago Gimenez',
      detail: { zh: '禁区中路抢点破门，墨西哥 1-0 领先。', en: 'Finishes from central box position. Mexico lead 1-0.' }
    },
    {
      minute: '39’',
      type: { zh: '黄牌', en: 'Yellow card' },
      team: 'South Africa',
      player: 'Teboho Mokoena',
      detail: { zh: '中场战术犯规，阻止墨西哥反击。', en: 'Tactical foul in midfield to stop a transition.' }
    },
    {
      minute: '54’',
      type: { zh: '扳平', en: 'Equaliser' },
      team: 'South Africa',
      player: 'Lyle Foster',
      detail: { zh: '反击中接直塞推射得分，比分变为 1-1。', en: 'Scores from a through ball in transition. 1-1.' }
    },
    {
      minute: '67’',
      type: { zh: '换人', en: 'Substitution' },
      team: 'Mexico',
      player: 'Raul Jimenez',
      detail: { zh: '替补登场加强禁区支点，换下 Julian Quinones。', en: 'Comes on to add box presence, replacing Julian Quinones.' }
    },
    {
      minute: '81’',
      type: { zh: '制胜球', en: 'Winning goal' },
      team: 'Mexico',
      player: 'Edson Alvarez',
      detail: { zh: '定位球二点球补射，墨西哥再次取得领先。', en: 'Finishes the second ball from a set piece to restore Mexico’s lead.' }
    }
  ]
};
