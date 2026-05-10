import { formatTeamName } from '../i18n/formatters';
import type { QualifierDetailData } from '../types/tournament';
import { SectionHeader } from './SectionHeader';

interface QualifierRoutesSectionProps {
  detail: QualifierDetailData;
}

export function QualifierRoutesSection({ detail }: QualifierRoutesSectionProps) {
  return (
    <section className="section">
      <SectionHeader
        eyebrow="晋级路线"
        title="晋级路线"
        description="按球队整理晋级方式和关键说明，帮助快速理解每个名额的来源。"
      />
      <div className="route-grid">
        {detail.routes.map((route) => (
          <article key={route.team} className="route-card">
            <div className="route-card__topline">
              <h3>{formatTeamName(route.team)}</h3>
              <span>{route.pathLabel}</span>
            </div>
            <p>{route.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
