import { PageNav } from './components/PageNav';
import {
  confederations,
  getHomepageHeroSlides,
  qualifierDetails,
  tournamentMeta
} from './data';
import type { WorldCupSiteData } from './data/siteData';
import { useWorldCupSiteData } from './hooks/useWorldCupSiteData';
import { contentByLocale, getLocaleFromPathname, stripAppBasePath, type Locale } from './i18n/content';
import { AdminPage } from './pages/AdminPage';
import { CitiesPage } from './pages/CitiesPage';
import { GroupDetailPage } from './pages/GroupDetailPage';
import { GroupsPage } from './pages/GroupsPage';
import { HomePage } from './pages/HomePage';
import { MatchDetailPage } from './pages/MatchDetailPage';
import { MatchesPage } from './pages/MatchesPage';
import { QualifierConfederationPage } from './pages/QualifierConfederationPage';
import { QualifierMatchDetailPage } from './pages/QualifierMatchDetailPage';
import { QualifiersOverviewPage } from './pages/QualifiersOverviewPage';
import { StatsPageV4 } from './pages/StatsPageV4';
import { TeamDetailPage } from './pages/TeamDetailPage';
import { TeamsPage } from './pages/TeamsPage';
import { CityDetailPage } from './pages/CityDetailPage';
import { UserCenterPage } from './pages/UserCenterPage';
import './styles/theme.css';
import './styles/world-cup-page.css';
import './styles/stats-v4.css';

function normalizePathname(pathname: string): string {
  if (pathname === '/en') return '/';
  if (pathname.startsWith('/en/')) {
    return pathname.slice(3) || '/';
  }
  if (pathname === '/zh') return '/';
  if (pathname.startsWith('/zh/')) {
    return pathname.slice(3) || '/';
  }
  return pathname;
}

function renderPage(pathname: string, locale: Locale, siteData: WorldCupSiteData) {
  const copy = contentByLocale[locale];
  const {
    apiFootballQualifierSourceReports,
    bracket,
    finalsDataCoverage,
    finalsMatchResults,
    fullSchedule,
    groupFixtures,
    groupStageMatches,
    groups,
    qualifierMatches
  } = siteData;

  if (pathname === '/qualifiers') {
    return (
      <QualifiersOverviewPage
        confederations={confederations}
        matches={qualifierMatches}
        sourceReports={apiFootballQualifierSourceReports}
        copy={copy}
      />
    );
  }

  if (pathname.startsWith('/qualifiers/matches/')) {
    const matchId = decodeURIComponent(pathname.split('/')[3] ?? '');
    const match = qualifierMatches.find((item) => item.id === matchId);

    if (match) {
      return <QualifierMatchDetailPage match={match} copy={copy} />;
    }
  }

  if (pathname.startsWith('/qualifiers/')) {
    const confederationId = pathname.split('/')[2];
    const confederation = confederations.find((item) => item.id === confederationId);
    const detail = qualifierDetails.find((item) => item.confederationId === confederationId);

    if (confederation && detail) {
      return (
        <QualifierConfederationPage
          confederation={confederation}
          matches={qualifierMatches}
          copy={copy}
        />
      );
    }
  }

  if (pathname === '/stats') {
    return (
      <StatsPageV4
        bracket={bracket}
        groupStageMatches={groupStageMatches}
      />
    );
  }

  if (pathname === '/me') {
    return (
      <UserCenterPage
        bracket={bracket}
        copy={copy}
        finalsMatchResults={finalsMatchResults}
        groupStageMatches={groupStageMatches}
      />
    );
  }

  if (pathname === '/admin') {
    return (
      <AdminPage
        bracket={bracket}
        copy={copy}
        finalsMatchResults={finalsMatchResults}
        groupStageMatches={groupStageMatches}
      />
    );
  }

  if (pathname === '/groups') {
    return <GroupsPage groups={groups} drawDateLabel={tournamentMeta.drawDateLabel} copy={copy} />;
  }

  if (pathname.startsWith('/groups/')) {
    const groupId = decodeURIComponent(pathname.split('/')[2] ?? '').toUpperCase();
    const group = groups.find((item) => item.id === groupId);

    if (group) {
      return (
        <GroupDetailPage
          group={group}
          matches={groupStageMatches.filter((match) => match.groupId === group.id)}
          copy={copy}
        />
      );
    }
  }

  if (pathname === '/teams') {
    return (
      <TeamsPage
        groups={groups}
        confederations={confederations}
        copy={copy}
      />
    );
  }

  if (pathname.startsWith('/teams/')) {
    const teamId = decodeURIComponent(pathname.split('/')[2] ?? '');
    return (
      <TeamDetailPage
        team={teamId}
        groups={groups}
        confederations={confederations}
        fixtures={groupStageMatches}
        copy={copy}
      />
    );
  }

  if (pathname === '/matches') {
    return <MatchesPage fixtures={groupStageMatches} rounds={bracket} copy={copy} />;
  }

  if (pathname === '/cities') {
    return <CitiesPage meta={tournamentMeta} copy={copy} />;
  }

  if (pathname.startsWith('/cities/')) {
    const cityId = decodeURIComponent(pathname.split('/')[2] ?? '');
    return <CityDetailPage city={cityId} fixtures={groupStageMatches} rounds={bracket} copy={copy} />;
  }

  if (pathname.startsWith('/matches/')) {
    const matchId = pathname.split('/')[2];
    const fixture = groupStageMatches.find((item) => item.id === matchId) ?? groupFixtures.find((item) => item.id === matchId);

    if (fixture) {
      return <MatchDetailPage fixture={fixture} copy={copy} />;
    }

    const knockoutEntry = bracket
      .flatMap((round) => round.matches.map((match) => ({ ...match, roundLabel: round.round })))
      .find((item) => item.id === matchId);

    if (knockoutEntry) {
      return <MatchDetailPage fixture={knockoutEntry} copy={copy} />;
    }
  }

  const teams = groups.flatMap((group) => group.teams.map((team) => team.name));
  return (
    <HomePage
      slides={getHomepageHeroSlides(new Date(), locale)}
      fullSchedule={fullSchedule}
      groups={groups}
      teams={teams}
      fixtures={groupFixtures}
      hostCities={tournamentMeta.hostCityNames}
      locale={locale}
    />
  );
}

export default function App() {
  const { runtimeError, siteData } = useWorldCupSiteData();
  const appPathname = stripAppBasePath(window.location.pathname);
  const locale = getLocaleFromPathname(window.location.pathname);
  const normalizedPathname = normalizePathname(appPathname);
  const isStats = normalizedPathname === '/stats';
  const isQualifiers = normalizedPathname === '/qualifiers' || normalizedPathname.startsWith('/qualifiers/');
  const isFinalsPage =
    normalizedPathname === '/' ||
    normalizedPathname === '/groups' ||
    normalizedPathname.startsWith('/groups/') ||
    normalizedPathname === '/matches' ||
    normalizedPathname.startsWith('/matches/') ||
    normalizedPathname === '/cities' ||
    normalizedPathname.startsWith('/cities/') ||
    normalizedPathname === '/teams' ||
    normalizedPathname.startsWith('/teams/');

  return (
    <main
      className={`world-cup-page ${isStats ? 'world-cup-page--stats' : ''} ${isQualifiers ? 'world-cup-page--qualifiers' : ''} ${isFinalsPage ? 'world-cup-page--finals' : ''}`}
      data-data-generated-at={siteData.generatedAt}
      data-data-source={siteData.source}
      data-data-warning={runtimeError ?? undefined}
    >
      <PageNav pathname={normalizedPathname} locale={locale} />
      {renderPage(normalizedPathname, locale, siteData)}
    </main>
  );
}
