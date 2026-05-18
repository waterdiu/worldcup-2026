import type { AppCopy } from '../i18n/content';

export type PersonKind = 'coach' | 'player' | 'referee';
export type PersonDataTier = 'direct' | 'derived' | 'distilled';

export type PersonKpi = {
  id: string;
  label_zh: string;
  label_en: string;
  value: string;
  unit_zh?: string;
  unit_en?: string;
  tier: PersonDataTier;
  note_zh?: string;
  note_en?: string;
};

export type PersonSection =
  | {
      type: 'profile_facts';
      title_zh: string;
      title_en: string;
      rows: Array<{
        label_zh: string;
        label_en: string;
        value: string;
        tier: PersonDataTier;
        note_zh?: string;
        note_en?: string;
      }>;
    }
  | {
      type: 'style_tags';
      title_zh: string;
      title_en: string;
      status: 'available' | 'insufficient_sample';
      tags: Array<{ label_zh: string; label_en: string; tier: PersonDataTier }>;
      note_zh?: string;
      note_en?: string;
    }
  | {
      type: 'career_timeline';
      title_zh: string;
      title_en: string;
      rows: Array<{
        season: string;
        team_zh?: string;
        team_en?: string;
        competition_zh?: string;
        competition_en?: string;
        record?: string;
        tier: PersonDataTier;
      }>;
    }
  | {
      type: 'referee_bias';
      title_zh: string;
      title_en: string;
      rows: Array<{
        metric_zh: string;
        metric_en: string;
        value: string;
        league_avg: string;
        delta: string;
        tier: PersonDataTier;
      }>;
      note_zh?: string;
      note_en?: string;
    }
  | {
      type: 'recent_matches';
      title_zh: string;
      title_en: string;
      rows: Array<{
        match_id?: string | null;
        date: string;
        competition: string;
        home: string;
        away: string;
        score: string;
        location?: string | null;
        tier: PersonDataTier;
      }>;
    };

export type PersonProfile = {
  person_id: string;
  kind: PersonKind;
  display_name: string;
  name_zh: string;
  country_code: string;
  country_name_en: string;
  country_name_zh: string;
  primary_team_id?: string | null;
  primary_team_name?: string | null;
  role_title_en: string;
  role_title_zh: string;
  photo_url?: string | null;
  kpis: PersonKpi[];
  sections: PersonSection[];
  source_status: 'mock_demo' | 'available' | 'missing_source';
  source_urls: string[];
  updated_at: string;
};

export type PeopleIndexEntry = {
  person_id: string;
  kind: PersonKind;
  display_name: string;
  name_zh: string;
  country_code: string;
  country_name_en: string;
  country_name_zh: string;
  primary_team_id?: string | null;
  primary_team_name?: string | null;
  role_title_en: string;
  role_title_zh: string;
};

function isoNow() {
  return new Date().toISOString();
}

export const mockPeopleIndex: PeopleIndexEntry[] = [
  {
    person_id: 'didier-deschamps',
    kind: 'coach',
    display_name: 'Didier Deschamps',
    name_zh: '迪迪埃·德尚',
    country_code: 'FRA',
    country_name_en: 'France',
    country_name_zh: '法国',
    primary_team_id: 'france',
    primary_team_name: 'France',
    role_title_en: 'Head coach',
    role_title_zh: '主教练'
  },
  {
    person_id: 'kylian-mbappe',
    kind: 'player',
    display_name: 'Kylian Mbappé',
    name_zh: '基利安·姆巴佩',
    country_code: 'FRA',
    country_name_en: 'France',
    country_name_zh: '法国',
    primary_team_id: 'france',
    primary_team_name: 'France',
    role_title_en: 'Forward',
    role_title_zh: '前锋'
  },
  {
    person_id: 'szymon-marciniak',
    kind: 'referee',
    display_name: 'Szymon Marciniak',
    name_zh: '西蒙·马齐尼亚克',
    country_code: 'POL',
    country_name_en: 'Poland',
    country_name_zh: '波兰',
    primary_team_id: null,
    primary_team_name: null,
    role_title_en: 'Referee',
    role_title_zh: '主裁判'
  }
];

export const mockCoachProfiles: PersonProfile[] = [
  {
    person_id: 'didier-deschamps',
    kind: 'coach',
    display_name: 'Didier Deschamps',
    name_zh: '迪迪埃·德尚',
    country_code: 'FRA',
    country_name_en: 'France',
    country_name_zh: '法国',
    primary_team_id: 'france',
    primary_team_name: 'France',
    role_title_en: 'Head coach',
    role_title_zh: '主教练',
    photo_url: null,
    kpis: [
      {
        id: 'tenure',
        label_zh: '执教年限',
        label_en: 'Tenure',
        value: '12',
        unit_zh: '年',
        unit_en: 'yrs',
        tier: 'direct',
        note_zh: 'DEMO',
        note_en: 'DEMO'
      },
      {
        id: 'matches',
        label_zh: '执教场次',
        label_en: 'Matches',
        value: '150',
        unit_zh: '场',
        unit_en: '',
        tier: 'direct',
        note_zh: 'DEMO',
        note_en: 'DEMO'
      },
      {
        id: 'winrate',
        label_zh: '胜率',
        label_en: 'Win rate',
        value: '63.2',
        unit_zh: '%',
        unit_en: '%',
        tier: 'derived',
        note_zh: '由赛果派生',
        note_en: 'Derived from results'
      }
    ],
    sections: [
      {
        type: 'profile_facts',
        title_zh: '基础档案',
        title_en: 'Profile facts',
        rows: [
          { label_zh: '国籍', label_en: 'Nation', value: '法国', tier: 'direct', note_zh: 'DEMO', note_en: 'DEMO' },
          { label_zh: '执教球队', label_en: 'Team', value: '法国', tier: 'direct', note_zh: 'DEMO', note_en: 'DEMO' },
          { label_zh: '整体胜率', label_en: 'Win rate', value: '63.2%', tier: 'derived', note_zh: '赛果计算', note_en: 'Result-based' }
        ]
      },
      {
        type: 'career_timeline',
        title_zh: '执教履历',
        title_en: 'Coaching timeline',
        rows: [
          { season: '2012–2026', team_zh: '法国', team_en: 'France', competition_zh: '国家队', competition_en: 'National team', record: 'DEMO', tier: 'direct' },
          { season: '2009–2012', team_zh: '马赛', team_en: 'Marseille', competition_zh: '俱乐部', competition_en: 'Club', record: 'DEMO', tier: 'direct' }
        ]
      },
      {
        type: 'style_tags',
        title_zh: '战术风格蒸馏',
        title_en: 'Style distillation',
        status: 'insufficient_sample',
        tags: [],
        note_zh: '需要 ≥30 场事件样本（阵型/换人/事件）才能激活。',
        note_en: 'Requires ≥30 event-level matches (shape/subs/events).'
      }
    ],
    source_status: 'mock_demo',
    source_urls: ['DEMO'],
    updated_at: isoNow()
  }
];

export const mockPlayerProfiles: PersonProfile[] = [
  {
    person_id: 'kylian-mbappe',
    kind: 'player',
    display_name: 'Kylian Mbappé',
    name_zh: '基利安·姆巴佩',
    country_code: 'FRA',
    country_name_en: 'France',
    country_name_zh: '法国',
    primary_team_id: 'france',
    primary_team_name: 'France',
    role_title_en: 'Forward',
    role_title_zh: '前锋',
    photo_url: null,
    kpis: [
      {
        id: 'apps',
        label_zh: '国家队出场',
        label_en: 'Caps',
        value: '80',
        unit_zh: '场',
        unit_en: '',
        tier: 'direct',
        note_zh: 'DEMO',
        note_en: 'DEMO'
      },
      {
        id: 'goals',
        label_zh: '国家队进球',
        label_en: 'Goals',
        value: '45',
        unit_zh: '球',
        unit_en: '',
        tier: 'direct',
        note_zh: 'DEMO',
        note_en: 'DEMO'
      },
      {
        id: 'impact',
        label_zh: '缺阵影响',
        label_en: 'Absence impact',
        value: '-12',
        unit_zh: '%',
        unit_en: '%',
        tier: 'derived',
        note_zh: '由最近比赛模型派生',
        note_en: 'Derived from match model'
      }
    ],
    sections: [
      {
        type: 'profile_facts',
        title_zh: '基础档案',
        title_en: 'Profile facts',
        rows: [
          { label_zh: '位置', label_en: 'Position', value: '前锋', tier: 'direct', note_zh: 'DEMO', note_en: 'DEMO' },
          { label_zh: '俱乐部', label_en: 'Club', value: 'DEMO', tier: 'direct', note_zh: '待接入', note_en: 'TBD' },
          { label_zh: '每90分钟参与进球', label_en: 'G+A per 90', value: '0.91', tier: 'derived', note_zh: '需要出场时间', note_en: 'Needs minutes' }
        ]
      },
      {
        type: 'style_tags',
        title_zh: '风格画像',
        title_en: 'Style profile',
        status: 'insufficient_sample',
        tags: [
          { label_zh: '直线冲刺', label_en: 'Direct runs', tier: 'distilled' },
          { label_zh: '禁区终结', label_en: 'Box finishing', tier: 'distilled' }
        ],
        note_zh: 'DEMO：真实标签需要事件/射门位置数据蒸馏。',
        note_en: 'DEMO: tags require event-level data.'
      }
    ],
    source_status: 'mock_demo',
    source_urls: ['DEMO'],
    updated_at: isoNow()
  }
];

export const mockRefereeProfiles: PersonProfile[] = [
  {
    person_id: 'szymon-marciniak',
    kind: 'referee',
    display_name: 'Szymon Marciniak',
    name_zh: '西蒙·马齐尼亚克',
    country_code: 'POL',
    country_name_en: 'Poland',
    country_name_zh: '波兰',
    primary_team_id: null,
    primary_team_name: null,
    role_title_en: 'Referee',
    role_title_zh: '主裁判',
    photo_url: null,
    kpis: [
      {
        id: 'yellows',
        label_zh: '场均黄牌',
        label_en: 'Yellows / match',
        value: '4.6',
        tier: 'derived',
        note_zh: '对比赛事均值',
        note_en: 'vs competition avg'
      },
      {
        id: 'pens',
        label_zh: '点球/场',
        label_en: 'Penalties / match',
        value: '0.28',
        tier: 'derived',
        note_zh: '对比赛事均值',
        note_en: 'vs competition avg'
      }
    ],
    sections: [
      {
        type: 'profile_facts',
        title_zh: '基础档案',
        title_en: 'Profile facts',
        rows: [
          { label_zh: '国籍', label_en: 'Nation', value: '波兰', tier: 'direct', note_zh: 'DEMO', note_en: 'DEMO' },
          { label_zh: '级别', label_en: 'Level', value: 'FIFA', tier: 'direct', note_zh: 'DEMO', note_en: 'DEMO' }
        ]
      },
      {
        type: 'referee_bias',
        title_zh: '尺度偏差（对比赛事均值）',
        title_en: 'Bias vs competition average',
        rows: [
          { metric_zh: '黄牌/场', metric_en: 'Yellows', value: '4.6', league_avg: '3.9', delta: '+18%', tier: 'derived' },
          { metric_zh: '红牌/场', metric_en: 'Reds', value: '0.08', league_avg: '0.10', delta: '-20%', tier: 'derived' },
          { metric_zh: '点球/场', metric_en: 'Pens', value: '0.28', league_avg: '0.22', delta: '+27%', tier: 'derived' }
        ],
        note_zh: 'DEMO：真实值需要裁判指派 + 事件/纪律数据。',
        note_en: 'DEMO: requires assignments + event/discipline.'
      }
    ],
    source_status: 'mock_demo',
    source_urls: ['DEMO'],
    updated_at: isoNow()
  }
];

export function localizePersonLabel(entry: PeopleIndexEntry, locale: AppCopy['locale']) {
  return locale === 'zh' ? entry.name_zh : entry.display_name;
}

