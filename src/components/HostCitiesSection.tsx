import type { AppCopy } from '../i18n/content';
import { formatHostCityName } from '../i18n/formatters';
import type { TournamentMeta } from '../types/tournament';
import { SectionHeader } from './SectionHeader';

interface HostCitiesSectionProps {
  meta: TournamentMeta;
  copy: AppCopy;
}

export function HostCitiesSection({ meta, copy }: HostCitiesSectionProps) {
  return (
    <section className="section" id="cities">
      <SectionHeader
        eyebrow={copy.sections.citiesEyebrow}
        title={copy.sections.citiesTitle}
        description={copy.sections.citiesDescription}
      />
      <div className="cities-grid">
        {meta.hostCityNames.map((city) => (
          <article key={city} className="city-card">
            <strong>{formatHostCityName(city, copy.locale)}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
