import { SectionHeader } from '../components/SectionHeader';
import { hostCityDetails } from '../data/hostCityDetails';
import { localizePath, type AppCopy } from '../i18n/content';
import { formatBracketLabel, formatHostCityName, formatMatchupLabel, formatVenueName } from '../i18n/formatters';
import type { BracketRoundData, GroupFixtureData } from '../types/tournament';
import { formatBeijingMonthDayKickoff } from '../utils/beijingTime';

interface CityDetailPageProps {
  city: string;
  fixtures: GroupFixtureData[];
  rounds: BracketRoundData[];
  copy: AppCopy;
}

const venueCityMap: Record<string, string> = {
  'Atlanta Stadium': 'Atlanta',
  'Boston Stadium': 'Boston',
  'Dallas Stadium': 'Dallas',
  'Estadio Guadalajara': 'Guadalajara',
  'Houston Stadium': 'Houston',
  'Kansas City Stadium': 'Kansas City',
  'Los Angeles Stadium': 'Los Angeles',
  'Mexico City Stadium': 'Mexico City',
  'Miami Stadium': 'Miami',
  'Estadio Monterrey': 'Monterrey',
  'New York New Jersey Stadium': 'New York New Jersey',
  'Philadelphia Stadium': 'Philadelphia',
  'San Francisco Bay Area Stadium': 'San Francisco Bay Area',
  'Seattle Stadium': 'Seattle',
  'Toronto Stadium': 'Toronto',
  'BC Place Vancouver': 'Vancouver',
  'BC Place 温哥华球场': 'Vancouver'
};

function countryLabel(country: string, locale: AppCopy['locale']) {
  if (locale === 'zh') return country;
  return {
    美国: 'United States',
    墨西哥: 'Mexico',
    加拿大: 'Canada'
  }[country] ?? country;
}

function roofLabel(label: string, locale: AppCopy['locale']) {
  if (locale === 'zh') return label;
  return {
    '可伸缩屋顶': 'Retractable roof',
    '露天球场': 'Open-air stadium',
    '顶棚覆盖': 'Canopy roof'
  }[label] ?? label;
}

function formatCapacity(value: number, locale: AppCopy['locale']) {
  return locale === 'zh' ? `${value.toLocaleString('zh-CN')} 座` : `${value.toLocaleString('en-US')} seats`;
}

function formatLocalDate(dateLabel: string, locale: AppCopy['locale']) {
  return formatBeijingMonthDayKickoff(dateLabel, locale);
}

function getMockCityProfile(detail: { city: string; country: string }, locale: AppCopy['locale']) {
  const isZh = locale === 'zh';
  const country = countryLabel(detail.country, locale);
  const regionByCity: Record<string, { zh: string; en: string }> = {
    Atlanta: { zh: '佐治亚州', en: 'Georgia' },
    Boston: { zh: '马萨诸塞州', en: 'Massachusetts' },
    Dallas: { zh: '德克萨斯州', en: 'Texas' },
    Guadalajara: { zh: '哈利斯科州', en: 'Jalisco' },
    Houston: { zh: '德克萨斯州', en: 'Texas' },
    'Kansas City': { zh: '密苏里州', en: 'Missouri' },
    'Los Angeles': { zh: '加利福尼亚州', en: 'California' },
    'Mexico City': { zh: '墨西哥城', en: 'Mexico City' },
    Miami: { zh: '佛罗里达州', en: 'Florida' },
    Monterrey: { zh: '新莱昂州', en: 'Nuevo Leon' },
    'New York New Jersey': { zh: '纽约 / 新泽西都会区', en: 'New York / New Jersey metro' },
    Philadelphia: { zh: '宾夕法尼亚州', en: 'Pennsylvania' },
    'San Francisco Bay Area': { zh: '加利福尼亚湾区', en: 'Bay Area, California' },
    Seattle: { zh: '华盛顿州', en: 'Washington' },
    Toronto: { zh: '安大略省', en: 'Ontario' },
    Vancouver: { zh: '不列颠哥伦比亚省', en: 'British Columbia' }
  };
  const profileByCountry: Record<string, {
    tagsZh: string[];
    tagsEn: string[];
    climateZh: string;
    climateEn: string;
    transportZh: string;
    transportEn: string;
    featureZh: string;
    featureEn: string;
  }> = {
    美国: {
      tagsZh: ['大型体育市场', '航空枢纽', '城市群辐射'],
      tagsEn: ['Major sports market', 'Air hub', 'Metro reach'],
      climateZh: '6-7 月整体偏热，部分城市午后体感温度较高，室内或顶棚场馆更利于观赛。',
      climateEn: 'June and July are generally warm to hot, with covered or indoor venues improving matchday comfort.',
      transportZh: '主要依托国际机场、城际高速与轨道交通，适合承接跨城市球迷流动。',
      transportEn: 'International airports, highways, and transit links support heavy tournament travel.',
      featureZh: '职业体育运营成熟，具备大型赛事安保、票务、商业和转播承载能力。',
      featureEn: 'A mature pro-sports market with large-event operations, security, ticketing, and broadcast capacity.'
    },
    墨西哥: {
      tagsZh: ['高海拔/热情主场', '足球文化', '城市节庆'],
      tagsEn: ['Football culture', 'Festival city', 'High-energy crowds'],
      climateZh: '6-7 月多为温暖到炎热天气，部分城市昼夜温差明显。',
      climateEn: 'June and July are warm to hot, with some host cities seeing noticeable day-night shifts.',
      transportZh: '主办城市依托机场与城市快速路，比赛日交通需要提前规划。',
      transportEn: 'Airports and urban expressways anchor matchday travel, with advance planning recommended.',
      featureZh: '足球氛围浓厚，城市公共空间和球场周边更容易形成赛事节日感。',
      featureEn: 'Deep football culture makes the stadium district and public spaces feel like a tournament festival.'
    },
    加拿大: {
      tagsZh: ['多元文化', '凉爽夏季', '城市公共交通'],
      tagsEn: ['Multicultural', 'Milder summer', 'Urban transit'],
      climateZh: '6-7 月气候相对温和，适合城市观光和比赛日步行流动。',
      climateEn: 'June and July are comparatively mild, suitable for city exploration and matchday walking routes.',
      transportZh: '城市公共交通和机场连接较成熟，适合无车球迷移动。',
      transportEn: 'Transit and airport links are mature, supporting car-free fan movement.',
      featureZh: '国际化程度高，适合承接多国家队球迷混合停留。',
      featureEn: 'Highly international cities can host mixed fan groups from many national teams.'
    }
  };
  const countryProfile = profileByCountry[detail.country] ?? profileByCountry['美国'];
  const region = regionByCity[detail.city];

  return {
    country,
    region: isZh ? region?.zh ?? detail.city : region?.en ?? detail.city,
    tags: isZh ? countryProfile.tagsZh : countryProfile.tagsEn,
    climate: isZh ? countryProfile.climateZh : countryProfile.climateEn,
    transport: isZh ? countryProfile.transportZh : countryProfile.transportEn,
    feature: isZh ? countryProfile.featureZh : countryProfile.featureEn
  };
}

export function CityDetailPage({
  city,
  fixtures,
  rounds,
  copy
}: CityDetailPageProps) {
  const detail = hostCityDetails.find((item) => item.city === city);

  if (!detail) {
    return (
      <section className="section page-intro">
        <SectionHeader
          eyebrow={copy.locale === 'zh' ? '城市详情' : 'City Detail'}
          title={formatHostCityName(city, copy.locale)}
          description={copy.locale === 'zh' ? '没有找到这座城市的主办信息。' : 'No host city record was found.'}
        />
        <div className="match-detail-card">
          <a href={localizePath('/cities', copy.locale)}>
            {copy.locale === 'zh' ? '返回主办城市总览' : 'Back to host cities'}
          </a>
        </div>
      </section>
    );
  }

  const groupMatches = fixtures
    .filter((fixture) => venueCityMap[fixture.venue] === city)
    .sort((first, second) => Date.parse(first.dateLabel) - Date.parse(second.dateLabel));
  const knockoutMatches = rounds.flatMap((round) =>
    round.matches
      .filter((match) => venueCityMap[match.venue] === city)
      .map((match) => ({ ...match, round: round.round }))
  ).sort((first, second) => Date.parse(first.dateLabel) - Date.parse(second.dateLabel));
  const cityProfile = getMockCityProfile(detail, copy.locale);

  return (
    <>
      <section className="section page-intro city-detail-hero">
        <a className="back-link" href={localizePath('/cities', copy.locale)}>
          {copy.locale === 'zh' ? '返回主办城市总览' : 'Back to host cities'}
        </a>
        <div className="city-detail-shell">
          <article className="feature-card city-detail-card">
            <img src={detail.imageUrl} alt={`${formatHostCityName(detail.city, copy.locale)} poster`} />
          </article>
          <article className="feature-card city-profile-card">
            <div className="city-profile-card__title">
              <span>{copy.locale === 'zh' ? '主办城市' : 'Host City'}</span>
              <h1>{formatHostCityName(detail.city, copy.locale)}</h1>
            </div>
            <div className="city-profile-card__meta">
              <span>{cityProfile.country}</span>
              <span>{cityProfile.region}</span>
            </div>
            <div className="city-profile-card__tags">
              {cityProfile.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
            <div className="city-profile-card__notes">
              <p><strong>{copy.locale === 'zh' ? '气候' : 'Climate'}</strong>{cityProfile.climate}</p>
              <p><strong>{copy.locale === 'zh' ? '交通' : 'Transport'}</strong>{cityProfile.transport}</p>
              <p><strong>{copy.locale === 'zh' ? '特点' : 'Feature'}</strong>{cityProfile.feature}</p>
            </div>
          </article>
          <article className="feature-card city-stadium-info-card city-stadium-info-card--with-photo">
            <div className="city-stadium-hero">
              <img src={detail.stadiumImageUrl} alt={`${formatHostCityName(detail.city, copy.locale)} stadium panorama`} />
            </div>
            <div className="city-stadium-info-card__body">
              <h3>{copy.locale === 'zh' ? '场馆信息' : 'Venue'}</h3>
              <div className="city-stadium-facts">
                <div className="city-stadium-facts__item">
                  <span>{copy.locale === 'zh' ? '国家' : 'Country'}</span>
                  <strong>{countryLabel(detail.country, copy.locale)}</strong>
                </div>
                <div className="city-stadium-facts__item">
                  <span>{copy.locale === 'zh' ? '场馆名称' : 'Venue name'}</span>
                  <strong>{copy.locale === 'zh' ? `${detail.stadium} / ${detail.officialStadiumName}` : detail.officialStadiumName}</strong>
                </div>
                <div className="city-stadium-facts__item">
                  <span>{copy.locale === 'zh' ? '座位数' : 'Capacity'}</span>
                  <strong>{formatCapacity(detail.capacity, copy.locale)}</strong>
                </div>
                <div className="city-stadium-facts__item">
                  <span>{copy.locale === 'zh' ? '启用年份' : 'Opened'}</span>
                  <strong>{detail.opened}</strong>
                </div>
                <div className="city-stadium-facts__item">
                  <span>{copy.locale === 'zh' ? '屋顶类型' : 'Roof'}</span>
                  <strong>{roofLabel(detail.roofLabel, copy.locale)}</strong>
                </div>
                <div className="city-stadium-facts__item">
                  <span>{copy.locale === 'zh' ? '坐标' : 'Coordinates'}</span>
                  <strong>{detail.latitude}, {detail.longitude}</strong>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="section">
        <SectionHeader
          eyebrow={copy.locale === 'zh' ? '承办比赛' : 'Hosted Matches'}
          title={copy.locale === 'zh' ? '承办比赛' : 'Hosted Matches'}
          description={
            copy.locale === 'zh'
              ? '这里按小组赛和淘汰赛列出当前赛程数据中归属这座城市的全部比赛。'
              : 'This section lists all matches assigned to this city across the group stage and knockout rounds.'
          }
        />
        <div className="city-match-sections">
          <div className="city-match-section">
            <h3>{copy.locale === 'zh' ? `小组赛 · ${groupMatches.length} 场` : `Group stage · ${groupMatches.length}`}</h3>
            <div className="fixtures-grid">
              {groupMatches.map((fixture) => (
                <a
                  key={fixture.id}
                  className="fixture-card fixture-card--link"
                  href={localizePath(`/matches/${fixture.id}`, copy.locale)}
                  aria-label={
                    copy.locale === 'zh'
                      ? `打开比赛详情: 比赛 ${fixture.id}`
                      : `open match detail: match ${fixture.id}`
                  }
                >
                  <p className="fixture-card__meta">
                    {copy.labels.matchPrefix} {fixture.id} · {formatLocalDate(fixture.dateLabel, copy.locale)}
                  </p>
                  <h3>{formatMatchupLabel(`${fixture.homeTeam} vs ${fixture.awayTeam}`, copy.locale)}</h3>
                  <p className="fixture-card__venue">
                    {copy.locale === 'zh' ? `${fixture.groupId} 组 · ${formatVenueName(fixture.venue, copy.locale)}` : `Group ${fixture.groupId} · ${fixture.venue}`}
                  </p>
                </a>
              ))}
            </div>
          </div>
          <div className="city-match-section">
            <h3>{copy.locale === 'zh' ? `淘汰赛 · ${knockoutMatches.length} 场` : `Knockout · ${knockoutMatches.length}`}</h3>
            <div className="fixtures-grid">
              {knockoutMatches.map((match) => (
                <a
                  key={match.id}
                  className="fixture-card fixture-card--link"
                  href={localizePath(`/matches/${match.id}`, copy.locale)}
                  aria-label={
                    copy.locale === 'zh'
                      ? `打开比赛详情: 比赛 ${match.id}`
                      : `open match detail: match ${match.id}`
                  }
                >
                  <p className="fixture-card__meta">
                    {copy.labels.matchPrefix} {match.id} · {formatLocalDate(match.dateLabel, copy.locale)}
                  </p>
                  <h3>{formatBracketLabel(match.round, copy.locale)}</h3>
                  <p className="fixture-card__venue">
                    {formatBracketLabel(match.homeLabel, copy.locale)} · {formatBracketLabel(match.awayLabel, copy.locale)}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
