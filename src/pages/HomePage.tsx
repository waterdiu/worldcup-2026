import { useEffect, useState } from 'react';
import type { HeroSlideData } from '../data/home';
import { hostCityDetails } from '../data/hostCityDetails';
import {
  formatHostCityName,
  formatTeamName,
  formatVenueName,
  getTeamDisplay
} from '../i18n/formatters';
import { localizePath, type Locale } from '../i18n/content';
import type { FullScheduleMatchData, GroupCardData, GroupFixtureData } from '../types/tournament';
import { publicAssetPath } from '../utils/publicAssets';
import { formatBeijingMonthDayKickoff } from '../utils/beijingTime';

interface HomePageProps {
  slides: HeroSlideData[];
  fullSchedule: FullScheduleMatchData[];
  groups: GroupCardData[];
  teams: string[];
  fixtures: GroupFixtureData[];
  hostCities: string[];
  locale: Locale;
}

const PROMO_POSTER_URL = publicAssetPath('/worldcup-assets/optimized/home-promo-hero-wide.webp');
const PROMO_VIDEO_URL = publicAssetPath('/worldcup-assets/2026worldcup.mp4?v=20260512-jimeng-keling');
const OPENING_POSTER_URL = publicAssetPath('/worldcup-assets/optimized/opening-match-poster-wide.jpg');
const TEAM_FLAG_BY_ZH: Record<string, string> = {
  阿尔及利亚: '🇩🇿',
  阿根廷: '🇦🇷',
  澳大利亚: '🇦🇺',
  奥地利: '🇦🇹',
  比利时: '🇧🇪',
  波黑: '🇧🇦',
  波斯尼亚和黑塞哥维那: '🇧🇦',
  巴西: '🇧🇷',
  加拿大: '🇨🇦',
  佛得角: '🇨🇻',
  哥伦比亚: '🇨🇴',
  '刚果（金）': '🇨🇩',
  刚果民主共和国: '🇨🇩',
  克罗地亚: '🇭🇷',
  库拉索: '🇨🇼',
  捷克: '🇨🇿',
  '捷克共和国': '🇨🇿',
  厄瓜多尔: '🇪🇨',
  埃及: '🇪🇬',
  英格兰: '🏴',
  法国: '🇫🇷',
  德国: '🇩🇪',
  加纳: '🇬🇭',
  海地: '🇭🇹',
  伊拉克: '🇮🇶',
  伊朗: '🇮🇷',
  日本: '🇯🇵',
  约旦: '🇯🇴',
  韩国: '🇰🇷',
  墨西哥: '🇲🇽',
  摩洛哥: '🇲🇦',
  荷兰: '🇳🇱',
  新西兰: '🇳🇿',
  挪威: '🇳🇴',
  巴拿马: '🇵🇦',
  巴拉圭: '🇵🇾',
  葡萄牙: '🇵🇹',
  卡塔尔: '🇶🇦',
  沙特阿拉伯: '🇸🇦',
  苏格兰: '🏴',
  塞内加尔: '🇸🇳',
  塞尔维亚: '🇷🇸',
  南非: '🇿🇦',
  西班牙: '🇪🇸',
  瑞典: '🇸🇪',
  瑞士: '🇨🇭',
  突尼斯: '🇹🇳',
  土耳其: '🇹🇷',
  阿联酋: '🇦🇪',
  乌拉圭: '🇺🇾',
  美国: '🇺🇸',
  乌兹别克斯坦: '🇺🇿',
  科特迪瓦: '🇨🇮'
};
const TEAM_NAME_ALIAS_BY_ZH: Record<string, string> = {
  刚果民主共和国: '刚果（金）',
  捷克共和国: '捷克',
  波斯尼亚和黑塞哥维那: '波黑'
};

function formatFixtureDayLabel(dateLabel: string, locale: Locale): string {
  const dateOnly = dateLabel.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    if (locale === 'en') {
      return new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(
        new Date(Number(year), Number(month) - 1, Number(day))
      );
    }
    return `${Number(month)}月${Number(day)}日`;
  }

  const date = new Date(dateLabel);
  if (Number.isNaN(date.getTime())) return dateLabel;

  if (locale === 'en') {
    return new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
  }

  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatBeijingFixtureTime(fixture: FullScheduleMatchData, locale: Locale): string {
  // Normalize to the same Beijing kickoff formatting used across match pages.
  // Avoid printing timezone suffixes like "北京时间" or "BJT" in UI.
  return formatBeijingMonthDayKickoff(fixture.dateLabel, locale);
}

function formatHomeFixtureVenue(fixture: FullScheduleMatchData, locale: Locale): string {
  const detail = hostCityDetails.find((item) => item.city === fixture.city || formatHostCityName(item.city, 'zh') === fixture.city);
  const country = detail ? countryLabel(detail.country, locale) : '';
  const city = locale === 'zh' ? fixture.city : detail ? formatHostCityName(detail.city, locale) : fixture.city;
  const venue = detail
    ? locale === 'zh'
      ? detail.stadium
      : detail.officialStadiumName
    : locale === 'zh'
      ? fixture.venue.replace(/（.*?）/g, '')
      : formatVenueName(fixture.venue, locale);

  return [country, city, venue].filter(Boolean).join(' · ');
}

function formatHomeFixtureTeam(team: string, locale: Locale): string {
  const display = getTeamDisplay(team);
  const normalizedZhName = TEAM_NAME_ALIAS_BY_ZH[team] ?? team;
  const name = locale === 'zh' ? (display.zh === team ? normalizedZhName : display.zh) : team;
  const flag = display.flag || TEAM_FLAG_BY_ZH[team];
  return flag ? `${flag} ${name}` : name;
}

function localDateKey(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatGroupLabel(groupId: string, locale: Locale): string {
  return locale === 'zh' ? `${groupId} 组` : `Group ${groupId}`;
}

function scoreLabel(fixture: Partial<GroupFixtureData>, locale: Locale): string {
  if (typeof fixture.homeScore === 'number' && typeof fixture.awayScore === 'number') {
    return `${fixture.homeScore} - ${fixture.awayScore}`;
  }

  return locale === 'zh' ? '待定' : 'TBD';
}

function sortedFixtures(fixtures: FullScheduleMatchData[] = []) {
  return [...fixtures].sort((a, b) => new Date(a.dateLabel).getTime() - new Date(b.dateLabel).getTime());
}

function uniqueFixtureDates(fixtures: FullScheduleMatchData[] = []) {
  return Array.from(new Set(sortedFixtures(fixtures).map((fixture) => localDateKey(fixture.dateLabel))));
}

function fixtureDateKey(fixture: FullScheduleMatchData) {
  return localDateKey(fixture.dateLabel);
}

function formatCalendarDay(dateKey: string) {
  const [, , month, day] = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/) ?? [];
  if (!month || !day) return { month: '', day: dateKey };
  return { month: Number(month), day: Number(day) };
}

function monthLabel(monthKey: string, locale: Locale) {
  const [year, month] = monthKey.split('-').map(Number);
  if (!year || !month) return monthKey;
  return locale === 'zh'
    ? `${year}年${month}月`
    : new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));
}

function getMonthKey(dateKey: string) {
  return dateKey.slice(0, 7);
}

function shiftMonth(monthKey: string, offset: number) {
  const [year, month] = monthKey.split('-').map(Number);
  const next = new Date(year, month - 1 + offset, 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
}

function monthDateKeys(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  const dayCount = new Date(year, month, 0).getDate();
  return Array.from({ length: dayCount }, (_, index) => `${year}-${String(month).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`);
}

function stageLabel(match: FullScheduleMatchData, locale: Locale) {
  if (match.groupId) return formatGroupLabel(match.groupId, locale);
  if (locale === 'en') return match.stageLabel;
  if (match.stageLabel === 'Round of 32') return '32强';
  if (match.stageLabel === 'Round of 16') return '16强';
  if (match.stageLabel === 'Quarter-finals') return '1/4决赛';
  if (match.stageLabel === 'Semi-finals') return '半决赛';
  if (match.stageLabel === 'Match for Third Place') return '季军赛';
  if (match.stageLabel === 'Final') return '决赛';
  return match.stageLabel;
}

function cityMatchCount(city: string, fullSchedule: FullScheduleMatchData[] = []) {
  const cityName = formatHostCityName(city, 'zh').replace('/', '');
  return fullSchedule.filter((fixture) => fixture.city.replace('/', '') === cityName).length;
}

function countryFlag(country: string) {
  if (country === '加拿大') return '🇨🇦';
  if (country === '墨西哥') return '🇲🇽';
  return '🇺🇸';
}

function countryLabel(country: string, locale: Locale) {
  if (locale === 'zh') return country;
  if (country === '加拿大') return 'Canada';
  if (country === '墨西哥') return 'Mexico';
  return 'USA';
}

export function HomePage({
  slides,
  fullSchedule,
  groups,
  teams,
  fixtures,
  hostCities,
  locale
}: HomePageProps) {
  const orderedFixtures = sortedFixtures(fullSchedule);
  const fixtureDates = uniqueFixtureDates(fullSchedule);
  const fixtureDateSet = new Set(fixtureDates);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [isPromoPlaying, setIsPromoPlaying] = useState(false);
  const [selectedDate, setSelectedDate] = useState(fixtureDates[0] ?? '');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(getMonthKey(fixtureDates[0] ?? '2026-06-01'));
  const openingFixture = fixtures.find((fixture) => fixture.id === '1') ?? fixtures[0];
  const activeDateIndex = Math.max(0, fixtureDates.indexOf(selectedDate));
  const visibleFixtures = orderedFixtures.filter((fixture) => fixtureDateKey(fixture) === selectedDate);
  const tomorrowDate = fixtureDates[Math.min(fixtureDates.length - 1, activeDateIndex + 1)] ?? selectedDate;
  const tomorrowFixtures = orderedFixtures.filter((fixture) => fixtureDateKey(fixture) === tomorrowDate);
  const heroSlides = slides.length > 0 ? slides : [];

  function selectDateByOffset(offset: number) {
    if (fixtureDates.length === 0) return;
    const nextIndex = Math.min(fixtureDates.length - 1, Math.max(0, activeDateIndex + offset));
    setSelectedDate(fixtureDates[nextIndex]);
    setVisibleMonth(getMonthKey(fixtureDates[nextIndex]));
  }

  function handleHeroSelect(index: number) {
    setActiveHeroIndex(index);
    if (heroSlides[index]?.type !== 'promo') {
      setIsPromoPlaying(false);
    }
  }

  useEffect(() => {
    if (heroSlides.length <= 1 || isPromoPlaying) return undefined;

    const timer = window.setInterval(() => {
      setActiveHeroIndex((index) => (index + 1) % heroSlides.length);
    }, 7000);

    return () => window.clearInterval(timer);
  }, [heroSlides.length, isPromoPlaying]);

  return (
    <section className="wc-home" aria-label={locale === 'zh' ? '世界杯首页' : 'World Cup homepage'}>
      <section
        className="wc-home-hero wc-home-hero--media"
        aria-label={locale === 'zh' ? '首页主视觉轮播' : 'Homepage media carousel'}
      >
        <div
          className="wc-home-hero__track"
          style={{ transform: `translateX(-${activeHeroIndex * 100}%)` }}
        >
          {heroSlides.map((slide) => {
            const isPromo = slide.type === 'promo';
            const isActivePromo = isPromo && isPromoPlaying && heroSlides[activeHeroIndex]?.id === slide.id;
            const href = localizePath(isPromo ? slide.href : (openingFixture ? `/matches/${openingFixture.id}` : slide.href), locale);

            return (
              <article key={slide.id} className={`wc-home-hero__slide wc-home-hero__slide--${slide.accent ?? 'default'}`}>
                {isActivePromo ? (
                  <video
                    className="wc-home-hero__video"
                    src={PROMO_VIDEO_URL}
                    poster={PROMO_POSTER_URL}
                    aria-label={locale === 'zh' ? '官方宣传片播放器' : 'official trailer player'}
                    controls
                    autoPlay
                    muted
                    playsInline
                    onEnded={() => setIsPromoPlaying(false)}
                  />
                ) : (
                  <img
                    src={isPromo ? PROMO_POSTER_URL : OPENING_POSTER_URL}
                    alt={isPromo ? (locale === 'zh' ? '2026 世界杯宣传海报' : 'World Cup 2026 poster') : (locale === 'zh' ? '揭幕战海报' : 'Opening match poster')}
                  />
                )}
                {isPromo && !isActivePromo ? (
                  <button
                    type="button"
                    className="wc-home-hero__hitarea"
                    aria-label={locale === 'zh' ? '播放世界杯宣传视频' : 'Play World Cup trailer'}
                    onClick={() => {
                      setActiveHeroIndex(heroSlides.findIndex((item) => item.id === slide.id));
                      setIsPromoPlaying(true);
                    }}
                  />
                ) : null}
                {!isPromo ? (
                  <a
                    className="wc-home-hero__hitarea"
                    href={href}
                    aria-label={locale === 'zh' ? '进入揭幕战详细页' : 'Open opening match detail'}
                  />
                ) : null}
                <div className="wc-home-hero__caption">
                  <span>{slide.eyebrow}</span>
                  <strong>{slide.title}</strong>
                </div>
              </article>
            );
          })}
        </div>
        <div className="wc-home-hero__nav" role="tablist" aria-label={locale === 'zh' ? '主视觉切换' : 'Hero slides'}>
          {heroSlides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={index === activeHeroIndex ? 'is-active' : undefined}
              aria-pressed={index === activeHeroIndex}
              aria-label={locale === 'zh' ? `切换到${slide.title}` : `Switch to ${slide.title}`}
              onClick={() => handleHeroSelect(index)}
            />
          ))}
        </div>
      </section>

      <div className="wc-home-page">
        <div className="wc-home-kpis">
          <a className="wc-home-kpi" href={localizePath('/groups', locale)} aria-label={locale === 'zh' ? '12 个小组详情' : '12 groups details'}>
            <span>{locale === 'zh' ? '小组' : 'Groups'}</span>
            <strong className="is-lime">12</strong>
            <small>{locale === 'zh' ? '每组 4 队' : 'Four teams each'}</small>
          </a>
          <a className="wc-home-kpi" href={localizePath('/matches', locale)} aria-label={locale === 'zh' ? '104 场赛程详情' : '104 matches details'}>
            <span>{locale === 'zh' ? '赛程' : 'Fixtures'}</span>
            <strong>104</strong>
            <small>{locale === 'zh' ? '小组赛 + 淘汰赛' : 'Group + knockouts'}</small>
          </a>
          <a className="wc-home-kpi" href={localizePath('/cities', locale)} aria-label={locale === 'zh' ? '16 个城市详情' : '16 host cities details'}>
            <span>{locale === 'zh' ? '城市' : 'Cities'}</span>
            <strong>16</strong>
            <small>{locale === 'zh' ? '美国 · 加拿大 · 墨西哥' : 'USA · Canada · Mexico'}</small>
          </a>
          <a className="wc-home-kpi" href={localizePath('/teams', locale)} aria-label={locale === 'zh' ? '48 支球队详情' : '48 teams details'}>
            <span>{locale === 'zh' ? '球队' : 'Teams'}</span>
            <strong>48</strong>
            <small>{locale === 'zh' ? '史上最多' : 'Expanded field'}</small>
          </a>
        </div>
        <section className="wc-home-section">
          <div className="wc-home-rule">
            <a href={localizePath('/groups', locale)}>{locale === 'zh' ? '小组' : 'Groups'}</a>
            <span>12 groups · 48 teams</span>
          </div>
          <div className="wc-home-groups">
            {groups.map((group) => (
              <a key={group.id} className="wc-home-group" href={localizePath(`/groups/${group.id}`, locale)}>
                <div className="wc-home-group__label">{formatGroupLabel(group.id, locale)}</div>
                <div className="wc-home-group__head" aria-hidden="true">
                  <span>{locale === 'zh' ? '队伍' : 'Team'}</span>
                  <b>胜</b>
                  <b>负</b>
                  <b>进球</b>
                  <b>失球</b>
                  <b>净胜</b>
                  <b>分</b>
                </div>
                <div className="wc-home-group__teams">
                  {group.teams.map((team) => (
                    <span key={team.name} className="wc-home-group__team">
                      <strong>{formatTeamName(team.name, locale)}</strong>
                      <b>{team.won}</b>
                      <b>{team.lost}</b>
                      <b>{team.goalsFor}</b>
                      <b>{team.goalsAgainst}</b>
                      <b>{team.goalsFor - team.goalsAgainst}</b>
                      <b>{team.points}</b>
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="wc-home-section">
          <div className="wc-home-rule">
            <a href={localizePath('/matches', locale)}>{locale === 'zh' ? '赛程' : 'Fixtures'}</a>
            <div className="wc-home-schedule-controls">
              <button type="button" onClick={() => selectDateByOffset(-1)} disabled={activeDateIndex <= 0}>
                ←
              </button>
              <div className="wc-home-date-picker">
                <button
                  type="button"
                  className="wc-home-date-trigger"
                  aria-expanded={isCalendarOpen}
                  onClick={() => setIsCalendarOpen((value) => !value)}
                >
                  <strong>{formatFixtureDayLabel(selectedDate, locale)}</strong>
                </button>
                {isCalendarOpen ? (
                  <div className="wc-home-calendar-popover" role="dialog" aria-label={locale === 'zh' ? '赛程日期选择器' : 'Schedule date picker'}>
                    <div className="wc-home-calendar-head">
                      <button type="button" onClick={() => setVisibleMonth((month) => shiftMonth(month, -1))}>←</button>
                      <strong>{monthLabel(visibleMonth, locale)}</strong>
                      <button type="button" onClick={() => setVisibleMonth((month) => shiftMonth(month, 1))}>→</button>
                    </div>
                    <div className="wc-home-calendar-weekdays" aria-hidden="true">
                      {(locale === 'zh' ? ['一', '二', '三', '四', '五', '六', '日'] : ['M', 'T', 'W', 'T', 'F', 'S', 'S']).map((day, index) => (
                        <span key={`${day}-${index}`}>{day}</span>
                      ))}
                    </div>
                    <div className="wc-home-date-calendar" role="group" aria-label={locale === 'zh' ? '选择赛程日期' : 'Select fixture date'}>
                      {monthDateKeys(visibleMonth).map((date) => {
                        const hasMatches = fixtureDateSet.has(date);
                        const day = formatCalendarDay(date);
                        return (
                          <button
                            key={date}
                            type="button"
                            className={`${date === selectedDate ? 'is-active' : ''} ${hasMatches ? 'has-matches' : 'is-empty'}`.trim()}
                            aria-pressed={date === selectedDate}
                            disabled={!hasMatches}
                            onClick={() => {
                              setSelectedDate(date);
                              setIsCalendarOpen(false);
                            }}
                          >
                            <strong>{day.day}</strong>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
              <button type="button" onClick={() => selectDateByOffset(1)} disabled={activeDateIndex >= fixtureDates.length - 1}>
                →
              </button>
            </div>
          </div>
          <div className="wc-home-fixture-days">
            {[
              { label: locale === 'zh' ? '所选日期赛程' : 'Selected date', date: selectedDate, matches: visibleFixtures },
              { label: locale === 'zh' ? '下一比赛日' : 'Next matchday', date: tomorrowDate, matches: tomorrowFixtures }
            ].map((day) => (
              <article key={day.label} className="wc-home-fixture-day">
                <div className="wc-home-fixture-day__head">
                  <strong>{day.label}</strong>
                  <span>{formatFixtureDayLabel(day.date, locale)}</span>
                </div>
                <div className="wc-home-fixtures">
                  {day.matches.map((fixture) => (
                    <a key={fixture.id} className="wc-home-fixture" href={localizePath(`/matches/${fixture.id}`, locale)}>
                      <span className="wc-home-fixture__meta">
                        <b>{formatBeijingFixtureTime(fixture, locale)}</b>
                        <small>{formatHomeFixtureVenue(fixture, locale)}</small>
                      </span>
                      <span className="wc-home-fixture__teams">
                        <strong>{formatHomeFixtureTeam(fixture.homeTeam, locale)}</strong>
                        <em>VS</em>
                        <strong>{formatHomeFixtureTeam(fixture.awayTeam, locale)}</strong>
                      </span>
                      <span className="wc-home-fixture__score is-pending">
                        {scoreLabel({}, locale)}
                      </span>
                      <span className="wc-home-fixture__group">{stageLabel(fixture, locale)}</span>
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="wc-home-section">
          <div className="wc-home-rule">
            <a href={localizePath('/cities', locale)}>{locale === 'zh' ? '城市' : 'Cities'}</a>
            <span>16 cities</span>
          </div>
          <div className="wc-home-cities">
            {hostCities.map((city) => {
              const detail = hostCityDetails.find((item) => item.city === city);
              if (!detail) return null;
              return (
                <a key={city} className="wc-home-city" href={localizePath(`/cities/${encodeURIComponent(city)}`, locale)}>
                  <span className="wc-home-city__body">
                    <strong>{formatHostCityName(city, locale)}</strong>
                    <span>{countryFlag(detail.country)} {countryLabel(detail.country, locale)}</span>
                    <small>{cityMatchCount(city, fullSchedule) || 6} {locale === 'zh' ? '场' : 'matches'}</small>
                  </span>
                  <img src={detail.imageUrl} alt={locale === 'zh' ? `${formatHostCityName(city, locale)}城市海报` : `${city} city poster`} loading="lazy" />
                </a>
              );
            })}
          </div>
        </section>

        <section className="wc-home-section">
          <div className="wc-home-rule">
            <a href={localizePath('/teams', locale)}>{locale === 'zh' ? '球队' : 'Teams'}</a>
            <span>teams prop · 48 teams</span>
          </div>
          <div className="wc-home-team-strip">
            <div className="wc-home-team-list">
              {teams.map((team) => {
                const display = getTeamDisplay(team);
                const label = locale === 'zh' ? display.zh : team;
                return (
                  <a
                    key={team}
                    className="wc-home-team-chip"
                    href={localizePath(`/teams/${encodeURIComponent(team)}`, locale)}
                    aria-label={locale === 'zh' ? `进入球队详情: ${team}` : `open team details: ${team}`}
                    data-team-name={label}
                  >
                    {display.flag ? `${display.flag} ` : ''}{label}
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <footer className="wc-home-footer">
        <span>{locale === 'zh' ? 'FIFA World Cup 2026 · 美国 · 加拿大 · 墨西哥' : 'FIFA World Cup 2026 · USA · Canada · Mexico'}</span>
        <span>{locale === 'zh' ? '数据仅供参考 · 赛程以官方公告为准' : 'Data for reference · schedule subject to official updates'}</span>
      </footer>
    </section>
  );
}
