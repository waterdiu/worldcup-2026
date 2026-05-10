import type { AppCopy } from '../i18n/content';
import { SectionHeader } from './SectionHeader';

interface PredictionPreviewSectionProps {
  copy: AppCopy;
}

export function PredictionPreviewSection({ copy }: PredictionPreviewSectionProps) {
  return (
    <section id="prediction" className="section">
      <SectionHeader
        eyebrow={copy.sections.predictionEyebrow}
        title={copy.sections.predictionTitle}
        description={copy.sections.predictionDescription}
      />
      <div className="prediction-grid">
        <article className="feature-card">
          <h3>{copy.labels.matchPrediction}</h3>
          <p>这里可以接入赛前胜平负概率、推荐比分、近期状态与模型解释。</p>
        </article>
        <article className="feature-card">
          <h3>{copy.labels.qualificationProbability}</h3>
          <p>这里可以接入小组出线概率、实时积分变化和剩余赛程影响。</p>
        </article>
        <article className="feature-card">
          <h3>{copy.labels.championPath}</h3>
          <p>这里可以接入淘汰赛路径模拟、冠军概率和不同轮次的晋级分布。</p>
        </article>
      </div>
    </section>
  );
}
