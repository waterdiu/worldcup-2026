import { localizePath, type AppCopy } from '../i18n/content';
import { formatTeamName } from '../i18n/formatters';
import type { MatchEventData, QualifierMatchData } from '../types/tournament';

interface QualifierMatchDetailPageProps {
  match: QualifierMatchData;
  copy: AppCopy;
}

function formatDate(dateLabel: string, locale: AppCopy['locale']) {
  if (locale === 'en') return dateLabel;
  const [year, month, day] = dateLabel.split('-');
  return `${year} 年 ${Number(month)} 月 ${Number(day)} 日`;
}

function formatEventType(type: MatchEventData['type'], locale: AppCopy['locale']) {
  const labels = {
    goal: locale === 'zh' ? '进球' : 'Goal',
    'yellow-card': locale === 'zh' ? '黄牌' : 'Yellow card',
    'red-card': locale === 'zh' ? '红牌' : 'Red card',
    substitution: locale === 'zh' ? '换人' : 'Substitution'
  };

  return labels[type];
}

function coverageLabel(hasData: boolean, locale: AppCopy['locale']) {
  if (hasData) return locale === 'zh' ? '已导入' : 'Imported';
  return locale === 'zh' ? '缺失' : 'Missing';
}

export function QualifierMatchDetailPage({ match, copy }: QualifierMatchDetailPageProps) {
  const homeLabel = formatTeamName(match.homeTeam, copy.locale);
  const awayLabel = formatTeamName(match.awayTeam, copy.locale);
  const hasStats = Boolean(match.stats?.length);
  const hasLineups = Boolean(match.lineups?.length);
  const hasEvents = Boolean(match.events?.length);
  const hasRatings = Boolean(match.playerRatings?.length);
  const coverageItems = [
    { label: copy.locale === 'zh' ? '比赛统计' : 'Match stats', hasData: hasStats },
    { label: copy.locale === 'zh' ? '阵容' : 'Lineups', hasData: hasLineups },
    { label: copy.locale === 'zh' ? '事件流' : 'Events', hasData: hasEvents },
    { label: copy.locale === 'zh' ? '球员赛后评分' : 'Player ratings', hasData: hasRatings }
  ];

  return (
    <section className="section match-detail-page qualifier-match-detail-page">
      <a className="back-link" href={localizePath('/qualifiers', copy.locale)}>
        {copy.locale === 'zh' ? '返回预选赛比赛记录' : 'Back to qualifier records'}
      </a>

      <article className="match-detail-hero-card qualifier-detail-hero">
        <span className="qualifier-detail-hero__eyebrow">{copy.locale === 'zh' ? '预选赛详情' : 'Qualifier Detail'}</span>
        <div className="match-detail-hero-card__meta">
          <span>{match.confederationName}</span>
          <span>{match.stage}</span>
          <span>{formatDate(match.dateLabel, copy.locale)}</span>
          {match.venue ? <span>{match.venue}</span> : null}
        </div>
        <div className="match-scoreboard">
          <div className="match-scoreboard__team">
            <span>{homeLabel}</span>
          </div>
          <div className="match-scoreboard__score">
            <strong>{match.homeScore} - {match.awayScore}</strong>
            <span>{copy.locale === 'zh' ? '全场结束' : 'Full time'}</span>
          </div>
          <div className="match-scoreboard__team match-scoreboard__team--away">
            <span>{awayLabel}</span>
          </div>
        </div>
        <h1>{copy.locale === 'zh' ? '预选赛比赛详情' : 'Qualifier Match Detail'}</h1>
        {match.resultNote ? <p>{match.resultNote}</p> : null}
      </article>

      <div className="match-detail-layout">
        <article className="match-detail-card match-detail-card--span qualifier-detail-coverage">
          <div className="qualifier-detail-coverage__header">
            <h3>{copy.locale === 'zh' ? '数据覆盖' : 'Data Coverage'}</h3>
            <span>
              {copy.locale === 'zh'
                ? `${coverageItems.filter((item) => item.hasData).length}/${coverageItems.length} 类已导入`
                : `${coverageItems.filter((item) => item.hasData).length}/${coverageItems.length} categories imported`}
            </span>
          </div>
          <div className="qualifier-detail-coverage__grid">
            {coverageItems.map((item) => (
              <div className={item.hasData ? 'is-complete' : 'is-missing'} key={item.label}>
                <strong>{item.label}</strong>
                <span>{coverageLabel(item.hasData, copy.locale)}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="match-detail-card">
          <h3>{copy.locale === 'zh' ? '比赛统计' : 'Match Statistics'}</h3>
          {match.stats?.length ? (
            <div className="match-stat-table">
              {match.stats.map((stat) => (
                <div className="match-stat-row" key={stat.label}>
                  <strong>{stat.home}</strong>
                  <span>{stat.label}</span>
                  <strong>{stat.away}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p>{copy.locale === 'zh' ? '暂无公开技术统计。' : 'No public match statistics available.'}</p>
          )}
        </article>

        <article className="match-detail-card">
          <h3>{copy.locale === 'zh' ? '阵容' : 'Lineups'}</h3>
          {match.lineups?.length ? (
            <div className="lineup-shell">
              {match.lineups.map((lineup) => (
                <div key={lineup.team}>
                  <h4>{formatTeamName(lineup.team, copy.locale)} {lineup.formation ? `· ${lineup.formation}` : ''}</h4>
                  <p>
                    {lineup.starters.map((player) => `${player.number} ${player.name}`).join(' · ')}
                  </p>
                  <small>
                    {copy.locale === 'zh' ? '替补：' : 'Subs: '}
                    {lineup.substitutes.map((player) => `${player.number} ${player.name}`).join(' · ')}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <p>{copy.locale === 'zh' ? '暂无完整阵容数据。' : 'No complete lineup data available.'}</p>
          )}
        </article>

        <article className="match-detail-card match-detail-card--span">
          <h3>{copy.locale === 'zh' ? '进球、红黄牌和换人' : 'Goals, Cards, and Substitutions'}</h3>
          {match.events?.length ? (
            <div className="match-timeline">
              {match.events.map((event) => (
                <div className="match-timeline__item" key={`${event.minute}-${event.team}-${event.player}`}>
                  <span>{event.minute}' · {formatEventType(event.type, copy.locale)}</span>
                  <p>
                    <strong>{formatTeamName(event.team, copy.locale)}</strong>
                    {' · '}
                    {event.player}
                    {event.detail ? ` · ${event.detail}` : ''}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>{copy.locale === 'zh' ? '暂无事件流数据。' : 'No event log available.'}</p>
          )}
        </article>

        <article className="match-detail-card">
          <h3>{copy.locale === 'zh' ? '球员赛后评分' : 'Player Ratings'}</h3>
          {hasRatings ? (
            <div className="match-stat-table">
              {match.playerRatings!.map((rating) => (
                <div className="match-stat-row" key={`${rating.team}-${rating.player}`}>
                  <span>{formatTeamName(rating.team, copy.locale)}</span>
                  <strong>{rating.player}</strong>
                  <strong>{rating.rating.toFixed(1)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p>{copy.locale === 'zh' ? '暂无球员评分数据。' : 'No player rating data available.'}</p>
          )}
        </article>

        <article className="match-detail-card">
          <h3>{copy.locale === 'zh' ? '缺失数据' : 'Missing Data'}</h3>
          {match.missingData.length ? (
            <ul className="detail-list">
              {match.missingData.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>{copy.locale === 'zh' ? '当前导入字段完整。' : 'Imported fields are complete.'}</p>
          )}
          <p>{copy.locale === 'zh' ? `来源：${match.sourceLabel}` : `Source: ${match.sourceLabel}`}</p>
        </article>
      </div>
    </section>
  );
}
