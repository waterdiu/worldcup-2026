import type { AppCopy } from '../i18n/content';
import { SectionHeader } from './SectionHeader';

interface FormatExplainerProps {
  copy: AppCopy;
}

export function FormatExplainer({ copy }: FormatExplainerProps) {
  return (
    <section className="section" id="format">
      <SectionHeader
        eyebrow={copy.sections.formatEyebrow}
        title={copy.sections.formatTitle}
        description={copy.sections.formatDescription}
      />
      <div className="format-grid">
        <article className="format-card">
          <strong>12 {copy.snapshotLabels[1]}</strong>
          <p>{copy.sections.formatDescription}</p>
        </article>
        <article className="format-card">
          <strong>{copy.labels.topTwoTitle}</strong>
          <p>{copy.labels.topTwoDescription}</p>
        </article>
        <article className="format-card">
          <strong>{copy.labels.bestThirdTitle}</strong>
          <p>{copy.labels.bestThirdDescription}</p>
        </article>
      </div>
    </section>
  );
}
