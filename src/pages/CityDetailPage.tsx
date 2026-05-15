import { SectionHeader } from '../components/SectionHeader';
import { hostCityDetails } from '../data/hostCityDetails';
import { localizePath, type AppCopy } from '../i18n/content';
import { formatBracketLabel, formatHostCityName, formatMatchupLabel, formatVenueName } from '../i18n/formatters';
import type { BracketRoundData, GroupFixtureData } from '../types/tournament';

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
  'BC Place Vancouver': 'Vancouver'
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
  if (locale === 'en') return dateLabel;
  const date = new Date(dateLabel);
  if (Number.isNaN(date.getTime())) return dateLabel;
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
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
  return (
    <>
      <section className="section page-intro city-detail-hero">
        <a className="back-link" href={localizePath('/cities', copy.locale)}>
          {copy.locale === 'zh' ? '返回主办城市总览' : 'Back to host cities'}
        </a>
        <SectionHeader
          eyebrow={copy.locale === 'zh' ? '城市详情' : 'City Detail'}
          title={formatHostCityName(detail.city, copy.locale)}
          description={
            copy.locale === 'zh'
              ? `${formatHostCityName(detail.city, copy.locale)} 是 2026 世界杯主办城市之一，这里汇总球场基础资料、坐标和完整承办赛程。`
              : `${detail.city} is one of the 2026 World Cup host cities, with venue facts, coordinates, and the full hosted match list.`
          }
        />
        <div className="city-detail-shell">
          <article className="feature-card city-detail-card">
            <img src={detail.imageUrl} alt={`${formatHostCityName(detail.city, copy.locale)} poster`} />
          </article>
          <div className="city-detail-main">
            <article className="feature-card city-stadium-hero">
              <img src={detail.stadiumImageUrl} alt={`${formatHostCityName(detail.city, copy.locale)} stadium panorama`} />
            </article>
            <article className="feature-card city-stadium-info-card">
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
            </article>
          </div>
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
        <div className="match-detail-card detail-return-card">
          <a className="back-link" href={localizePath('/cities', copy.locale)}>
            {copy.locale === 'zh' ? '返回主办城市总览' : 'Back to host cities'}
          </a>
        </div>
      </section>
    </>
  );
}
