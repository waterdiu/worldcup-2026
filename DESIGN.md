# DESIGN.md

## Product Context
- Product: 2026 World Cup editorial and data site.
- Audience: Chinese-speaking football fans who want fixtures, host cities, stats, favorites, predictions, and admin tools in one place.
- Core goal: Make the site feel like a publishable tournament product, not a prototype or generic dashboard.

## Data Integration
- 基础世界杯数据不再长期由本仓库单独维护。
- 当前展示站通过 `scripts/sync_shared_data.mjs` 从共享层 `/Users/chamcham/Documents/AI/CODEX/soccer/football-data-platform` 同步这些模块：
  - 该脚本已经挂入 `prebuild` 和 `pretest`，默认构建与测试前都会同步一次。
  - `src/data/finalsMatchResults.ts`
  - `src/data/finalsDataCoverage.ts`
  - `src/data/qualifierMatches.ts`
- 这样页面层仍保持现有 TypeScript import 方式，但数据真相源已经收敛到共享层。
- 后续如果继续迁移，会优先把更多展示站数据改成“共享层生成 -> 本地 TS 同步”或直接读取共享层产物，而不是继续分叉抓取逻辑。

## Style Prompt
2026 host-nations tournament poster on a dark stage: deep midnight field, saturated Canada red / Mexico green / USA navy shards, paper-cut geometry, sweeping motion ribbons, and monumental event typography.

## Visual Direction
- Overall mood: celebratory, sharp, graphic, official, high-energy, night-stage.
- Design keywords: paper-cut, host nation tricolor, stadium icon, motion ribbon, confetti shard, giant scoreboard type.
- Memorable element: a dark stage canvas with red/green/blue paper-cut fragments and data panels that feel like official tournament boards.
- Avoid: generic dark corporate dashboards, glassmorphism, purple SaaS gradients, muted corporate colors, overly soft rounded-card systems.

## Colors
- `--bg`: deep midnight stage.
- `--surface`: dark panel with subtle grain.
- `--surface-strong`: slightly brighter board panel for contrast.
- `--text`: near-white with a cool cast.
- `--muted`: steel-gray supporting copy.
- `--accent`: Mexico green (primary).
- `--accent-2`: Canada red (secondary).
- `--accent-3`: warm sun orange (tertiary).
- `--border`: cool, low-contrast stroke.

## Typography
- Display font: `Archivo Black` for hero titles, page headings, and decisive labels.
- Body font: `Noto Sans SC` for Chinese readability and UI copy.
- Mono font: `JetBrains Mono` for stats, IDs, schedule metadata, and admin labels.
- Heading style: huge, poster-like, navy, tight line-height, high contrast.
- Body style: calm, readable, not over-decorated.

## Layout
- Use strong poster sections, large paper panels, and angular accent strips.
- Keep navigation compact and persistent.
- Data pages should feel like official printed tournament statistic boards, not spreadsheets.
- Admin pages should be dense but polished, with rows that scan cleanly inside the same poster system.

## Motion
- Motion personality: quick paper-card lift, ribbon sweep, confetti snap.
- Use subtle slide/fade entrance, hover lift, and directional underline movement.
- Avoid constant decorative motion.
- Respect `prefers-reduced-motion`.

## Components
- Buttons: bold pill controls with red/green/blue states.
- Cards: white paper panel, navy stroke, saturated accent corner.
- Navigation: compact poster-ticket capsule.
- Data display: mono labels, bold navy numeric hierarchy.
- Forms: clear focus rings and compact controls.

## What NOT To Do
- Do not use generic `Inter + purple gradient + white SaaS cards`.
- Do not make sports pages look like a dark corporate admin template.
- Do not make every card the same visual weight.
- Do not hide data density behind oversized empty space.
