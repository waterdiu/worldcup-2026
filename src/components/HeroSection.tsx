import type { AppCopy } from '../i18n/content';
import type { TournamentMeta } from '../types/tournament';

interface HeroSectionProps {
  meta: TournamentMeta;
  copy: AppCopy;
  primaryHref?: string;
  secondaryHref?: string;
}

export function HeroSection({
  meta,
  copy,
  primaryHref = '#qualifiers',
  secondaryHref = '#knockout'
}: HeroSectionProps) {
  return (
    <section className="hero" id="top">
      <div className="hero__backdrop" aria-hidden="true" />
      <div className="hero__content">
        <p className="hero__eyebrow">{copy.hero.eyebrow}</p>
        <h1>{copy.hero.title}</h1>
        <p className="hero__hosts">{copy.hero.hosts}</p>
        <p className="hero__status">{copy.hero.status}</p>
        <div className="hero__dates">
          <span>{copy.hero.openingMatch}</span>
          <span>{copy.hero.finalLabel}: {meta.finalDate}</span>
        </div>
        <div className="hero__actions">
          <a href={primaryHref}>{copy.hero.primaryCta}</a>
          <a href={secondaryHref}>{copy.hero.secondaryCta}</a>
        </div>
      </div>
    </section>
  );
}
