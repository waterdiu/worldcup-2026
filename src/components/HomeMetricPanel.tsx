import { useEffect, useState, type MouseEvent, type FocusEvent } from 'react';
import { hostCityDetails } from '../data/hostCityDetails';
import {
  formatHostCityName,
  formatTeamName,
  formatVenueName,
  getTeamDisplay
} from '../i18n/formatters';
import { localizePath, type Locale } from '../i18n/content';
import type { GroupCardData, GroupFixtureData } from '../types/tournament';

interface HomeMetricPanelProps {
  groups: GroupCardData[];
  teams: string[];
  fixtures: GroupFixtureData[];
  hostCities: string[];
  locale: Locale;
}

function formatFixtureDate(dateLabel: string, locale: Locale): string {
  const date = new Date(dateLabel);
  if (locale === 'en') {
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
  }
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatCompactVenue(venue: string, locale: Locale): string {
  if (locale === 'en') return venue.replace(' Stadium', '');

  const cityDetail = hostCityDetails.find((item) => item.stadium === formatVenueName(venue, locale));
  if (!cityDetail) {
    return formatVenueName(venue, locale);
  }
  return cityDetail.country;
}

function GroupsCarousel({ groups, locale }: { groups: GroupCardData[]; locale: Locale }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (groups.length <= 1) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % groups.length);
    }, 3600);

    return () => window.clearInterval(intervalId);
  }, [groups.length]);

  const activeGroup = groups[activeIndex];
  const changeGroup = (nextIndex: number) => setActiveIndex(nextIndex);

  function getGroupTeamNameClass(teamName: string): string {
    const label = formatTeamName(teamName, locale);

    if (label.length >= 5) {
      return 'group-carousel__team-name is-xlong';
    }

    if (label.length >= 4) {
      return 'group-carousel__team-name is-long';
    }

    return 'group-carousel__team-name';
  }

  return (
    <div className="group-carousel">
      <section className="group-carousel__slide">
        <header className="group-carousel__header">
          <h3>{activeGroup.id} 组</h3>
          <p>{locale === 'zh' ? '完整积分排名' : 'Full standings table'}</p>
        </header>
        <div
          className="group-carousel__table"
          role="table"
          aria-label={
            locale === 'zh'
              ? `${activeGroup.id} 组积分榜`
              : `Group ${activeGroup.id} standings`
          }
        >
          <div className="group-carousel__row group-carousel__row--head" role="row">
            <span>#</span>
            <span>{locale === 'zh' ? '球队' : 'Team'}</span>
            <span>{locale === 'zh' ? '胜' : 'W'}</span>
            <span>{locale === 'zh' ? '平' : 'D'}</span>
            <span>{locale === 'zh' ? '负' : 'L'}</span>
            <span>{locale === 'zh' ? '进' : 'GF'}</span>
            <span>{locale === 'zh' ? '失' : 'GA'}</span>
            <span>{locale === 'zh' ? '分' : 'Pts'}</span>
          </div>
          {activeGroup.teams.map((team, index) => (
            <div key={team.name} className="group-carousel__row" role="row">
              <span>{index + 1}</span>
              <span className={getGroupTeamNameClass(team.name)}>{formatTeamName(team.name, locale)}</span>
              <span>{team.won}</span>
              <span>{team.drawn}</span>
              <span>{team.lost}</span>
              <span>{team.goalsFor}</span>
              <span>{team.goalsAgainst}</span>
              <span>{team.points}</span>
            </div>
          ))}
        </div>
      </section>
      <div
        className="group-carousel__progress"
        role="tablist"
        aria-label={locale === 'zh' ? '小组轮播切换' : 'group carousel'}
      >
        {groups.map((group, index) => (
          <button
            key={group.id}
            type="button"
            aria-label={locale === 'zh' ? `切换到 ${group.id} 组` : `switch to Group ${group.id}`}
            aria-pressed={index === activeIndex}
            className={index === activeIndex ? 'is-active' : undefined}
            onClick={() => changeGroup(index)}
          />
        ))}
      </div>
    </div>
  );
}

function TeamFlagWall({ teams, locale }: { teams: string[]; locale: Locale }) {
  const [hoveredTeam, setHoveredTeam] = useState<{
    name: string;
    left: number;
    top: number;
  } | null>(null);

  function showTooltip(
    event: MouseEvent<HTMLAnchorElement> | FocusEvent<HTMLAnchorElement>,
    label: string
  ): void {
    const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = event.currentTarget;
    setHoveredTeam({
      name: label,
      left: offsetLeft + offsetWidth / 2,
      top: offsetTop + offsetHeight + 8
    });
  }

  return (
    <div className="team-flag-wall">
      {teams.map((team) => {
        const display = getTeamDisplay(team);
        const displayName = locale === 'zh' ? display.zh : team;
        return (
          <a
            key={team}
            className="team-flag-chip"
            href={localizePath(`/teams/${encodeURIComponent(team)}`, locale)}
            aria-label={locale === 'zh' ? `进入球队详情: ${team}` : `open team details: ${team}`}
            data-team-name={displayName}
            onMouseEnter={(event) => showTooltip(event, displayName)}
            onMouseLeave={() => setHoveredTeam((current) => (current?.name === displayName ? null : current))}
            onFocus={(event) => showTooltip(event, displayName)}
            onBlur={() => setHoveredTeam((current) => (current?.name === displayName ? null : current))}
          >
            {display.flag || displayName.slice(0, 1)}
          </a>
        );
      })}
      {hoveredTeam ? (
        <div
          className="team-flag-tooltip"
          style={{
            left: hoveredTeam.left,
            top: hoveredTeam.top
          }}
        >
          {hoveredTeam.name}
        </div>
      ) : null}
    </div>
  );
}

function MatchList({ fixtures, locale }: { fixtures: GroupFixtureData[]; locale: Locale }) {
  const visibleFixtures = fixtures.slice(0, 8);

  return (
    <div className="match-inline-list">
      {visibleFixtures.map((fixture) => {
        const matchupLabel = `${formatTeamName(fixture.homeTeam, locale)} ${
          locale === 'zh' ? '对' : 'vs'
        } ${formatTeamName(fixture.awayTeam, locale)}`;
        const matchupClass =
          matchupLabel.length > 22
            ? 'match-inline-row__matchup is-xlong'
            : matchupLabel.length > 18
              ? 'match-inline-row__matchup is-long'
              : 'match-inline-row__matchup';

        return (
        <a
          key={fixture.id}
          className="match-inline-row"
          href={localizePath(`/matches/${fixture.id}`, locale)}
        >
          <span className="match-inline-row__date">{formatFixtureDate(fixture.dateLabel, locale)}</span>
          <span className="match-inline-row__venue">{formatCompactVenue(fixture.venue, locale)}</span>
          <strong className={matchupClass}>
            {matchupLabel}
          </strong>
          <b className="match-inline-row__status">{fixture.resultLabel ?? (locale === 'zh' ? '待定' : 'TBA')}</b>
        </a>
      );})}
    </div>
  );
}

function CityVisual({ city, locale }: { city: string; locale: Locale }) {
  const detail = hostCityDetails.find((item) => item.city === city);
  const tooltip = detail
    ? `${detail.country} / ${formatHostCityName(detail.city, locale)} / ${detail.stadium}`
    : formatHostCityName(city, locale);

  if (!detail) {
    return null;
  }

  return (
    <a
      key={city}
      className="city-thumb city-thumb--photo"
      href={localizePath(`/cities/${encodeURIComponent(city)}`, locale)}
      aria-label={locale === 'zh' ? `进入城市详情: ${city}` : `open city details: ${city}`}
      title={tooltip}
    >
      <img
        src={detail.imageUrl}
        alt={locale === 'zh' ? `${detail.stadium} 球场图片` : `${detail.stadium} stadium image`}
        loading="lazy"
      />
      <span className="city-thumb__caption">
        <strong>{formatHostCityName(detail.city, locale)}</strong>
        <small>{detail.stadium}</small>
      </span>
    </a>
  );
}

export function HomeMetricPanel({
  groups,
  teams,
  fixtures,
  hostCities,
  locale
}: HomeMetricPanelProps) {
  return (
    <section className="home-metric-panel">
      <article className="home-metric-card home-metric-card--groups">
        <a
          className="home-metric-card__summary home-metric-card__summary--link"
          href={localizePath('/groups', locale)}
          aria-label={locale === 'zh' ? '12 小组详情' : '12 groups details'}
        >
          <span className="home-metric-card__icon" aria-hidden="true">▦</span>
          <strong>12</strong>
          <h2>{locale === 'zh' ? '小组' : 'Groups'}</h2>
        </a>
        <div className="home-metric-card__content">
          <GroupsCarousel groups={groups} locale={locale} />
        </div>
      </article>

      <article className="home-metric-card home-metric-card--teams">
        <a
          className="home-metric-card__summary home-metric-card__summary--link"
          href={localizePath('/teams', locale)}
          aria-label={locale === 'zh' ? '48 支参赛队详情' : '48 teams details'}
        >
          <span className="home-metric-card__icon" aria-hidden="true">◉</span>
          <strong>48</strong>
          <h2>{locale === 'zh' ? '球队' : 'Teams'}</h2>
        </a>
        <div className="home-metric-card__content">
          <TeamFlagWall teams={teams} locale={locale} />
        </div>
      </article>

      <article className="home-metric-card home-metric-card--matches">
        <a
          className="home-metric-card__summary home-metric-card__summary--link"
          href={localizePath('/matches', locale)}
          aria-label={locale === 'zh' ? '104 场比赛详情' : '104 matches details'}
        >
          <span className="home-metric-card__icon" aria-hidden="true">◫</span>
          <strong>104</strong>
          <h2>{locale === 'zh' ? '比赛' : 'Matches'}</h2>
        </a>
        <div className="home-metric-card__content">
          <MatchList fixtures={fixtures} locale={locale} />
        </div>
      </article>

      <article className="home-metric-card home-metric-card--cities">
        <a
          className="home-metric-card__summary home-metric-card__summary--link"
          href={localizePath('/cities', locale)}
          aria-label={locale === 'zh' ? '16 个主办城市详情' : '16 host cities details'}
        >
          <span className="home-metric-card__icon" aria-hidden="true">◎</span>
          <strong>16</strong>
          <h2>{locale === 'zh' ? '城市' : 'Cities'}</h2>
        </a>
        <div className="home-metric-card__content">
          <div className="city-photo-grid">
            {hostCities.map((city) => (
              <CityVisual key={city} city={city} locale={locale} />
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}
