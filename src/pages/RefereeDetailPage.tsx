import type { PersonProfile } from '../data/mockPeople';
import type { AppCopy } from '../i18n/content';
import { PersonDetailPage } from './PersonDetailPage';

export function RefereeDetailPage({ profile, copy }: { profile: PersonProfile | null; copy: AppCopy }) {
  return <PersonDetailPage profile={profile} copy={copy} />;
}

