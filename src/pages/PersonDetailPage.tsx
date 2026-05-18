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

function valueOrPending(value: unknown, locale: AppCopy['locale']) {
  const s = coerceString(value);
  if (s && s !== 'null') return s;
  return locale === 'zh' ? '待补齐' : 'Pending';
}

function isPending(value: unknown) {
  const s = coerceString(value);
  return !s || s === 'null';
}

function renderDataGrid(profile: PersonProfile, locale: AppCopy['locale']) {
  const direct = (profile.direct ?? {}) as any;
  const coverage = (direct.field_coverage ?? {}) as Record<string, string>;
  const derived = (profile.derived ?? {}) as any;
  const metrics = (derived.metrics ?? {}) as any;

  const nation = direct.nationality ?? (locale === 'zh' ? profile.country_name_zh : profile.country_name_en);

  const leftRows: Array<{ field: string; value: unknown; note: string }> = [
    { field: locale === 'zh' ? '国籍' : 'Nation', value: nation, note: coverage.nationality ?? 'FIFA' }
  ];

  if (profile.kind !== 'referee') {
    leftRows.push({ field: locale === 'zh' ? '球队' : 'Team', value: profile.primary_team_name ?? '—', note: 'FIFA' });
  }

  if (profile.kind === 'coach') {
    leftRows.push({
      field: locale === 'zh' ? '合同至' : 'Contract',
      value: direct.contract_until,
      note: coverage.contract_until ?? 'pending_source'
    });
    leftRows.push({
      field: locale === 'zh' ? '任命日期' : 'Appointed',
      value: direct.appointed_at,
      note: coverage.appointed_at ?? 'pending_source'
    });
  }

  if (profile.kind === 'player') {
    leftRows.push({ field: locale === 'zh' ? '位置' : 'Position', value: direct.position, note: coverage.position ?? 'FIFA' });
    leftRows.push({ field: locale === 'zh' ? '俱乐部' : 'Club', value: direct.club, note: coverage.club ?? 'pending_source' });
    leftRows.push({ field: locale === 'zh' ? '号码' : 'Shirt', value: direct.shirt_number, note: coverage.shirt_number ?? 'pending_source' });
  }

  leftRows.push({ field: locale === 'zh' ? '出生日期' : 'DOB', value: direct.date_of_birth, note: coverage.date_of_birth ?? 'pending_source' });
  leftRows.push({ field: locale === 'zh' ? '年龄' : 'Age', value: direct.age, note: coverage.age ?? 'pending_source' });

  const rightRows: Array<{ field: string; value: unknown; note: string }> = [];

  if (profile.kind === 'coach') {
    const w = metrics.w_total;
    const d = metrics.d_total;
    const l = metrics.l_total;
    rightRows.push({
      field: locale === 'zh' ? '近10场' : 'Last 10',
      value: typeof w === 'number' && typeof d === 'number' && typeof l === 'number' ? `${w}-${d}-${l}` : null,
      note: derived.window ?? 'last_10'
    });
    rightRows.push({
      field: locale === 'zh' ? '胜率' : 'Win rate',
      value: typeof metrics.win_rate_pct === 'number' ? `${metrics.win_rate_pct.toFixed(1)}%` : null,
      note: 'derived'
    });
    rightRows.push({
      field: locale === 'zh' ? '场均进球' : 'GF / match',
      value: typeof metrics.goals_for_per_match === 'number' ? metrics.goals_for_per_match.toFixed(2) : null,
      note: 'derived'
    });
    rightRows.push({
      field: locale === 'zh' ? '场均失球' : 'GA / match',
      value: typeof metrics.goals_against_per_match === 'number' ? metrics.goals_against_per_match.toFixed(2) : null,
      note: 'derived'
    });
    rightRows.push({
      field: locale === 'zh' ? '零封率' : 'Shutouts',
      value: typeof metrics.clean_sheet_rate_pct === 'number' ? `${metrics.clean_sheet_rate_pct.toFixed(0)}%` : null,
      note: 'derived'
    });
  }

  if (profile.kind === 'player') {
    rightRows.push({ field: locale === 'zh' ? '出场' : 'Caps', value: metrics.caps ?? null, note: derived.status ?? 'pending_source' });
    rightRows.push({ field: locale === 'zh' ? '进球' : 'Goals', value: metrics.goals ?? null, note: derived.status ?? 'pending_source' });
    rightRows.push({ field: locale === 'zh' ? '影响力' : 'Impact', value: metrics.impact_score ?? null, note: derived.status ?? 'pending_source' });
  }

  if (profile.kind === 'referee') {
    rightRows.push({ field: locale === 'zh' ? '样本场次' : 'Sample', value: metrics.matches ?? null, note: derived.status ?? 'derived' });
    rightRows.push({ field: locale === 'zh' ? '场均黄牌' : 'Yellows', value: metrics.yellow_cards_per_match ?? null, note: derived.status ?? 'derived' });
    rightRows.push({ field: locale === 'zh' ? '场均红牌' : 'Reds', value: metrics.red_cards_per_match ?? null, note: derived.status ?? 'derived' });
    rightRows.push({ field: locale === 'zh' ? '平局率' : 'Draw rate', value: metrics.draw_rate ?? null, note: derived.status ?? 'derived' });
  }

  const column = (title: string, rows: typeof leftRows, tierBadge: 'src-d' | 'src-a') => (
    <div className="data-col">
      <div className="data-col__label">
        {title} <span className={`src ${tierBadge}`}>{tierBadge === 'src-d' ? (locale === 'zh' ? '直接数据' : 'Direct') : (locale === 'zh' ? '派生分析' : 'Derived')}</span>
      </div>
      {rows.map((row) => (
        <div className="data-row" key={row.field}>
          <span className="field">{row.field}</span>
          <span className={`val ${isPending(row.value) ? 'val--pending' : ''}`}>{valueOrPending(row.value, locale)}</span>
          <span className="note">{row.note}</span>
        </div>
      ))}
    </div>
  );

  return (
    <section className="section">
      <div className="sec-rule">
        <span className="sec-title">{locale === 'zh' ? '基础档案' : 'Profile'}</span>
        <span className="sec-note">{locale === 'zh' ? 'direct / derived' : 'direct / derived'}</span>
      </div>
      <div className="data-grid cols-2">
        {column(locale === 'zh' ? '个人信息' : 'Identity', leftRows, 'src-d')}
        {column(locale === 'zh' ? '指标摘要' : 'Summary', rightRows, 'src-a')}
      </div>
    </section>
  );
}

function renderAbilityBars(profile: PersonProfile, locale: AppCopy['locale']) {
  if (profile.kind !== 'player') return null;
  const derived = (profile.derived ?? {}) as any;
  const ratings = (derived.dimension_ratings ?? {}) as Record<string, number>;
  const hasRatings = ratings && Object.keys(ratings).length > 0;

  const placeholder = [
    { label_zh: '速度突破', label_en: 'Pace', value: null },
    { label_zh: '终结能力', label_en: 'Finishing', value: null },
    { label_zh: '传球创造', label_en: 'Creation', value: null },
    { label_zh: '防守参与', label_en: 'Defending', value: null }
  ];

  const items = hasRatings
    ? Object.entries(ratings).slice(0, 6).map(([k, v]) => ({ label_zh: k, label_en: k, value: v }))
    : placeholder;

  return (
    <section className="section">
      <div className="sec-rule">
        <span className="sec-title">{locale === 'zh' ? '能力评分' : 'Ability ratings'}</span>
        <span className="sec-note">{hasRatings ? (locale === 'zh' ? '派生分析' : 'derived') : (locale === 'zh' ? '待补齐' : 'pending')}</span>
      </div>
      <div className="ability-grid cols-2">
        <div className="ability-col">
          <div className="ability-col__label">
            <span>{locale === 'zh' ? '维度' : 'Dimensions'}</span>
            <span className="src src-a">{locale === 'zh' ? '派生分析' : 'Derived'}</span>
          </div>
          {items.map((item) => {
            const label = locale === 'zh' ? item.label_zh : item.label_en;
            const pending = item.value === null || Number.isNaN(item.value as any);
            const value = pending ? null : Math.max(0, Math.min(100, Number(item.value)));
            return (
              <div className="bar-row" key={label}>
                <div className="bar-row__head">
                  <span className="bar-row__label">{label}</span>
                  <span className="bar-row__val">{pending ? (locale === 'zh' ? '待补齐' : 'Pending') : value}</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill bar-lime" style={{ width: pending ? '0%' : `${value}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="ability-col">
          <div className="ability-col__label">
            <span>{locale === 'zh' ? '说明' : 'Notes'}</span>
            <span className="src src-a">{locale === 'zh' ? '派生分析' : 'Derived'}</span>
          </div>
          <p className="people-card__muted">
            {locale === 'zh'
              ? '能力评分需要稳定的分钟数、技术统计或事件数据源。当前若显示“待补齐”，表示数据层尚未发布可复现的评分输入。'
              : 'Ability ratings require stable minutes + stats/event feeds. Pending means the data layer has not published reproducible inputs yet.'}
          </p>
        </div>
      </div>
    </section>
  );
}

function renderStyleProfile(profile: PersonProfile, locale: AppCopy['locale']) {
  const distilled = (profile.distilled ?? {}) as any;
  const tags = Array.isArray(distilled.style_tags) ? distilled.style_tags : [];
  const status = distilled.distillation_status ?? profile.distillation_status ?? 'insufficient_sample';
  const summary = coerceString(distilled.summary);

  return (
    <section className="section">
      <div className="sec-rule">
        <span className="sec-title">{locale === 'zh' ? '风格画像' : 'Style profile'}</span>
        <span className="sec-note">{String(status)}</span>
      </div>
      <div className="style-grid cols-2">
        <div className="style-col">
          <div className="style-col__label">{locale === 'zh' ? '标签' : 'Tags'}</div>
          <div className="style-tags">
            {tags.length ? tags.slice(0, 10).map((t: any) => <span className="tag lime" key={String(t)}>{String(t)}</span>) : (
              <span className="people-card__muted">{locale === 'zh' ? '样本不足' : 'Insufficient sample'}</span>
            )}
          </div>
          <div className="evidence">
            {locale === 'zh'
              ? '蒸馏规则：样本 ≥30 场才输出稳定标签；不足时仅展示状态，不输出结论。'
              : 'Rule: requires ≥30 matches to output stable tags; otherwise show status only.'}
          </div>
        </div>
        <div className="style-col">
          <div className="style-col__label">{locale === 'zh' ? '摘要' : 'Summary'}</div>
          <div className="style-summary">
            {summary ?? (locale === 'zh'
              ? '暂无可用摘要（样本不足或数据层未发布）。'
              : 'No summary yet (insufficient sample or not published).')}
          </div>
          <div className="evidence">{locale === 'zh' ? '来源：事件/阵型/换人等高粒度数据。' : 'Source: event/shape/substitution feeds.'}</div>
        </div>
      </div>
    </section>
  );
}

function renderImpactBox(profile: PersonProfile, locale: AppCopy['locale']) {
  if (profile.kind !== 'player') return null;
  const derived = (profile.derived ?? {}) as any;
  const box = derived.impact_box ?? {};
  const pct = box.absence_impact_pct;
  const explain = locale === 'zh' ? box.absence_impact_explain_zh : box.absence_impact_explain_en;
  const pending = pct === null || pct === undefined;
  return (
    <section className="section">
      <div className="impact-box">
        <div className="impact-title">{locale === 'zh' ? '缺阵影响' : 'Absence impact'}</div>
        <p>
          {pending
            ? (locale === 'zh' ? '需要可靠的出场分钟、进球贡献或模型输入源后才能计算。' : 'Requires reliable minutes/stats or model inputs.')
            : `${locale === 'zh' ? '缺席时球队预期进球变化：' : 'Estimated team xG change when absent: '}${pct}%`}
          {!pending && explain ? ` ${explain}` : ''}
        </p>
      </div>
    </section>
  );
}

function renderMethodology(profile: PersonProfile, locale: AppCopy['locale']) {
  const kind = profile.kind;
  const base = import.meta.env.PROD
    ? 'https://waterdiu.github.io/football-data-platform/api/worldcup/2026'
    : '/api/worldcup/2026';
  const dataLinks =
    kind === 'coach'
      ? [
          { label: locale === 'zh' ? '教练档案' : 'coach-profiles', url: `${base}/core/coach-profiles.json` },
          { label: locale === 'zh' ? '教练补充事实' : 'staff-external-facts', url: `${base}/core/staff-external-facts.json` }
        ]
      : kind === 'player'
        ? [
            { label: locale === 'zh' ? '球员档案' : 'player-profiles', url: `${base}/core/player-profiles.json` },
            { label: locale === 'zh' ? '球员补充事实' : 'player-external-facts', url: `${base}/core/player-external-facts.json` }
          ]
        : [
            { label: locale === 'zh' ? '裁判档案' : 'referee-profiles', url: `${base}/core/referee-profiles.json` }
          ];

  const directText =
    locale === 'zh'
      ? kind === 'coach'
        ? '官方确认“谁是主教练”、所属球队。补充事实来自可追溯的第三方离线数据，字段带来源标记。'
        : kind === 'player'
          ? '官方名单确认“谁在 26 人名单”、位置。俱乐部/生日等补充事实来自可追溯的第三方离线数据，字段带来源标记。'
          : '裁判名单与历史执法样本来自公开赛果数据集；世界杯官方指派发布后会替换为赛事样本。'
      : kind === 'coach'
        ? 'Direct facts: official head coach + team. Extra facts come from auditable offline datasets and are source-tagged.'
        : kind === 'player'
          ? 'Direct facts: official roster membership + position. Extra facts (club/DOB) come from auditable offline datasets and are source-tagged.'
          : 'Referee facts: public match-result datasets. Will be replaced by official World Cup assignments when published.';

  const derivedText =
    locale === 'zh'
      ? kind === 'coach'
        ? '近 10 场窗口派生：胜/平/负、胜率、场均进失球、零封率。公式只依赖比分，不做主观打分。'
        : kind === 'player'
          ? '国家队出场/进球为事实汇总；影响力当前为代理分（impact_proxy_score），仅用于展示“已接入/待升级”。'
          : '按历史样本计算：黄/红/点球/平局率等，并可与样本均值做对比。样本不足时会标注。'
      : kind === 'coach'
        ? 'Derived: last-10 window W/D/L, win rate, goals for/against per match, clean sheet rate. Scoreline-only, no subjective scoring.'
        : kind === 'player'
          ? 'Derived: caps/goals aggregation; impact is a proxy score for UI only and clearly labeled.'
          : 'Derived: yellows/reds/pens/draw-rate from sample matches, with league-mean comparisons when available.';

  const distilledText =
    locale === 'zh'
      ? '风格蒸馏需要事件/阵型/换人等高粒度数据。规则：样本 ≥30 场才输出稳定标签；否则仅显示“样本不足”。'
      : 'Distillation requires event/shape/substitution feeds. Rule: ≥30 matches required for stable tags; otherwise show “insufficient sample”.';

  return (
    <section className="section">
      <div className="sec-rule">
        <span className="sec-title">{locale === 'zh' ? '数据与模型说明' : 'Data & methodology'}</span>
        <span className="sec-note">{locale === 'zh' ? '不伪造 · 可复现 · 可追溯' : 'No fabrication · Reproducible · Traceable'}</span>
      </div>
      <div className="method-grid">
        <div className="method-col">
          <div className="method-col__label">
            <span>{locale === 'zh' ? '直接数据' : 'Direct'}</span>
            <span className="src src-d">{tierLabel('direct', locale)}</span>
          </div>
          <div className="method-body">{directText}</div>
        </div>
        <div className="method-col">
          <div className="method-col__label">
            <span>{locale === 'zh' ? '派生指标' : 'Derived'}</span>
            <span className="src src-a">{tierLabel('derived', locale)}</span>
          </div>
          <div className="method-body">{derivedText}</div>
        </div>
        <div className="method-col">
          <div className="method-col__label">
            <span>{locale === 'zh' ? '风格蒸馏' : 'Distilled'}</span>
            <span className="src src-s">{tierLabel('distilled', locale)}</span>
          </div>
          <div className="method-body">{distilledText}</div>
        </div>
      </div>
      <div className="method-links">
        {dataLinks.map((l) => (
          <a key={l.url} className="method-link" href={l.url} target="_blank" rel="noreferrer">
            {l.label}
          </a>
        ))}
      </div>
    </section>
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
  const sections = profile.sections.filter((section) => !['profile_facts', 'style_tags'].includes(section.type));
  const coachSections = sections.filter((s) => s.type === 'career_timeline' || s.type === 'recent_matches');
  const refereeSections = sections.filter((s) => s.type === 'referee_bias' || s.type === 'recent_matches');
  const miscSections = sections.filter((s) => !['career_timeline', 'referee_bias', 'recent_matches'].includes(s.type));

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

      {renderDataGrid(profile, locale)}
      {renderStyleProfile(profile, locale)}
      {renderImpactBox(profile, locale)}
      {renderAbilityBars(profile, locale)}
      {renderMethodology(profile, locale)}

      {profile.kind === 'coach' && coachSections.length ? (
        <section className="section people-sections">
          {coachSections.map((section) => (
            <div key={`${profile.person_id}:${section.type}`}>{renderSection(section, locale)}</div>
          ))}
        </section>
      ) : null}

      {profile.kind === 'referee' && refereeSections.length ? (
        <section className="section people-sections">
          {refereeSections.map((section) => (
            <div key={`${profile.person_id}:${section.type}`}>{renderSection(section, locale)}</div>
          ))}
        </section>
      ) : null}

      {profile.kind === 'player' && miscSections.length ? (
        <section className="section people-sections">
          {miscSections.map((section) => (
            <div key={`${profile.person_id}:${section.type}`}>{renderSection(section, locale)}</div>
          ))}
        </section>
      ) : null}

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
