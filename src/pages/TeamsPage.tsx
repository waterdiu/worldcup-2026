import { findTeamProfile } from '../data/teamProfiles';
import { localizePath, type AppCopy } from '../i18n/content';
import { formatConfederationName, formatTeamName } from '../i18n/formatters';
import type { ConfederationCardData, GroupCardData } from '../types/tournament';

interface TeamsPageProps {
  groups: GroupCardData[];
  confederations: ConfederationCardData[];
  copy: AppCopy;
}

function findConfederation(team: string, confederations: ConfederationCardData[]) {
  return confederations.find((confederation) => confederation.qualifiedTeams.includes(team));
}

export function TeamsPage({
  groups,
  confederations,
  copy
}: TeamsPageProps) {
  const teamCards = groups.flatMap((group) =>
    group.teams.map((team) => ({
      name: team.name,
      groupId: group.id,
      confederation: findConfederation(team.name, confederations),
      profile: findTeamProfile(team.name)
    }))
  );

  return (
    <>
      <section className="section page-intro">
        <h1 className="page-title">{copy.locale === 'zh' ? '球队总览' : 'Teams Overview'}</h1>
      </section>

      <section className="section">
        <div className="team-grid team-grid--release">
          {teamCards.map(({ name, groupId, confederation, profile }) => (
            <a
              key={name}
              className="team-card team-card__link team-card__name-link"
              href={localizePath(`/teams/${encodeURIComponent(name)}`, copy.locale)}
              aria-label={copy.locale === 'zh' ? `进入球队详情: ${name}` : `open team details: ${name}`}
            >
              <article>
                <strong>{formatTeamName(name, copy.locale)}</strong>
                <div className="team-card__meta">
                  <span>
                    {copy.labels.groupPrefix} {groupId}
                  </span>
                  <span>{formatConfederationName(confederation?.name ?? '', copy.locale)}</span>
                  {profile ? (
                    <span className="team-card__rank">
                      {copy.locale === 'zh'
                        ? `世界排名第 ${profile.worldRanking} 位`
                        : `World ranking #${profile.worldRanking}`}
                    </span>
                  ) : null}
                </div>
              </article>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
