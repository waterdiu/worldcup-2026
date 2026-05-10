import { GroupsSection } from '../components/GroupsSection';
import { localizePath, type AppCopy } from '../i18n/content';
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
        <a className="back-link" href={localizePath('/', copy.locale)}>
          {copy.locale === 'zh' ? '返回上一个页面' : 'Back'}
        </a>
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
