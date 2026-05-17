# World Cup 2026 Site: Project Rules

适用范围：`/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026`

这份文档是本项目的“执行规则基线”，用于避免跨项目协作时反复口头对齐。

## 1. 工作边界

- 本对话/本项目只允许修改 `worldcup/2026` 目录内文件。
- `football-data-platform` 作为数据真相源：本项目只消费其发布的静态 API（或本地 dev proxy），不在这里修改其代码与数据。
- 如果必须修改其他目录（例如数据层、预测模型项目），要把需求以“任务单”形式转交到对应对话/项目执行。

## 2. 数据来源原则

- 运行时数据优先：页面运行时优先通过 `manifest.json` + `site/bundle.json` + `core/*.json` 获取数据。
- 本地数据为兜底：`src/data/*.ts` 保留作为 fallback（离线/加载失败时保证页面可用），但不应作为长期真相源手工维护。
- 所有“数据缺失”必须区分：
  - 数据层未提供（API 404/字段缺失）
  - 前端未接入（未请求或映射错误）
  - 运行时加载失败（请求失败但被 try/catch 吞掉）

## 3. 构建与发布

- `npm test` / `npm run build` 前必须执行 `sync:shared-data`，避免发布旧数据。
  - 当前已通过 `pretest` / `prebuild` 挂载。
- GitHub Pages 发布成功的最低标准：
  - `npm test` 通过
  - `npm run build` 通过
  - 站点首页可访问且关键页面（/groups /matches /teams /cities /qualifiers /stats /me /admin）无 404

## 4. 本地开发端口

- 本项目固定端口：`5175`（避免与足球预测项目 `5173` 冲突）。
- 命令：`npm run dev`。

详情见：`docs/PORTS.md`。

## 5. UI 一致性硬规则

- 统一风格：Editorial × Brutalist Data（统计页 v4 的近黑底 + 1px 线分割 + 单一荧光绿强调）。
- 禁止项：
  - 旧版蓝底“圆角卡片”风格
  - 任何页面背景图（除非明确需求）
  - 无跳转的卡片不应有 hover/可点击动效
- 返回按钮规则（站内一致）：
  - `/qualifiers`、`/stats`、`/me`、`/admin`：不显示返回按钮/返回条
  - 其他页面如需返回：统一使用 `.back-link` 样式

## 6. QA 最低要求

- 重大 UI 调整后必须做一次快速全站走查：
  - 字号比例是否统一（标题/卡片/说明）
  - 是否有残留背景图/蓝底组件
  - 关键列表是否溢出/遮挡（全屏与常见移动宽度）
  - 所有链接路由是否可达、无明显闪烁
- 推荐工具：
  - 本地：Playwright（用于快速页面巡检与断言）
  - CI：vitest（组件/路由/数据加载测试）

