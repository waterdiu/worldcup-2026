import { localizePath, type AppCopy } from '../i18n/content';
import { formatConfederationName, formatTeamName } from '../i18n/formatters';
import type { ConfederationCardData } from '../types/tournament';
import { QualifiedTeamsRail } from './QualifiedTeamsRail';
import { SectionHeader } from './SectionHeader';

interface QualifiersSectionProps {
  confederations: ConfederationCardData[];
  copy: AppCopy;
  showDetailsLinks?: boolean;
}

export function QualifiersSection({
  confederations,
  copy,
  showDetailsLinks = false
}: QualifiersSectionProps) {
  return (
    <section id="qualifiers" className="section">
      <SectionHeader
        eyebrow={copy.sections.qualifiersEyebrow}
        title={copy.sections.qualifiersTitle}
        description={copy.sections.qualifiersDescription}
      />
      <div className="confederation-grid">
        {confederations.map((confederation) => (
          <article key={confederation.id} className="confederation-card">
            <div className="confederation-card__topline">
              <h3>{formatConfederationName(confederation.name)}</h3>
              <span>{confederation.statusLabel}</span>
            </div>
            <p>{confederation.slotSummary}</p>
            <p>{confederation.remainingPlaces}</p>
            <QualifiedTeamsRail
              teams={confederation.qualifiedTeams.map((team) => formatTeamName(team))}
              label={copy.labels.qualifiedTeams}
            />
            <ul>
              {confederation.featuredMatches.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
            {showDetailsLinks ? (
              <a className="text-link" href={localizePath(`/qualifiers/${confederation.id}`, copy.locale)}>
                查看{formatConfederationName(confederation.name)}详情
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
