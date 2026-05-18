import type { PeopleIndexEntry } from '../data/mockPeople';
import { localizePath, type AppCopy } from '../i18n/content';

function personPath(entry: PeopleIndexEntry) {
  if (entry.kind === 'coach') return `/people/coaches/${encodeURIComponent(entry.person_id)}`;
  if (entry.kind === 'player') return `/people/players/${encodeURIComponent(entry.person_id)}`;
  return `/people/referees/${encodeURIComponent(entry.person_id)}`;
}

function kindLabel(kind: PeopleIndexEntry['kind'], locale: AppCopy['locale']) {
  if (locale === 'en') {
    if (kind === 'coach') return 'Coach';
    if (kind === 'player') return 'Player';
    return 'Referee';
  }
  if (kind === 'coach') return '教练';
  if (kind === 'player') return '球员';
  return '裁判';
}

export function PeopleIndexPage({ people, copy }: { people: PeopleIndexEntry[]; copy: AppCopy }) {
  const locale = copy.locale;
  const visiblePeople = people.filter((entry) => entry.kind !== 'referee');

  return (
    <main className="world-cup-page world-cup-page--people">
      <section className="section page-intro">
        <div className="section-header">
          <h1 className="page-title">{locale === 'zh' ? '人物档案' : 'Person Profiles'}</h1>
          <p className="page-subtitle">
            {locale === 'zh'
              ? '教练、球员、裁判的档案页。数据分为：直接事实 / 派生分析 / 风格蒸馏（样本不足时会隐藏）。'
              : 'Coach, player, and referee profiles. Data tiers: direct facts, derived analysis, distilled style (hidden if insufficient sample).'}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="people-index-grid" role="list" aria-label={locale === 'zh' ? '人物列表' : 'People list'}>
          {visiblePeople.map((entry) => {
            const title = locale === 'zh' ? entry.name_zh : entry.display_name;
            const meta = locale === 'zh'
              ? `${kindLabel(entry.kind, locale)} · ${entry.country_name_zh}${entry.primary_team_name ? ` · ${entry.primary_team_name}` : ''}`
              : `${kindLabel(entry.kind, locale)} · ${entry.country_name_en}${entry.primary_team_name ? ` · ${entry.primary_team_name}` : ''}`;
            return (
              <a
                key={`${entry.kind}-${entry.person_id}`}
                className="people-index-card"
                role="listitem"
                href={localizePath(personPath(entry), locale)}
                aria-label={locale === 'zh' ? `打开人物档案：${title}` : `Open profile: ${title}`}
              >
                <div className="people-index-card__kind">{kindLabel(entry.kind, locale)}</div>
                <div className="people-index-card__title">{title}</div>
                <div className="people-index-card__meta">{meta}</div>
              </a>
            );
          })}
        </div>
      </section>
    </main>
  );
}
