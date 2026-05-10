import type { AppCopy } from '../i18n/content';
import type { TournamentMeta } from '../types/tournament';

interface SnapshotStripProps {
  meta: TournamentMeta;
  copy: AppCopy;
}

export function SnapshotStrip({ meta, copy }: SnapshotStripProps) {
  const labels = copy.snapshotLabels;
  const values = [meta.teamCount, meta.groupCount, meta.matchCount, meta.hostCities];

  return (
    <section className="snapshot">
      {values.map((value, index) => (
        <article key={labels[index]} className="snapshot__card">
          <strong>{value}</strong>
          <span>{labels[index]}</span>
        </article>
      ))}
    </section>
  );
}
