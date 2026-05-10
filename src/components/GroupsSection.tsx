import type { AppCopy } from '../i18n/content';
import { localizePath } from '../i18n/content';
import { formatTeamName } from '../i18n/formatters';
import type { GroupCardData } from '../types/tournament';
import { SectionHeader } from './SectionHeader';

interface GroupsSectionProps {
  groups: GroupCardData[];
  drawDateLabel: string;
  copy: AppCopy;
  showHeader?: boolean;
  groupLinkBasePath?: string;
}

export function GroupsSection({
  groups,
  drawDateLabel,
  copy,
  showHeader = true,
  groupLinkBasePath
}: GroupsSectionProps) {
  return (
    <section id="groups" className="section">
      {showHeader && (
        <SectionHeader
          eyebrow={copy.sections.groupsEyebrow}
          title={copy.sections.groupsTitle}
          description={copy.sections.groupsDescription}
        />
      )}
      <p className="section-note">{drawDateLabel}</p>
      <div className="group-grid">
        {groups.map((group) => (
          <article key={group.id} className="group-card">
            <header className="group-card__header">
              <h3>
                {groupLinkBasePath ? (
                  <a
                    className="group-card__title-link"
                    href={localizePath(`${groupLinkBasePath}/${group.id}`, copy.locale)}
                  >
                    {copy.labels.groupPrefix} {group.id}
                  </a>
                ) : (
                  <>
                    {copy.labels.groupPrefix} {group.id}
                  </>
                )}
              </h3>
              <span>{copy.labels.drawComplete}</span>
            </header>
            <p className="group-card__note">{copy.labels.standingsShell}</p>
            <div className="group-card__table">
              <div className="group-card__row group-card__row--head">
                <span>#</span>
                <span>{copy.locale === 'zh' ? '球队' : 'Team'}</span>
                <span>{copy.locale === 'zh' ? '胜' : 'W'}</span>
                <span>{copy.locale === 'zh' ? '平' : 'D'}</span>
                <span>{copy.locale === 'zh' ? '负' : 'L'}</span>
                <span>{copy.locale === 'zh' ? '进' : 'GF'}</span>
                <span>{copy.locale === 'zh' ? '失' : 'GA'}</span>
                <span>{copy.locale === 'zh' ? '分' : 'Pts'}</span>
              </div>
            </div>
            <ul className="group-card__list">
              {group.teams.map((team, index) => (
                <li key={`${group.id}-${team.name}`}>
                  <span>{index + 1}</span>
                  <span>
                    <a
                      className="group-team-link"
                      href={localizePath(`/teams/${encodeURIComponent(team.name)}`, copy.locale)}
                    >
                      {formatTeamName(team.name, copy.locale)}
                    </a>
                  </span>
                  <span>{team.won}</span>
                  <span>{team.drawn}</span>
                  <span>{team.lost}</span>
                  <span>{team.goalsFor}</span>
                  <span>{team.goalsAgainst}</span>
                  <span>{team.points}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
