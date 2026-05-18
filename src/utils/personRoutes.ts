export type PersonKind = 'coach' | 'player' | 'referee';

export function slugifyPersonId(value: string) {
  return value
    .normalize('NFKD')
    // Strip diacritics
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function buildPersonId(kind: PersonKind, teamId: string | null | undefined, name: string) {
  const slug = slugifyPersonId(name);
  if (kind === 'coach' && teamId) return `${teamId}:staff:${slug}`;
  if (kind === 'player' && teamId) return `${teamId}:player:${slug}`;
  if (kind === 'referee') return `referee:${slug}`;
  return `${kind}:${slug}`;
}

export function buildPersonPath(kind: PersonKind, personId: string) {
  if (kind === 'coach') return `/people/coaches/${encodeURIComponent(personId)}`;
  if (kind === 'player') return `/people/players/${encodeURIComponent(personId)}`;
  return `/people/referees/${encodeURIComponent(personId)}`;
}

