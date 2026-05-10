# World Cup 2026 Theme Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React/Vite-based 2026 FIFA World Cup theme page with a premium visual hero, reality-first tournament sections, placeholder-safe group and knockout views, and clean data structures ready for future prediction features.

**Architecture:** Create a small React single-page app in the `2026` workspace with local structured tournament data, focused section components, and one long-scroll layout. Keep factual tournament data separate from presentation so later API integration and prediction enrichment can replace the local data layer without redesigning the page.

**Tech Stack:** React, Vite, TypeScript, CSS modules or scoped CSS files, Vitest, Testing Library

---

## File Structure

### Project root

- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/package.json`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/tsconfig.json`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/tsconfig.node.json`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/vite.config.ts`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/index.html`

### Source files

- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/main.tsx`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/App.tsx`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/styles/global.css`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/styles/theme.css`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/styles/world-cup-page.css`

### Data and types

- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/types/tournament.ts`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/data/tournamentMeta.ts`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/data/confederations.ts`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/data/groups.ts`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/data/bracket.ts`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/data/index.ts`

### Components

- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/components/SectionHeader.tsx`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/components/AnchorNav.tsx`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/components/HeroSection.tsx`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/components/SnapshotStrip.tsx`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/components/QualifiedTeamsRail.tsx`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/components/QualifiersSection.tsx`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/components/FormatExplainer.tsx`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/components/GroupsSection.tsx`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/components/KnockoutBracketSection.tsx`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/components/PredictionPreviewSection.tsx`

### Tests

- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/test/setup.ts`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/test/App.test.tsx`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/test/data.test.ts`

## Task 1: Scaffold The React/Vite Project

**Files:**
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/package.json`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/tsconfig.json`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/tsconfig.node.json`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/vite.config.ts`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/index.html`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/main.tsx`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/App.tsx`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/styles/global.css`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/test/setup.ts`

- [ ] **Step 1: Write the initial app smoke test**

```tsx
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders the World Cup page heading', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: /world cup 2026/i })
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --runInBand`
Expected: FAIL with module resolution errors because the app and test setup do not exist yet.

- [ ] **Step 3: Create the base project files**

```json
{
  "name": "worldcup-2026",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "jsdom": "^25.0.1",
    "typescript": "^5.6.3",
    "vite": "^5.4.10",
    "vitest": "^2.1.4"
  }
}
```

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts'
  }
});
```

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

```tsx
export default function App() {
  return (
    <main>
      <h1>WORLD CUP 2026</h1>
    </main>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --runInBand`
Expected: PASS for the app smoke test.

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json tsconfig.node.json vite.config.ts index.html src/main.tsx src/App.tsx src/styles/global.css src/test/setup.ts src/test/App.test.tsx
git commit -m "feat: scaffold world cup 2026 app"
```

## Task 2: Add Tournament Types And Reality-First Local Data

**Files:**
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/types/tournament.ts`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/data/tournamentMeta.ts`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/data/confederations.ts`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/data/groups.ts`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/data/bracket.ts`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/data/index.ts`
- Test: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/test/data.test.ts`

- [ ] **Step 1: Write the failing data integrity tests**

```ts
import { bracket, confederations, groups, tournamentMeta } from '../data';

describe('tournament data', () => {
  it('defines the official tournament scale', () => {
    expect(tournamentMeta.teamCount).toBe(48);
    expect(tournamentMeta.groupCount).toBe(12);
    expect(tournamentMeta.matchCount).toBe(104);
  });

  it('marks unresolved groups as pending', () => {
    expect(groups).toHaveLength(12);
    expect(groups.every((group) => group.status !== 'confirmed')).toBe(true);
  });

  it('keeps knockout slots placeholder-safe', () => {
    expect(bracket[0].matches.every((match) => match.homeLabel && match.awayLabel)).toBe(true);
  });

  it('contains confederation cards for all six regions', () => {
    expect(confederations.map((item) => item.id)).toEqual([
      'afc',
      'caf',
      'concacaf',
      'conmebol',
      'ofc',
      'uefa'
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --runInBand src/test/data.test.ts`
Expected: FAIL because the data modules and exported shapes do not exist yet.

- [ ] **Step 3: Add the tournament types and local data modules**

```ts
export type PendingStatus = 'pending' | 'partial' | 'confirmed';

export interface TournamentMeta {
  name: string;
  year: number;
  hosts: string[];
  hostCities: number;
  startDate: string;
  finalDate: string;
  teamCount: number;
  groupCount: number;
  matchCount: number;
  status: string;
  openingMatchLabel: string;
}

export interface ConfederationCardData {
  id: 'afc' | 'caf' | 'concacaf' | 'conmebol' | 'ofc' | 'uefa';
  name: string;
  slotSummary: string;
  statusLabel: string;
  qualifiedTeams: string[];
  remainingPlaces: string;
  featuredMatches: string[];
}

export interface GroupCardData {
  id: string;
  status: PendingStatus;
  statusLabel: string;
  teams: string[];
}

export interface BracketMatchData {
  id: string;
  homeLabel: string;
  awayLabel: string;
}

export interface BracketRoundData {
  round: string;
  matches: BracketMatchData[];
}
```

```ts
export const tournamentMeta = {
  name: 'FIFA World Cup 2026',
  year: 2026,
  hosts: ['Canada', 'Mexico', 'United States'],
  hostCities: 16,
  startDate: '2026-06-11',
  finalDate: '2026-07-19',
  teamCount: 48,
  groupCount: 12,
  matchCount: 104,
  status: 'Qualifiers in progress',
  openingMatchLabel: 'Opening match in Mexico City'
} satisfies TournamentMeta;
```

```ts
export const groups = Array.from({ length: 12 }, (_, index) => ({
  id: String.fromCharCode(65 + index),
  status: 'pending',
  statusLabel: '待抽签',
  teams: ['TBD', 'TBD', 'TBD', 'TBD']
})) satisfies GroupCardData[];
```

```ts
export const bracket = [
  {
    round: 'Round of 32',
    matches: Array.from({ length: 16 }, (_, index) => ({
      id: `r32-${index + 1}`,
      homeLabel: 'TBD',
      awayLabel: 'TBD'
    }))
  },
  {
    round: 'Round of 16',
    matches: Array.from({ length: 8 }, (_, index) => ({
      id: `r16-${index + 1}`,
      homeLabel: 'Winner TBD',
      awayLabel: 'Winner TBD'
    }))
  }
] satisfies BracketRoundData[];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --runInBand src/test/data.test.ts`
Expected: PASS with all data integrity assertions green.

- [ ] **Step 5: Commit**

```bash
git add src/types/tournament.ts src/data/tournamentMeta.ts src/data/confederations.ts src/data/groups.ts src/data/bracket.ts src/data/index.ts src/test/data.test.ts
git commit -m "feat: add world cup data foundation"
```

## Task 3: Build The Page Shell And Hero Experience

**Files:**
- Modify: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/App.tsx`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/components/AnchorNav.tsx`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/components/HeroSection.tsx`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/components/SnapshotStrip.tsx`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/styles/theme.css`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/styles/world-cup-page.css`
- Test: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/test/App.test.tsx`

- [ ] **Step 1: Expand the failing page rendering tests**

```tsx
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders the hero heading and host countries', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: /world cup 2026/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/canada, mexico, united states/i)).toBeInTheDocument();
  });

  it('renders snapshot stats for tournament scale', () => {
    render(<App />);
    expect(screen.getByText('48')).toBeInTheDocument();
    expect(screen.getByText(/teams/i)).toBeInTheDocument();
    expect(screen.getByText('104')).toBeInTheDocument();
    expect(screen.getByText(/matches/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --runInBand src/test/App.test.tsx`
Expected: FAIL because the hero and snapshot content are not implemented yet.

- [ ] **Step 3: Implement the app shell, anchor nav, hero, and snapshot strip**

```tsx
import { tournamentMeta } from './data';
import { AnchorNav } from './components/AnchorNav';
import { HeroSection } from './components/HeroSection';
import { SnapshotStrip } from './components/SnapshotStrip';
import './styles/theme.css';
import './styles/world-cup-page.css';

export default function App() {
  return (
    <main className="world-cup-page">
      <AnchorNav />
      <HeroSection meta={tournamentMeta} />
      <SnapshotStrip meta={tournamentMeta} />
    </main>
  );
}
```

```tsx
interface HeroSectionProps {
  meta: TournamentMeta;
}

export function HeroSection({ meta }: HeroSectionProps) {
  return (
    <section className="hero" id="top">
      <p className="hero__eyebrow">2026 FIFA Tournament Special</p>
      <h1>WORLD CUP 2026</h1>
      <p className="hero__hosts">{meta.hosts.join(', ')}</p>
      <p className="hero__status">{meta.status}</p>
      <div className="hero__actions">
        <a href="#qualifiers">View Qualifiers</a>
        <a href="#knockout">Knockout Path</a>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --runInBand src/test/App.test.tsx`
Expected: PASS for hero and snapshot assertions.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/components/AnchorNav.tsx src/components/HeroSection.tsx src/components/SnapshotStrip.tsx src/styles/theme.css src/styles/world-cup-page.css src/test/App.test.tsx
git commit -m "feat: build world cup hero shell"
```

## Task 4: Implement Qualifiers, Qualified Teams, And Format Explainer Sections

**Files:**
- Modify: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/App.tsx`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/components/SectionHeader.tsx`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/components/QualifiedTeamsRail.tsx`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/components/QualifiersSection.tsx`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/components/FormatExplainer.tsx`
- Test: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/test/App.test.tsx`

- [ ] **Step 1: Add the failing section tests**

```tsx
it('renders all six confederation cards', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /qualifiers/i })).toBeInTheDocument();
  expect(screen.getByText(/afc/i)).toBeInTheDocument();
  expect(screen.getByText(/uefa/i)).toBeInTheDocument();
});

it('renders the finals format explainer', () => {
  render(<App />);
  expect(screen.getByText(/12 groups/i)).toBeInTheDocument();
  expect(screen.getByText(/best eight third-placed teams/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --runInBand src/test/App.test.tsx`
Expected: FAIL because the qualifiers and format sections do not exist yet.

- [ ] **Step 3: Implement the qualifiers, qualified teams, and format explainer components**

```tsx
export function QualifiersSection({ confederations }: QualifiersSectionProps) {
  return (
    <section id="qualifiers" className="section">
      <SectionHeader
        eyebrow="Qualification"
        title="Road to 2026"
        description="Officially confirmed progress only. Pending slots remain clearly unresolved."
      />
      <div className="confederation-grid">
        {confederations.map((confederation) => (
          <article key={confederation.id} className="confederation-card">
            <h3>{confederation.name}</h3>
            <p>{confederation.statusLabel}</p>
            <p>{confederation.slotSummary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
```

```tsx
export function FormatExplainer() {
  return (
    <section className="section" id="format">
      <SectionHeader
        eyebrow="Tournament Format"
        title="How The Finals Work"
        description="48 teams enter. Twelve groups begin the finals. The top two and the best eight third-placed teams advance to the Round of 32."
      />
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --runInBand src/test/App.test.tsx`
Expected: PASS with qualifiers and format coverage.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/components/SectionHeader.tsx src/components/QualifiedTeamsRail.tsx src/components/QualifiersSection.tsx src/components/FormatExplainer.tsx src/test/App.test.tsx
git commit -m "feat: add qualifiers and finals format sections"
```

## Task 5: Implement Group Stage Placeholders And Knockout Bracket Shell

**Files:**
- Modify: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/App.tsx`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/components/GroupsSection.tsx`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/components/KnockoutBracketSection.tsx`
- Test: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/test/App.test.tsx`

- [ ] **Step 1: Add the failing unresolved-state tests**

```tsx
it('renders all 12 group cards with pending labels', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /group stage outlook/i })).toBeInTheDocument();
  expect(screen.getAllByText(/待抽签|tbd/i).length).toBeGreaterThan(0);
});

it('renders the knockout bracket shell', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /knockout bracket/i })).toBeInTheDocument();
  expect(screen.getByText(/round of 32/i)).toBeInTheDocument();
  expect(screen.getByText(/final/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --runInBand src/test/App.test.tsx`
Expected: FAIL because the group and knockout sections do not exist.

- [ ] **Step 3: Implement the groups and bracket sections**

```tsx
export function GroupsSection({ groups }: GroupsSectionProps) {
  return (
    <section id="groups" className="section">
      <SectionHeader
        eyebrow="Group Stage"
        title="Group Stage Outlook"
        description="Groups remain explicitly unresolved until the official draw is complete."
      />
      <div className="group-grid">
        {groups.map((group) => (
          <article key={group.id} className="group-card">
            <header>
              <h3>Group {group.id}</h3>
              <span>{group.statusLabel}</span>
            </header>
            <ul>
              {group.teams.map((team) => (
                <li key={`${group.id}-${team}`}>{team}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
```

```tsx
export function KnockoutBracketSection({ rounds }: KnockoutBracketSectionProps) {
  return (
    <section id="knockout" className="section">
      <SectionHeader
        eyebrow="Knockout"
        title="Knockout Bracket"
        description="The bracket structure is visible now, while unresolved fixtures remain marked as pending."
      />
      <div className="bracket-scroll">
        {rounds.map((round) => (
          <div key={round.round} className="bracket-round">
            <h3>{round.round}</h3>
            {round.matches.map((match) => (
              <article key={match.id} className="bracket-match">
                <span>{match.homeLabel}</span>
                <span>{match.awayLabel}</span>
              </article>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --runInBand src/test/App.test.tsx`
Expected: PASS with group placeholder and bracket shell coverage.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/components/GroupsSection.tsx src/components/KnockoutBracketSection.tsx src/test/App.test.tsx
git commit -m "feat: add pending-safe groups and bracket sections"
```

## Task 6: Add Prediction Preview And Responsive Polish

**Files:**
- Modify: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/App.tsx`
- Create: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/components/PredictionPreviewSection.tsx`
- Modify: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/styles/world-cup-page.css`
- Test: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/test/App.test.tsx`

- [ ] **Step 1: Add the failing future-feature tests**

```tsx
it('renders the prediction preview section', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /prediction preview/i })).toBeInTheDocument();
  expect(screen.getByText(/match prediction/i)).toBeInTheDocument();
  expect(screen.getByText(/champion path simulation/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --runInBand src/test/App.test.tsx`
Expected: FAIL because the prediction preview section has not been added.

- [ ] **Step 3: Implement the preview section and mobile-safe styles**

```tsx
export function PredictionPreviewSection() {
  return (
    <section id="prediction" className="section">
      <SectionHeader
        eyebrow="Coming Next"
        title="Prediction Preview"
        description="This page is designed to grow into a live forecasting surface as data feeds and models arrive."
      />
      <div className="prediction-grid">
        <article className="feature-card">
          <h3>Match Prediction</h3>
          <p>Future win probabilities, scorelines, and momentum signals will live here.</p>
        </article>
        <article className="feature-card">
          <h3>Qualification Probability</h3>
          <p>Group advancement projections will connect standings, fixtures, and strength signals.</p>
        </article>
        <article className="feature-card">
          <h3>Champion Path Simulation</h3>
          <p>Bracket pathways will become explorable once real fixtures and model outputs are connected.</p>
        </article>
      </div>
    </section>
  );
}
```

```css
@media (max-width: 720px) {
  .confederation-grid,
  .group-grid,
  .prediction-grid {
    grid-template-columns: 1fr;
  }

  .bracket-scroll {
    overflow-x: auto;
    padding-bottom: 12px;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --runInBand src/test/App.test.tsx`
Expected: PASS with the preview section visible.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/components/PredictionPreviewSection.tsx src/styles/world-cup-page.css src/test/App.test.tsx
git commit -m "feat: add prediction preview and responsive polish"
```

## Task 7: Verify The Full App End-To-End

**Files:**
- Modify if needed: `/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026/src/**/*`

- [ ] **Step 1: Run the full automated test suite**

Run: `npm test -- --runInBand`
Expected: PASS for all data and rendering tests.

- [ ] **Step 2: Run the production build**

Run: `npm run build`
Expected: PASS and emit a `dist/` build without TypeScript or Vite errors.

- [ ] **Step 3: Preview the app locally**

Run: `npm run dev`
Expected: Vite dev server starts and the page shows the hero, qualifiers, format explainer, groups, bracket, and prediction preview sections in a single scroll flow.

- [ ] **Step 4: Review factual content against the spec**

Check:
- Hosts are Canada, Mexico, and United States
- Snapshot shows 48 teams, 12 groups, 104 matches, and 16 host cities
- Unresolved group and bracket data remain visibly pending
- No fabricated standings or winners appear anywhere

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: deliver world cup 2026 theme page"
```

## Self-Review

### Spec coverage

- Hero, snapshot, qualifiers, format, groups, knockout, and prediction preview are each covered by a dedicated task.
- Reality-first display rules are covered in the data task and the unresolved-state UI task.
- React/Vite architecture is covered in the scaffold task.
- Responsive behavior is explicitly covered in the final UI polish task.

### Placeholder scan

- The implementation plan does not use unresolved planning placeholders such as `TODO` or `implement later`.
- All tasks include explicit files, commands, and concrete code samples.

### Type consistency

- Data names are consistent across the plan: `tournamentMeta`, `confederations`, `groups`, and `bracket`.
- Component names are consistent with the spec and app shell references.
