import { bracket, confederations, finalsMatchResults, getHomepageHeroSlides, groupFixtures, groups, groupStageMatches, hostCityDetails, tournamentMeta } from '../data';
import { buildHostCityScatterData, filterHostCountries } from '../data/cityGeoMap';
import { getTeamDisplay } from '../i18n/formatters';
import * as fs from 'node:fs';

describe('tournament data', () => {
  it('defines the official tournament scale', () => {
    expect(tournamentMeta.teamCount).toBe(48);
    expect(tournamentMeta.groupCount).toBe(12);
    expect(tournamentMeta.matchCount).toBe(104);
    expect(tournamentMeta.hostCities).toBe(16);
    expect(tournamentMeta.hostCityNames).toContain('Mexico City');
  });

  it('contains all six confederations in display order', () => {
    expect(confederations.map((item) => item.id)).toEqual([
      'afc',
      'caf',
      'concacaf',
      'conmebol',
      'ofc',
      'uefa'
    ]);
  });

  it('marks groups as draw-complete and bracket entries as scheduled structures', () => {
    expect(groups).toHaveLength(12);
    expect(groups.every((group) => group.status === 'draw-complete')).toBe(true);
    expect(bracket[0].matches.every((match) => match.homeLabel && match.awayLabel)).toBe(true);
    expect(groupFixtures).toHaveLength(24);
    expect(groups[0].teams.map((team) => team.name)).toEqual([
      'Mexico',
      'Czechia',
      'Korea Republic',
      'South Africa'
    ]);
    expect(bracket[0].matches[0]).toMatchObject({
      id: '73',
      homeLabel: 'Group A runners-up',
      awayLabel: 'Group B runners-up',
      venue: 'Los Angeles Stadium',
      predictionStatus: 'Model-ready display'
    });
    expect(groupFixtures[0]).toMatchObject({
      groupId: 'A',
      homeTeam: 'Mexico',
      awayTeam: 'South Africa',
      venue: 'Mexico City Stadium',
      homeWinProbability: 0.52,
      drawProbability: 0.27,
      awayWinProbability: 0.21
    });
  });

  it('defines six complete match cards for every group detail page', () => {
    expect(groupStageMatches).toHaveLength(72);

    groups.forEach((group) => {
      const matches = groupStageMatches.filter((match) => match.groupId === group.id);
      const pairings = new Set(
        matches.map((match) => [match.homeTeam, match.awayTeam].sort().join(' v '))
      );

      expect(matches).toHaveLength(6);
      expect(pairings.size).toBe(6);
      group.teams.forEach((team) => {
        expect(matches.some((match) => match.homeTeam === team.name || match.awayTeam === team.name)).toBe(true);
      });
    });
  });

  it('prepares a unified finals result dataset for all 104 matches', () => {
    expect(finalsMatchResults).toHaveLength(104);
    expect(finalsMatchResults.filter((match) => match.stageType === 'group')).toHaveLength(72);
    expect(finalsMatchResults.filter((match) => match.stageType === 'knockout')).toHaveLength(32);
    expect(finalsMatchResults.every((match) => match.status === 'scheduled')).toBe(true);
    expect(finalsMatchResults[0]).toMatchObject({
      id: '1',
      stageType: 'group',
      groupId: 'A',
      homeTeam: 'Mexico',
      awayTeam: 'South Africa',
      status: 'scheduled',
      sourceLabel: 'Generated schedule scaffold'
    });
    expect(finalsMatchResults.some((match) => match.id === '104' && match.stageType === 'knockout')).toBe(true);
  });

  it('uses generated daily hero data for the post-kickoff homepage', () => {
    const slides = getHomepageHeroSlides(new Date('2026-06-12T23:30:00Z'), 'zh');

    expect(slides).toHaveLength(1);
    expect(slides[0]).toMatchObject({
      id: 'daily-hero-7',
      type: 'match',
      accent: 'daily',
      title: '巴西 vs 摩洛哥',
      href: '/matches/7',
      artworkUrl: '/worldcup-assets/home/daily/2026-06-13-match-7.webp',
      fallbackArtworkUrl: '/worldcup-assets/home/daily/2026-06-13-match-7.jpg'
    });
  });

  it('publishes daily hero json and static poster assets', () => {
    const dailyHero = JSON.parse(
      fs.readFileSync('public/worldcup-assets/home/daily-hero.json', 'utf8')
    ) as {
      date: string;
      matchId: string;
      poster: string;
      fallbackPoster: string;
    };

    expect(dailyHero).toMatchObject({
      date: '2026-06-13',
      matchId: '7',
      poster: '/worldcup-assets/home/daily/2026-06-13-match-7.webp',
      fallbackPoster: '/worldcup-assets/home/daily/2026-06-13-match-7.jpg',
      posterSource: 'template'
    });
    expect(fs.readFileSync(`public${dailyHero.poster}`, 'base64').length).toBeGreaterThan(0);
    expect(fs.readFileSync(`public${dailyHero.fallbackPoster}`, 'base64').length).toBeGreaterThan(0);
  });

  it('documents the local finals result import contract', () => {
    const sample = JSON.parse(fs.readFileSync('data/finals-results.sample.json', 'utf8')) as {
      sourceLabel: string;
      updatedAt: string;
      matches: Array<{
        id: string;
        status: string;
        homeScore: number;
        awayScore: number;
        goals: Array<{ minute: string; team: string; player: string }>;
      }>;
    };

    expect(sample.sourceLabel).toBe('Local finals result import sample');
    expect(sample.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(sample.matches[0]).toMatchObject({
      id: '1',
      status: 'completed',
      homeScore: 2,
      awayScore: 1
    });
    expect(sample.matches[0].goals).toEqual([
      { minute: '12', team: 'Mexico', player: 'Example scorer' },
      { minute: '54', team: 'South Africa', player: 'Example equalizer' },
      { minute: '88', team: 'Mexico', player: 'Example winner' }
    ]);
  });

  it('maps british home nations to dedicated flag glyphs', () => {
    const scotlandFlag = '\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}';
    const englandFlag = '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}';

    expect(getTeamDisplay('Scotland')).toEqual({
      zh: '苏格兰',
      flag: scotlandFlag
    });
    expect(getTeamDisplay('England')).toEqual({
      zh: '英格兰',
      flag: englandFlag
    });
  });

  it('uses local artwork paths for host city posters', () => {
    expect(hostCityDetails[0].imageUrl).toBe('/worldcup-assets/cities-normalized/atlanta.png');
    expect(hostCityDetails[7].imageUrl).toBe('/worldcup-assets/cities-normalized/mexicocity.png');
    expect(hostCityDetails[7].stadiumImageUrl).toBe('/worldcup-assets/stadiums/mexicocity.jpg');
  });

  it('uses full-stadium exterior or aerial panorama files for the replaced venue hero photos', () => {
    const expectedPanoramaFiles: Record<string, string> = {
      Dallas: '/worldcup-assets/stadiums/dallas.jpg',
      Guadalajara: '/worldcup-assets/stadiums/guadalajara.jpg',
      'Kansas City': '/worldcup-assets/stadiums/kansas.jpg',
      'Los Angeles': '/worldcup-assets/stadiums/losangeles.jpg',
      Monterrey: '/worldcup-assets/stadiums/monterrey.jpg',
      'San Francisco Bay Area': '/worldcup-assets/stadiums/sanfrancisco.png',
      Seattle: '/worldcup-assets/stadiums/seattle.jpg',
      Toronto: '/worldcup-assets/stadiums/toronto.jpg',
      Vancouver: '/worldcup-assets/stadiums/vancouver.jpg'
    };

    Object.entries(expectedPanoramaFiles).forEach(([city, expectedPath]) => {
      const detail = hostCityDetails.find((item) => item.city === city);
      expect(detail?.stadiumImageUrl).toBe(expectedPath);
    });
  });

  it('builds host city map data from real coordinates instead of hand-tuned image percentages', () => {
    expect(
      hostCityDetails.every((city) => {
        const geo = city as unknown as { latitude?: number; longitude?: number };
        return typeof geo.latitude === 'number' && typeof geo.longitude === 'number';
      })
    ).toBe(true);

    const data = buildHostCityScatterData(hostCityDetails);
    const vancouver = data.find((city) => city.name === 'Vancouver');
    const toronto = data.find((city) => city.name === 'Toronto');

    expect(vancouver?.value).toEqual([-123.1119, 49.2767]);
    expect(toronto?.value).toEqual([-79.4186, 43.6332]);
    expect(vancouver!.value[0]).toBeLessThan(toronto!.value[0]);
  });

  it('filters country geojson down to the three World Cup host countries', () => {
    const filtered = filterHostCountries({
      type: 'FeatureCollection',
      features: [
        { properties: { name: 'Canada' } },
        { properties: { name: 'United States' } },
        { properties: { name: 'Mexico' } },
        { properties: { name: 'Brazil' } }
      ]
    });

    expect(filtered.features.map((feature) => feature.properties.name)).toEqual([
      'Canada',
      'United States',
      'Mexico'
    ]);
  });

  it('keeps the confederation qualified-team lists aligned with the 48 group-stage teams', () => {
    const groupTeams = new Set(groups.flatMap((group) => group.teams.map((team) => team.name)));
    const confederationTeams = new Set(confederations.flatMap((item) => item.qualifiedTeams));

    expect(groupTeams.size).toBe(48);
    expect(confederationTeams.size).toBe(48);
    expect([...groupTeams].sort()).toEqual([...confederationTeams].sort());
  });
});
