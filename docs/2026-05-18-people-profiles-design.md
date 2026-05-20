# 人物档案页设计（教练 / 球员 / 裁判）

更新时间：2026-05-18

本文件是 `worldcup/2026` 的人物档案页（People Profiles）主专题设计文档，描述：

- 页面信息架构（教练/球员/裁判三套）
- 数据集契约与来源分层（direct/derived/distilled）
- 派生指标计算原则（可复现、无主观硬填）
- 风格蒸馏（distillation）激活条件与输出规范
- 前端与数据层边界

## 1. 目标与边界

### 目标

- 让人物页像成品出版物：信息密度高、层级清晰、避免“堆表格”。
- 同一风格系统：与统计页/首页一致（近黑底、1px 规则线、无圆角、Barlow Condensed + DM Mono、荧光绿强调色）。
- 明确数据可信度：任何字段都必须能回答 “它从哪里来 / 怎么算出来 / 样本是否足够”。

### 非目标

- 前端不做事实拼接与指标计算，不做“靠名气猜”。
- 未经审计的数据源不写入 canonical（例如不受控的爬虫、不可追溯来源）。
- 不在本仓库内采集第三方数据；采集/清洗属于 `football-data-platform`。

## 2. 页面信息架构（IA）

三类人物共用同一“骨架”，但每类模块不同：

### 2.1 通用骨架

1. Hero（左：身份与关键事实；右：大号字母图形）
2. Real-time band（顶部实时状态条：T-24h/T-90m/re-score/指派等）
2. KPI Strip（4-6 个最关键数字）
3. Real-time grid（实时状态面板：可用性/新闻/赛程负荷/模型修正等，按人物类型差异化）
4. Profile Grid（direct/derived 两列摘要）
5. Style Profile（distilled 标签 + 摘要；样本不足则显式提示）
6. Methodology（数据与模型说明：direct/derived/distilled 三列）
7. Sources（来源链接列表）

### 2.2 教练（Coach）

P0：
- 近 10 场窗口（W-D-L、胜率、场均进/失、零封率）
- 任命日期 / 合同信息（若可靠来源缺失则隐藏并显示 pending）

P1（未来）：
- 战术倾向：阵型稳定性、换人时机、领先后保守度等（需要事件/阵容/换人数据）

### 2.3 球员（Player）

P0：
- 位置、俱乐部、DOB/age（可追溯事实）
- 国家队 caps/goals（事实汇总）
- 影响力（impact_proxy_score）仅作为“已接入展示位”，必须标注为 proxy

P1（未来）：
- 能力维度（pace/finishing/creation/defending 等）需要稳定分钟数 + 技术统计/事件
- 风格画像（射门区域偏好、终结方式、传球风格、对抗风格）需要事件级数据与样本阈值

### 2.4 裁判（Referee）

P0：
- 样本量（matches）
- 黄/红/点球/平局率（derived）
- 与样本均值偏差（若数据层提供）

P1（未来）：
- 主队偏差、尺度偏严/偏松等 distillation（需要足够样本与对照组）

## 3. 数据契约与分层

人物档案所有字段分为三层：

### 3.1 direct（直接事实）

定义：
- 可直接采集、可追溯、无需计算的字段。

例：
- 球员：position、team、(club/DOB/age 若有可靠来源)
- 教练：谁是 head coach、team、(nationality/DOB/age 若有可靠来源)

规则：
- 缺失时必须输出 `null` 或 `pending_source`，不得猜测。
- 必须提供字段级别 `field_coverage`（来源标记）。

### 3.2 derived（派生指标）

定义：
- 可以从 direct / 赛果 / 样本数据稳定计算出来的指标。

例：
- 教练近 10 场胜率、场均进失球、零封率（只依赖比分即可复现）
- 裁判黄牌/场、红牌/场、点球/场、平局率（只依赖事件计数/赛果）
- 球员 caps/goals（事实汇总）

规则：
- 必须能写出“输入是什么、窗口是什么、公式是什么”。
- 不允许前端做计算；由数据层输出 `derived.metrics`。

### 3.3 distilled（风格蒸馏）

定义：
- 需要事件级或高粒度样本进行“画像”提炼（标签/摘要）。

规则：
- 样本阈值：默认 `>= 30 场` 才输出稳定标签。
- `distillation_status` 必须明确：
  - `available`
  - `insufficient_sample`
  - `pending_source`
- 样本不足时不得输出结论型文字，只能展示状态与占位提示。

## 4. 数据集与来源（Runtime API）

人物相关数据由 `football-data-platform` 发布，站点通过 runtime `manifest.json` 发现。

核心数据集（`/api/worldcup/2026/core/*`）：

- `people-index.json`
- `coach-profiles.json`
- `player-profiles.json`
- `referee-profiles.json`
- `officials.json`
- `player-external-facts.json`
- `staff-external-facts.json`

2026-05-20 之后，`coach/player/referee-profiles.json` 已经包含可渲染的 `sections[]`。前端适配层应保留这些 section，并把未知类型作为运行时 section 以通用 data-row 方式展示，而不是丢弃后在前端重新拼装结论。

约束：
- 前端不计算胜率、能力评分、缺阵影响、裁判尺度、风格标签。
- `derived_display_proxy`、`impact_proxy_score` 只能作为展示代理，不得当作真实模型特征或缺阵影响百分比。
- `pending_source`、`low_sample`、`insufficient_sample`、`null`、空字符串、空数组都不能显示为 0。
- 历史号码候选只能显示为“历史常用号码候选”，不能显示为 2026 世界杯球衣号码。

为了承接 “实时数据分析 + 对模型的修正（L2/L3）” 的 UI（参考 `person-profiles-new.html`），建议数据层新增并发布：

- `person-realtime-snapshots.json`
  - 目标：让前端直接渲染 `rt-band` 与 `rt-grid`，并准确表达采样频率与更新时间。
  - 必含：`person_id`, `updated_at`, `refresh_policy`, `confidence`, `sample_size`
  - 建议：`rt_band[]`（pill 数组）、`rt_panels[]`（网格面板，直接可渲染 data-row/news/schedule 等）

- `person-model-impact.json`
  - 目标：输出进入预测链路的结构化字段（L2 结构调整 / L3 信号共振）与 evidence。
  - 必含：`person_id`, `layer`（L2/L3）, `impact_rows[]`（data-row 列表）, `evidence[]`

- `match-official-assignments.json`
  - 目标：裁判本场指派（赛前 24-48h）与比赛详情页裁判链接的可靠来源。
  - 必含：`match_id`, `crew[]`, `published_at`, `source_urls`

说明：
- external facts 属于“第三方补充事实”，不得覆盖官方 master，而是以字段级来源标记合并。
- 世界杯裁判名单未发布前，referee 样本可能来自其他赛事历史（必须显式标注）。

## 5. 前端与数据层边界

### 前端（worldcup/2026）负责

- 路由与页面渲染
- 缺失/待补齐/样本不足的 UI 表达
- 只做字段展示，不做指标计算、不做风格生成

### 数据层（football-data-platform）负责

- 数据采集、清洗、审计、字段级来源标注
- derived 指标计算与窗口定义
- distilled 的阈值控制与输出规范

## 6. 迭代路线（建议）

Phase A（已做）
- direct 可用（官方 roster/team-staff）
- 教练近 10 场 derived 可用
- external facts 合并（club/DOB/age/caps/goals/impact proxy 部分可用）

Phase B（待做）
- 裁判改成世界杯官方名单 + 指派比赛（替换历史样本）
- 球员 shirt_number 官方名单来源补齐
- 教练 appointed_at / contract_until 结构化来源补齐

Phase C（后续）
- 事件级数据接入后开放 distilled 标签与能力维度评分
