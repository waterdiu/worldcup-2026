export interface TeamProfileData {
  team: string;
  worldRanking: number;
  participations: number;
  bestFinish?: string;
  profileSummary?: string;
  historySummary?: string;
  overallWorldCupRecord?: string;
  coach?: string;
  coachAge?: number;
  coachSummary?: string;
  squadStatus?: {
    label: string;
    note: string;
    sourceNote?: string;
  };
  players?: {
    name: string;
    position: string;
    club: string;
    age: number;
    status: string;
    summary: string;
  }[];
  historyRecords?: {
    title: string;
    result: string;
    description: string;
  }[];
  worldCupHistory?: {
    year: number;
    tournament: string;
    stage: string;
    position: string;
    record: string;
    goals: string;
    matches: string[];
  }[];
  qualificationMatches?: {
    title: string;
    result: string;
    description: string;
  }[];
  recentResults?: {
    title: string;
    result: string;
    description: string;
  }[];
}

export const teamProfiles: TeamProfileData[] = [
  { team: 'Algeria', worldRanking: 28, participations: 4 },
  { team: 'Argentina', worldRanking: 3, participations: 18 },
  { team: 'Australia', worldRanking: 27, participations: 6 },
  { team: 'Austria', worldRanking: 24, participations: 7 },
  { team: 'Belgium', worldRanking: 9, participations: 13 },
  { team: 'Bosnia and Herzegovina', worldRanking: 65, participations: 1 },
  { team: 'Brazil', worldRanking: 6, participations: 22 },
  { team: 'Cabo Verde', worldRanking: 69, participations: 0 },
  { team: 'Canada', worldRanking: 30, participations: 2 },
  { team: 'Colombia', worldRanking: 13, participations: 6 },
  { team: 'Congo DR', worldRanking: 46, participations: 0 },
  { team: "Cote d'Ivoire", worldRanking: 34, participations: 3 },
  { team: 'Croatia', worldRanking: 11, participations: 6 },
  { team: 'Curacao', worldRanking: 82, participations: 0 },
  { team: 'Czechia', worldRanking: 41, participations: 1 },
  { team: 'Ecuador', worldRanking: 23, participations: 4 },
  { team: 'Egypt', worldRanking: 29, participations: 3 },
  { team: 'England', worldRanking: 4, participations: 16 },
  {
    team: 'France',
    worldRanking: 1,
    participations: 16,
    coach: 'Didier Deschamps',
    coachAge: 57
  },
  { team: 'Germany', worldRanking: 10, participations: 10 },
  { team: 'Ghana', worldRanking: 74, participations: 4 },
  { team: 'Haiti', worldRanking: 83, participations: 1 },
  { team: 'IR Iran', worldRanking: 21, participations: 6 },
  { team: 'Iraq', worldRanking: 57, participations: 1 },
  { team: 'Japan', worldRanking: 18, participations: 7 },
  { team: 'Jordan', worldRanking: 63, participations: 0 },
  { team: 'Korea Republic', worldRanking: 25, participations: 10 },
  {
    team: 'Mexico',
    worldRanking: 15,
    participations: 18,
    bestFinish: '八强（1970、1986）',
    profileSummary: '墨西哥是 2026 世界杯联合东道主之一，主场氛围、比赛经验和中北美赛区适应能力会是这支球队的重要底色。',
    historySummary: '墨西哥长期保持世界杯正赛竞争力，队史多次从小组出线，历史最佳成绩是在本土举办的 1970 年和 1986 年世界杯进入八强。',
    overallWorldCupRecord: '总战绩：60 场 17 胜 15 平 28 负，进 62 球失 101 球',
    coach: 'Javier Aguirre',
    coachAge: 67,
    coachSummary: '经验丰富，长期执教俱乐部和国家队，适合带领球队在主场压力下保持稳定性和比赛纪律。',
    squadStatus: {
      label: '官方最终名单待公布',
      note: 'FIFA 计划于 2026 年 6 月 2 日确认 48 支球队的官方 26 人最终名单。此处先展示球员资料展示位，不把候选名单写成最终名单。',
      sourceNote: '最终名单确认前，国家队可以公布候选或训练名单，但只有 FIFA 确认后才算官方参赛名单。'
    },
    players: [
      {
        name: 'Santiago Gimenez',
        position: '前锋',
        club: 'AC Milan',
        age: 25,
        status: '名单状态：待官方最终确认',
        summary: '禁区终结能力和支点能力是墨西哥锋线的重要观察点，适合承担小组赛中前场压迫和抢点任务。'
      },
      {
        name: 'Edson Alvarez',
        position: '中场',
        club: 'West Ham United',
        age: 28,
        status: '名单状态：待官方最终确认',
        summary: '防守覆盖、定位球和中路对抗价值突出，是墨西哥攻防转换里最关键的平衡点之一。'
      },
      {
        name: 'Hirving Lozano',
        position: '边锋',
        club: 'San Diego FC',
        age: 30,
        status: '名单状态：待官方最终确认',
        summary: '速度、反击推进和边路一对一仍是墨西哥打开空间的重要手段，尤其适合主场高节奏比赛。'
      },
      {
        name: 'Raul Jimenez',
        position: '前锋',
        club: 'Fulham',
        age: 35,
        status: '名单状态：待官方最终确认',
        summary: '大赛经验、背身处理和门前跑位能补足年轻锋线的稳定性，是替补或轮换方案的重要参考。'
      },
      {
        name: 'Johan Vasquez',
        position: '后卫',
        club: 'Genoa',
        age: 27,
        status: '名单状态：待官方最终确认',
        summary: '左脚中卫属性和欧洲联赛对抗经验，能帮助墨西哥在面对高空球和转换进攻时保持防线弹性。'
      },
      {
        name: 'Luis Malagon',
        position: '门将',
        club: 'Club America',
        age: 29,
        status: '名单状态：待官方最终确认',
        summary: '门线反应和国内联赛稳定性让他成为门将竞争的重要人选，最终顺位需等待官方名单确认。'
      }
    ],
    historyRecords: [
      {
        title: '1970 本土世界杯',
        result: '八强',
        description: '墨西哥第一次在本土举办世界杯，并打进八强，建立了球队在世界杯舞台上的代表性记忆。'
      },
      {
        title: '1986 本土世界杯',
        result: '八强',
        description: '再次作为东道主参赛，墨西哥连续利用主场氛围和熟悉环境打出高竞争力，追平队史最佳成绩。'
      },
      {
        title: '1994-2018 世界杯周期',
        result: '连续多届小组出线',
        description: '墨西哥长期保持稳定的小组赛竞争力，多次进入淘汰赛，球队标签是下限稳定、节奏强、比赛经验足。'
      },
      {
        title: '2022 卡塔尔世界杯',
        result: '小组赛出局',
        description: '2022 年未能从小组突围，终结此前连续晋级淘汰赛的势头，也让 2026 主场周期的更新压力更明确。'
      }
    ],
    worldCupHistory: [
      {
        year: 1930,
        tournament: '1930 乌拉圭世界杯',
        stage: '小组赛',
        position: '第 13 名',
        record: '0 胜 0 平 3 负',
        goals: '进 4 失 13',
        matches: ['墨西哥 1-4 法国', '墨西哥 0-3 智利', '墨西哥 3-6 阿根廷']
      },
      {
        year: 1950,
        tournament: '1950 巴西世界杯',
        stage: '小组赛',
        position: '第 12 名',
        record: '0 胜 0 平 3 负',
        goals: '进 2 失 10',
        matches: ['墨西哥 0-4 巴西', '墨西哥 1-4 南斯拉夫', '墨西哥 1-2 瑞士']
      },
      {
        year: 1954,
        tournament: '1954 瑞士世界杯',
        stage: '小组赛',
        position: '第 13 名',
        record: '0 胜 0 平 2 负',
        goals: '进 2 失 8',
        matches: ['墨西哥 0-5 巴西', '墨西哥 2-3 法国']
      },
      {
        year: 1958,
        tournament: '1958 瑞典世界杯',
        stage: '小组赛',
        position: '第 16 名',
        record: '0 胜 1 平 2 负',
        goals: '进 1 失 8',
        matches: ['墨西哥 0-3 瑞典', '墨西哥 1-1 威尔士', '墨西哥 0-4 匈牙利']
      },
      {
        year: 1962,
        tournament: '1962 智利世界杯',
        stage: '小组赛',
        position: '第 11 名',
        record: '1 胜 0 平 2 负',
        goals: '进 3 失 4',
        matches: ['墨西哥 0-2 巴西', '墨西哥 0-1 西班牙', '墨西哥 3-1 捷克斯洛伐克']
      },
      {
        year: 1966,
        tournament: '1966 英格兰世界杯',
        stage: '小组赛',
        position: '第 12 名',
        record: '0 胜 2 平 1 负',
        goals: '进 1 失 3',
        matches: ['墨西哥 1-1 法国', '墨西哥 0-2 英格兰', '墨西哥 0-0 乌拉圭']
      },
      {
        year: 1970,
        tournament: '1970 墨西哥世界杯',
        stage: '八强',
        position: '第 6 名',
        record: '2 胜 1 平 1 负',
        goals: '进 6 失 4',
        matches: ['墨西哥 0-0 苏联', '墨西哥 4-0 萨尔瓦多', '墨西哥 1-0 比利时', '墨西哥 1-4 意大利']
      },
      {
        year: 1978,
        tournament: '1978 阿根廷世界杯',
        stage: '小组赛',
        position: '第 16 名',
        record: '0 胜 0 平 3 负',
        goals: '进 2 失 12',
        matches: ['墨西哥 1-3 突尼斯', '墨西哥 0-6 西德', '墨西哥 1-3 波兰']
      },
      {
        year: 1986,
        tournament: '1986 墨西哥世界杯',
        stage: '八强',
        position: '第 6 名',
        record: '3 胜 2 平 0 负',
        goals: '进 6 失 2',
        matches: ['墨西哥 2-1 比利时', '墨西哥 1-1 巴拉圭', '墨西哥 1-0 伊拉克', '墨西哥 2-0 保加利亚', '墨西哥 0-0 西德（点球 1-4）']
      },
      {
        year: 1994,
        tournament: '1994 美国世界杯',
        stage: '16 强',
        position: '第 13 名',
        record: '1 胜 2 平 1 负',
        goals: '进 4 失 4',
        matches: ['墨西哥 0-1 挪威', '墨西哥 2-1 爱尔兰', '墨西哥 1-1 意大利', '墨西哥 1-1 保加利亚（点球 1-3）']
      },
      {
        year: 1998,
        tournament: '1998 法国世界杯',
        stage: '16 强',
        position: '第 13 名',
        record: '1 胜 2 平 1 负',
        goals: '进 8 失 7',
        matches: ['墨西哥 3-1 韩国', '墨西哥 2-2 比利时', '墨西哥 2-2 荷兰', '墨西哥 1-2 德国']
      },
      {
        year: 2002,
        tournament: '2002 韩日世界杯',
        stage: '16 强',
        position: '第 11 名',
        record: '2 胜 1 平 1 负',
        goals: '进 4 失 4',
        matches: ['墨西哥 1-0 克罗地亚', '墨西哥 2-1 厄瓜多尔', '墨西哥 1-1 意大利', '墨西哥 0-2 美国']
      },
      {
        year: 2006,
        tournament: '2006 德国世界杯',
        stage: '16 强',
        position: '第 15 名',
        record: '1 胜 1 平 2 负',
        goals: '进 5 失 5',
        matches: ['墨西哥 3-1 伊朗', '墨西哥 0-0 安哥拉', '墨西哥 1-2 葡萄牙', '墨西哥 1-2 阿根廷（加时）']
      },
      {
        year: 2010,
        tournament: '2010 南非世界杯',
        stage: '16 强',
        position: '第 14 名',
        record: '1 胜 1 平 2 负',
        goals: '进 4 失 5',
        matches: ['墨西哥 1-1 南非', '墨西哥 2-0 法国', '墨西哥 0-1 乌拉圭', '墨西哥 1-3 阿根廷']
      },
      {
        year: 2014,
        tournament: '2014 巴西世界杯',
        stage: '16 强',
        position: '第 10 名',
        record: '2 胜 1 平 1 负',
        goals: '进 5 失 3',
        matches: ['墨西哥 1-0 喀麦隆', '墨西哥 0-0 巴西', '墨西哥 3-1 克罗地亚', '墨西哥 1-2 荷兰']
      },
      {
        year: 2018,
        tournament: '2018 俄罗斯世界杯',
        stage: '16 强',
        position: '第 12 名',
        record: '2 胜 0 平 2 负',
        goals: '进 3 失 6',
        matches: ['墨西哥 1-0 德国', '墨西哥 2-1 韩国', '墨西哥 0-3 瑞典', '墨西哥 0-2 巴西']
      },
      {
        year: 2022,
        tournament: '2022 卡塔尔世界杯',
        stage: '小组赛',
        position: '第 22 名',
        record: '1 胜 1 平 1 负',
        goals: '进 2 失 3',
        matches: ['墨西哥 0-0 波兰', '墨西哥 0-2 阿根廷', '墨西哥 2-1 沙特阿拉伯']
      }
    ],
    qualificationMatches: [
      {
        title: '东道主资格确认',
        result: '自动晋级',
        description: '作为联合东道主，墨西哥没有参加中北美区预选赛，直接进入 2026 世界杯正赛。'
      },
      {
        title: '正赛分组落位',
        result: 'A 组',
        description: '墨西哥进入 A 组，将在小组赛依次面对南非、韩国和捷克。'
      }
    ],
    recentResults: [
      {
        title: '2025 美金杯决赛',
        result: '美国 1-2 墨西哥',
        description: '墨西哥在决赛中逆转美国夺冠，Raul Jimenez 扳平、Edson Alvarez 打进制胜球，展示了定位球和关键球能力。'
      },
      {
        title: '2025 美金杯半决赛',
        result: '墨西哥 1-0 洪都拉斯',
        description: '淘汰赛阶段以小比分推进，体现出球队在杯赛淘汰制里的控场、抗压和防守韧性。'
      },
      {
        title: '2025 美金杯四分之一决赛',
        result: '墨西哥 2-0 沙特阿拉伯',
        description: '面对受邀球队保持零封，并通过边路推进和定位球威胁拿到晋级主动权。'
      },
      {
        title: '2025 美金杯小组赛',
        result: '墨西哥 0-0 哥斯达黎加',
        description: '小组赛末轮零封对手，反映出球队防守结构稳定，但阵地战效率仍是世界杯前需要继续提升的方向。'
      }
    ]
  },
  { team: 'Morocco', worldRanking: 8, participations: 6 },
  { team: 'Netherlands', worldRanking: 7, participations: 10 },
  { team: 'New Zealand', worldRanking: 85, participations: 2 },
  { team: 'Norway', worldRanking: 31, participations: 3 },
  { team: 'Panama', worldRanking: 33, participations: 1 },
  { team: 'Paraguay', worldRanking: 40, participations: 8 },
  { team: 'Portugal', worldRanking: 5, participations: 8 },
  { team: 'Qatar', worldRanking: 55, participations: 1 },
  { team: 'Saudi Arabia', worldRanking: 61, participations: 6 },
  { team: 'Scotland', worldRanking: 43, participations: 7 },
  { team: 'Senegal', worldRanking: 14, participations: 3 },
  { team: 'South Africa', worldRanking: 60, participations: 3 },
  { team: 'Spain', worldRanking: 2, participations: 16 },
  { team: 'Sweden', worldRanking: 38, participations: 12 },
  { team: 'Switzerland', worldRanking: 19, participations: 12 },
  { team: 'Tunisia', worldRanking: 44, participations: 6 },
  { team: 'Turkiye', worldRanking: 22, participations: 2 },
  { team: 'Uruguay', worldRanking: 17, participations: 14 },
  { team: 'United States', worldRanking: 16, participations: 11 },
  { team: 'Uzbekistan', worldRanking: 50, participations: 0 }
];

export function findTeamProfile(team: string): TeamProfileData | undefined {
  return teamProfiles.find((profile) => profile.team === team);
}
