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
  const knockoutMatchCount = rounds.reduce((count, round) => count + round.matches.length, 0);
  const sortedFixtures = [...fixtures].sort((first, second) => {
    const dateDiff = Date.parse(first.dateLabel) - Date.parse(second.dateLabel);
    if (dateDiff !== 0) return dateDiff;
    return first.groupId.localeCompare(second.groupId) || first.id.localeCompare(second.id);
  });

  return (
    <>
      <section className="section page-intro">
        <SectionHeader
          eyebrow={copy.locale === 'zh' ? '比赛日历' : 'Match Calendar'}
          title={copy.locale === 'zh' ? '赛程总览' : 'Schedule Overview'}
          description={
            copy.locale === 'zh'
              ? '页面按赛事阶段拆成小组赛和淘汰赛：小组赛按比赛时间排列，淘汰赛用左右两侧向中间晋级的结构展示。'
              : 'The schedule is split into group stage and knockout stage: group matches are time-ordered, while the knockout map advances from both sides toward the centre.'
          }
        />
        <div className="feature-grid">
          <article className="feature-card">
            <h3>{copy.locale === 'zh' ? `${sortedFixtures.length} 场小组赛` : `${sortedFixtures.length} group matches`}</h3>
            <p>
              {copy.locale === 'zh'
                ? '每场比赛一张紧凑卡片，按时间顺序浏览，点击卡片进入单场比赛详情。'
                : 'Each fixture is a compact card ordered by date, linking directly into match detail.'}
            </p>
          </article>
          <article className="feature-card">
            <h3>{copy.locale === 'zh' ? `${knockoutMatchCount} 场淘汰赛` : `${knockoutMatchCount} knockout matches`}</h3>
            <p>
              {copy.locale === 'zh'
                ? '从 32 强到决赛的晋级路径按左右两边汇合呈现，每个节点都能进入详情。'
                : 'The route from the Round of 32 through the final converges from both sides and every node is clickable.'}
            </p>
          </article>
        </div>
      </section>
      <section className="section match-overview-section">
        <SectionHeader
          eyebrow={copy.locale === 'zh' ? 'Group Stage' : 'Group Stage'}
          title={copy.locale === 'zh' ? '小组赛' : 'Group Stage'}
          description={
            copy.locale === 'zh'
              ? '按比赛时间排列，保留轮次、小组、对阵、场馆和状态。'
              : 'Ordered by kickoff date with round, group, matchup, venue, and status.'
          }
        />
        <div className="match-overview-list">
          {sortedFixtures.map((fixture) => {
            const matchupLabel = `${formatTeamName(fixture.homeTeam, copy.locale)} ${copy.locale === 'zh' ? '对' : 'vs'} ${formatTeamName(fixture.awayTeam, copy.locale)}`;
            const plainMatchupLabel = `${formatPlainTeamName(fixture.homeTeam, copy.locale)} ${copy.locale === 'zh' ? '对' : 'vs'} ${formatPlainTeamName(fixture.awayTeam, copy.locale)}`;

            return (
              <a
                key={fixture.id}
                className="match-overview-card"
                data-testid="match-overview-group-card"
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
        description={
          copy.locale === 'zh'
            ? '左右两侧从 32 强开始向中间推进，决赛和季军赛位于中心。'
            : 'Both sides advance inward from the Round of 32, with the final and bronze match in the centre.'
        }
      />
    </>
  );
}
