# AGENTS.md

## Project Boundary

This Codex conversation owns only:

```text
/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026
```

Do not directly modify files outside this directory.

If a task requires changes in another project, stop and provide a handoff note for the user to forward to the correct project conversation.

## Coordination References

The following files may be read for coordination context, but must not be edited from this project conversation:

```text
/Users/chamcham/Documents/AI/CODEX/soccer/football-data-platform/docs/2026-05-17-coordination-and-github-publish-rules.md
/Users/chamcham/Documents/AI/CODEX/soccer/WORKSPACE_STATUS.md
```

## Owner Responsibilities

This project owns:

- World Cup 2026 presentation website UI
- React pages and components
- Site-side runtime API client and fallback behavior
- Local TypeScript fallback compatibility files
- GitHub Pages build/deploy workflow for this site
- Supabase client-side user/admin UI integration
- Site-specific tests and visual QA
- Site documentation under this repository

This project does not own:

- `football-data-platform` schema, collectors, normalized/public data, source health, or API publishing
- `world-cup-predictor` model code, training, prediction generation, Kelly/EV logic, or reports
- Workspace-level coordination files

## Cross-Project Handoff Format

When another project must change something, report it in this format:

```text
Project:
Task:
Reason:
Required change:
Files likely affected:
Data/API contract impact:
Validation:
Blockers:
Return report expected:
```

## Data Rules

- Consume `football-data-platform` public runtime APIs for shared football data.
- Do not create or modify platform schema/API/data-source logic from this repository.
- If the site needs a new field, dataset, coverage report, or contract change, write a handoff for the data-platform coordinator.
- Keep `sync:shared-data` wired into test/build flows while local fallback files remain in use.
- Treat `src/data/*.ts` shared-data files as generated fallback compatibility, not as the production source of truth.

## GitHub Publish Rules

- Prefer normal SSH Git for this repository: `git fetch`, `git pull`, `git push`.
- If a full fetch is slow because it starts downloading historical blobs, use `git fetch --filter=blob:none --no-tags origin main` before falling back to GitHub API.
- Use GitHub Contents API or Git Database API only when SSH/Git transport fails.
- Before publishing, check `git status --short --branch`.
- Do not force-push or use destructive reset commands unless the user explicitly approves.
- If GitHub API fallback is used, verify remote state and deployment status afterward.

## Documentation Rules

- Keep `DESIGN.md` and `DESIGN.zh.md` as the main design baselines.
- Update design docs when changing architecture, data flow, route structure, runtime API behavior, deployment behavior, or project boundary.
- Keep this file aligned with `docs/2026-05-17-project-rules.md`.
