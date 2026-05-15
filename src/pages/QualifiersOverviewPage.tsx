import { useEffect, useMemo, useState } from 'react';
import { appBasePath, localizePath, type AppCopy } from '../i18n/content';
import type { ConfederationCardData, QualifierMatchData } from '../types/tournament';

type SourceReport = {
  confederationId: QualifierMatchData['confederationId'] | 'intercontinental' | 'shared';
  leagueId: number;
  season: number;
  importedMatches: number;
  errors: string[];
};

interface QualifiersOverviewPageProps {
  confederations: ConfederationCardData[];
  matches: QualifierMatchData[];
  sourceReports: SourceReport[];
  copy: AppCopy;
}

function groupMatchesByConfederation(matches: QualifierMatchData[]) {
  return matches.reduce<Record<string, QualifierMatchData[]>>((groups, match) => {
    groups[match.confederationId] = groups[match.confederationId] ?? [];
    groups[match.confederationId].push(match);
    return groups;
  }, {});
}

function formatMissingSummary(matches: QualifierMatchData[], locale: AppCopy['locale']) {
  const totalMissing = matches.reduce((count, match) => count + match.missingData.length, 0);
  return locale === 'zh'
    ? `${matches.length} 场已导入比赛中，共 ${totalMissing} 项详情数据缺失。`
    : `${totalMissing} detail fields are missing across ${matches.length} imported matches.`;
}

function sourceLabel(report: SourceReport, locale: AppCopy['locale']) {
  if (report.confederationId === 'intercontinental') {
    return locale === 'zh' ? '洲际附加赛' : 'Intercontinental Play-offs';
  }
  if (report.confederationId === 'shared') {
    return locale === 'zh' ? '共享数据源' : 'Shared data source';
  }

  const labels: Record<QualifierMatchData['confederationId'], string> = {
    afc: locale === 'zh' ? '亚洲区' : 'AFC',
    caf: locale === 'zh' ? '非洲区' : 'CAF',
    concacaf: locale === 'zh' ? '中北美区' : 'CONCACAF',
    conmebol: locale === 'zh' ? '南美区' : 'CONMEBOL',
    ofc: locale === 'zh' ? '大洋洲区' : 'OFC',
    uefa: locale === 'zh' ? '欧洲区' : 'UEFA'
  };

  return labels[report.confederationId];
}

function mapRegionLabel(confederationId: ConfederationCardData['id'], locale: AppCopy['locale']) {
  const labels: Record<ConfederationCardData['id'], { zh: string; en: string }> = {
    afc: { zh: '亚洲', en: 'Asia' },
    caf: { zh: '非洲', en: 'Africa' },
    concacaf: { zh: '中北美洲', en: 'North America' },
    conmebol: { zh: '南美洲', en: 'South America' },
    ofc: { zh: '大洋洲', en: 'Oceania' },
    uefa: { zh: '欧洲', en: 'Europe' }
  };

  return labels[confederationId][locale];
}

function getQualifierMetrics(
  matches: QualifierMatchData[],
  confederations: ConfederationCardData[],
  confederationId: ConfederationCardData['id'] | null
) {
  const scopedMatches = confederationId
    ? matches.filter((match) => match.confederationId === confederationId)
    : matches;
  const scopedConfederations = confederationId
    ? confederations.filter((confederation) => confederation.id === confederationId)
    : confederations;
  const teams = new Set(scopedMatches.flatMap((match) => [match.homeTeam, match.awayTeam]));

  return {
    teamCount: teams.size,
    qualifiedCount: scopedConfederations.reduce((count, confederation) => count + confederation.qualifiedTeams.length, 0),
    matchCount: scopedMatches.length,
    goalCount: scopedMatches.reduce((count, match) => count + match.homeScore + match.awayScore, 0)
  };
}

function missingFieldSummary(matches: QualifierMatchData[]) {
  return matches
    .flatMap((match) => match.missingData)
    .reduce<Record<string, number>>((summary, field) => {
      summary[field] = (summary[field] ?? 0) + 1;
      return summary;
    }, {});
}

const mapRegions: Array<{
  id: ConfederationCardData['id'];
  x: number;
  y: number;
  width: number;
  height: number;
}> = [
  {
    id: 'concacaf',
    x: 150,
    y: 318,
    width: 240,
    height: 150
  },
  {
    id: 'conmebol',
    x: 272,
    y: 514,
    width: 132,
    height: 190
  },
  {
    id: 'uefa',
    x: 504,
    y: 320,
    width: 214,
    height: 105
  },
  {
    id: 'caf',
    x: 528,
    y: 452,
    width: 190,
    height: 200
  },
  {
    id: 'afc',
    x: 714,
    y: 374,
    width: 274,
    height: 210
  },
  {
    id: 'ofc',
    x: 760,
    y: 552,
    width: 210,
    height: 86
  }
];

type GeoJsonGeometry = {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][] | number[][][][];
};

type GeoJsonFeature = {
  properties: {
    continent: string;
    name: string;
  };
  geometry: GeoJsonGeometry;
};

type GeoJsonCollection = {
  features: GeoJsonFeature[];
};

type WorldMapCountryPath = {
  confederationId: ConfederationCardData['id'];
  d: string;
  name: string;
};

const confederationByContinent: Record<string, ConfederationCardData['id'] | null> = {
  Africa: 'caf',
  Asia: 'afc',
  Europe: 'uefa',
  'North America': 'concacaf',
  Oceania: 'ofc',
  'South America': 'conmebol',
  Antarctica: null,
  'Seven seas (open ocean)': null
};

function projectCoordinate([longitude, latitude]: number[]) {
  const clampedLatitude = Math.max(-72, Math.min(82, latitude));
  const latitudeRadians = clampedLatitude * Math.PI / 180;
  const x = ((longitude + 180) / 360) * 1000;
  const y = (1 - Math.log(Math.tan(Math.PI / 4 + latitudeRadians / 2)) / Math.PI) / 2 * 1000;
  return [x, y];
}

function ringToPath(ring: number[][]) {
  return ring
    .map((coordinate, index) => {
      const [x, y] = projectCoordinate(coordinate);
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

function polygonToPath(polygon: number[][][]) {
  return polygon
    .map((ring) => `${ringToPath(ring)} Z`)
    .join(' ');
}

function geometryToPath(geometry: GeoJsonGeometry) {
  if (geometry.type === 'Polygon') {
    return polygonToPath(geometry.coordinates as number[][][]);
  }

  return (geometry.coordinates as number[][][][])
    .map((polygon) => polygonToPath(polygon))
    .join(' ');
}

function buildWorldMapPaths(collection: GeoJsonCollection): WorldMapCountryPath[] {
  return collection.features
    .map((feature) => {
      const confederationId = confederationByContinent[feature.properties.continent];
      if (!confederationId) return null;

      return {
        confederationId,
        d: geometryToPath(feature.geometry),
        name: feature.properties.name
      };
    })
    .filter((item): item is WorldMapCountryPath => Boolean(item && item.d));
}

export function QualifiersOverviewPage({
  confederations,
  matches,
  sourceReports,
  copy
}: QualifiersOverviewPageProps) {
  const [activeConfederationId, setActiveConfederationId] = useState<ConfederationCardData['id'] | null>(null);
  const [worldMapPaths, setWorldMapPaths] = useState<WorldMapCountryPath[]>([]);

  const groupedMatches = useMemo(() => groupMatchesByConfederation(matches), [matches]);
  const metrics = getQualifierMetrics(matches, confederations, activeConfederationId);
  const missingSummary = missingFieldSummary(matches);
  const mapPathsByConfederation = useMemo(
    () =>
      worldMapPaths.reduce<Record<string, WorldMapCountryPath[]>>((groups, path) => {
        groups[path.confederationId] = groups[path.confederationId] ?? [];
        groups[path.confederationId].push(path);
        return groups;
      }, {}),
    [worldMapPaths]
  );

  useEffect(() => {
    if (import.meta.env.MODE === 'test') return;
    if (typeof fetch !== 'function') return;

    let isCancelled = false;
    const base = appBasePath();
    const mapUrl = `${base || ''}/vendor/maps/countries.geojson`;

    fetch(mapUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load world map: ${response.status}`);
        }
        return response.json() as Promise<GeoJsonCollection>;
      })
      .then((collection) => {
        if (!isCancelled) {
          setWorldMapPaths(buildWorldMapPaths(collection));
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setWorldMapPaths([]);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  function navigateToConfederation(confederationId: ConfederationCardData['id']) {
    window.location.href = localizePath(`/qualifiers/${confederationId}`, copy.locale);
  }

  return (
    <section className="section qualifier-match-board">
      <div className="qualifier-hero">
        <h1>{copy.locale === 'zh' ? '世界杯预选赛' : 'World Cup Qualifiers'}</h1>
      </div>

      <div className="qualifier-metric-grid" aria-label={copy.locale === 'zh' ? '预选赛数据覆盖' : 'Qualifier data coverage'}>
        <article>
          <span>{copy.locale === 'zh' ? '球队总数' : 'Teams'}</span>
          <strong>{metrics.teamCount}</strong>
        </article>
        <article>
          <span>{copy.locale === 'zh' ? '出线球队数' : 'Qualified'}</span>
          <strong>{metrics.qualifiedCount}</strong>
        </article>
        <article>
          <span>{copy.locale === 'zh' ? '比赛场数' : 'Matches'}</span>
          <strong>{metrics.matchCount}</strong>
        </article>
        <article>
          <span>{copy.locale === 'zh' ? '进球总数' : 'Goals'}</span>
          <strong>{metrics.goalCount}</strong>
        </article>
      </div>

      <section className="qualifier-map-panel" aria-label={copy.locale === 'zh' ? '按大洲浏览预选赛' : 'Browse qualifiers by confederation'}>
        <svg className="qualifier-world-map" viewBox="-55 70 1110 640" preserveAspectRatio="xMidYMid meet" role="img" aria-label={copy.locale === 'zh' ? '世界杯预选赛洲际地图' : 'World Cup qualifier confederation map'}>
          <defs>
            <radialGradient id="qualifierRegionGlow" cx="50%" cy="45%" r="65%">
              <stop offset="0%" stopColor="#c8f230" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#c8f230" stopOpacity="0.03" />
            </radialGradient>
            <linearGradient id="qualifierRegionBase" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2a261b" />
              <stop offset="100%" stopColor="#11100c" />
            </linearGradient>
          </defs>
          <path className="qualifier-world-map__grid" d="M70 300 H930 M500 72 V540 M150 128 C300 70 700 70 850 128 M150 472 C300 530 700 530 850 472" />
          {confederations.map((confederation) => {
            const countryPaths = mapPathsByConfederation[confederation.id] ?? [];
            if (countryPaths.length === 0) return null;

            return (
              <g
                className={activeConfederationId === confederation.id ? 'qualifier-map-continent is-active' : 'qualifier-map-continent'}
                key={confederation.id}
                onClick={() => navigateToConfederation(confederation.id)}
                onMouseEnter={() => setActiveConfederationId(confederation.id)}
                onMouseLeave={() => setActiveConfederationId(null)}
              >
                {countryPaths.map((country) => (
                  <path d={country.d} key={country.name} />
                ))}
              </g>
            );
          })}
          {mapRegions.map((region) => {
            const confederation = confederations.find((item) => item.id === region.id);
            const regionMatches = groupedMatches[region.id] ?? [];
            if (!confederation) return null;

            return (
              <a
                className={activeConfederationId === region.id ? 'qualifier-map-label-link is-active' : 'qualifier-map-label-link'}
                href={localizePath(`/qualifiers/${region.id}`, copy.locale)}
                key={region.id}
                onBlur={() => setActiveConfederationId(null)}
                onFocus={() => setActiveConfederationId(region.id)}
                onMouseEnter={() => setActiveConfederationId(region.id)}
                onMouseLeave={() => setActiveConfederationId(null)}
              >
                <foreignObject x={region.x} y={region.y} width={region.width} height={region.height}>
                  <div className="qualifier-map-region__label">
                    <strong>{mapRegionLabel(region.id, copy.locale)}</strong>
                    <span>
                      {confederation.qualifiedTeams.length}
                      {copy.locale === 'zh' ? ' 队出线' : ' qualified'}
                    </span>
                    <small>
                      {regionMatches.length}
                      {copy.locale === 'zh' ? ' 场比赛' : ' matches'}
                    </small>
                  </div>
                </foreignObject>
              </a>
            );
          })}
        </svg>
      </section>

      <article className="qualifier-coverage-card">
        <h3>{copy.locale === 'zh' ? '数据缺失统计' : 'Missing Data Summary'}</h3>
        <p>{formatMissingSummary(matches, copy.locale)}</p>
        <p>
          {copy.locale === 'zh'
            ? '公开来源可以稳定拿到赛程和比分；逐场球员评分、完整阵容和技术统计在部分预选赛中没有公开稳定来源。'
            : 'Public sources cover scores reliably; player ratings, complete lineups, and detailed stats are not consistently available for every qualifier.'}
        </p>
        <div className="qualifier-missing-fields">
          {Object.entries(missingSummary).map(([field, count]) => (
            <span key={field}>
              <strong>{count}</strong>
              {field}
            </span>
          ))}
        </div>
      </article>

      {sourceReports.length ? (
        <section className="qualifier-source-grid" aria-label={copy.locale === 'zh' ? 'API 数据源状态' : 'API source status'}>
          {sourceReports.map((report) => {
            const isBlocked = report.errors.length > 0;

            return (
              <article className={isBlocked ? 'is-blocked' : ''} key={`${report.leagueId}-${report.season}`}>
                <span>{sourceLabel(report, copy.locale)}</span>
                <strong>{report.importedMatches}</strong>
                <small>
                  API-Football league {report.leagueId} · season {report.season}
                </small>
                {isBlocked ? (
                  <p>{copy.locale === 'zh' ? '免费档未开放该赛季' : 'Season blocked on free plan'}</p>
                ) : (
                  <p>{copy.locale === 'zh' ? '已接入免费档' : 'Connected through free tier'}</p>
                )}
              </article>
            );
          })}
        </section>
      ) : null}
    </section>
  );
}
