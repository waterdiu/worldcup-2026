# 2026 World Cup Theme Page Design

## Goal

Build a 2026 FIFA World Cup theme page that combines a strong editorial landing experience with a structured tournament data surface. The page should feel like a premium event special while remaining compatible with future real-time data ingestion and match prediction features.

## Product Direction

- Page type: hybrid experience
- Experience model: strong visual homepage plus long-scroll data sections
- Data principle: reality-first
- Prediction support: reserved in the architecture, not implemented in the first version

The page must only present officially confirmed tournament information as factual content. Any group assignment, knockout matchup, ranking, or team slot that is not officially confirmed must be clearly labeled as `TBD`, `待定`, or `待抽签`.

## User Experience Goals

- Create immediate World Cup atmosphere on first load
- Let users quickly understand tournament scale, hosts, and timing
- Let users browse qualifiers, finals format, groups, and knockout structure in one continuous reading flow
- Avoid fake certainty for not-yet-confirmed information
- Create clear extension points for future prediction products

## Information Architecture

The page is organized into seven sections:

### 1. Hero Section

Purpose:
Establish emotion, tournament identity, and immediate entry points.

Content:
- Main title: `WORLD CUP 2026`
- Subtitle or tagline
- Host countries: Canada, Mexico, United States
- Tournament status summary
- Primary CTA: jump to qualifiers
- Secondary CTA: jump to knockout path
- Key date callouts such as opening match and final

Behavior:
- Full-screen first impression
- Layered visual background with subtle field/grid motifs
- Light entrance animation for headings and stat strip

### 2. Tournament Snapshot

Purpose:
Deliver core facts in one glance.

Content cards:
- 48 teams
- 12 groups
- 104 matches
- 16 host cities
- Opening match date
- Final date

This strip should be compact, scannable, and reusable from a simple metadata object.

### 3. Qualifiers Section

Purpose:
Show real progression from qualification to finals.

Structure:
- One card per confederation
- Confederations: AFC, CAF, CONCACAF, CONMEBOL, OFC, UEFA

Per-card data:
- Confederation name
- Allocation summary or qualification slots
- Current stage label
- Officially qualified teams
- Remaining places
- Featured matchups or recent important results

Rules:
- This section should be designed for dynamic data replacement later
- Unknown or pending information must remain explicitly unresolved

### 4. Finals Format Explainer

Purpose:
Help users understand the expanded 48-team tournament.

Content:
- 12 groups
- Top two from each group advance
- Best eight third-placed teams also advance
- Round of 32 begins the knockout phase

Presentation:
- Diagram-led explanation
- Minimal text with clear progress flow

### 5. Group Stage Section

Purpose:
Display the future group structure without inventing confirmed teams before the official draw.

Structure:
- Group cards A through L
- Each card supports:
  - group label
  - status label
  - team slots
  - standings table area

Initial behavior:
- Before official draw completion, group cards should say `待抽签` or `TBD`
- Any known anchors should only be shown if officially confirmed
- Standings area can exist as a designed shell without fake played results

### 6. Knockout Bracket Section

Purpose:
Give users the emotional tournament pathway from Round of 32 to Final.

Structure:
- Round of 32
- Round of 16
- Quarter-finals
- Semi-finals
- Third-place match if needed by chosen scope
- Final

Rules:
- If official knockout mapping is confirmed, follow it
- If only partial mapping is known, use rule-based placeholders
- Otherwise show `TBD vs TBD`
- Never invent actual qualified teams or fabricated winners

### 7. Prediction Preview Section

Purpose:
Reserve an obvious path for the future forecasting product.

Initial content:
- Match prediction preview card
- Group qualification probability preview card
- Champion path simulation preview card

Scope limit:
- No actual model output in version one
- This section is architectural and visual groundwork only

## Visual Language

The visual system should merge sports-broadcast drama with clean data presentation.

### Tone

- High-stakes
- Editorial
- Premium
- Competitive
- Modern

### Color Direction

Recommended palette direction:
- Deep night blue or near-black for depth
- Grass or electric green accents for sporting identity
- Silver or light neutral for data surfaces
- Warm red-orange for highlights and urgency

Avoid:
- Generic purple-on-white aesthetics
- Flat dashboard-only styling
- Overly playful consumer-app visuals

### Typography

- Title system: condensed or display sans for impact
- Data/UI text: clean readable sans for tables and cards
- Strong hierarchy between event title, section labels, and data cells

### Motion

Use restrained motion in only meaningful places:
- Hero entrance reveal
- Section stagger on scroll
- Bracket path highlight on hover

Avoid noisy micro-animations across every component.

## Component Model

The implementation should be split into focused components with clear upgrade paths.

### Core page components

- `HeroSection`
- `SnapshotStrip`
- `QualifiersSection`
- `ConfederationCard`
- `QualifiedTeamsRail`
- `FormatExplainer`
- `GroupsSection`
- `GroupCard`
- `StandingsTableShell`
- `KnockoutBracketSection`
- `BracketRoundColumn`
- `PredictionPreviewSection`

### Shared support components

- `SectionHeader`
- `StatCard`
- `StatusPill`
- `TeamChip`
- `AnchorNav`

Each component should accept data props rather than hard-coded inline content wherever practical.

## Data Model

The page should be built around structured local data that can later be swapped for API responses.

### `tournamentMeta`

Fields:
- `name`
- `year`
- `hosts`
- `hostCities`
- `startDate`
- `finalDate`
- `teamCount`
- `groupCount`
- `matchCount`
- `status`

### `confederations`

Per item:
- `id`
- `name`
- `slotSummary`
- `statusLabel`
- `qualifiedTeams`
- `remainingPlaces`
- `featuredMatches`

### `teams`

Per item:
- `id`
- `name`
- `confederation`
- `qualificationStatus`
- `groupId`
- `fifaRank`
- `elo`

`fifaRank` and `elo` are optional in version one but should be anticipated in the model for future prediction work.

### `groups`

Per item:
- `groupId`
- `status`
- `teams`
- `standings`

Version one must allow empty or placeholder teams cleanly.

### `matches`

Per item:
- `id`
- `stage`
- `homeTeam`
- `awayTeam`
- `kickoff`
- `venue`
- `status`

Future prediction fields can be appended later:
- `winProbabilities`
- `predictedScore`
- `modelVersion`

## Content Truth Rules

### Must be factual

- Host countries
- Tournament format
- Number of teams
- Number of groups
- Number of matches
- Official key dates
- Officially qualified teams
- Officially published host-city or venue information

### Must remain unresolved when not official

- Final group compositions
- Knockout pairings not yet determined
- Group standings before play
- Results not officially played
- Advancement outcomes not officially secured

### Presentation rule

Every unresolved item must be visibly marked as pending rather than silently omitted.

## Technical Direction

Recommended implementation stack:
- React
- Vite
- Component-driven page composition
- Local structured data files in version one

Why this stack:
- Supports future real-time data ingestion
- Supports prediction-oriented data enrichment later
- Keeps presentational and data boundaries clear

## Responsive Behavior

- Desktop: immersive hero and multi-column data sections
- Tablet: reduced columns, preserved hierarchy
- Mobile: stacked cards, horizontal bracket scrolling if needed, compact stat strip

The bracket must remain readable on mobile without collapsing into unreadable miniature text.

## Accessibility Notes

- Preserve strong contrast for key data and CTA text
- Ensure status labels are not color-only
- Keep keyboard access for anchor navigation and section jumps
- Use semantic heading order for long-scroll comprehension

## Non-Goals For Version One

- No live API integration yet
- No real prediction engine yet
- No user account or personalization flow
- No fake auto-generated full tournament outcomes

## Recommended Build Sequence

1. Scaffold React/Vite project in the `2026` workspace
2. Build static page shell and theme system
3. Implement hero and snapshot sections
4. Implement qualifiers and finals format sections
5. Implement group placeholders and knockout bracket shell
6. Add prediction preview section
7. Refine responsive layout and motion
8. Prepare data files for future external integration

## Open Decision Locked During Brainstorming

The following decisions are already agreed:
- The page is for the 2026 FIFA World Cup
- It should balance visual storytelling with structured data
- It should follow real confirmed tournament progress only
- It should use a strong visual homepage plus long-scroll data sections
- It should be implemented in a React/Vite-friendly architecture because future prediction features are planned
