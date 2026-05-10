import type { ConfederationCardData } from '../types/tournament';

export const confederations: ConfederationCardData[] = [
  {
    id: 'afc',
    name: 'AFC',
    slotSummary: '8 个直接晋级名额 + 1 个附加赛晋级名额',
    statusLabel: '9 支球队已晋级',
    qualifiedTeams: [
      'Australia',
      'Iraq',
      'IR Iran',
      'Japan',
      'Jordan',
      'Korea Republic',
      'Qatar',
      'Saudi Arabia',
      'Uzbekistan'
    ],
    remainingPlaces: '亚洲区正赛席位已全部确定',
    featuredMatches: [
      '日本和韩国较早锁定正赛资格',
      '约旦和乌兹别克斯坦历史性晋级世界杯'
    ]
  },
  {
    id: 'caf',
    name: 'CAF',
    slotSummary: '9 个直接晋级名额 + 1 个附加赛晋级名额',
    statusLabel: '10 支球队已晋级',
    qualifiedTeams: [
      'Algeria',
      'Cabo Verde',
      'Congo DR',
      "Cote d'Ivoire",
      'Egypt',
      'Ghana',
      'Morocco',
      'Senegal',
      'South Africa',
      'Tunisia'
    ],
    remainingPlaces: '非洲区正赛席位已全部确定',
    featuredMatches: [
      '摩洛哥和塞内加尔领衔非洲正赛阵容',
      '南非凭借新一代阵容重返世界杯'
    ]
  },
  {
    id: 'concacaf',
    name: 'CONCACAF',
    slotSummary: '6 个直接晋级名额 + 2 个附加赛名额',
    statusLabel: '6 支球队已晋级',
    qualifiedTeams: ['Canada', 'Curacao', 'Haiti', 'Mexico', 'Panama', 'United States'],
    remainingPlaces: '直接晋级名额已全部确定',
    featuredMatches: [
      '加拿大、墨西哥、美国以东道主身份直接晋级',
      '库拉索和海地完成突破，晋级正赛'
    ]
  },
  {
    id: 'conmebol',
    name: 'CONMEBOL',
    slotSummary: '6 个直接晋级名额 + 1 个附加赛名额',
    statusLabel: '6 支球队已晋级',
    qualifiedTeams: ['Argentina', 'Brazil', 'Colombia', 'Ecuador', 'Paraguay', 'Uruguay'],
    remainingPlaces: '南美区直接晋级名额已全部确定',
    featuredMatches: [
      '阿根廷和巴西继续领跑南美赛道',
      '巴拉圭和厄瓜多尔锁定直接晋级资格'
    ]
  },
  {
    id: 'ofc',
    name: 'OFC',
    slotSummary: '1 个直接晋级名额 + 1 个附加赛名额',
    statusLabel: '1 支球队已晋级',
    qualifiedTeams: ['New Zealand'],
    remainingPlaces: '直接晋级名额已确定',
    featuredMatches: [
      '新西兰拿下大洋洲首次独立的世界杯直通名额'
    ]
  },
  {
    id: 'uefa',
    name: 'UEFA',
    slotSummary: '16 个直接晋级名额',
    statusLabel: '16 支球队已晋级',
    qualifiedTeams: [
      'Austria',
      'Belgium',
      'Bosnia and Herzegovina',
      'Croatia',
      'Czechia',
      'England',
      'France',
      'Germany',
      'Netherlands',
      'Norway',
      'Portugal',
      'Scotland',
      'Spain',
      'Sweden',
      'Switzerland',
      'Turkiye'
    ],
    remainingPlaces: '欧洲区 16 个正赛席位已全部确定',
    featuredMatches: [
      '西班牙、法国、德国领衔欧洲正赛阵容',
      '波黑和土耳其为欧洲赛区带来新鲜面孔'
    ]
  }
];
