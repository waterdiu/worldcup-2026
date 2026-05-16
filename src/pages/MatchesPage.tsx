import { useEffect, useMemo, useRef } from 'react';
import { KnockoutBracketSection } from '../components/KnockoutBracketSection';
import { SectionHeader } from '../components/SectionHeader';
import { localizePath, type AppCopy } from '../i18n/content';
import { formatTeamName, formatVenueName } from '../i18n/formatters';
import type { BracketRoundData, GroupStageMatchData } from '../types/tournament';

interface MatchesPageProps {
  fixtures: GroupStageMatchData[];
  rounds: BracketRoundData[];
  copy: AppCopy;
}

function formatDetailDate(dateLabel: string, locale: AppCopy['locale']): string {
  if (locale === 'en') return dateLabel;
  const date = new Date(dateLabel);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatMatchday(matchdayLabel: string, locale: AppCopy['locale']): string {
  if (locale === 'en') return matchdayLabel;

  const matchdayNumber = matchdayLabel.match(/\d+/)?.[0];
  return matchdayNumber ? `第 ${matchdayNumber} 轮` : matchdayLabel;
}

function formatPlainTeamName(team: string, locale: AppCopy['locale']): string {
  if (locale === 'en') return team;
  const formatted = formatTeamName(team, locale);
  return formatted.replace(/^\S+\s/, '');
}

export function MatchesPage({ fixtures, rounds, copy }: MatchesPageProps) {
  const groupListRef = useRef<HTMLDivElement | null>(null);
  const knockoutMatchCount = rounds.reduce((count, round) => count + round.matches.length, 0);
  const sortedFixtures = [...fixtures].sort((first, second) => {
    const dateDiff = Date.parse(first.dateLabel) - Date.parse(second.dateLabel);
    if (dateDiff !== 0) return dateDiff;
    return first.groupId.localeCompare(second.groupId) || first.id.localeCompare(second.id);
  });
  const nearestUpcomingFixtureId = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return sortedFixtures.find((fixture) => {
      const fixtureDate = new Date(fixture.dateLabel);
      fixtureDate.setHours(0, 0, 0, 0);
      return fixtureDate.getTime() >= today.getTime();
    })?.id ?? sortedFixtures[sortedFixtures.length - 1]?.id;
  }, [sortedFixtures]);

  useEffect(() => {
    const list = groupListRef.current;
    if (!list || !nearestUpcomingFixtureId) return;

    const target = list.querySelector<HTMLElement>(`[data-nearest-upcoming="true"]`);
    if (!target) return;

    list.scrollTop = Math.max(0, target.offsetTop - list.offsetTop);
  }, [nearestUpcomingFixtureId]);

  return (
    <>
      <section className="section page-intro matches-page-intro">
        <SectionHeader
          title={copy.locale === 'zh' ? '赛程总览' : 'Schedule Overview'}
        />
        <div className="feature-grid matches-summary-grid" aria-label={copy.locale === 'zh' ? '赛程阶段统计' : 'Schedule phase totals'}>
          <article className="feature-card">
            <h3>{copy.locale === 'zh' ? `${sortedFixtures.length} 场小组赛` : `${sortedFixtures.length} group matches`}</h3>
          </article>
          <article className="feature-card">
            <h3>{copy.locale === 'zh' ? `${knockoutMatchCount} 场淘汰赛` : `${knockoutMatchCount} knockout matches`}</h3>
          </article>
        </div>
      </section>
      <section className="section match-overview-section">
        <SectionHeader
          title={copy.locale === 'zh' ? '小组赛' : 'Group Stage'}
        />
        <div className="match-overview-list" ref={groupListRef}>
          {sortedFixtures.map((fixture) => {
            const isNearestUpcoming = fixture.id === nearestUpcomingFixtureId;
            const matchupLabel = `${formatTeamName(fixture.homeTeam, copy.locale)} ${copy.locale === 'zh' ? '对' : 'vs'} ${formatTeamName(fixture.awayTeam, copy.locale)}`;
            const plainMatchupLabel = `${formatPlainTeamName(fixture.homeTeam, copy.locale)} ${copy.locale === 'zh' ? '对' : 'vs'} ${formatPlainTeamName(fixture.awayTeam, copy.locale)}`;

            return (
              <a
                key={fixture.id}
                className="match-overview-card"
                data-testid="match-overview-group-card"
                data-nearest-upcoming={isNearestUpcoming ? 'true' : undefined}
                href={localizePath(`/matches/${encodeURIComponent(fixture.id)}`, copy.locale)}
                aria-label={`${copy.locale === 'zh' ? '打开比赛详情' : 'Open match detail'}: ${plainMatchupLabel}`}
              >
                <p>{formatDetailDate(fixture.dateLabel, copy.locale)}</p>
                <span>{copy.locale === 'zh' ? `${fixture.groupId} 组 · ${formatMatchday(fixture.matchdayLabel, copy.locale)}` : `Group ${fixture.groupId} · ${fixture.matchdayLabel}`}</span>
                <strong>{matchupLabel}</strong>
                <span>{formatVenueName(fixture.venue, copy.locale)}</span>
                <span>{fixture.resultLabel ?? fixture.predictionStatus}</span>
              </a>
            );
          })}
        </div>
      </section>
      <KnockoutBracketSection
        rounds={rounds}
        copy={copy}
        title={copy.locale === 'zh' ? '淘汰赛' : 'Knockout Stage'}
      />
    </>
  );
}
