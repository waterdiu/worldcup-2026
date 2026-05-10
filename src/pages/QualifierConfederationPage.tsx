import { QualifiedTeamsRail } from '../components/QualifiedTeamsRail';
import { QualifierRoutesSection } from '../components/QualifierRoutesSection';
import { SectionHeader } from '../components/SectionHeader';
import { formatConfederationName, formatTeamName } from '../i18n/formatters';
import type {
  ConfederationCardData,
  QualifierDetailData
} from '../types/tournament';

interface QualifierConfederationPageProps {
  confederation: ConfederationCardData;
  detail: QualifierDetailData;
}

export function QualifierConfederationPage({
  confederation,
  detail
}: QualifierConfederationPageProps) {
  return (
    <>
      <section className="section page-intro">
        <SectionHeader
          eyebrow="洲别详情"
          title={`${formatConfederationName(confederation.name)}预选赛`}
          description="这里把当前洲别的配额、已晋级球队和晋级路线单独呈现，便于从预选赛视角理解正赛名单。"
        />
        <div className="detail-grid">
          <article className="feature-card">
            <h3>赛区概览</h3>
            <p>{confederation.slotSummary}</p>
            <p>{confederation.remainingPlaces}</p>
          </article>
          <article className="feature-card">
            <h3>结果摘要</h3>
            <ul className="detail-list">
              {detail.resultsSummary.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="section">
        <SectionHeader
          eyebrow="资格赛结构"
          title={detail.title}
          description="这一页聚焦资格赛阶段、结果摘要和晋级路径，让各洲信息保持清晰可读。"
        />
        <div className="detail-grid">
          <article className="feature-card">
            <h3>赛制与阶段</h3>
            <ul className="detail-list">
              {detail.stageSummary.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="feature-card">
            <h3>已晋级球队</h3>
            <QualifiedTeamsRail
              teams={confederation.qualifiedTeams.map((team) => formatTeamName(team))}
              label="已晋级球队"
            />
          </article>
        </div>
      </section>

      <QualifierRoutesSection detail={detail} />
    </>
  );
}
