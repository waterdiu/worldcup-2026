import type { CSSProperties } from 'react';
import type { AppCopy } from '../i18n/content';
import { localizePath } from '../i18n/content';
import { formatBracketLabel } from '../i18n/formatters';
import type { BracketMatchData, BracketRoundData } from '../types/tournament';
import { SectionHeader } from './SectionHeader';

interface KnockoutBracketSectionProps {
  rounds: BracketRoundData[];
  copy: AppCopy;
  title?: string;
  description?: string;
}

type KnockoutSlotStyle = CSSProperties & {
  '--pair-span'?: string;
  '--slot-top'?: string;
};

const bracketCardHeight = 104;
const bracketRowGap = 10;
const bracketStep = bracketCardHeight + bracketRowGap;

function getRound(rounds: BracketRoundData[], roundName: string) {
  return rounds.find((round) => round.round === roundName)?.matches ?? [];
}

function getSlotStyle(matchCount: number, index: number): KnockoutSlotStyle {
  const spacing = 8 / matchCount;
  const offset = (spacing - 1) / 2;
  const slotTop = (index * spacing + offset) * bracketStep;

  return {
    '--pair-span': `${spacing * bracketStep}px`,
    '--slot-top': `${slotTop}px`
  };
}

function formatKnockoutDate(dateLabel: string, copy: AppCopy) {
  if (copy.locale === 'en') return dateLabel;

  const date = new Date(dateLabel);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function renderKnockoutMatch(match: BracketMatchData, copy: AppCopy) {
  return (
    <a
      className="bracket-match bracket-match--link"
      href={localizePath(`/matches/${match.id}`, copy.locale)}
      aria-label={`${copy.locale === 'zh' ? '打开淘汰赛比赛详情' : 'Open knockout match detail'}: ${copy.locale === 'zh' ? '比赛' : 'Match'} ${match.id}`}
    >
      <p className="bracket-match__number">
        {copy.locale === 'zh' ? `比赛 ${match.id}` : `Match ${match.id}`}
      </p>
      <p className="bracket-match__meta">
        {formatKnockoutDate(match.dateLabel, copy)}
      </p>
      <strong className="bracket-match__team">{formatBracketLabel(match.homeLabel, copy.locale)}</strong>
      <strong className="bracket-match__team">{formatBracketLabel(match.awayLabel, copy.locale)}</strong>
    </a>
  );
}

function renderKnockoutSlot(match: BracketMatchData, copy: AppCopy, style?: KnockoutSlotStyle, showConnectors = true) {
  return (
    <div className="knockout-match-slot" data-testid="knockout-match-slot" key={match.id} style={style}>
      {showConnectors ? (
        <>
          <span className="knockout-match-slot__line knockout-match-slot__line--in" aria-hidden="true" />
          <span className="knockout-match-slot__line knockout-match-slot__line--out" aria-hidden="true" />
        </>
      ) : null}
      {renderKnockoutMatch(match, copy)}
    </div>
  );
}

function KnockoutColumn({
  label,
  matches,
  copy
}: {
  label: string;
  matches: BracketMatchData[];
  copy: AppCopy;
}) {
  return (
    <div className={`knockout-column knockout-column--count-${matches.length}`}>
      <h3>{label}</h3>
      <div className="knockout-column__matches">
        {matches.map((match, index) => renderKnockoutSlot(match, copy, getSlotStyle(matches.length, index)))}
      </div>
    </div>
  );
}

export function KnockoutBracketSection({ rounds, copy, title, description }: KnockoutBracketSectionProps) {
  const roundOf32 = getRound(rounds, 'Round of 32');
  const roundOf16 = getRound(rounds, 'Round of 16');
  const quarterFinals = getRound(rounds, 'Quarter-finals');
  const semiFinals = getRound(rounds, 'Semi-finals');
  const bronzeAndFinal = getRound(rounds, 'Bronze & Final');
  const finalMatches = [
    ...bronzeAndFinal.filter((match) => match.id === '104'),
    ...bronzeAndFinal.filter((match) => match.id !== '104')
  ];

  return (
    <section id="knockout" className="section">
      <SectionHeader
        eyebrow={copy.sections.knockoutEyebrow}
        title={title ?? copy.sections.knockoutTitle}
        description={description ?? copy.sections.knockoutDescription}
      />
      <div className="knockout-map" data-testid="knockout-bracket-map">
        <div className="knockout-path knockout-path--left" data-testid="knockout-left-path">
          <KnockoutColumn label={formatBracketLabel('Round of 32', copy.locale)} matches={roundOf32.slice(0, 8)} copy={copy} />
          <KnockoutColumn label={formatBracketLabel('Round of 16', copy.locale)} matches={roundOf16.slice(0, 4)} copy={copy} />
          <KnockoutColumn label={formatBracketLabel('Quarter-finals', copy.locale)} matches={quarterFinals.slice(0, 2)} copy={copy} />
          <KnockoutColumn label={formatBracketLabel('Semi-finals', copy.locale)} matches={semiFinals.slice(0, 1)} copy={copy} />
        </div>
        <div className="knockout-final-path" data-testid="knockout-final-path">
          <h3>{copy.locale === 'zh' ? '中心赛道' : 'Centre Lane'}</h3>
          <div className="knockout-final-path__matches">
            {finalMatches.map((match) => renderKnockoutSlot(match, copy, undefined, false))}
          </div>
        </div>
        <div className="knockout-path knockout-path--right" data-testid="knockout-right-path">
          <KnockoutColumn label={formatBracketLabel('Semi-finals', copy.locale)} matches={semiFinals.slice(1, 2)} copy={copy} />
          <KnockoutColumn label={formatBracketLabel('Quarter-finals', copy.locale)} matches={quarterFinals.slice(2, 4)} copy={copy} />
          <KnockoutColumn label={formatBracketLabel('Round of 16', copy.locale)} matches={roundOf16.slice(4, 8)} copy={copy} />
          <KnockoutColumn label={formatBracketLabel('Round of 32', copy.locale)} matches={roundOf32.slice(8, 16)} copy={copy} />
        </div>
      </div>
    </section>
  );
}
