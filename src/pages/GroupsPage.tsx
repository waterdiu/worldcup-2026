import { GroupsSection } from '../components/GroupsSection';
import type { AppCopy } from '../i18n/content';
import type { GroupCardData } from '../types/tournament';

interface GroupsPageProps {
  groups: GroupCardData[];
  drawDateLabel: string;
  copy: AppCopy;
}

export function GroupsPage({ groups, drawDateLabel, copy }: GroupsPageProps) {
  return (
    <>
      <section className="section page-intro">
        <h1 className="page-title">{copy.locale === 'zh' ? '分组详情' : 'Group Details'}</h1>
      </section>
      <GroupsSection
        groups={groups}
        drawDateLabel={drawDateLabel}
        copy={copy}
        showHeader={false}
        groupLinkBasePath="/groups"
      />
    </>
  );
}
