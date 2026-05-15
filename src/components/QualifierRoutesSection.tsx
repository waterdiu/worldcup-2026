import { formatTeamName } from '../i18n/formatters';
import type { QualifierDetailData } from '../types/tournament';

interface QualifierRoutesSectionProps {
  detail: QualifierDetailData;
}

export function QualifierRoutesSection({ detail }: QualifierRoutesSectionProps) {
  return (
    <section className="qualifier-route-section">
      <div className="qualifier-sec-rule">
        <span>05</span>
        <h2>晋级路线</h2>
      </div>
      <div className="qualifier-route-grid">
        {detail.routes.map((route) => (
          <article key={route.team} className="qualifier-route-card">
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
