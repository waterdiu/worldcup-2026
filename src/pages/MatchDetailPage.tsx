import { localizePath, type AppCopy } from '../i18n/content';
import { formatBracketLabel, formatTeamName, formatVenueName } from '../i18n/formatters';
import { openingMatchDetail, type OpeningMatchDetailData } from '../data/openingMatchDetail';
import type { BracketMatchData, GroupFixtureData, GroupStageMatchData } from '../types/tournament';
import { FavoriteButton } from '../components/FavoriteButton';
import { PredictionForm } from '../components/PredictionForm';

type KnockoutMatchDetailData = BracketMatchData & {
  roundLabel: string;
};

type GroupMatchDetailData = GroupFixtureData | GroupStageMatchData;

interface MatchDetailPageProps {
  fixture: GroupMatchDetailData | KnockoutMatchDetailData;
  copy: AppCopy;
}

interface DetailLink {
  href: string;
  label: string;
}

const statisticRows = [
  ['控球率', '待比赛开始'],
  ['射门', '待比赛开始'],
  ['射正', '待比赛开始'],
  ['角球', '待比赛开始'],
  ['犯规', '待比赛开始'],
  ['黄牌', '待比赛开始']
];

function formatDetailDate(dateLabel: string, locale: AppCopy['locale']): string {
  if (locale === 'en') return dateLabel;
  const date = new Date(dateLabel);
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

function formatMatchday(matchdayLabel: string | undefined, locale: AppCopy['locale']): string {
  if (!matchdayLabel) return locale === 'zh' ? '小组赛' : 'Group stage';
  if (locale === 'en') return matchdayLabel;

  const matchdayNumber = matchdayLabel.match(/\d+/)?.[0];
  return matchdayNumber ? `第 ${matchdayNumber} 轮` : matchdayLabel;
}

function isKnockoutMatch(
  fixture: GroupMatchDetailData | KnockoutMatchDetailData
): fixture is KnockoutMatchDetailData {
  return 'homeLabel' in fixture;
}

function formatKnockoutStage(match: KnockoutMatchDetailData, locale: AppCopy['locale']): string {
  if (match.roundLabel === 'Bronze & Final' && match.id === '104') {
    return locale === 'zh' ? '决赛' : 'Final';
  }

  if (match.roundLabel === 'Bronze & Final' && match.id === '103') {
    return locale === 'zh' ? '季军赛' : 'Third-place match';
  }

  return formatBracketLabel(match.roundLabel, locale);
}

function formatGroupScore(fixture: GroupFixtureData | GroupStageMatchData, locale: AppCopy['locale']) {
  if (fixture.homeScore !== undefined && fixture.awayScore !== undefined) {
    return `${fixture.homeScore} - ${fixture.awayScore}`;
  }

  return locale === 'zh' ? '待定' : 'TBD';
}

function getGroupStageLabel(fixture: GroupMatchDetailData): string {
  return 'matchdayLabel' in fixture ? (fixture as GroupStageMatchData).matchdayLabel : fixture.roundLabel;
}

function getMatchStatus(
  fixture: GroupMatchDetailData | KnockoutMatchDetailData,
  locale: AppCopy['locale']
) {
  if (isKnockoutMatch(fixture)) {
    return locale === 'zh' ? '未开赛 · 晋级球队待定' : 'Not started · teams pending';
  }

  return fixture.resultLabel ?? (locale === 'zh' ? '未开赛' : 'Not started');
}

function getTimelineItems(isKnockout: boolean, locale: AppCopy['locale']) {
  if (locale === 'en') {
    return [
      ['Pre-match', 'Lineups, injuries, and match officials will be published before kickoff.'],
      ['Kickoff', 'Live event logging can attach goals, cards, VAR, and substitutions here.'],
      ['Half-time', 'First-half summary and tactical notes can be shown here.'],
      ['Full-time', isKnockout ? 'Winner advances through the knockout route.' : 'Result updates the group table.']
    ];
  }

  return [
    ['赛前', '首发阵容、伤停名单和裁判信息将在赛前公布。'],
    ['开球', '进球、红黄牌、VAR、换人等实时事件可以接入这里。'],
    ['半场', '半场比分、关键数据和战术观察可以在这里更新。'],
    ['全场', isKnockout ? '胜者沿淘汰赛路径继续晋级。' : '赛果将同步影响小组积分榜。']
  ];
}

function getRelatedLinks({
  fixture,
  copy
}: {
  fixture: GroupMatchDetailData | KnockoutMatchDetailData;
  copy: AppCopy;
}): DetailLink[] {
  if (isKnockoutMatch(fixture)) {
    return [
      {
        href: localizePath('/matches#knockout', copy.locale),
        label: copy.locale === 'zh' ? '返回淘汰赛图' : 'Back to bracket map'
      },
      {
        href: localizePath('/matches', copy.locale),
        label: copy.locale === 'zh' ? '返回赛程总览' : 'Back to schedule overview'
      }
    ];
  }

  return [
    {
      href: localizePath(`/groups/${fixture.groupId}`, copy.locale),
      label: copy.locale === 'zh' ? `查看 ${fixture.groupId} 组积分榜` : `View Group ${fixture.groupId} table`
    },
    {
      href: localizePath('/matches', copy.locale),
      label: copy.locale === 'zh' ? '返回赛程总览' : 'Back to schedule overview'
    }
  ];
}

function getLocalizedText(value: Record<AppCopy['locale'], string>, locale: AppCopy['locale']) {
  return value[locale];
}

function formatProbability(value: number) {
  return `${Math.round(value * 100)}%`;
}

function getTeamPath(team: string, locale: AppCopy['locale']) {
  return localizePath(`/teams/${encodeURIComponent(team)}`, locale);
}

function normalizePitchX(value: number, side: 'left' | 'right') {
  if (side === 'left') {
    const normalized = (value - 8) / (68 - 8);
    return 8 + Math.max(0, Math.min(1, normalized)) * 36;
  }

  const normalized = (value - 38) / (92 - 38);
  return 56 + Math.max(0, Math.min(1, normalized)) * 36;
}

function OpeningMatchCompleteDetail({
  fixture,
  copy,
  detail
}: {
  fixture: GroupMatchDetailData;
  copy: AppCopy;
  detail: OpeningMatchDetailData;
}) {
  const homeLabel = formatTeamName(fixture.homeTeam, copy.locale);
  const awayLabel = formatTeamName(fixture.awayTeam, copy.locale);
  const groupLabel = copy.locale === 'zh' ? `${fixture.groupId} 组` : `Group ${fixture.groupId}`;
  const homeLineup = detail.lineups.find((lineup) => lineup.team === fixture.homeTeam) ?? detail.lineups[0];
  const awayLineup = detail.lineups.find((lineup) => lineup.team === fixture.awayTeam) ?? detail.lineups[1];

  return (
    <section className="section match-detail-page opening-match-detail">
      <a className="back-link" href={localizePath('/matches', copy.locale)}>
        {copy.locale === 'zh' ? '返回赛程总览' : 'Back to schedule overview'}
      </a>

      <article className="match-detail-card match-detail-card--span opening-match-section match-info-card" data-testid="match-info-card">
        <div className="match-detail-hero-card__meta match-detail-hero-card__meta--with-action">
          <div className="match-detail-hero-card__meta-items">
            <span>{copy.locale === 'zh' ? '比赛 1 · 2026 世界杯揭幕战' : 'Match 1 · 2026 World Cup opener'}</span>
            <span>{groupLabel}</span>
          </div>
          <FavoriteButton
            targetType="match"
            targetId={fixture.id}
            locale={copy.locale}
            label={copy.locale === 'zh' ? '比赛' : 'match'}
          />
        </div>
        <h1>{copy.locale === 'zh' ? '比赛信息' : 'Match Information'}</h1>
        <div className="match-info-card__teams">
          <a className="match-info-card__team-link" href={getTeamPath(fixture.homeTeam, copy.locale)}>
            {homeLabel}
          </a>
          <span className="match-info-card__versus">{copy.locale === 'zh' ? '对' : 'vs'}</span>
          <a className="match-info-card__team-link" href={getTeamPath(fixture.awayTeam, copy.locale)}>
            {awayLabel}
          </a>
        </div>
        <div className="match-info-card__facts">
          <div className="match-info-card__fact">
            <span>{copy.locale === 'zh' ? '比赛时间 / 天气' : 'Kickoff / Weather'}</span>
            <strong>{getLocalizedText(detail.kickoffLocal, copy.locale)}</strong>
            <small>{getLocalizedText(detail.weather, copy.locale)}</small>
          </div>
          <div className="match-info-card__fact">
            <span>{copy.locale === 'zh' ? '比赛地点' : 'Venue'}</span>
            <strong>{getLocalizedText(detail.venueDetail, copy.locale)}</strong>
          </div>
          <div className="match-info-card__fact">
            <span>{copy.locale === 'zh' ? '裁判组' : 'Officials'}</span>
            <strong className="match-info-card__officials">
              {detail.refereeCrew.map((crew) => `${getLocalizedText(crew.role, copy.locale)}: ${crew.name}`).join(' · ')}
            </strong>
          </div>
        </div>
      </article>

      <div className="opening-match-layout">
        <article className="match-detail-card opening-match-section match-user-prediction-card">
          <PredictionForm
            matchId={fixture.id}
            homeLabel={homeLabel}
            awayLabel={awayLabel}
            locale={copy.locale}
          />
        </article>

        <article className="match-detail-card match-detail-card--span opening-match-section">
          <h3>{copy.locale === 'zh' ? '预计首发阵容' : 'Projected Lineups'}</h3>
          <div className="lineup-pitch" data-testid="lineup-pitch">
            <div className="lineup-pitch__header">
              <div>
                <span>{homeLabel}</span>
                <strong>{homeLineup.formation}</strong>
              </div>
              <div>
                <span>{awayLabel}</span>
                <strong>{awayLineup.formation}</strong>
              </div>
            </div>
            <div className="lineup-pitch__surface">
              <div className="lineup-pitch__midline" />
              <div className="lineup-pitch__center-circle" />
              <div className="lineup-pitch__box lineup-pitch__box--left" />
              <div className="lineup-pitch__box lineup-pitch__box--right" />
              {detail.lineups.map((lineup, index) =>
                lineup.players.map((player) => (
                  <div
                    className={`lineup-player-marker lineup-player-marker--${index === 0 ? 'home' : 'away'}`}
                    data-testid="lineup-player-marker"
                    key={`${lineup.team}-${player.name}`}
                    style={{
                      left: `${normalizePitchX(player.x, index === 0 ? 'left' : 'right')}%`,
                      top: `${player.y}%`
                    }}
                  >
                    <span className="lineup-player-marker__number">{player.number}</span>
                    <strong className="lineup-player-marker__name">{player.name}</strong>
                    <small className="lineup-player-marker__role">{getLocalizedText(player.role, copy.locale)}</small>
                  </div>
                ))
              )}
            </div>
            <div className="lineup-pitch__list">
              {[homeLineup, awayLineup].map((lineup) => (
                <section className="lineup-pitch__roster" key={`${lineup.team}-roster`}>
                  <div className="lineup-pitch__roster-header">
                    <h4>{formatTeamName(lineup.team, copy.locale)}</h4>
                  </div>
                  <div className="lineup-pitch__roster-table">
                    {lineup.players.map((player) => (
                      <div className="lineup-pitch__roster-row" key={`${lineup.team}-${player.number}`}>
                        <strong>{player.number}</strong>
                        <span>{player.name}</span>
                        <small>{player.club}</small>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </article>

        <article className="match-detail-card opening-match-section">
          <h3>{copy.locale === 'zh' ? '预测分析' : 'Prediction Analysis'}</h3>
          <div className="opening-probability-board">
            <div>
              <span>{copy.locale === 'zh' ? '主胜' : 'Home win'}</span>
              <strong>{formatProbability(detail.prediction.probabilities.homeWin)}</strong>
            </div>
            <div>
              <span>{copy.locale === 'zh' ? '平局' : 'Draw'}</span>
              <strong>{formatProbability(detail.prediction.probabilities.draw)}</strong>
            </div>
            <div>
              <span>{copy.locale === 'zh' ? '客胜' : 'Away win'}</span>
              <strong>{formatProbability(detail.prediction.probabilities.awayWin)}</strong>
            </div>
          </div>
          <div className="opening-prediction-summary">
            <div className="opening-prediction-summary__item">
              <span>{copy.locale === 'zh' ? '预测比分' : 'Predicted score'}</span>
              <strong>{detail.prediction.predictedScore}</strong>
            </div>
            <div className="opening-prediction-summary__item">
              <span>{copy.locale === 'zh' ? '总球数' : 'Total goals'}</span>
              <strong>{getLocalizedText(detail.prediction.totalGoals, copy.locale)}</strong>
            </div>
            <div className="opening-prediction-summary__item">
              <span>{copy.locale === 'zh' ? 'xG' : 'Expected goals'}</span>
              <strong>{detail.prediction.expectedGoals}</strong>
            </div>
          </div>
          <p>
            {copy.locale === 'zh'
              ? `主胜 ${formatProbability(detail.prediction.probabilities.homeWin)} · 平局 ${formatProbability(detail.prediction.probabilities.draw)} · 客胜 ${formatProbability(detail.prediction.probabilities.awayWin)}`
              : `Home ${formatProbability(detail.prediction.probabilities.homeWin)} · Draw ${formatProbability(detail.prediction.probabilities.draw)} · Away ${formatProbability(detail.prediction.probabilities.awayWin)}`}
          </p>
          <p>{getLocalizedText(detail.prediction.summary, copy.locale)}</p>
        </article>

        <article className="match-detail-card opening-match-section">
          <h3>{copy.locale === 'zh' ? '赛后统计' : 'Post-match Statistics'}</h3>
          <div className="opening-stat-compare">
            <div className="opening-stat-compare__teams">
              <strong>{homeLabel}</strong>
              <strong>{awayLabel}</strong>
            </div>
            {detail.postMatchStats.map((stat) => (
              <div className="opening-stat-row" key={getLocalizedText(stat.label, copy.locale)}>
                <strong>{stat.home}</strong>
                <span>{getLocalizedText(stat.label, copy.locale)}</span>
                <strong>{stat.away}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="match-detail-card match-detail-card--span opening-match-section">
          <h3>{copy.locale === 'zh' ? '比赛过程记录' : 'Match Event Log'}</h3>
          <div className="opening-event-timeline">
            {detail.matchEvents.map((event) => (
              <div className="opening-event-timeline__item" key={`${event.minute}-${event.player}`}>
                <div className="opening-event-timeline__rail" aria-hidden="true">
                  <span className="opening-event-timeline__dot" />
                </div>
                <span className="opening-event-timeline__minute">{event.minute}</span>
                <div className="opening-event-row">
                  <strong className="opening-event-row__type">{getLocalizedText(event.type, copy.locale)}</strong>
                  <div className="opening-event-row__body">
                    <b>{formatTeamName(event.team, copy.locale)}</b>
                    <span>{event.player}</span>
                    <p>{getLocalizedText(event.detail, copy.locale)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

export function MatchDetailPage({ fixture, copy }: MatchDetailPageProps) {
  const isKnockout = isKnockoutMatch(fixture);
  const groupFixture = isKnockout ? undefined : fixture;
  const openingDetail = groupFixture?.id === openingMatchDetail.id ? openingMatchDetail : undefined;

  if (groupFixture && openingDetail) {
    return <OpeningMatchCompleteDetail fixture={groupFixture} copy={copy} detail={openingDetail} />;
  }

  const homeLabel = isKnockout ? formatBracketLabel(fixture.homeLabel, copy.locale) : formatTeamName(fixture.homeTeam, copy.locale);
  const awayLabel = isKnockout ? formatBracketLabel(fixture.awayLabel, copy.locale) : formatTeamName(fixture.awayTeam, copy.locale);
  const matchupLabel = `${homeLabel} ${copy.locale === 'zh' ? '对' : 'vs'} ${awayLabel}`;
  const matchdayLabel = groupFixture ? getGroupStageLabel(groupFixture) : undefined;
  const stageLabel = isKnockout ? formatKnockoutStage(fixture, copy.locale) : formatMatchday(matchdayLabel, copy.locale);
  const scoreLabel = groupFixture ? formatGroupScore(groupFixture, copy.locale) : copy.locale === 'zh' ? '待定' : 'TBD';
  const relatedLinks = getRelatedLinks({ fixture, copy });
  const timelineItems = getTimelineItems(isKnockout, copy.locale);
  const groupLabel = groupFixture ? (copy.locale === 'zh' ? `${groupFixture.groupId} 组` : `Group ${groupFixture.groupId}`) : '';

  return (
    <section className="section match-detail-page">
      <a className="back-link" href={localizePath('/matches', copy.locale)}>
        {copy.locale === 'zh' ? '返回赛程总览' : 'Back to schedule overview'}
      </a>

      <article className="match-detail-hero-card" data-testid="match-detail-hero">
        <div className="match-detail-hero-card__meta match-detail-hero-card__meta--with-action">
          <div className="match-detail-hero-card__meta-items">
            <span>{isKnockout ? (copy.locale === 'zh' ? `比赛 ${fixture.id}` : `Match ${fixture.id}`) : groupLabel}</span>
            <span>{copy.locale === 'zh' ? `阶段：${stageLabel}` : `Stage: ${stageLabel}`}</span>
            <span>{formatDetailDate(fixture.dateLabel, copy.locale)}</span>
            <span>{formatVenueName(fixture.venue, copy.locale)}</span>
          </div>
          <FavoriteButton
            targetType="match"
            targetId={fixture.id}
            locale={copy.locale}
            label={copy.locale === 'zh' ? '比赛' : 'match'}
          />
        </div>
        <div className="match-scoreboard">
          <div className="match-scoreboard__team">
            <span>{homeLabel}</span>
          </div>
          <div className="match-scoreboard__score">
            <strong>{scoreLabel}</strong>
            <span>{getMatchStatus(fixture, copy.locale)}</span>
          </div>
          <div className="match-scoreboard__team match-scoreboard__team--away">
            <span>{awayLabel}</span>
          </div>
        </div>
        <h1>{fixture.id === '1' && copy.locale === 'zh' ? '揭幕战详情' : isKnockout ? (copy.locale === 'zh' ? '淘汰赛比赛详情' : 'Knockout Match Detail') : copy.locale === 'zh' ? '比赛详情' : 'Match Detail'}</h1>
      </article>

      <div className="match-detail-layout">
        <article className="match-detail-card match-detail-card--span">
          <h3>{copy.locale === 'zh' ? '比赛摘要' : 'Match Summary'}</h3>
          <p>
            {isKnockout
              ? copy.locale === 'zh'
                ? `${matchupLabel}，将在${formatVenueName(fixture.venue, copy.locale)}进行。当前球队席位由晋级路径决定，赛前可接入阵容、伤停和裁判信息。`
                : `${matchupLabel} will be played at ${formatVenueName(fixture.venue, copy.locale)}. Team slots are driven by the knockout route.`
              : groupFixture
                ? copy.locale === 'zh'
                  ? `${matchupLabel} 是 ${groupFixture.groupId} 组${stageLabel}比赛，赛果会直接影响小组积分、净胜球和出线形势。`
                  : `${matchupLabel} is a Group ${groupFixture.groupId} ${stageLabel} match that affects table position and qualification outlook.`
                : ''}
          </p>
          {!isKnockout && groupFixture ? (
            <div className="match-probability-strip">
              <span>{copy.locale === 'zh' ? '胜平负展示' : 'Win-draw-win'} · {copy.labels.home} {Math.round(groupFixture.homeWinProbability * 100)}%</span>
              <span>{copy.labels.draw} {Math.round(groupFixture.drawProbability * 100)}%</span>
              <span>{copy.labels.away} {Math.round(groupFixture.awayWinProbability * 100)}%</span>
            </div>
          ) : null}
        </article>

        <article className="match-detail-card">
          <h3>{copy.locale === 'zh' ? '事件时间线' : 'Event Timeline'}</h3>
          <div className="match-timeline">
            {timelineItems.map(([time, note]) => (
              <div className="match-timeline__item" key={time}>
                <span>{time}</span>
                <p>{note}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="match-detail-card match-user-prediction-card">
          <PredictionForm
            matchId={fixture.id}
            homeLabel={homeLabel}
            awayLabel={awayLabel}
            locale={copy.locale}
          />
        </article>

        <article className="match-detail-card">
          <h3>{copy.locale === 'zh' ? '技术统计' : 'Match Statistics'}</h3>
          <div className="match-stat-table">
            {statisticRows.map(([label, value]) => (
              <div className="match-stat-row" key={label}>
                <span>{copy.locale === 'zh' ? label : label}</span>
                <strong>{copy.locale === 'zh' ? value : 'Pending kickoff'}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="match-detail-card">
          <h3>{copy.locale === 'zh' ? '阵容与人员' : 'Lineups and Personnel'}</h3>
          <div className="lineup-shell">
            <div>
              <h4>{homeLabel}</h4>
              <p>{copy.locale === 'zh' ? '首发阵容将在赛前公布。这里预留首发、替补、主教练和伤停名单展示位。' : 'Lineups will be published before kickoff.'}</p>
            </div>
            <div>
              <h4>{awayLabel}</h4>
              <p>{copy.locale === 'zh' ? '客队阵容将在赛前公布。这里预留首发、替补、主教练和伤停名单展示位。' : 'Lineups will be published before kickoff.'}</p>
            </div>
          </div>
        </article>

        <article className="match-detail-card">
          <h3>{isKnockout ? (copy.locale === 'zh' ? '淘汰赛影响' : 'Knockout Impact') : copy.locale === 'zh' ? '小组影响' : 'Group Impact'}</h3>
          <p>
            {isKnockout
              ? fixture.id === '104'
                ? copy.locale === 'zh'
                  ? '冠军归属将在这场比赛后确认，页面之后可以承接颁奖、进球、技术统计和关键事件。'
                  : 'The champion will be decided after this match.'
                : copy.locale === 'zh'
                  ? '胜者进入下一轮，败者结束本届淘汰赛征程。'
                  : 'The winner advances and the loser exits the knockout route.'
              : groupFixture
                ? copy.locale === 'zh'
                  ? `${groupFixture.groupId} 组形势会随本场比分更新，积分、净胜球和进球数是主要影响项。`
                  : `Group ${groupFixture.groupId} standings will update based on points, goal difference, and goals scored.`
                : ''}
          </p>
        </article>

        <article className="match-detail-card match-detail-card--span">
          <h3>{copy.locale === 'zh' ? '相关比赛' : 'Related Links'}</h3>
          <div className="related-link-row">
            {relatedLinks.map((link) => (
              <a href={link.href} key={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
