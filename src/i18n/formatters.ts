import type { Locale } from './content';

const englandFlag = '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}';
const scotlandFlag = '\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}';

const teamNameMap: Record<string, { zh: string; flag: string }> = {
  Algeria: { zh: '阿尔及利亚', flag: '🇩🇿' },
  Argentina: { zh: '阿根廷', flag: '🇦🇷' },
  Australia: { zh: '澳大利亚', flag: '🇦🇺' },
  Austria: { zh: '奥地利', flag: '🇦🇹' },
  Belgium: { zh: '比利时', flag: '🇧🇪' },
  'Bosnia and Herzegovina': { zh: '波黑', flag: '🇧🇦' },
  Brazil: { zh: '巴西', flag: '🇧🇷' },
  Canada: { zh: '加拿大', flag: '🇨🇦' },
  'Cabo Verde': { zh: '佛得角', flag: '🇨🇻' },
  Colombia: { zh: '哥伦比亚', flag: '🇨🇴' },
  'Congo DR': { zh: '刚果（金）', flag: '🇨🇩' },
  Croatia: { zh: '克罗地亚', flag: '🇭🇷' },
  Curacao: { zh: '库拉索', flag: '🇨🇼' },
  Czechia: { zh: '捷克', flag: '🇨🇿' },
  Ecuador: { zh: '厄瓜多尔', flag: '🇪🇨' },
  Egypt: { zh: '埃及', flag: '🇪🇬' },
  England: { zh: '英格兰', flag: englandFlag },
  France: { zh: '法国', flag: '🇫🇷' },
  Germany: { zh: '德国', flag: '🇩🇪' },
  Ghana: { zh: '加纳', flag: '🇬🇭' },
  Haiti: { zh: '海地', flag: '🇭🇹' },
  Iraq: { zh: '伊拉克', flag: '🇮🇶' },
  'IR Iran': { zh: '伊朗', flag: '🇮🇷' },
  Japan: { zh: '日本', flag: '🇯🇵' },
  Jordan: { zh: '约旦', flag: '🇯🇴' },
  'Korea Republic': { zh: '韩国', flag: '🇰🇷' },
  Mexico: { zh: '墨西哥', flag: '🇲🇽' },
  Morocco: { zh: '摩洛哥', flag: '🇲🇦' },
  Netherlands: { zh: '荷兰', flag: '🇳🇱' },
  'New Zealand': { zh: '新西兰', flag: '🇳🇿' },
  Norway: { zh: '挪威', flag: '🇳🇴' },
  Panama: { zh: '巴拿马', flag: '🇵🇦' },
  Paraguay: { zh: '巴拉圭', flag: '🇵🇾' },
  Portugal: { zh: '葡萄牙', flag: '🇵🇹' },
  Qatar: { zh: '卡塔尔', flag: '🇶🇦' },
  'Saudi Arabia': { zh: '沙特阿拉伯', flag: '🇸🇦' },
  Scotland: { zh: '苏格兰', flag: scotlandFlag },
  Senegal: { zh: '塞内加尔', flag: '🇸🇳' },
  Serbia: { zh: '塞尔维亚', flag: '🇷🇸' },
  'South Africa': { zh: '南非', flag: '🇿🇦' },
  Spain: { zh: '西班牙', flag: '🇪🇸' },
  Sweden: { zh: '瑞典', flag: '🇸🇪' },
  Switzerland: { zh: '瑞士', flag: '🇨🇭' },
  Tunisia: { zh: '突尼斯', flag: '🇹🇳' },
  Turkiye: { zh: '土耳其', flag: '🇹🇷' },
  Turkey: { zh: '土耳其', flag: '🇹🇷' },
  'United Arab Emirates': { zh: '阿联酋', flag: '🇦🇪' },
  Uruguay: { zh: '乌拉圭', flag: '🇺🇾' },
  USA: { zh: '美国', flag: '🇺🇸' },
  'United States': { zh: '美国', flag: '🇺🇸' },
  Uzbekistan: { zh: '乌兹别克斯坦', flag: '🇺🇿' },
  "Cote d'Ivoire": { zh: '科特迪瓦', flag: '🇨🇮' }
};

const confederationMap: Record<string, string> = {
  AFC: '亚足联',
  CAF: '非足联',
  CONCACAF: '中北美及加勒比地区足联',
  CONMEBOL: '南美足联',
  OFC: '大洋洲足联',
  UEFA: '欧足联'
};

const venueMap: Record<string, string> = {
  'Mexico City Stadium': '墨西哥城球场',
  'Estadio Guadalajara': '瓜达拉哈拉球场',
  'Toronto Stadium': '多伦多球场',
  'San Francisco Bay Area Stadium': '旧金山湾区球场',
  'Boston Stadium': '波士顿球场',
  'New York New Jersey Stadium': '纽约新泽西球场',
  'Los Angeles Stadium': '洛杉矶球场',
  'BC Place Vancouver': '温哥华 BC Place 球场',
  'Philadelphia Stadium': '费城球场',
  'Houston Stadium': '休斯敦球场',
  'Dallas Stadium': '达拉斯球场',
  'Estadio Monterrey': '蒙特雷球场',
  'Seattle Stadium': '西雅图球场',
  'Miami Stadium': '迈阿密球场',
  'Atlanta Stadium': '亚特兰大球场',
  'Kansas City Stadium': '堪萨斯城球场'
};

const hostCityMap: Record<string, string> = {
  Atlanta: '亚特兰大',
  Boston: '波士顿',
  Dallas: '达拉斯',
  Guadalajara: '瓜达拉哈拉',
  Houston: '休斯敦',
  'Kansas City': '堪萨斯城',
  'Los Angeles': '洛杉矶',
  'Mexico City': '墨西哥城',
  Miami: '迈阿密',
  Monterrey: '蒙特雷',
  'New York New Jersey': '纽约新泽西',
  Philadelphia: '费城',
  'San Francisco Bay Area': '旧金山湾区',
  Seattle: '西雅图',
  Toronto: '多伦多',
  Vancouver: '温哥华'
};

export function formatTeamName(name: string, locale: Locale = 'zh'): string {
  const entry = teamNameMap[name];
  if (locale === 'en') return name;
  if (!entry) return name;
  return `${entry.flag} ${entry.zh}`;
}

export function formatConfederationName(name: string, locale: Locale = 'zh'): string {
  if (locale === 'en') return name;
  return confederationMap[name] ?? name;
}

export function formatVenueName(name: string, locale: Locale = 'zh'): string {
  if (locale === 'en') return name;
  return venueMap[name] ?? name;
}

export function formatHostCityName(name: string, locale: Locale = 'zh'): string {
  if (locale === 'en') return name;
  return hostCityMap[name] ?? name;
}

export function getTeamDisplay(name: string): { flag: string; zh: string } {
  const entry = teamNameMap[name];
  if (!entry) {
    return { flag: '', zh: name };
  }
  return entry;
}

export function formatMatchupLabel(label: string, locale: Locale = 'zh'): string {
  const [home, away] = label.split(' vs ');
  if (!home || !away) return label;
  return `${formatTeamName(home, locale)} vs ${formatTeamName(away, locale)}`;
}

function replaceEverywhere(input: string, search: string, replacement: string): string {
  return input.split(search).join(replacement);
}

export function formatBracketLabel(label: string, locale: Locale = 'zh'): string {
  if (locale === 'en') return label;

  let output = label;
  Object.keys(teamNameMap).forEach((team) => {
    output = replaceEverywhere(output, team, formatTeamName(team));
  });

  output = [
    ['Round of 32', '32 强'],
    ['Round of 16', '16 强'],
    ['Quarter-finals', '四分之一决赛'],
    ['Semi-finals', '半决赛'],
    ['Final', '决赛'],
    ['Group ', '小组 '],
    [' winners', ' 第一'],
    [' runners-up', ' 第二'],
    ['Best third from ', '成绩最好的小组第三（来自 '],
    ['/', ' / '],
    ['Winner Match ', '胜者：比赛 '],
    ['Runner-up Match ', '负者：比赛 '],
    ['Bronze & Final', '季军战与决赛']
  ].reduce(
    (current, [search, replacement]) =>
      replaceEverywhere(current, search, replacement),
    output
  );

  if (output.includes('成绩最好的小组第三（来自 ') && !output.endsWith('）')) {
    output = `${output}）`;
  }

  return output;
}
