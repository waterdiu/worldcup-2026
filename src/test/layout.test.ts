import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(join(process.cwd(), 'src/styles/world-cup-page.css'), 'utf8');

describe('layout CSS contracts', () => {
  it('keeps team overview cards structured and team detail content stacked', () => {
    expect(css).toMatch(/\.team-card\s*\{[^}]*display:\s*grid/s);
    expect(css).toMatch(/\.team-card\s*\{[^}]*gap:\s*12px/s);
    expect(css).toMatch(/\.team-card__meta\s*\{[^}]*display:\s*grid/s);
    expect(css).toMatch(/\.team-detail-hero\s*\{[^}]*display:\s*flex/s);
    expect(css).toMatch(/\.team-detail-stack\s*\{[^}]*max-width:\s*1080px/s);
    expect(css).toMatch(/\.team-detail-stack\s+\.team-stats-grid[\s\S]*grid-template-columns:\s*1fr/);
    expect(css).toMatch(/\.team-detail-stack\s+\.qualification-match-grid[\s\S]*grid-template-columns:\s*1fr/);
    expect(css).toMatch(/\.team-detail-stack\s+\.team-roster-grid[\s\S]*grid-template-columns:\s*1fr/);
    expect(css).toMatch(/\.team-detail-stack\s+\.team-fixture-grid[\s\S]*grid-template-columns:\s*1fr/);
  });

  it('keeps the knockout bracket fully visible instead of forcing horizontal clipping', () => {
    expect(css).toMatch(/\.knockout-map\s*\{[^}]*overflow:\s*visible/s);
    expect(css).toMatch(/\.knockout-path\s*\{[^}]*min-width:\s*0/s);
    expect(css).not.toMatch(/\.knockout-path\s*\{[^}]*min-width:\s*720px/s);
  });

  it('draws bracket connector lines while keeping knockout match cards equal height', () => {
    expect(css).toMatch(/\.knockout-map\s*\{[^}]*--bracket-card-height:/s);
    expect(css).toMatch(/\.knockout-map\s*\{[^}]*--bracket-card-width:/s);
    expect(css).toMatch(/--bracket-card-width:\s*138px/);
    expect(css).toMatch(/\.knockout-path\s*\{[^}]*gap:\s*calc\(var\(--bracket-connector-length\) \* 2\)/s);
    expect(css).toMatch(/\.knockout-final-path\s*\{[^}]*width:\s*calc\(var\(--bracket-card-width\) \+ 64px\)/s);
    expect(css).toMatch(/\.knockout-match-slot\s*\{[^}]*height:\s*var\(--bracket-card-height\)/s);
    expect(css).toMatch(/\.knockout-match-slot\s*\{[^}]*width:\s*var\(--bracket-card-width\)/s);
    expect(css).toMatch(/\.knockout-column__matches\s*\{[^}]*height:\s*var\(--bracket-path-height\)/s);
    expect(css).toMatch(/\.knockout-column__matches\s+\.knockout-match-slot\s*\{[^}]*position:\s*absolute/s);
    expect(css).toMatch(/\.knockout-column__matches\s+\.knockout-match-slot\s*\{[^}]*top:\s*var\(--slot-top\)/s);
    expect(css).toMatch(/\.bracket-match--link\s*\{[^}]*height:\s*100%/s);
    expect(css).toMatch(/\.bracket-match--link::after\s*\{[^}]*content:\s*none/s);
    expect(css).toMatch(/\.knockout-match-slot__line--in/s);
    expect(css).toMatch(/\.knockout-match-slot__line--out/s);
    expect(css).toMatch(/\.knockout-match-slot:nth-child\(odd\)::before/s);
  });

  it('keeps the matches overview dense and bounded', () => {
    expect(css).toMatch(/\.world-cup-page--matches-overview::before,\s*\n\.world-cup-page--matches-overview::after\s*\{[^}]*content:\s*none/s);
    expect(css).toMatch(/\.world-cup-page--matches-overview \.section-header\s*\{[^}]*background-image:\s*none !important/s);
    expect(css).toMatch(/\.world-cup-page--matches-overview \.section-header\s*\{[^}]*box-shadow:\s*none !important/s);
    expect(css).toMatch(/\.world-cup-page--matches-overview \.section-header::before,\s*\n\.world-cup-page--matches-overview \.section-header::after\s*\{[^}]*content:\s*none !important/s);
    expect(css).toMatch(/\.world-cup-page--matches-overview \.match-overview-list\s*\{[^}]*max-height:\s*688px/s);
    expect(css).toMatch(/\.world-cup-page--matches-overview \.match-overview-list\s*\{[^}]*overflow-y:\s*auto/s);
    expect(css).toMatch(/\.world-cup-page--matches-overview \.knockout-map\s*\{[^}]*--bracket-card-width:\s*118px/s);
    expect(css).toMatch(/\.world-cup-page--matches-overview \.knockout-final-path\s*\{[^}]*width:\s*calc\(var\(--bracket-card-width\) \+ 48px\)/s);
  });

  it('keeps finals section headers out of the legacy blue card treatment', () => {
    expect(css).toMatch(/\.world-cup-page--finals \.section-header\s*\{[^}]*background-image:\s*none !important/s);
    expect(css).toMatch(/\.world-cup-page--finals \.section-header\s*\{[^}]*box-shadow:\s*none !important/s);
    expect(css).toMatch(/\.world-cup-page--finals \.section-header\s*\{[^}]*clip-path:\s*none !important/s);
    expect(css).toMatch(/\.world-cup-page--finals \.section-header::before,\s*\n\.world-cup-page--finals \.section-header::after\s*\{[^}]*content:\s*none !important/s);
  });
});
