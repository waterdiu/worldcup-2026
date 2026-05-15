describe('finals result fetch transform', () => {
  it('formats fetch dates in the project timezone instead of UTC', async () => {
    // @ts-expect-error The fetcher is a Node .mjs script exercised directly by Vitest.
    const { formatDateForTimezone } = await import('../../scripts/fetch_finals_results.mjs');

    expect(formatDateForTimezone(new Date('2026-05-10T16:30:00Z'), 'Asia/Shanghai')).toBe('2026-05-11');
  });

  it('converts openfootball-style completed matches into the local import payload', async () => {
    // @ts-expect-error The fetcher is a Node .mjs script exercised directly by Vitest.
    const { transformOpenFootballPayload } = await import('../../scripts/fetch_finals_results.mjs');

    const payload = transformOpenFootballPayload(
      {
        name: 'World Cup 2026',
        rounds: [
          {
            name: 'Matchday 1',
            matches: [
              {
                num: 1,
                team1: 'Mexico',
                team2: 'South Africa',
                score: { ft: [2, 1] },
                goals1: [
                  { name: 'Example scorer', minute: 12 },
                  { name: 'Example winner', minute: 88 }
                ],
                goals2: [{ name: 'Example equalizer', minute: 54 }]
              },
              {
                num: 2,
                team1: 'Korea Republic',
                team2: 'Czechia',
                score: { ft: null },
                goals1: [],
                goals2: []
              }
            ]
          }
        ]
      },
      { updatedAt: '2026-06-11' }
    );

    expect(payload.sourceLabel).toBe('openfootball worldcup.json');
    expect(payload.updatedAt).toBe('2026-06-11');
    expect(payload.matches).toEqual([
      {
        id: '1',
        status: 'completed',
        homeScore: 2,
        awayScore: 1,
        goals: [
          { minute: '12', team: 'Mexico', player: 'Example scorer' },
          { minute: '88', team: 'Mexico', player: 'Example winner' },
          { minute: '54', team: 'South Africa', player: 'Example equalizer' }
        ]
      }
    ]);
    expect(payload.report).toMatchObject({
      sourceMatches: 2,
      importedMatches: 1,
      skippedMatches: 1
    });
  });

  it('can map openfootball group matches to generated local ids by team pair', async () => {
    // @ts-expect-error The fetcher is a Node .mjs script exercised directly by Vitest.
    const { transformOpenFootballPayload } = await import('../../scripts/fetch_finals_results.mjs');

    const payload = transformOpenFootballPayload(
      {
        matches: [
          {
            num: 25,
            team1: 'Mexico',
            team2: 'Czechia',
            score: { ft: [1, 0] },
            goals1: [{ name: 'Example scorer', minute: 44 }],
            goals2: []
          }
        ]
      },
      {
        updatedAt: '2026-06-24',
        matchIdByTeamPair: {
          'Mexico::Czechia': 'A-5'
        }
      }
    );

    expect(payload.matches[0]).toMatchObject({
      id: 'A-5',
      homeScore: 1,
      awayScore: 0
    });
  });

  it('builds a default team-pair map for generated group-stage match ids', async () => {
    // @ts-expect-error The fetcher is a Node .mjs script exercised directly by Vitest.
    const { buildDefaultMatchIdByTeamPair } = await import('../../scripts/fetch_finals_results.mjs');

    const matchMap = await buildDefaultMatchIdByTeamPair();

    expect(matchMap['Mexico::South Africa']).toBe('1');
    expect(matchMap['Mexico::Czechia']).toBe('5');
    expect(matchMap['Czechia::Mexico']).toBe('5');
  });

  it('converts football-data matches when they can be mapped to local match ids', async () => {
    // @ts-expect-error The fetcher is a Node .mjs script exercised directly by Vitest.
    const { transformFootballDataPayload } = await import('../../scripts/fetch_finals_results.mjs');

    const payload = transformFootballDataPayload(
      {
        matches: [
          {
            id: 9001,
            status: 'FINISHED',
            homeTeam: { name: 'Mexico' },
            awayTeam: { name: 'South Africa' },
            score: {
              fullTime: {
                home: 2,
                away: 1
              }
            }
          },
          {
            id: 9002,
            status: 'TIMED',
            homeTeam: { name: 'Korea Republic' },
            awayTeam: { name: 'Czechia' },
            score: {
              fullTime: {
                home: null,
                away: null
              }
            }
          }
        ]
      },
      {
        updatedAt: '2026-06-11',
        matchIdByTeamPair: {
          'Mexico::South Africa': '1'
        }
      }
    );

    expect(payload).toMatchObject({
      sourceLabel: 'football-data.org',
      updatedAt: '2026-06-11',
      matches: [
        {
          id: '1',
          status: 'completed',
          homeScore: 2,
          awayScore: 1,
          goals: []
        }
      ],
      report: {
        sourceMatches: 2,
        importedMatches: 1,
        skippedMatches: 1
      }
    });
  });

  it('merges normalized sources by priority and reports missing or inconsistent fields', async () => {
    // @ts-expect-error The fetcher is a Node .mjs script exercised directly by Vitest.
    const { mergeSourcePayloads } = await import('../../scripts/fetch_finals_results.mjs');

    const merged = mergeSourcePayloads(
      [
        {
          sourceLabel: 'primary free source',
          updatedAt: '2026-06-12',
          matches: [
            {
              id: '1',
              status: 'completed',
              homeScore: 2,
              awayScore: 1,
              goals: [{ minute: '12', team: 'Mexico', player: 'Example scorer' }]
            }
          ]
        },
        {
          sourceLabel: 'backup free source',
          updatedAt: '2026-06-11',
          matches: [
            {
              id: '1',
              status: 'completed',
              homeScore: 1,
              awayScore: 1,
              goals: []
            },
            {
              id: '2',
              status: 'completed',
              homeScore: 0,
              awayScore: 0,
              goals: []
            }
          ]
        }
      ],
      { totalMatches: 104 }
    );

    expect(merged.importPayload).toMatchObject({
      sourceLabel: 'primary free source + backup free source',
      updatedAt: '2026-06-12',
      matches: [
        {
          id: '1',
          status: 'completed',
          homeScore: 2,
          awayScore: 1
        },
        {
          id: '2',
          status: 'completed',
          homeScore: 0,
          awayScore: 0
        }
      ]
    });
    expect(merged.coverageReport).toMatchObject({
      totalMatches: 104,
      completedMatches: 2,
      scoreCoveragePct: 2,
      goalEventCoveragePct: 50
    });
    expect(merged.missingDataReport.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ matchId: '1', type: 'goal_count_mismatch' }),
        expect.objectContaining({ matchId: '1', type: 'score_conflict' })
      ])
    );
  });

  it('builds the TypeScript coverage module consumed by the stats page', async () => {
    // @ts-expect-error The fetcher is a Node .mjs script exercised directly by Vitest.
    const { buildCoverageSource } = await import('../../scripts/fetch_finals_results.mjs');

    expect(
      buildCoverageSource({
        importPayload: {
          sourceLabel: 'primary free source',
          updatedAt: '2026-06-12',
          matches: []
        },
        coverageReport: {
          scoreCoveragePct: 2,
          goalEventCoveragePct: 50,
          issueCount: 3
        }
      })
    ).toContain('sourceLabel: "primary free source"');
  });
});
