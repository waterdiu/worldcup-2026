import type { QualifierDetailData } from '../types/tournament';

export const qualifierDetails: QualifierDetailData[] = [
  {
    confederationId: 'afc',
    title: '亚足联预选赛',
    stageSummary: [
      '资格赛分为多阶段推进，最终由第三阶段直接决出大部分世界杯名额。',
      '亚足联拿到 8 个直接晋级名额，外加 1 个洲际附加赛席位。',
      '已锁定正赛资格的球队包括日本、韩国、伊朗、澳大利亚、沙特、卡塔尔、约旦和乌兹别克斯坦。'
    ],
    resultsSummary: [
      '亚洲区正赛队伍已经整理为独立视图，方便快速确认本届入围球队。',
      '页面按洲别组织资格路径、阶段说明和晋级摘要，适合发布前浏览。'
    ],
    routes: [
      { team: 'Japan', pathLabel: '第三阶段直通', note: '在亚洲区强队集团中率先锁定世界杯席位。' },
      { team: 'Korea Republic', pathLabel: '第三阶段直通', note: '稳定保持出线节奏，提前确保正赛资格。' },
      { team: 'IR Iran', pathLabel: '第三阶段直通', note: '延续强势表现，持续处在直通区。' },
      { team: 'Australia', pathLabel: '第三阶段直通', note: '在关键阶段完成抢分，拿到直接晋级资格。' },
      { team: 'Saudi Arabia', pathLabel: '第三阶段直通', note: '通过稳定积分表现锁定世界杯门票。' },
      { team: 'Qatar', pathLabel: '第三阶段直通', note: '延续上届后积累的竞争力，成功晋级。' },
      { team: 'Iraq', pathLabel: '附加赛晋级', note: '通过附加赛路径进入本届正赛阵容。' },
      { team: 'Jordan', pathLabel: '第三阶段直通', note: '历史性完成突破，首次以扩军后格局锁定资格。' },
      { team: 'Uzbekistan', pathLabel: '第三阶段直通', note: '在亚洲预选赛中完成里程碑式晋级。' }
    ]
  },
  {
    confederationId: 'caf',
    title: '非足联预选赛',
    stageSummary: [
      '非洲区分组竞争激烈，9 个直接晋级名额和 1 个附加赛席位让每轮结果都极具含金量。',
      '摩洛哥、塞内加尔、埃及、阿尔及利亚等队组成了本届非洲区已确认晋级阵容。',
      '刚果（金）拿到附加赛晋级席位，使非洲区最终形成 10 支正赛球队。'
    ],
    resultsSummary: [
      '非洲区以晋级球队和路径摘要为核心，直接服务正赛参赛队浏览。',
      '本页聚焦发布版需要的资格信息，不展示未确认或未整理的比分明细。'
    ],
    routes: [
      { team: 'Morocco', pathLabel: '小组头名直通', note: '保持稳定强势输出，率先锁定非洲区名额。' },
      { team: 'Senegal', pathLabel: '小组头名直通', note: '依靠成熟阵容和稳定发挥进入正赛。' },
      { team: 'Egypt', pathLabel: '小组头名直通', note: '在关键轮次保持领先，最终锁定出线。' },
      { team: 'Algeria', pathLabel: '小组头名直通', note: '延续高竞争力，稳住小组头名位置。' },
      { team: 'South Africa', pathLabel: '小组头名直通', note: '凭借新一代阵容完成重要回归。' },
      { team: 'Ghana', pathLabel: '小组头名直通', note: '在漫长赛程中保持竞争力，拿下世界杯席位。' },
      { team: 'Tunisia', pathLabel: '小组头名直通', note: '延续非洲区稳定输出，再次闯入世界杯。' },
      { team: "Cote d'Ivoire", pathLabel: '小组头名直通', note: '利用阵容深度完成突围。' },
      { team: 'Congo DR', pathLabel: '附加赛晋级', note: '通过附加赛路线拿到非洲区额外正赛席位。' },
      { team: 'Cabo Verde', pathLabel: '小组头名直通', note: '打出突破性周期，进入世界杯舞台。' }
    ]
  },
  {
    confederationId: 'concacaf',
    title: '中北美及加勒比地区足联预选赛',
    stageSummary: [
      '中北美区拥有 6 个直接晋级席位和 2 个附加赛席位，其中加拿大、墨西哥、美国因东道主身份直接入围。',
      '除东道主外，库拉索、海地和巴拿马也已确认拿到正赛资格。',
      '本页把东道主席位和预选赛直通路径分开展示，便于理解中北美区名额来源。'
    ],
    resultsSummary: [
      '中北美区同时包含主办国直通和预选赛晋级，发布页按路径类型说明。',
      '库拉索、海地和巴拿马作为预选赛晋级球队独立列出，避免与东道主席位混淆。'
    ],
    routes: [
      { team: 'Canada', pathLabel: '东道主席位', note: '作为 2026 世界杯主办国之一，直接获得正赛资格。' },
      { team: 'Mexico', pathLabel: '东道主席位', note: '作为 2026 世界杯主办国之一，直接获得正赛资格。' },
      { team: 'United States', pathLabel: '东道主席位', note: '作为 2026 世界杯主办国之一，直接获得正赛资格。' },
      { team: 'Panama', pathLabel: '预选赛直通', note: '在中北美区竞争中稳住位置，锁定正赛席位。' },
      { team: 'Curacao', pathLabel: '预选赛直通', note: '打出突破性周期，成功晋级世界杯。' },
      { team: 'Haiti', pathLabel: '预选赛直通', note: '在扩军背景下把握住机会，进入正赛。' }
    ]
  },
  {
    confederationId: 'conmebol',
    title: '南美足联预选赛',
    stageSummary: [
      '南美区继续采用高强度双循环体系，6 个直接晋级名额加 1 个附加赛名额。',
      '阿根廷、巴西、乌拉圭、哥伦比亚、厄瓜多尔、巴拉圭已确认直接晋级。',
      '南美区以联赛表式资格赛推进，发布页保留最终直接晋级阵容。'
    ],
    resultsSummary: [
      '南美区晋级信息按联赛积分直通路径展示，便于快速理解名额来源。',
      '本页只呈现已确认进入正赛的球队，不展示未进入正赛的排名细节。'
    ],
    routes: [
      { team: 'Argentina', pathLabel: '联赛积分直通', note: '持续保持在南美区前列，提前确保正赛席位。' },
      { team: 'Brazil', pathLabel: '联赛积分直通', note: '在双循环赛制下逐步锁定世界杯资格。' },
      { team: 'Uruguay', pathLabel: '联赛积分直通', note: '凭借稳定表现保持在直接晋级区。' },
      { team: 'Colombia', pathLabel: '联赛积分直通', note: '关键轮次持续拿分，最终锁定资格。' },
      { team: 'Ecuador', pathLabel: '联赛积分直通', note: '在赛程中段建立优势并守住名额。' },
      { team: 'Paraguay', pathLabel: '联赛积分直通', note: '通过关键对决积累分数，拿到世界杯门票。' }
    ]
  },
  {
    confederationId: 'ofc',
    title: '大洋洲足联预选赛',
    stageSummary: [
      '大洋洲本届首次拥有独立的直接晋级名额，赛区意义明显提升。',
      '新西兰已经锁定大洋洲直接席位。',
      '本页突出大洋洲直通资格的变化，以及新西兰的正赛路径。'
    ],
    resultsSummary: [
      '大洋洲区以最终晋级结果为主，页面保持轻量清晰。',
      '新西兰作为赛区直通球队独立展示，便于和其他洲别对照。'
    ],
    routes: [
      { team: 'New Zealand', pathLabel: '大洋洲直通', note: '拿下赛区首次独立世界杯直通名额。' }
    ]
  },
  {
    confederationId: 'uefa',
    title: '欧足联预选赛',
    stageSummary: [
      '欧洲区拥有 16 个正赛席位，本页按已进入小组赛的球队整理。',
      '英格兰、法国、德国、西班牙、葡萄牙、荷兰、克罗地亚、瑞士等球队组成欧洲阵容。',
      '奥地利、挪威、苏格兰、瑞典和土耳其等队也已纳入正赛小组。'
    ],
    resultsSummary: [
      '欧洲区发布页聚焦正赛球队、晋级路径和小组归属。',
      '所有欧洲参赛队与小组赛 48 队名单保持一致。'
    ],
    routes: [
      { team: 'England', pathLabel: '小组直通', note: '在欧洲区资格赛中稳定拿分，率先晋级。' },
      { team: 'France', pathLabel: '小组直通', note: '保持强队节奏，顺利锁定世界杯资格。' },
      { team: 'Germany', pathLabel: '小组直通', note: '以稳定输出进入已确认晋级阵容。' },
      { team: 'Spain', pathLabel: '小组直通', note: '凭借持续优势完成晋级。' },
      { team: 'Portugal', pathLabel: '小组直通', note: '在欧洲区保持竞争力，锁定席位。' },
      { team: 'Netherlands', pathLabel: '小组直通', note: '守住小组优势位置，拿下世界杯资格。' },
      { team: 'Croatia', pathLabel: '小组直通', note: '延续成熟体系，继续站上世界杯舞台。' },
      { team: 'Switzerland', pathLabel: '小组直通', note: '稳健拿分，完成晋级目标。' },
      { team: 'Czechia', pathLabel: '小组直通', note: '抓住关键比赛，锁定世界杯席位。' },
      { team: 'Austria', pathLabel: '小组直通', note: '以稳定表现进入欧洲区正赛名单。' },
      { team: 'Belgium', pathLabel: '小组直通', note: '延续核心竞争力，锁定世界杯席位。' },
      { team: 'Norway', pathLabel: '小组直通', note: '凭借进攻端表现重返世界杯舞台。' },
      { team: 'Scotland', pathLabel: '小组直通', note: '守住关键积分，进入正赛小组。' },
      { team: 'Sweden', pathLabel: '小组直通', note: '通过欧洲区竞争拿到正赛资格。' },
      { team: 'Bosnia and Herzegovina', pathLabel: '小组直通', note: '完成欧洲区突破，跻身正赛。' },
      { team: 'Turkiye', pathLabel: '小组直通', note: '以稳定表现重返世界杯竞争中心。' }
    ]
  }
];
