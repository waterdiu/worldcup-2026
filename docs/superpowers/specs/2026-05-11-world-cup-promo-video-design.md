# 2026 World Cup Promo Video Design

## Goal

Create an unofficial 30-second promotional video for the 2026 World Cup hosted by Canada, Mexico, and the USA.

The deliverable must be a premium motion-poster style piece built with HTML, CSS, GSAP, and HyperFrames. It should feel like a collectible modern sports campaign film rather than an official tournament ident, travel commercial, or generic hype reel.

The work must avoid any FIFA logo, official emblem, or official brand lockup.

## Deliverables

The project must ship as both:

- a standalone HyperFrames video project for authoring and rendering
- an accessible showcase entry inside the existing `soccer/worldcup/2026` site
- a completed 30-second final piece with embedded free-to-use royalty-free music

The intended final outputs are:

- HyperFrames source project
- previewable browser composition
- site-integrated preview or showcase page
- final rendered 16:9 video

## Format And Runtime

- Aspect ratio: `16:9`
- Runtime: `30 seconds`
- Style: premium motion poster
- Rendering base: HTML, CSS, SVG, GSAP, HyperFrames

## Creative Direction

The piece should feel like a contemporary sports art poster breaking apart and recomposing itself in motion.

The visual construction has three layers that must coexist without looking like three unrelated videos:

### 1. Poster abstraction layer

This is the quality-control layer that keeps the film elegant and editorial:

- white negative space
- geometric field arcs
- sharp cut-paper fragments
- diagonal speed slashes
- stars, stripes, rays, and pattern systems
- poster-like composition with deliberate breathing room

### 2. Programmatic vector layer

This is the originality layer. The core motifs should be created as vector or CSS/SVG-driven graphic forms rather than as photo montages:

- football panel geometry
- player silhouette
- maple leaf structures
- mountain ridges and forest teeth
- cactus forms
- agave-like curves
- festive banner geometry
- skyline shards
- stadium-light grids
- animal silhouettes where used

### 3. Existing asset integration layer

The existing `soccer/worldcup/2026` project assets may be reused selectively, but only as supporting fragments:

- host country maps
- city silhouettes or masked textures
- existing world-cup-themed site assets

These assets must not dominate the style. They are reference material, texture support, or masked collage pieces, not the main visual language.

## Visual Identity

The visual identity should be based on warm white space with aggressive, controlled blocks of national color.

### Core palette

- `Warm White`: `#F7F4EE`
- `Carbon`: `#111111`
- `Canada Red`: `#E1251B`
- `Mexico Green`: `#0F8A43`
- `USA Blue`: `#1546B8`

### Typography

The piece should use tall condensed display typography with clean supporting condensed sans text.

Recommended direction:

- display: `Bebas Neue` or equivalent condensed all-caps family
- supporting copy: `Barlow Condensed`, `Oswald`, or equivalent

Typography must feel elegant, athletic, and architectural rather than corporate or tech-demo-like.

### What Not To Do

- no purple-led palette
- no cyberpunk neon treatment
- no glossy 3D chrome or cheap CGI look
- no official tournament emblem imitation
- no photo-led tourism montage
- no particle-template trailer effects
- no full-bleed flag wallpaper compositions

## Country Visual Systems

Each host country chapter needs a distinct motion grammar while remaining part of one film.

### Canada chapter

Primary color: red

Required motifs:

- maple leaf angularity
- mountains
- forests
- wildlife silhouettes
- urban skyline fragments

Motion character:

- vertical lift
- crisp reveals
- cold, sharp, structured movement
- parallax depth with strong cut shapes

Desired feeling:

- precise
- elevated
- clean
- opening-act authority

### Mexico chapter

Primary color: green

Required motifs:

- sun forms
- cactus forms
- folk-art geometry
- festive banners
- agave-inspired curves
- stadium rhythm

Motion character:

- rhythmic pulse
- geometric wipes
- repeated pattern movement
- festive but still modern and controlled

Desired feeling:

- heat
- rhythm
- celebration
- collective energy

### USA chapter

Primary color: blue

Required motifs:

- stars
- stripes
- skyline shards
- highways
- stadium lights
- speed streaks

Motion character:

- acceleration
- lateral sweep
- large-scale movement
- forward propulsion

Desired feeling:

- power
- scale
- speed
- final build toward climax

## Unified Football Geometry

Across all scenes, the national visual systems must resolve back into one shared football language:

- circles and arcs derived from football and pitch geometry
- diagonal trajectories derived from sprint and shot motion
- polygon fragments derived from torn poster layers and ball paneling
- repeated short-line bursts derived from crowd energy and percussion rhythm

This shared geometry is what keeps the film cohesive.

## Timeline Structure

The runtime must follow this exact macro structure.

### 0-5 seconds: opening build

White background.

Red, green, and blue fragments rush inward from multiple directions. The fragments build football arcs, pitch geometry, and a visual ruleset for the rest of the film.

This section should establish speed, control, and graphic intelligence before any single country takes over.

### 5-12 seconds: Canada chapter

Red-led layered collage animation with parallax and shape reveals.

The scene should emphasize structure, altitude, and sharpness rather than carnival energy.

### 12-19 seconds: Mexico chapter

Green-led rhythmic festive motion with geometric wipes and animated pattern logic.

The scene should become more elastic and rhythmic than Canada while staying visually premium.

### 19-26 seconds: USA chapter

Blue-led acceleration with speed lines and large-scale motion.

This is the fastest and most forceful chapter before the ending merge.

### 26-30 seconds: final merge

The three national systems merge into:

- one giant football
- one dynamic footballer silhouette
- one clean hero composition

The final second should be readable and screenshot-worthy rather than overloaded with continued motion.

## End Frame Copy

The end frame must contain:

`WORLD CUP 2026`

`11 JUNE - 19 JULY 2026`

`CANADA | MEXICO | USA`

The copy should sit in a clean hero layout with strong negative space and a clear hierarchy.

## Music Strategy

The final piece must use free royalty-free music sourced by the implementation work.

### Music target

The track should feel like:

- cinematic sports trailer
- strong percussion
- rising brass or equivalent orchestral lift
- modern electronic pulse
- crowd-energy uplift
- triumphant finish

### Music editing approach

- choose a track based on its usable 30-second structure, not just its genre tags
- cut the visuals to the strongest musical beats and transitions
- use a music-first timeline rather than forcing music underneath a locked visual edit
- allow safe trimming and fade shaping if needed to create a natural 30-second ad-like finish

### Music constraints

- no paid subscription-only dependency for the first version
- no copyright-uncertain download source
- no generic corporate inspiration track
- no festival EDM feel
- no dark horror-trailer low-end aesthetic

## Motion Direction

The motion must be driven by GSAP transforms and composition-level choreography.

Required motion techniques:

- transform-driven entrances
- mask-like reveals
- scale bursts
- directional wipes
- staggered reveals
- shape-morph-feeling transitions where practical
- speed ramps through timing and sequencing

Motion principles:

- fast but readable
- no photorealism
- no cheap 3D CGI simulation
- each scene must have entrances
- transitions must carry scene change energy
- pacing should escalate across the piece

## Implementation Structure

The work should be split into two connected but separate layers.

### Standalone HyperFrames project

This is the source of truth for authoring and rendering.

Suggested structure:

- `index.html`
- `compositions/intro-build.html`
- `compositions/canada-chapter.html`
- `compositions/mexico-chapter.html`
- `compositions/usa-chapter.html`
- `compositions/final-hero.html`
- `assets/audio/`
- `assets/svg/`
- `assets/shared/`
- `DESIGN.md`
- `README.md`

### Existing site showcase entry

The existing `soccer/worldcup/2026` site should expose a preview or showcase route for this promo.

Its purpose is to:

- make the piece discoverable inside the site
- preview the promo in-browser
- show the final rendered video or hero frame

The site integration is not the primary authoring environment.

## Reuse Strategy

Reuse from the existing site should stay selective and tactical.

Preferred reuse:

- host maps
- city-related silhouettes or shapes
- tournament-related textures or visual references

Avoid:

- porting the site app structure into the video project
- building the video as a React page first and forcing it into HyperFrames later

## Scene Architecture

Each major section should have a clear hero frame before animation is added.

Expected composition split:

- `intro-build`
- `canada-chapter`
- `mexico-chapter`
- `usa-chapter`
- `final-hero`

This separation should make timing adjustments possible without destabilizing the whole film.

## Testing And Validation

Before calling the work complete, the implementation must verify:

- duration is 30 seconds
- end text is accurate and readable
- transitions are smooth and intentional
- national color systems remain distinct
- the full piece feels cohesive rather than episodic
- the selected free music track is actually present and licensed for the intended use case
- the site preview path works
- the standalone HyperFrames project previews and renders successfully

## Success Criteria

The result succeeds if:

- it feels premium, modern, and original
- the three host countries are instantly legible without becoming cliché tourism slides
- the music and motion feel tightly cut together
- the ending lands as a strong collectible hero frame
- the work is usable both as a standalone renderable project and as a showcase asset inside the existing site
