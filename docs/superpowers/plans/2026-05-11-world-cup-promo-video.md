# World Cup Promo Video Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone 30-second HyperFrames promotional video project for the 2026 World Cup, integrate a preview/showcase route into the existing `soccer/worldcup/2026` site, and produce a final music-backed render.

**Architecture:** Keep authoring and rendering inside a new standalone promo-video workspace while exposing the finished asset and a lightweight preview page inside the existing site. Reuse only selective map and tournament assets from the site, and drive all primary motion through GSAP composition files with a shared visual system defined in `DESIGN.md`.

**Tech Stack:** HyperFrames-compatible HTML compositions, CSS, SVG, GSAP, Vite/React site integration, Vitest, local static assets

---

## File Structure

### Standalone promo-video project

- Create: `soccer/worldcup/2026-promo-video/package.json`
- Create: `soccer/worldcup/2026-promo-video/README.md`
- Create: `soccer/worldcup/2026-promo-video/DESIGN.md`
- Create: `soccer/worldcup/2026-promo-video/index.html`
- Create: `soccer/worldcup/2026-promo-video/compositions/intro-build.html`
- Create: `soccer/worldcup/2026-promo-video/compositions/canada-chapter.html`
- Create: `soccer/worldcup/2026-promo-video/compositions/mexico-chapter.html`
- Create: `soccer/worldcup/2026-promo-video/compositions/usa-chapter.html`
- Create: `soccer/worldcup/2026-promo-video/compositions/final-hero.html`
- Create: `soccer/worldcup/2026-promo-video/assets/audio/`
- Create: `soccer/worldcup/2026-promo-video/assets/svg/`
- Create: `soccer/worldcup/2026-promo-video/assets/shared/`
- Create: `soccer/worldcup/2026-promo-video/scripts/`

### Existing site integration

- Modify: `soccer/worldcup/2026/src/App.tsx`
- Modify: `soccer/worldcup/2026/src/components/PageNav.tsx`
- Modify: `soccer/worldcup/2026/src/i18n/content.ts`
- Modify: `soccer/worldcup/2026/src/test/App.test.tsx`
- Create: `soccer/worldcup/2026/src/pages/PromoVideoPage.tsx`
- Create: `soccer/worldcup/2026/src/data/promoVideo.ts`
- Modify: `soccer/worldcup/2026/src/styles/world-cup-page.css`
- Create: `soccer/worldcup/2026/public/worldcup-assets/promo/`

### Optional render artifact placement

- Create: `soccer/worldcup/2026/public/worldcup-assets/promo/world-cup-2026-promo.mp4`
- Create: `soccer/worldcup/2026/public/worldcup-assets/promo/world-cup-2026-hero.jpg`

## Task 1: Scaffold The Standalone Promo Project

**Files:**
- Create: `soccer/worldcup/2026-promo-video/package.json`
- Create: `soccer/worldcup/2026-promo-video/README.md`
- Create: `soccer/worldcup/2026-promo-video/DESIGN.md`
- Create: `soccer/worldcup/2026-promo-video/index.html`

- [ ] **Step 1: Write the failing structure check**

Create a shell test script path in `soccer/worldcup/2026-promo-video/package.json` so the workspace has an explicit validation target:

```json
{
  "name": "world-cup-2026-promo-video",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "check:files": "node scripts/check-required-files.mjs"
  }
}
```

- [ ] **Step 2: Run the structure check and verify it fails**

Run: `npm run check:files`

Expected: FAIL because `scripts/check-required-files.mjs` and the required composition files do not exist yet.

- [ ] **Step 3: Write the minimal project files**

Create `soccer/worldcup/2026-promo-video/DESIGN.md` with the approved visual system:

```md
# DESIGN

## Style Prompt
Warm-white motion-poster collage for an unofficial 2026 World Cup promo. Flat-vector forms, sharp geometric layering, large negative space, condensed typography, and fast GSAP-led sports energy.

## Colors
- Warm White: #F7F4EE
- Carbon: #111111
- Canada Red: #E1251B
- Mexico Green: #0F8A43
- USA Blue: #1546B8

## Typography
- Display: Bebas Neue or equivalent condensed all-caps family
- Support: Barlow Condensed or Oswald

## What NOT to Do
- No purple-led palette
- No cyberpunk neon
- No glossy CGI
- No official tournament emblem mimicry
- No photo-led tourism montage
```

Create `soccer/worldcup/2026-promo-video/README.md`:

```md
# World Cup 2026 Promo Video

Standalone HyperFrames-style composition project for the unofficial 30-second promo video.

## Structure
- `index.html`: root composition
- `compositions/`: chapter compositions
- `assets/audio/`: royalty-free music
- `assets/svg/`: generated vector motifs
- `assets/shared/`: reused worldcup site assets
```

Create `soccer/worldcup/2026-promo-video/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>World Cup 2026 Promo Video</title>
  </head>
  <body>
    <div
      data-composition-id="world-cup-2026-promo"
      data-start="0"
      data-duration="30"
      data-width="1920"
      data-height="1080"
    >
      <div
        id="intro-build"
        data-composition-id="intro-build"
        data-composition-src="compositions/intro-build.html"
        data-start="0"
        data-duration="5"
        data-track-index="1"
      ></div>
      <div
        id="canada-chapter"
        data-composition-id="canada-chapter"
        data-composition-src="compositions/canada-chapter.html"
        data-start="5"
        data-duration="7"
        data-track-index="1"
      ></div>
      <div
        id="mexico-chapter"
        data-composition-id="mexico-chapter"
        data-composition-src="compositions/mexico-chapter.html"
        data-start="12"
        data-duration="7"
        data-track-index="1"
      ></div>
      <div
        id="usa-chapter"
        data-composition-id="usa-chapter"
        data-composition-src="compositions/usa-chapter.html"
        data-start="19"
        data-duration="7"
        data-track-index="1"
      ></div>
      <div
        id="final-hero"
        data-composition-id="final-hero"
        data-composition-src="compositions/final-hero.html"
        data-start="26"
        data-duration="4"
        data-track-index="1"
      ></div>
      <audio
        id="promo-audio"
        data-start="0"
        data-duration="30"
        data-track-index="2"
        data-volume="1"
        src="assets/audio/world-cup-promo-track.mp3"
      ></audio>
    </div>
  </body>
</html>
```

- [ ] **Step 4: Add the structure validation script**

Create `soccer/worldcup/2026-promo-video/scripts/check-required-files.mjs`:

```js
import { access } from 'node:fs/promises';

const requiredFiles = [
  'DESIGN.md',
  'index.html',
  'README.md',
  'compositions/intro-build.html',
  'compositions/canada-chapter.html',
  'compositions/mexico-chapter.html',
  'compositions/usa-chapter.html',
  'compositions/final-hero.html'
];

const missing = [];

for (const file of requiredFiles) {
  try {
    await access(new URL(`../${file}`, import.meta.url));
  } catch {
    missing.push(file);
  }
}

if (missing.length > 0) {
  console.error('Missing required files:\n' + missing.join('\n'));
  process.exit(1);
}

console.log('All required promo project files exist.');
```

- [ ] **Step 5: Run the structure check to verify it still fails for missing compositions**

Run: `npm run check:files`

Expected: FAIL listing the missing chapter composition files.

- [ ] **Step 6: Commit**

```bash
git add soccer/worldcup/2026-promo-video/package.json soccer/worldcup/2026-promo-video/README.md soccer/worldcup/2026-promo-video/DESIGN.md soccer/worldcup/2026-promo-video/index.html soccer/worldcup/2026-promo-video/scripts/check-required-files.mjs
git commit -m "feat: scaffold world cup promo video project"
```

## Task 2: Build Shared Visual Foundations And Reused Assets

**Files:**
- Create: `soccer/worldcup/2026-promo-video/assets/svg/shared-motifs.svg`
- Create: `soccer/worldcup/2026-promo-video/assets/shared/README.md`
- Create: `soccer/worldcup/2026-promo-video/scripts/sync-shared-assets.mjs`

- [ ] **Step 1: Write the failing asset sync script expectation**

Add a second script to `soccer/worldcup/2026-promo-video/package.json`:

```json
{
  "scripts": {
    "check:files": "node scripts/check-required-files.mjs",
    "sync:assets": "node scripts/sync-shared-assets.mjs"
  }
}
```

- [ ] **Step 2: Run the asset sync command and verify it fails**

Run: `npm run sync:assets`

Expected: FAIL because `scripts/sync-shared-assets.mjs` does not exist yet.

- [ ] **Step 3: Create the asset sync script**

Create `soccer/worldcup/2026-promo-video/scripts/sync-shared-assets.mjs`:

```js
import { cp, mkdir, writeFile } from 'node:fs/promises';

const sourceRoot = new URL('../../worldcup/2026/public/worldcup-assets/', import.meta.url);
const targetRoot = new URL('../assets/shared/', import.meta.url);

await mkdir(targetRoot, { recursive: true });

await cp(new URL('maps/worldcup2026_overlay_v2.svg', sourceRoot), new URL('worldcup2026_overlay_v2.svg', targetRoot));
await cp(new URL('maps/worldcup2026_preview_v2.jpg', sourceRoot), new URL('worldcup2026_preview_v2.jpg', targetRoot));
await cp(new URL('../vendor/maps/Canada.json', sourceRoot), new URL('Canada.json', targetRoot));
await cp(new URL('../vendor/maps/Mexico.json', sourceRoot), new URL('Mexico.json', targetRoot));
await cp(new URL('../vendor/maps/USA.json', sourceRoot), new URL('USA.json', targetRoot));

await writeFile(
  new URL('README.md', targetRoot),
  `# Shared Assets\n\nSynced from soccer/worldcup/2026 public assets for masked collage and map reference use.\n`
);

console.log('Shared assets synced.');
```

- [ ] **Step 4: Create the shared SVG motifs file**

Create `soccer/worldcup/2026-promo-video/assets/svg/shared-motifs.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
  <defs>
    <symbol id="pitch-arc" viewBox="0 0 300 300">
      <path d="M30 150a120 120 0 1 1 240 0" fill="none" stroke="currentColor" stroke-width="14" />
    </symbol>
    <symbol id="speed-line" viewBox="0 0 220 20">
      <rect x="0" y="4" width="220" height="12" rx="6" fill="currentColor" />
    </symbol>
    <symbol id="star-burst" viewBox="0 0 200 200">
      <path d="M100 0 121 79 200 100 121 121 100 200 79 121 0 100 79 79Z" fill="currentColor" />
    </symbol>
  </defs>
</svg>
```

- [ ] **Step 5: Run the asset sync command to verify it passes**

Run: `npm run sync:assets`

Expected: PASS with `Shared assets synced.`

- [ ] **Step 6: Commit**

```bash
git add soccer/worldcup/2026-promo-video/package.json soccer/worldcup/2026-promo-video/scripts/sync-shared-assets.mjs soccer/worldcup/2026-promo-video/assets/svg/shared-motifs.svg soccer/worldcup/2026-promo-video/assets/shared/README.md
git commit -m "feat: add promo video shared asset pipeline"
```

## Task 3: Implement The Intro And Country Chapter Compositions

**Files:**
- Create: `soccer/worldcup/2026-promo-video/compositions/intro-build.html`
- Create: `soccer/worldcup/2026-promo-video/compositions/canada-chapter.html`
- Create: `soccer/worldcup/2026-promo-video/compositions/mexico-chapter.html`
- Create: `soccer/worldcup/2026-promo-video/compositions/usa-chapter.html`

- [ ] **Step 1: Write the missing composition failure**

Run: `npm run check:files`

Expected: FAIL because the four chapter files do not exist yet.

- [ ] **Step 2: Create the intro composition**

Create `soccer/worldcup/2026-promo-video/compositions/intro-build.html` with a root-scoped white canvas, RGB fragments, and GSAP timeline registration:

```html
<template id="intro-build-template">
  <div data-composition-id="intro-build" data-width="1920" data-height="1080">
    <div class="scene intro-build">
      <div class="scene-content">
        <div class="fragment fragment--red"></div>
        <div class="fragment fragment--green"></div>
        <div class="fragment fragment--blue"></div>
        <div class="pitch pitch--center"></div>
        <div class="pitch pitch--left"></div>
        <div class="pitch pitch--right"></div>
      </div>
    </div>
    <style>
      [data-composition-id="intro-build"] { width: 100%; height: 100%; background: #f7f4ee; overflow: hidden; }
      [data-composition-id="intro-build"] .scene-content { position: relative; width: 100%; height: 100%; }
      [data-composition-id="intro-build"] .fragment { position: absolute; border-radius: 40px; transform: rotate(-18deg); }
      [data-composition-id="intro-build"] .fragment--red { top: 90px; left: 140px; width: 320px; height: 120px; background: #e1251b; }
      [data-composition-id="intro-build"] .fragment--green { top: 280px; right: 220px; width: 280px; height: 110px; background: #0f8a43; }
      [data-composition-id="intro-build"] .fragment--blue { bottom: 160px; left: 540px; width: 520px; height: 140px; background: #1546b8; }
      [data-composition-id="intro-build"] .pitch { position: absolute; border: 12px solid #111111; border-radius: 999px; opacity: 0.9; }
      [data-composition-id="intro-build"] .pitch--center { inset: 260px 620px 260px 620px; }
      [data-composition-id="intro-build"] .pitch--left { width: 420px; height: 420px; top: 320px; left: -120px; }
      [data-composition-id="intro-build"] .pitch--right { width: 420px; height: 420px; top: 160px; right: -120px; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      tl.from('.fragment--red', { x: -600, y: -160, rotation: -32, duration: 0.9, ease: 'expo.out' }, 0.15);
      tl.from('.fragment--green', { x: 520, y: -180, rotation: 28, duration: 0.85, ease: 'power4.out' }, 0.28);
      tl.from('.fragment--blue', { x: 0, y: 440, scaleX: 0.2, duration: 0.95, ease: 'back.out(1.2)' }, 0.42);
      tl.from('.pitch--center', { scale: 0.3, opacity: 0, duration: 0.8, ease: 'circ.out' }, 1.2);
      tl.from('.pitch--left', { x: -220, opacity: 0, duration: 0.6, ease: 'power2.out' }, 1.45);
      tl.from('.pitch--right', { x: 220, opacity: 0, duration: 0.6, ease: 'power2.out' }, 1.6);
      window.__timelines['intro-build'] = tl;
    </script>
  </div>
</template>
```

- [ ] **Step 3: Create the Canada chapter**

Create `soccer/worldcup/2026-promo-video/compositions/canada-chapter.html`:

```html
<template id="canada-chapter-template">
  <div data-composition-id="canada-chapter" data-width="1920" data-height="1080">
    <div class="scene canada-chapter">
      <div class="scene-content">
        <div class="panel panel--red"></div>
        <div class="maple"></div>
        <div class="mountains"></div>
        <div class="forest"></div>
        <div class="skyline"></div>
        <div class="wildlife"></div>
      </div>
    </div>
    <style>
      [data-composition-id="canada-chapter"] { width: 100%; height: 100%; background: #f7f4ee; overflow: hidden; }
      [data-composition-id="canada-chapter"] .scene-content { position: relative; width: 100%; height: 100%; }
      [data-composition-id="canada-chapter"] .panel--red { position: absolute; inset: 120px 180px 120px 180px; background: #e1251b; clip-path: polygon(0 8%, 82% 0, 100% 18%, 93% 100%, 12% 92%, 0 70%); }
      [data-composition-id="canada-chapter"] .maple { position: absolute; top: 120px; left: 170px; width: 500px; height: 500px; background: #f7f4ee; clip-path: polygon(49% 0, 58% 17%, 76% 7%, 70% 29%, 92% 31%, 74% 48%, 92% 64%, 68% 65%, 72% 92%, 50% 77%, 28% 92%, 32% 65%, 8% 64%, 26% 48%, 8% 31%, 30% 29%, 24% 7%, 42% 17%); }
      [data-composition-id="canada-chapter"] .mountains { position: absolute; left: 120px; right: 540px; bottom: 170px; height: 240px; background: #111111; clip-path: polygon(0 100%, 18% 42%, 30% 65%, 44% 24%, 58% 66%, 76% 18%, 100% 100%); }
      [data-composition-id="canada-chapter"] .forest { position: absolute; left: 220px; right: 700px; bottom: 140px; height: 160px; background: repeating-linear-gradient(90deg, #f7f4ee 0 14px, transparent 14px 24px); clip-path: polygon(0 100%, 6% 40%, 12% 100%, 18% 30%, 24% 100%, 32% 24%, 40% 100%, 49% 34%, 58% 100%, 69% 26%, 80% 100%, 90% 38%, 100% 100%); }
      [data-composition-id="canada-chapter"] .skyline { position: absolute; right: 180px; bottom: 170px; width: 420px; height: 330px; background: #f7f4ee; clip-path: polygon(0 100%, 0 52%, 11% 52%, 11% 34%, 22% 34%, 22% 58%, 36% 58%, 36% 18%, 48% 18%, 48% 64%, 64% 64%, 64% 42%, 76% 42%, 76% 8%, 89% 8%, 89% 70%, 100% 70%, 100% 100%); }
      [data-composition-id="canada-chapter"] .wildlife { position: absolute; right: 290px; bottom: 220px; width: 260px; height: 160px; background: #111111; clip-path: polygon(0 70%, 14% 46%, 28% 52%, 34% 28%, 46% 22%, 58% 30%, 62% 0, 70% 28%, 84% 36%, 100% 62%, 90% 72%, 82% 100%, 70% 72%, 50% 70%, 42% 100%, 30% 74%, 10% 80%); }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      tl.from('.panel--red', { scaleX: 0.2, x: -220, duration: 0.8, ease: 'expo.out' }, 0.15);
      tl.from('.maple', { y: -180, rotation: -18, opacity: 0, duration: 0.75, ease: 'power4.out' }, 0.35);
      tl.from('.mountains', { y: 180, opacity: 0, duration: 0.7, ease: 'circ.out' }, 0.58);
      tl.from('.forest', { y: 120, opacity: 0, duration: 0.6, ease: 'power2.out' }, 0.78);
      tl.from('.skyline', { x: 140, opacity: 0, duration: 0.65, ease: 'power3.out' }, 0.96);
      tl.from('.wildlife', { x: 110, y: 30, opacity: 0, duration: 0.45, ease: 'back.out(1.1)' }, 1.08);
      window.__timelines['canada-chapter'] = tl;
    </script>
  </div>
</template>
```

- [ ] **Step 4: Create the Mexico chapter**

Create `soccer/worldcup/2026-promo-video/compositions/mexico-chapter.html`:

```html
<template id="mexico-chapter-template">
  <div data-composition-id="mexico-chapter" data-width="1920" data-height="1080">
    <div class="scene mexico-chapter">
      <div class="scene-content">
        <div class="sun-core"></div>
        <div class="sun-rays"></div>
        <div class="banner-row"></div>
        <div class="cactus cactus--left"></div>
        <div class="cactus cactus--right"></div>
        <div class="agave"></div>
        <div class="dots"></div>
      </div>
    </div>
    <style>
      [data-composition-id="mexico-chapter"] { width: 100%; height: 100%; background: #f7f4ee; overflow: hidden; }
      [data-composition-id="mexico-chapter"] .scene-content { position: relative; width: 100%; height: 100%; }
      [data-composition-id="mexico-chapter"] .sun-core { position: absolute; top: 180px; left: 300px; width: 280px; height: 280px; border-radius: 50%; background: #0f8a43; }
      [data-composition-id="mexico-chapter"] .sun-rays { position: absolute; inset: 90px 980px 420px 120px; background: repeating-conic-gradient(from 0deg, #0f8a43 0deg 10deg, transparent 10deg 20deg); border-radius: 50%; }
      [data-composition-id="mexico-chapter"] .banner-row { position: absolute; top: 120px; right: 160px; width: 760px; height: 180px; background: repeating-linear-gradient(90deg, #0f8a43 0 40px, transparent 40px 60px); clip-path: polygon(0 0, 100% 0, 92% 100%, 84% 0, 76% 100%, 68% 0, 60% 100%, 52% 0, 44% 100%, 36% 0, 28% 100%, 20% 0, 12% 100%, 0 0); }
      [data-composition-id="mexico-chapter"] .cactus { position: absolute; width: 140px; background: #0f8a43; border-radius: 50px; }
      [data-composition-id="mexico-chapter"] .cactus--left { left: 240px; bottom: 130px; height: 330px; }
      [data-composition-id="mexico-chapter"] .cactus--right { right: 280px; bottom: 130px; height: 290px; }
      [data-composition-id="mexico-chapter"] .agave { position: absolute; left: 560px; bottom: 120px; width: 720px; height: 360px; background: repeating-conic-gradient(from 180deg, #0f8a43 0deg 12deg, transparent 12deg 24deg); clip-path: ellipse(42% 44% at 50% 100%); }
      [data-composition-id="mexico-chapter"] .dots { position: absolute; inset: 200px 180px 180px 980px; background-image: radial-gradient(#111111 1.8px, transparent 1.8px); background-size: 24px 24px; opacity: 0.75; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      tl.from('.sun-core', { scale: 0.15, opacity: 0, duration: 0.7, ease: 'back.out(1.3)' }, 0.2);
      tl.from('.sun-rays', { rotation: -50, scale: 0.6, opacity: 0, duration: 0.8, ease: 'expo.out' }, 0.35);
      tl.from('.banner-row', { y: -120, opacity: 0, duration: 0.65, ease: 'power3.out' }, 0.55);
      tl.from('.cactus--left', { y: 220, opacity: 0, duration: 0.55, ease: 'circ.out' }, 0.78);
      tl.from('.cactus--right', { y: 220, opacity: 0, duration: 0.55, ease: 'circ.out' }, 0.88);
      tl.from('.agave', { scaleY: 0.2, transformOrigin: '50% 100%', opacity: 0, duration: 0.8, ease: 'power4.out' }, 0.94);
      tl.from('.dots', { opacity: 0, duration: 0.4, stagger: 0.03, ease: 'none' }, 1.1);
      window.__timelines['mexico-chapter'] = tl;
    </script>
  </div>
</template>
```

- [ ] **Step 5: Create the USA chapter**

Create `soccer/worldcup/2026-promo-video/compositions/usa-chapter.html`:

```html
<template id="usa-chapter-template">
  <div data-composition-id="usa-chapter" data-width="1920" data-height="1080">
    <div class="scene usa-chapter">
      <div class="scene-content">
        <div class="blue-field"></div>
        <div class="star"></div>
        <div class="stripes"></div>
        <div class="skyline"></div>
        <div class="lights"></div>
        <div class="roads"></div>
      </div>
    </div>
    <style>
      [data-composition-id="usa-chapter"] { width: 100%; height: 100%; background: #f7f4ee; overflow: hidden; }
      [data-composition-id="usa-chapter"] .scene-content { position: relative; width: 100%; height: 100%; }
      [data-composition-id="usa-chapter"] .blue-field { position: absolute; inset: 90px 110px 90px 110px; background: #1546b8; clip-path: polygon(0 10%, 76% 0, 100% 14%, 94% 100%, 12% 94%, 0 72%); }
      [data-composition-id="usa-chapter"] .star { position: absolute; top: 110px; left: 180px; width: 320px; height: 320px; background: #f7f4ee; clip-path: polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 92%, 50% 70%, 21% 92%, 32% 57%, 2% 35%, 39% 35%); }
      [data-composition-id="usa-chapter"] .stripes { position: absolute; left: 520px; right: 180px; top: 180px; height: 150px; background: repeating-linear-gradient(0deg, #f7f4ee 0 16px, transparent 16px 32px); }
      [data-composition-id="usa-chapter"] .skyline { position: absolute; left: 160px; right: 180px; bottom: 180px; height: 320px; background: #f7f4ee; clip-path: polygon(0 100%, 0 64%, 8% 64%, 8% 26%, 16% 26%, 16% 54%, 27% 54%, 27% 10%, 40% 10%, 40% 72%, 51% 72%, 51% 34%, 61% 34%, 61% 58%, 74% 58%, 74% 16%, 86% 16%, 86% 68%, 100% 68%, 100% 100%); }
      [data-composition-id="usa-chapter"] .lights { position: absolute; top: 380px; right: 170px; width: 480px; height: 110px; background: radial-gradient(circle, #f7f4ee 0 18%, transparent 18%); background-size: 54px 54px; opacity: 0.85; }
      [data-composition-id="usa-chapter"] .roads { position: absolute; left: 420px; right: 120px; bottom: 90px; height: 180px; background: repeating-linear-gradient(-12deg, #f7f4ee 0 12px, transparent 12px 36px); clip-path: polygon(0 100%, 18% 66%, 42% 52%, 66% 34%, 100% 0, 100% 100%); }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      tl.from('.blue-field', { x: 360, scaleX: 0.2, duration: 0.75, ease: 'expo.out' }, 0.15);
      tl.from('.star', { x: -200, y: -140, rotation: -26, opacity: 0, duration: 0.6, ease: 'power4.out' }, 0.28);
      tl.from('.stripes', { x: 260, opacity: 0, duration: 0.52, ease: 'power3.out' }, 0.46);
      tl.from('.skyline', { y: 180, opacity: 0, duration: 0.58, ease: 'circ.out' }, 0.65);
      tl.from('.lights', { x: 180, opacity: 0, duration: 0.45, ease: 'power2.out' }, 0.82);
      tl.from('.roads', { x: 320, y: 60, opacity: 0, duration: 0.55, ease: 'back.out(1.15)' }, 0.94);
      window.__timelines['usa-chapter'] = tl;
    </script>
  </div>
</template>
```

- [ ] **Step 6: Run the structure check to verify it passes**

Run: `npm run check:files`

Expected: PASS with `All required promo project files exist.`

- [ ] **Step 7: Commit**

```bash
git add soccer/worldcup/2026-promo-video/compositions/intro-build.html soccer/worldcup/2026-promo-video/compositions/canada-chapter.html soccer/worldcup/2026-promo-video/compositions/mexico-chapter.html soccer/worldcup/2026-promo-video/compositions/usa-chapter.html
git commit -m "feat: add world cup promo chapter compositions"
```

## Task 4: Implement The Final Hero Composition And Audio Selection

**Files:**
- Create: `soccer/worldcup/2026-promo-video/compositions/final-hero.html`
- Create: `soccer/worldcup/2026-promo-video/assets/audio/world-cup-promo-track.mp3`
- Create: `soccer/worldcup/2026-promo-video/assets/audio/LICENSE.txt`
- Create: `soccer/worldcup/2026-promo-video/docs/music-selection.md`

- [ ] **Step 1: Pick the free track and document why**

Create `soccer/worldcup/2026-promo-video/docs/music-selection.md`:

```md
# Music Selection

## Selected Track
- Source: Pixabay
- Track: Epic Tension
- Track page: https://pixabay.com/music/main-title-epic-tension-123648/
- License page: https://pixabay.com/service/license-summary/

## Why This Track
- opening build supports 0-5 second fragment rush
- mid-track percussion supports Mexico rhythmic pattern motion
- late-track lift supports USA acceleration and final merge

## Edit Window
- Start: 00:00
- End: 00:30
- Output: 30 seconds
```

- [ ] **Step 2: Download the track and store the license record**

Place the final trimmed or source audio at `soccer/worldcup/2026-promo-video/assets/audio/world-cup-promo-track.mp3`.

Create `soccer/worldcup/2026-promo-video/assets/audio/LICENSE.txt`:

```txt
Track: Epic Tension
Source: https://pixabay.com/music/main-title-epic-tension-123648/
License page: https://pixabay.com/service/license-summary/
Downloaded: 2026-05-11
Usage: World Cup 2026 unofficial promo video
```

- [ ] **Step 3: Create the final hero composition**

Create `soccer/worldcup/2026-promo-video/compositions/final-hero.html` with the merged football geometry, player silhouette, and end copy:

```html
<template id="final-hero-template">
  <div data-composition-id="final-hero" data-width="1920" data-height="1080">
    <div class="scene final-hero">
      <div class="scene-content">
        <div class="ball ball--red"></div>
        <div class="ball ball--green"></div>
        <div class="ball ball--blue"></div>
        <div class="player-silhouette"></div>
        <div class="hero-copy">
          <p class="hero-kicker">WORLD CUP 2026</p>
          <p class="hero-date">11 JUNE - 19 JULY 2026</p>
          <p class="hero-hosts">CANADA | MEXICO | USA</p>
        </div>
      </div>
    </div>
    <style>
      [data-composition-id="final-hero"] { width: 100%; height: 100%; background: #f7f4ee; overflow: hidden; }
      [data-composition-id="final-hero"] .scene-content { position: relative; width: 100%; height: 100%; padding: 120px 150px; box-sizing: border-box; }
      [data-composition-id="final-hero"] .ball { position: absolute; border-radius: 50%; mix-blend-mode: multiply; }
      [data-composition-id="final-hero"] .ball--red { width: 420px; height: 420px; top: 150px; left: 640px; background: #e1251b; }
      [data-composition-id="final-hero"] .ball--green { width: 420px; height: 420px; top: 190px; left: 770px; background: #0f8a43; }
      [data-composition-id="final-hero"] .ball--blue { width: 420px; height: 420px; top: 240px; left: 520px; background: #1546b8; }
      [data-composition-id="final-hero"] .player-silhouette { position: absolute; right: 220px; bottom: 120px; width: 360px; height: 620px; background: #111111; clip-path: polygon(49% 0, 67% 11%, 62% 29%, 82% 45%, 100% 83%, 74% 100%, 59% 76%, 47% 60%, 29% 71%, 0 100%, 11% 64%, 25% 47%, 40% 28%, 35% 11%); }
      [data-composition-id="final-hero"] .hero-copy { position: absolute; left: 150px; bottom: 140px; color: #111111; font-family: "Bebas Neue", "Oswald", sans-serif; }
      [data-composition-id="final-hero"] .hero-kicker { margin: 0; font-size: 140px; letter-spacing: 2px; }
      [data-composition-id="final-hero"] .hero-date,
      [data-composition-id="final-hero"] .hero-hosts { margin: 0; font-size: 42px; letter-spacing: 1px; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      tl.from('.ball--red', { x: -260, y: -180, scale: 0.2, duration: 0.9, ease: 'expo.out' }, 0.2);
      tl.from('.ball--green', { x: 180, y: -120, scale: 0.2, duration: 0.9, ease: 'power4.out' }, 0.35);
      tl.from('.ball--blue', { x: -80, y: 260, scale: 0.25, duration: 0.9, ease: 'back.out(1.3)' }, 0.5);
      tl.from('.player-silhouette', { x: 260, opacity: 0, duration: 0.8, ease: 'power3.out' }, 1.0);
      tl.from('.hero-kicker', { y: 40, opacity: 0, duration: 0.7, ease: 'circ.out' }, 1.35);
      tl.from('.hero-date', { y: 28, opacity: 0, duration: 0.55, ease: 'power2.out' }, 1.55);
      tl.from('.hero-hosts', { y: 22, opacity: 0, duration: 0.5, ease: 'power2.out' }, 1.7);
      window.__timelines['final-hero'] = tl;
    </script>
  </div>
</template>
```

- [ ] **Step 4: Verify the audio file and required files exist**

Run: `npm run check:files`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add soccer/worldcup/2026-promo-video/compositions/final-hero.html soccer/worldcup/2026-promo-video/assets/audio/world-cup-promo-track.mp3 soccer/worldcup/2026-promo-video/assets/audio/LICENSE.txt soccer/worldcup/2026-promo-video/docs/music-selection.md
git commit -m "feat: add promo finale and selected audio track"
```

## Task 5: Add A Site Showcase Route For The Promo

**Files:**
- Create: `soccer/worldcup/2026/src/pages/PromoVideoPage.tsx`
- Create: `soccer/worldcup/2026/src/data/promoVideo.ts`
- Modify: `soccer/worldcup/2026/src/App.tsx`
- Modify: `soccer/worldcup/2026/src/components/PageNav.tsx`
- Modify: `soccer/worldcup/2026/src/i18n/content.ts`
- Modify: `soccer/worldcup/2026/src/styles/world-cup-page.css`
- Test: `soccer/worldcup/2026/src/test/App.test.tsx`

- [ ] **Step 1: Write the failing route test**

Add a new test in `soccer/worldcup/2026/src/test/App.test.tsx`:

```tsx
it('renders the promo video showcase page', () => {
  window.history.replaceState({}, '', '/promo');
  const { container } = render(<App />);

  expect(screen.getByRole('heading', { name: /2026 世界杯宣传片/i })).toBeInTheDocument();
  expect(container.querySelector('video')).not.toBeNull();
  expect(screen.getByRole('link', { name: /返回首页/i })).toHaveAttribute('href', '/');
});
```

- [ ] **Step 2: Run the focused app test to verify it fails**

Run: `npm run test -- src/test/App.test.tsx`

Expected: FAIL because `/promo` is not routed and the page component does not exist.

- [ ] **Step 3: Create the promo data file**

Create `soccer/worldcup/2026/src/data/promoVideo.ts`:

```ts
import { publicAssetPath } from '../utils/publicAssets';

export const promoVideoData = {
  titleZh: '2026 世界杯宣传片',
  titleEn: 'World Cup 2026 Promo Film',
  descriptionZh: '非官方原创运动海报风宣传片，使用 HyperFrames 风格 HTML 动画与免费免版税配乐制作。',
  descriptionEn: 'Unofficial original motion-poster promo built with HyperFrames-style HTML animation and royalty-free music.',
  videoSrc: publicAssetPath('/worldcup-assets/promo/world-cup-2026-promo.mp4'),
  posterSrc: publicAssetPath('/worldcup-assets/promo/world-cup-2026-hero.jpg')
};
```

- [ ] **Step 4: Create the promo page component**

Create `soccer/worldcup/2026/src/pages/PromoVideoPage.tsx`:

```tsx
import { promoVideoData } from '../data/promoVideo';
import type { Locale } from '../i18n/content';

interface PromoVideoPageProps {
  locale: Locale;
}

export function PromoVideoPage({ locale }: PromoVideoPageProps) {
  const title = locale === 'zh' ? promoVideoData.titleZh : promoVideoData.titleEn;
  const description = locale === 'zh' ? promoVideoData.descriptionZh : promoVideoData.descriptionEn;
  const backLabel = locale === 'zh' ? '返回首页' : 'Back home';

  return (
    <section className="promo-video-page">
      <div className="promo-video-page__header">
        <a href={locale === 'en' ? '/en' : '/'}>{backLabel}</a>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="promo-video-page__player">
        <video controls playsInline poster={promoVideoData.posterSrc} src={promoVideoData.videoSrc} />
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Wire the route and navigation**

Update `soccer/worldcup/2026/src/App.tsx`:

```tsx
import { PromoVideoPage } from './pages/PromoVideoPage';

if (pathname === '/promo') {
  return <PromoVideoPage locale={locale} />;
}
```

Update the relevant navigation content in `soccer/worldcup/2026/src/i18n/content.ts` and `soccer/worldcup/2026/src/components/PageNav.tsx` so `/promo` appears in both locales.

- [ ] **Step 6: Add the page styles**

Append a dedicated promo page section to `soccer/worldcup/2026/src/styles/world-cup-page.css`:

```css
.promo-video-page {
  display: grid;
  gap: 24px;
  padding: 96px 24px 48px;
  max-width: 1280px;
  margin: 0 auto;
}

.promo-video-page__player video {
  width: 100%;
  border-radius: 28px;
  background: #111111;
  box-shadow: 0 24px 64px rgba(17, 17, 17, 0.18);
}
```

- [ ] **Step 7: Run the focused app test to verify it passes**

Run: `npm run test -- src/test/App.test.tsx`

Expected: PASS, including the new `/promo` route test.

- [ ] **Step 8: Commit**

```bash
git add soccer/worldcup/2026/src/pages/PromoVideoPage.tsx soccer/worldcup/2026/src/data/promoVideo.ts soccer/worldcup/2026/src/App.tsx soccer/worldcup/2026/src/components/PageNav.tsx soccer/worldcup/2026/src/i18n/content.ts soccer/worldcup/2026/src/styles/world-cup-page.css soccer/worldcup/2026/src/test/App.test.tsx
git commit -m "feat: add world cup promo showcase page"
```

## Task 6: Export The Final Render Into The Site And Verify End-To-End

**Files:**
- Create: `soccer/worldcup/2026/public/worldcup-assets/promo/world-cup-2026-promo.mp4`
- Create: `soccer/worldcup/2026/public/worldcup-assets/promo/world-cup-2026-hero.jpg`
- Modify: `soccer/worldcup/2026-promo-video/README.md`

- [ ] **Step 1: Render the final video from the standalone project**

Run:

`npx hyperframes lint`

Expected: PASS with no composition registration or track-overlap errors.

Run:

`npx hyperframes inspect --samples 15 --at 4.6,11.5,18.5,25.5,29.0`

Expected: PASS with no text overflow or off-canvas layout errors at the chapter hero frames.

Run:

`npx hyperframes render --fps 60 --quality high --output renders/world-cup-2026-promo.mp4`

Expected output:

- `renders/world-cup-2026-promo.mp4`
- a readable 30-second 16:9 export

- [ ] **Step 2: Copy the final render and poster into the existing site**

Place the render outputs at:

```text
soccer/worldcup/2026/public/worldcup-assets/promo/world-cup-2026-promo.mp4
soccer/worldcup/2026/public/worldcup-assets/promo/world-cup-2026-hero.jpg
```

- [ ] **Step 3: Document the preview and render workflow**

Append this to `soccer/worldcup/2026-promo-video/README.md`:

```md
## Delivery

- Final render is published to `../worldcup/2026/public/worldcup-assets/promo/world-cup-2026-promo.mp4`
- Poster frame is published to `../worldcup/2026/public/worldcup-assets/promo/world-cup-2026-hero.jpg`
```

- [ ] **Step 4: Run the site test suite**

Run: `npm run test`

Expected: PASS.

- [ ] **Step 5: Run the site production build**

Run: `npm run build`

Expected: PASS and emit the site build without route regressions.

- [ ] **Step 6: Preview the `/promo` route in-browser**

Open the site locally and verify:

- `/promo` loads
- the video player loads the exported mp4
- the hero poster appears before playback
- Chinese and English navigation both still work

- [ ] **Step 7: Commit**

```bash
git add soccer/worldcup/2026/public/worldcup-assets/promo/world-cup-2026-promo.mp4 soccer/worldcup/2026/public/worldcup-assets/promo/world-cup-2026-hero.jpg soccer/worldcup/2026-promo-video/README.md
git commit -m "feat: publish final world cup promo render"
```

## Self-Review

### Spec coverage

- Standalone HyperFrames-style source project: covered in Tasks 1-4
- Distinct Canada / Mexico / USA chapters: covered in Task 3
- Final merge hero frame and required end copy: covered in Task 4
- Free royalty-free music selection and license trail: covered in Task 4
- Existing site preview/showcase route: covered in Task 5
- Final rendered asset placed into the site: covered in Task 6

### Placeholder scan

The plan now fixes the standalone project path, chapter file set, `/promo` route, chosen music source, chosen track, track license URL, and render commands. No `TODO`, `TBD`, or unnamed code surfaces remain.

### Type consistency

- Standalone authoring stays in `soccer/worldcup/2026-promo-video`
- Existing site integration stays in `soccer/worldcup/2026`
- `/promo` is the single site route for the showcase page
