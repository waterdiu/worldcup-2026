import { useMemo, useState } from 'react';
import type { AppCopy } from '../i18n/content';
import { formatTeamName, formatVenueName } from '../i18n/formatters';
import type { GroupFixtureData } from '../types/tournament';
import { SectionHeader } from './SectionHeader';

interface OpeningFixturesSectionProps {
  fixtures: GroupFixtureData[];
  copy: AppCopy;
}

export function OpeningFixturesSection({ fixtures, copy }: OpeningFixturesSectionProps) {
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const visibleFixtures = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return fixtures.filter((fixture) => {
      const matchesGroup = selectedGroup === 'all' || fixture.groupId === selectedGroup;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        fixture.homeTeam.toLowerCase().includes(normalizedQuery) ||
        fixture.awayTeam.toLowerCase().includes(normalizedQuery);

      return matchesGroup && matchesQuery;
    });
  }, [fixtures, searchQuery, selectedGroup]);

  const groupOptions = ['all', ...new Set(fixtures.map((fixture) => fixture.groupId))];

  return (
    <section className="section" id="fixtures">
      <SectionHeader
        eyebrow={copy.sections.fixturesEyebrow}
        title={copy.sections.fixturesTitle}
        description={copy.sections.fixturesDescription}
      />
      <div className="fixtures-controls">
        <label className="fixtures-controls__field">
          <span>{copy.sections.fixturesFilterGroup}</span>
          <select
            aria-label={copy.sections.fixturesFilterGroup}
            value={selectedGroup}
            onChange={(event) => setSelectedGroup(event.target.value)}
          >
            {groupOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? copy.sections.fixturesFilterAll : `${copy.labels.groupPrefix} ${option}`}
              </option>
            ))}
          </select>
        </label>
        <label className="fixtures-controls__field">
          <span>{copy.sections.fixturesSearchTeam}</span>
          <input
            aria-label={copy.sections.fixturesSearchTeam}
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={copy.sections.fixturesSearchPlaceholder}
          />
        </label>
      </div>
      <div className="fixtures-grid">
        {visibleFixtures.map((fixture) => (
          <article key={fixture.id} className="fixture-card">
            <p className="fixture-card__meta">
              {copy.labels.groupPrefix} {fixture.groupId} · {fixture.dateLabel}
            </p>
            <h3>
              {formatTeamName(fixture.homeTeam, copy.locale)} {copy.locale === 'zh' ? '对' : 'vs'}{' '}
              {formatTeamName(fixture.awayTeam, copy.locale)}
            </h3>
            <p className="fixture-card__venue">{formatVenueName(fixture.venue, copy.locale)}</p>
            <p className="fixture-card__odds">
              {copy.labels.home} {Math.round(fixture.homeWinProbability * 100)}% · {copy.labels.draw}{' '}
              {Math.round(fixture.drawProbability * 100)}% · {copy.labels.away}{' '}
              {Math.round(fixture.awayWinProbability * 100)}%
            </p>
            <p className="fixture-card__prediction">{copy.labels.predictionReserved}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
