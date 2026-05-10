import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { posterPlacements as basePosterPlacements } from '../data/citiesLayout';
import { hostCityDetails } from '../data/hostCityDetails';
import { localizePath, type AppCopy } from '../i18n/content';
import { formatHostCityName } from '../i18n/formatters';
import type { TournamentMeta } from '../types/tournament';
import { publicAssetPath } from '../utils/publicAssets';

interface CitiesPageProps {
  meta: TournamentMeta;
  copy: AppCopy;
}

const SHOW_CITY_POSTERS = true;
const RENDERED_MAP_URL = publicAssetPath('/worldcup-assets/cities-map-stage.png');

const cityMarkerPlacements: Record<string, { left: string; top: string; label: string }> = {
  'New York New Jersey': { left: '62.62%', top: '51.43%', label: '纽约/新泽西' },
  'Los Angeles': { left: '39.89%', top: '57.70%', label: '洛杉矶' },
  'San Francisco Bay Area': { left: '38.82%', top: '53.67%', label: '旧金山' },
  Dallas: { left: '49.70%', top: '61.00%', label: '达拉斯' },
  Houston: { left: '50.42%', top: '64.93%', label: '休斯顿' },
  Atlanta: { left: '58.31%', top: '60.36%', label: '亚特兰大' },
  Miami: { left: '60.41%', top: '68.97%', label: '迈阿密' },
  Seattle: { left: '39.59%', top: '43.25%', label: '西雅图' },
  'Kansas City': { left: '52.39%', top: '52.71%', label: '堪萨斯城' },
  Boston: { left: '64.00%', top: '49.20%', label: '波士顿' },
  Philadelphia: { left: '62.08%', top: '53.77%', label: '费城' },
  Toronto: { left: '60.41%', top: '46.44%', label: '多伦多' },
  Vancouver: { left: '39.17%', top: '38.89%', label: '温哥华' },
  'Mexico City': { left: '49.22%', top: '77.26%', label: '墨西哥城' },
  Guadalajara: { left: '45.81%', top: '75.35%', label: '瓜达拉哈拉' },
  Monterrey: { left: '48.33%', top: '70.24%', label: '蒙特雷' }
};

function usePosterDetails(hostCityNames: string[]) {
  return useMemo(
    () =>
      hostCityNames
        .map((name) => hostCityDetails.find((detail) => detail.city === name))
        .filter((detail): detail is (typeof hostCityDetails)[number] => Boolean(detail)),
    [hostCityNames]
  );
}

function CitiesEChartsMap({
  cities,
  copy
}: {
  cities: typeof hostCityDetails;
  copy: AppCopy;
}) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const posterRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [editorEnabled, setEditorEnabled] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Vancouver');
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [draftPlacements, setDraftPlacements] = useState(() => structuredClone(basePosterPlacements));
  const dragStateRef = useRef<{
    city: string;
    pointerId: number;
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
  } | null>(null);
  const layoutConfigText = useMemo(
    () =>
      JSON.stringify(
        {
          posterPlacements: draftPlacements
        },
        null,
        2
      ),
    [draftPlacements]
  );

  function registerPoster(city: string, node: HTMLAnchorElement | null) {
    posterRefs.current[city] = node;
  }

  // The cities page should be a clean, finished composition by default.
  // Keep the editor as an optional debug tool behind `?edit=1`.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    setEditorEnabled(params.get('edit') === '1');
  }, []);

  function handlePosterPointerDown(city: string, event: ReactPointerEvent<HTMLAnchorElement>) {
    if (!editorOpen || !stageRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setSelectedCity(city);

    const current = draftPlacements[city];
    dragStateRef.current = {
      city,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: parseFloat(current.left),
      startTop: parseFloat(current.top)
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePosterPointerMove(city: string, event: ReactPointerEvent<HTMLAnchorElement>) {
    const drag = dragStateRef.current;
    if (!editorOpen || !stageRef.current || !drag || drag.city !== city || drag.pointerId !== event.pointerId) {
      return;
    }

    const rect = stageRef.current.getBoundingClientRect();
    const deltaLeftPct = ((event.clientX - drag.startX) / rect.width) * 100;
    const deltaTopPct = ((event.clientY - drag.startY) / rect.height) * 100;

    setDraftPlacements((current) => ({
      ...current,
      [city]: {
        ...current[city],
        left: `${Math.max(0, Math.min(94, drag.startLeft + deltaLeftPct)).toFixed(1)}%`,
        top: `${Math.max(0, Math.min(90, drag.startTop + deltaTopPct)).toFixed(1)}%`
      }
    }));
  }

  function handlePosterPointerUp(city: string, event: ReactPointerEvent<HTMLAnchorElement>) {
    const drag = dragStateRef.current;
    if (!drag || drag.city !== city || drag.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div ref={stageRef} className="cities-map-stage">
      {editorEnabled ? (
        <button
          type="button"
          className="cities-layout-toggle"
          aria-label={editorOpen ? '关闭布局编辑器' : '打开布局编辑器'}
          onClick={() => setEditorOpen((value) => !value)}
        >
          {editorOpen ? '关闭编辑' : '布局编辑'}
        </button>
      ) : null}
      {editorOpen ? (
        <aside className="cities-layout-editor">
          <p>拖动海报改位置，确认后从下方复制配置。</p>
          <label className="cities-layout-editor__field">
            <span>选择城市</span>
            <select value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)} aria-label="选择城市">
              {cities.map((city) => (
                <option key={city.city} value={city.city}>
                  {city.city}
                </option>
              ))}
            </select>
          </label>
          <label className="cities-layout-editor__field">
            <span>当前海报布局配置</span>
            <textarea readOnly value={layoutConfigText} aria-label="当前海报布局配置" rows={18} />
          </label>
        </aside>
      ) : null}
      <div className="cities-map-stage__backdrop" aria-hidden="true" />
      <figure
        className="cities-rendered-map"
        data-testid="cities-rendered-map"
        role="img"
        aria-label="2026 世界杯主办城市地图"
      >
        <img
          className="cities-rendered-map__base"
          src={RENDERED_MAP_URL}
          alt=""
          aria-hidden="true"
          draggable={false}
        />
        <div className="cities-marker-layer" aria-hidden="false">
          {cities.map((city) => {
            const marker = cityMarkerPlacements[city.city];
            if (!marker) return null;

            return (
              <a
                key={city.city}
                className={
                  activeCity === city.city
                    ? `cities-map-marker is-active is-${city.country}`
                    : `cities-map-marker is-${city.country}`
                }
                href={localizePath(`/cities/${encodeURIComponent(city.city)}`, copy.locale)}
                aria-label={`地图标点: ${city.city}`}
                style={{ left: marker.left, top: marker.top }}
                onMouseEnter={() => setActiveCity(city.city)}
                onMouseLeave={() => setActiveCity((current) => (current === city.city ? null : current))}
                onFocus={() => setActiveCity(city.city)}
                onBlur={() => setActiveCity((current) => (current === city.city ? null : current))}
              >
                <span className="cities-map-marker__pulse" />
                <span className="cities-map-marker__dot" />
                <span className="cities-map-marker__label">
                  {copy.locale === 'zh' ? marker.label : formatHostCityName(city.city, copy.locale)}
                </span>
              </a>
            );
          })}
        </div>
      </figure>
      {SHOW_CITY_POSTERS ? (
        <div className={editorOpen ? 'cities-poster-cloud is-editing' : 'cities-poster-cloud'}>
          {cities.map((city) => {
            const placement = draftPlacements[city.city];
            if (!placement) {
              return null;
            }

            return (
              <a
                key={city.city}
                ref={(node) => registerPoster(city.city, node)}
                className={
                  activeCity === city.city
                    ? 'cities-floating-poster is-active'
                    : editorOpen && selectedCity === city.city
                    ? 'cities-floating-poster is-selected'
                    : 'cities-floating-poster'
                }
                href={editorOpen ? '#' : localizePath(`/cities/${encodeURIComponent(city.city)}`, copy.locale)}
                aria-label={`进入城市详情: ${city.city}`}
                style={{
                  top: placement.top,
                  left: placement.left,
                  width: placement.width,
                  height: placement.height,
                  zIndex: placement.zIndex,
                  transform: placement.rotate ? `rotate(${placement.rotate}deg)` : undefined
                }}
                onClick={(event) => {
                  if (editorOpen) {
                    event.preventDefault();
                    setSelectedCity(city.city);
                  }
                }}
                onMouseEnter={() => setActiveCity(city.city)}
                onMouseLeave={() => setActiveCity((current) => (current === city.city ? null : current))}
                onFocus={() => setActiveCity(city.city)}
                onBlur={() => setActiveCity((current) => (current === city.city ? null : current))}
                onPointerDown={(event) => handlePosterPointerDown(city.city, event)}
                onPointerMove={(event) => handlePosterPointerMove(city.city, event)}
                onPointerUp={(event) => handlePosterPointerUp(city.city, event)}
                onPointerCancel={(event) => handlePosterPointerUp(city.city, event)}
              >
                <img src={city.imageUrl} alt={`${city.city} 宣传海报`} loading="lazy" />
                <span className="cities-floating-poster__label">
                  {formatHostCityName(city.city, copy.locale)}
                </span>
              </a>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function CitiesPage({ meta, copy }: CitiesPageProps) {
  const cities = usePosterDetails(meta.hostCityNames);

  return (
    <section className="cities-board-page">
      <CitiesEChartsMap cities={cities} copy={copy} />
    </section>
  );
}
