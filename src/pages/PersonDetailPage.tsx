import type { PersonDataTier, PersonProfile, PersonSection } from '../data/mockPeople';
import { localizePath, type AppCopy } from '../i18n/content';

function tierLabel(tier: PersonDataTier, locale: AppCopy['locale']) {
  if (locale === 'en') {
    if (tier === 'direct') return 'Direct';
    if (tier === 'derived') return 'Derived';
    return 'Distilled';
  }
  if (tier === 'direct') return '直接数据';
  if (tier === 'derived') return '派生分析';
  return '风格蒸馏';
}

function kindLabel(kind: PersonProfile['kind'], locale: AppCopy['locale']) {
  if (locale === 'en') {
    if (kind === 'coach') return 'Coach';
    if (kind === 'player') return 'Player';
    return 'Referee';
  }
  if (kind === 'coach') return '教练';
  if (kind === 'player') return '球员';
  return '裁判';
}

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '');
  return letters.join('');
}

function coerceString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return null;
}

function pickCoachHeroFacts(profile: PersonProfile, locale: AppCopy['locale']) {
  const direct = (profile.direct ?? {}) as any;
  const derived = (profile.derived ?? {}) as any;
  const metrics = (derived.metrics ?? {}) as any;

  const facts: Array<[string, string]> = [];
  const nation = coerceString(direct.nationality) ?? (locale === 'zh' ? profile.country_name_zh : profile.country_name_en);
  if (nation) facts.push([locale === 'zh' ? '国籍' : 'Nation', nation]);
  if (profile.primary_team_name) facts.push([locale === 'zh' ? '球队' : 'Team', profile.primary_team_name]);

  const last10 = metrics.recent_10_form;
  if (last10 && typeof last10 === 'object') {
    const w = (last10 as any).won;
    const d = (last10 as any).drawn;
    const l = (last10 as any).lost;
    if (typeof w === 'number' && typeof d === 'number' && typeof l === 'number') {
      facts.push([locale === 'zh' ? '近10场' : 'Last 10', `${w}-${d}-${l}`]);
    }
  }

  const contractUntil = coerceString(direct.contract_until);
  if (contractUntil) facts.push([locale === 'zh' ? '合同至' : 'Contract', contractUntil]);

  return facts;
}

function pickPlayerHeroFacts(profile: PersonProfile, locale: AppCopy['locale']) {
  const direct = (profile.direct ?? {}) as any;
  const facts: Array<[string, string]> = [];
  if (profile.primary_team_name) facts.push([locale === 'zh' ? '球队' : 'Team', profile.primary_team_name]);
  const pos = coerceString(direct.position);
  if (pos) facts.push([locale === 'zh' ? '位置' : 'Position', pos]);
  const club = coerceString(direct.club);
  if (club) facts.push([locale === 'zh' ? '俱乐部' : 'Club', club]);
  const shirt = direct.shirt_number;
  if (typeof shirt === 'number') facts.push([locale === 'zh' ? '号码' : 'Shirt', String(shirt)]);
  return facts;
}

function pickRefereeHeroFacts(profile: PersonProfile, locale: AppCopy['locale']) {
  const derived = (profile.derived ?? {}) as any;
  const metrics = (derived.metrics ?? {}) as any;
  const facts: Array<[string, string]> = [];
  if (profile.country_name_en || profile.country_name_zh) {
    facts.push([locale === 'zh' ? '国籍' : 'Nation', locale === 'zh' ? profile.country_name_zh : profile.country_name_en]);
  }
  if (typeof metrics.matches === 'number') facts.push([locale === 'zh' ? '样本场次' : 'Sample', `${metrics.matches}`]);
  if (typeof metrics.yellow_cards_per_match === 'number') facts.push([locale === 'zh' ? '场均黄牌' : 'Yellows', `${metrics.yellow_cards_per_match}`]);
  return facts;
}

function renderHero(profile: PersonProfile, locale: AppCopy['locale']) {
  const name = locale === 'zh' ? profile.name_zh : profile.display_name;
  const eyebrow = locale === 'zh'
    ? `${kindLabel(profile.kind, locale)}档案`
    : `${kindLabel(profile.kind, locale)} profile`;

  const facts =
    profile.kind === 'coach'
      ? pickCoachHeroFacts(profile, locale)
      : profile.kind === 'player'
        ? pickPlayerHeroFacts(profile, locale)
        : pickRefereeHeroFacts(profile, locale);

  const distilled = (profile.distilled ?? {}) as any;
  const styleTags = Array.isArray(distilled.style_tags) ? distilled.style_tags : [];
  const showTags = profile.distillation_status === 'available' && styleTags.length;

  return (
    <div className="person-hero">
      <div className="person-hero__text">
        <div className="person-hero__eyebrow">{eyebrow}</div>
        <div className="person-hero__name">
          {name.split(' ').slice(0, 1).join(' ')}{' '}
          <em>{name.split(' ').slice(1).join(' ') || name}</em>
        </div>
        <div className="person-hero__sub">
          {facts.map(([k, v]) => (
            <div key={k}>
              <strong>{k}</strong> {v}
            </div>
          ))}
        </div>
        {showTags ? (
          <div className="person-hero__tags">
            {styleTags.slice(0, 6).map((tag: any) => (
              <span className="tag lime" key={String(tag)}>{String(tag)}</span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="person-hero__visual">
        <div className="hero-glyph">{initials(profile.display_name || profile.name_zh || '?')}</div>
      </div>
    </div>
  );
}

function renderKpiStrip(profile: PersonProfile, locale: AppCopy['locale']) {
  const items = profile.kpis.slice(0, profile.kind === 'player' ? 6 : 5);
  const cols = items.length;
  return (
    <div className={`kpi-strip cols-${cols}`}>
      {items.map((kpi) => {
        const label = locale === 'zh' ? kpi.label_zh : kpi.label_en;
        const unit = locale === 'zh' ? kpi.unit_zh : kpi.unit_en;
        const pending = (kpi.status ?? '').includes('pending') || kpi.value === 'null' || kpi.value === '';
        const val = pending ? (locale === 'zh' ? '待补齐' : 'Pending') : kpi.value;
        return (
          <div className="kpi" key={kpi.id}>
            <div className="kl">{label}</div>
            <div className={`kv ${kpi.tier === 'direct' ? 'lime' : kpi.tier === 'derived' ? 'gold' : ''}`}>
              {val}{unit ? <span style={{ fontSize: 18 }}>{unit}</span> : null}
            </div>
            <div className="ks">
              <span className={`src ${kpi.tier === 'direct' ? 'src-d' : kpi.tier === 'derived' ? 'src-a' : 'src-s'}`}>
                {tierLabel(kpi.tier, locale)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function renderSection(section: PersonSection, locale: AppCopy['locale']) {
  const title = locale === 'zh' ? section.title_zh : section.title_en;

  if (section.type === 'profile_facts') {
    return (
      <article className="people-card">
        <header className="people-card__header">
          <h2>{title}</h2>
        </header>
        <div className="people-table" role="table" aria-label={title}>
          <div className="people-table__head" aria-hidden="true">
            <span>{locale === 'zh' ? '字段' : 'Field'}</span>
            <span>{locale === 'zh' ? '值' : 'Value'}</span>
            <span>{locale === 'zh' ? '性质' : 'Tier'}</span>
            <span>{locale === 'zh' ? '备注' : 'Note'}</span>
          </div>
          {section.rows.map((row) => (
            <div className="people-table__row" role="row" key={`${row.label_en}:${row.value}`}>
              <span>{locale === 'zh' ? row.label_zh : row.label_en}</span>
              <strong>{row.value}</strong>
              <span className={`tier-badge tier-badge--${row.tier}`}>{tierLabel(row.tier, locale)}</span>
              <span className="people-table__note">{locale === 'zh' ? row.note_zh ?? '—' : row.note_en ?? '—'}</span>
            </div>
          ))}
        </div>
      </article>
    );
  }

  if (section.type === 'career_timeline') {
    return (
      <article className="people-card">
        <header className="people-card__header">
          <h2>{title}</h2>
        </header>
        <div className="people-table" role="table" aria-label={title}>
          <div className="people-table__head" aria-hidden="true">
            <span>{locale === 'zh' ? '赛季' : 'Season'}</span>
            <span>{locale === 'zh' ? '球队/单位' : 'Team'}</span>
            <span>{locale === 'zh' ? '范围' : 'Scope'}</span>
            <span>{locale === 'zh' ? '记录' : 'Record'}</span>
            <span>{locale === 'zh' ? '性质' : 'Tier'}</span>
          </div>
          {section.rows.map((row) => (
            <div className="people-table__row" role="row" key={`${row.season}:${row.team_en ?? ''}`}>
              <span>{row.season}</span>
              <strong>{locale === 'zh' ? row.team_zh ?? row.team_en ?? '—' : row.team_en ?? row.team_zh ?? '—'}</strong>
              <span>{locale === 'zh' ? row.competition_zh ?? row.competition_en ?? '—' : row.competition_en ?? row.competition_zh ?? '—'}</span>
              <span className="people-table__note">{row.record ?? '—'}</span>
              <span className={`tier-badge tier-badge--${row.tier}`}>{tierLabel(row.tier, locale)}</span>
            </div>
          ))}
        </div>
      </article>
    );
  }

  if (section.type === 'referee_bias') {
    return (
      <article className="people-card">
        <header className="people-card__header">
          <h2>{title}</h2>
          {section.note_zh || section.note_en ? (
            <p>{locale === 'zh' ? section.note_zh : section.note_en}</p>
          ) : null}
        </header>
        <div className="people-table" role="table" aria-label={title}>
          <div className="people-table__head" aria-hidden="true">
            <span>{locale === 'zh' ? '指标' : 'Metric'}</span>
            <span>{locale === 'zh' ? '本人' : 'Value'}</span>
            <span>{locale === 'zh' ? '均值' : 'Avg'}</span>
            <span>{locale === 'zh' ? '偏差' : 'Delta'}</span>
            <span>{locale === 'zh' ? '性质' : 'Tier'}</span>
          </div>
          {section.rows.map((row) => (
            <div className="people-table__row" role="row" key={row.metric_en}>
              <span>{locale === 'zh' ? row.metric_zh : row.metric_en}</span>
              <strong>{row.value}</strong>
              <span>{row.league_avg}</span>
              <span className="people-delta">{row.delta}</span>
              <span className={`tier-badge tier-badge--${row.tier}`}>{tierLabel(row.tier, locale)}</span>
            </div>
          ))}
        </div>
      </article>
    );
  }

  if (section.type === 'style_tags') {
    return (
      <article className="people-card">
        <header className="people-card__header">
          <h2>{title}</h2>
          <p className="people-card__muted">
            {section.status === 'available'
              ? locale === 'zh' ? '已激活：可输出稳定风格标签。' : 'Active: stable style tags available.'
              : locale === 'zh' ? '样本不足：标签仅作占位展示。' : 'Insufficient sample: placeholder tags only.'}
          </p>
        </header>
        <div className="people-tags" aria-label={locale === 'zh' ? '风格标签' : 'Style tags'}>
          {section.tags.length ? (
            section.tags.map((tag) => (
              <span key={tag.label_en} className={`people-tag people-tag--${tag.tier}`}>
                {locale === 'zh' ? tag.label_zh : tag.label_en}
              </span>
            ))
          ) : (
            <span className="people-card__muted">{locale === 'zh' ? '暂无可用标签' : 'No tags yet'}</span>
          )}
        </div>
        {section.note_zh || section.note_en ? (
          <p className="people-card__footnote">{locale === 'zh' ? section.note_zh : section.note_en}</p>
        ) : null}
      </article>
    );
  }

  // recent_matches
  return (
    <article className="people-card">
      <header className="people-card__header">
        <h2>{title}</h2>
      </header>
      <div className="people-table" role="table" aria-label={title}>
        <div className="people-table__head" aria-hidden="true">
          <span>{locale === 'zh' ? '日期' : 'Date'}</span>
          <span>{locale === 'zh' ? '赛事' : 'Competition'}</span>
          <span>{locale === 'zh' ? '对阵' : 'Match'}</span>
          <span>{locale === 'zh' ? '比分' : 'Score'}</span>
          <span>{locale === 'zh' ? '性质' : 'Tier'}</span>
        </div>
        {section.rows.map((row) => {
          const matchup = `${row.home} vs ${row.away}`;
          const content = (
            <>
              <span>{row.date}</span>
              <span>{row.competition}</span>
              <strong>{matchup}</strong>
              <span>{row.score}</span>
              <span className={`tier-badge tier-badge--${row.tier}`}>{tierLabel(row.tier, locale)}</span>
            </>
          );

          if (row.match_id) {
            return (
              <a
                className="people-table__row people-table__row--link"
                href={localizePath(`/matches/historical/${encodeURIComponent(row.match_id)}`, locale)}
                key={row.match_id}
                aria-label={locale === 'zh' ? `打开历史比赛详情：${matchup}` : `Open match: ${matchup}`}
              >
                {content}
              </a>
            );
          }

          return (
            <div className="people-table__row" role="row" key={`${row.date}:${matchup}`}>
              {content}
            </div>
          );
        })}
      </div>
    </article>
  );
}

export function PersonDetailPage({
  profile,
  copy,
  emptyReason
}: {
  profile: PersonProfile | null;
  copy: AppCopy;
  emptyReason?: string;
}) {
  const locale = copy.locale;

  if (!profile) {
    return (
      <main className="world-cup-page world-cup-page--people">
        <section className="section page-intro">
          <a className="back-link" href={localizePath('/people', locale)}>
            {locale === 'zh' ? '返回人物列表' : 'Back to people'}
          </a>
          <div className="section-header">
            <h1 className="page-title">{locale === 'zh' ? '人物档案不可用' : 'Profile unavailable'}</h1>
            <p className="page-subtitle">
              {emptyReason ?? (locale === 'zh' ? '数据层尚未发布该人物档案。' : 'The data layer has not published this profile yet.')}
            </p>
          </div>
        </section>
      </main>
    );
  }

  const country = locale === 'zh' ? profile.country_name_zh : profile.country_name_en;
  const role = locale === 'zh' ? profile.role_title_zh : profile.role_title_en;
  const teamMeta = profile.primary_team_name ? ` · ${profile.primary_team_name}` : '';

  return (
    <main className="world-cup-page world-cup-page--people">
      <section className="section page-intro">
        <a className="back-link" href={localizePath('/people', locale)}>
          {locale === 'zh' ? '返回人物列表' : 'Back to people'}
        </a>
        {renderHero(profile, locale)}
      </section>

      <section className="section">
        <div className="sec-rule">
          <span className="sec-title">{locale === 'zh' ? '核心指标' : 'Key metrics'}</span>
          <span className="sec-note">{profile.updated_at}</span>
        </div>
        {renderKpiStrip(profile, locale)}
      </section>

      <section className="section people-sections">
        {profile.sections.map((section) => (
          <div key={`${profile.person_id}:${section.type}`}>{renderSection(section, locale)}</div>
        ))}
      </section>

      <section className="section">
        <article className="people-card">
          <header className="people-card__header">
            <h2>{locale === 'zh' ? '数据来源与覆盖' : 'Sources and coverage'}</h2>
            <p className="people-card__muted">
              {locale === 'zh'
                ? `状态：${profile.source_status} · 更新时间：${profile.updated_at}`
                : `Status: ${profile.source_status} · Updated: ${profile.updated_at}`}
            </p>
          </header>
          <div className="people-sources">
            {profile.source_urls.length ? (
              profile.source_urls.map((url) => (
                <div className="people-source" key={url}>
                  <span className="people-source__dot" aria-hidden="true" />
                  <span>{url}</span>
                </div>
              ))
            ) : (
              <span className="people-card__muted">{locale === 'zh' ? '暂无来源链接' : 'No source links'}</span>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
