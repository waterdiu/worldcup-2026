export type Locale = 'en' | 'zh';

export interface AppCopy {
  locale: Locale;
  nav: {
    top: string;
    qualifiers: string;
    cities: string;
    fixtures: string;
    format: string;
    groups: string;
    bracket: string;
    predict: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    hosts: string;
    status: string;
    openingMatch: string;
    finalLabel: string;
    primaryCta: string;
    secondaryCta: string;
  };
  snapshotLabels: [string, string, string, string];
  sections: {
    qualifiersEyebrow: string;
    qualifiersTitle: string;
    qualifiersDescription: string;
    citiesEyebrow: string;
    citiesTitle: string;
    citiesDescription: string;
    fixturesEyebrow: string;
    fixturesTitle: string;
    fixturesDescription: string;
    fixturesFilterGroup: string;
    fixturesFilterAll: string;
    fixturesSearchTeam: string;
    fixturesSearchPlaceholder: string;
    formatEyebrow: string;
    formatTitle: string;
    formatDescription: string;
    groupsEyebrow: string;
    groupsTitle: string;
    groupsDescription: string;
    knockoutEyebrow: string;
    knockoutTitle: string;
    knockoutDescription: string;
    predictionEyebrow: string;
    predictionTitle: string;
    predictionDescription: string;
  };
  labels: {
    qualifiedTeams: string;
    drawComplete: string;
    standingsShell: string;
    predictionReserved: string;
    matchPrediction: string;
    qualificationProbability: string;
    championPath: string;
    home: string;
    draw: string;
    away: string;
    groupPrefix: string;
    matchPrefix: string;
    topTwoTitle: string;
    topTwoDescription: string;
    bestThirdTitle: string;
    bestThirdDescription: string;
  };
}

export function localizePath(path: string, locale: Locale): string {
  if (locale === 'zh') return path;
  if (path === '/') return '/en';
  return `/en${path}`;
}

export const contentByLocale: Record<Locale, AppCopy> = {
  en: {
    locale: 'en',
    nav: {
      top: 'Top',
      qualifiers: 'Qualifiers',
      cities: 'Cities',
      fixtures: 'Fixtures',
      format: 'Format',
      groups: 'Groups',
      bracket: 'Bracket',
      predict: 'Predict'
    },
    hero: {
      eyebrow: 'FIFA World Cup 2026 Special',
      title: 'WORLD CUP 2026',
      hosts: 'Canada, Mexico, United States',
      status: 'Official draw completed. Tournament opens on 11 June 2026.',
      openingMatch: 'Opening match: Estadio Azteca, Mexico City',
      finalLabel: 'Final',
      primaryCta: 'View Qualifiers',
      secondaryCta: 'Stats'
    },
    snapshotLabels: ['Teams', 'Groups', 'Matches', 'Host Cities'],
    sections: {
      qualifiersEyebrow: 'Qualification',
      qualifiersTitle: 'Road to 2026',
      qualifiersDescription:
        'This view follows official qualification progress and highlights the teams that have already locked their place in the finals.',
      citiesEyebrow: 'Host Cities',
      citiesTitle: '16 Cities Across 3 Nations',
      citiesDescription:
        'The 2026 tournament stretches across North America, giving the page a natural venue layer for future travel, routing, and match prediction context.',
      fixturesEyebrow: 'Opening Fixtures',
      fixturesTitle: 'Opening Round Fixtures',
      fixturesDescription:
        'These are the first two group-stage matches for every group, giving the page a real match-by-match layer before live results arrive.',
      fixturesFilterGroup: 'Filter by Group',
      fixturesFilterAll: 'All Groups',
      fixturesSearchTeam: 'Search Team',
      fixturesSearchPlaceholder: 'Type a team name',
      formatEyebrow: 'Tournament Format',
      formatTitle: 'How the Finals Work',
      formatDescription:
        '48 teams are divided into 12 groups. The top two in every group and the best eight third-placed teams advance into the Round of 32.',
      groupsEyebrow: 'Group Stage',
      groupsTitle: 'Group Stage Outlook',
      groupsDescription:
        'The finals draw is complete. Standings remain at zero until group-stage matches begin.',
      knockoutEyebrow: 'Knockout',
      knockoutTitle: 'Knockout Bracket',
      knockoutDescription:
        'The route from the Round of 32 to the final is laid out as a complete tournament path.',
      predictionEyebrow: 'Model Display',
      predictionTitle: 'Prediction Display',
      predictionDescription:
        'Prediction areas show the display structure for probabilities, form, and simulation outputs without making live model claims.'
    },
    labels: {
      qualifiedTeams: 'Qualified teams',
      drawComplete: 'Draw complete',
      standingsShell: 'Standings start at zero before the tournament kicks off',
      predictionReserved: 'Model-ready display',
      matchPrediction: 'Match Prediction',
      qualificationProbability: 'Qualification Probability',
      championPath: 'Champion Path Simulation',
      home: 'Home',
      draw: 'Draw',
      away: 'Away',
      groupPrefix: 'Group',
      matchPrefix: 'Match',
      topTwoTitle: 'Top two advance',
      topTwoDescription: 'Each group sends its first and second place finishers forward.',
      bestThirdTitle: 'Best eight third-placed teams',
      bestThirdDescription: 'The expanded finals reward strong third-place finishes too.'
    }
  },
  zh: {
    locale: 'zh',
    nav: {
      top: '顶部',
      qualifiers: '预选赛',
      cities: '主办城市',
      fixtures: '比赛',
      format: '赛制',
      groups: '小组赛',
      bracket: '淘汰赛',
      predict: '预测展示'
    },
    hero: {
      eyebrow: '2026 世界杯专题页',
      title: '2026 世界杯',
      hosts: '加拿大、墨西哥、美国',
      status: '世界杯抽签已完成，赛事将于 2026 年 6 月 11 日开幕。',
      openingMatch: '揭幕战：墨西哥城阿兹特克球场',
      finalLabel: '决赛',
      primaryCta: '进入预选赛中心',
      secondaryCta: '进入统计'
    },
    snapshotLabels: ['参赛队', '小组', '比赛', '主办城市'],
    sections: {
      qualifiersEyebrow: '预选赛',
      qualifiersTitle: '通往 2026',
      qualifiersDescription: '这里展示官方已确认的出线进度，以及已经锁定世界杯席位的球队。',
      citiesEyebrow: '主办城市',
      citiesTitle: '3 国 16 城',
      citiesDescription: '2026 世界杯横跨北美三国，主办城市层提供场馆、地理位置和比赛浏览入口。',
      fixturesEyebrow: '首轮比赛',
      fixturesTitle: '首轮对决一览',
      fixturesDescription: '这里展示每个小组的前两场首轮比赛，让页面在开赛前就具备按比赛浏览的能力。',
      fixturesFilterGroup: '按小组筛选',
      fixturesFilterAll: '全部小组',
      fixturesSearchTeam: '搜索球队',
      fixturesSearchPlaceholder: '输入球队名称',
      formatEyebrow: '赛制',
      formatTitle: '正赛怎么踢',
      formatDescription: '48 支球队分成 12 个小组，每组前两名和成绩最好的 8 个小组第三晋级 32 强。',
      groupsEyebrow: '小组赛',
      groupsTitle: '小组赛展望',
      groupsDescription: '抽签结果已经确定，比赛开始前各组积分均保持为 0。',
      knockoutEyebrow: '淘汰赛',
      knockoutTitle: '淘汰赛路径',
      knockoutDescription: '从 32 强到决赛的完整路径已经铺开，适合按轮次浏览晋级路线。',
      predictionEyebrow: '预测展示',
      predictionTitle: '预测展示区',
      predictionDescription: '这里展示概率、状态和模拟结果的页面结构，不提供真实预测结论。'
    },
    labels: {
      qualifiedTeams: '已出线球队',
      drawComplete: '抽签完成',
      standingsShell: '开赛前积分均为 0',
      predictionReserved: '模型展示位',
      matchPrediction: '比赛预测',
      qualificationProbability: '出线概率',
      championPath: '冠军路径模拟',
      home: '主胜',
      draw: '平局',
      away: '客胜',
      groupPrefix: '小组',
      matchPrefix: '比赛',
      topTwoTitle: '每组前二晋级',
      topTwoDescription: '每个小组的第一名和第二名直接进入淘汰赛。',
      bestThirdTitle: '8 个成绩最好的小组第三',
      bestThirdDescription: '扩军后的世界杯也给表现最好的小组第三留出了晋级空间。'
    }
  }
};

export function getLocaleFromPathname(pathname: string): Locale {
  return pathname.startsWith('/en') ? 'en' : 'zh';
}
